import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";

// GET /api/appointments
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        // If USER => show appointments for their patients
        // If CARER => show appointments assigned to them

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const whereClause: Prisma.AppointmentWhereInput = {};

        // Filter by status if provided (e.g. 'SCHEDULED')
        if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
            whereClause.status = status as AppointmentStatus;
        }

        if (session.user.role === 'CARER') {
            whereClause.carerId = session.user.id;
        } else {
            // For Migrant Worker, get appointments for their patients
            // logical join: Appointment -> Patient -> User(id)
            whereClause.patient = {
                userId: session.user.id
            };
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: {
                    select: {
                        name: true,
                        address: true,
                        city: true
                    }
                },
                carer: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            }
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error("[APPOINTMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST /api/appointments
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        // Only Carers can create schedules now
        if (session.user.role !== 'CARER') {
            return new NextResponse("Forbidden: Only caretakers can set schedules", { status: 403 });
        }

        const body = await req.json();
        const { patientId, scheduledAt, duration, notes, location, recurring } = body;

        if (!patientId || !scheduledAt) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const appointmentDuration = duration || 60;
        const baseDate = new Date(scheduledAt);
        const appointmentsToCreate = [];

        // If recurring is true, create 4 appointments (once a week)
        const count = recurring ? 4 : 1;

        for (let i = 0; i < count; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + (i * 7));

            appointmentsToCreate.push({
                patientId,
                carerId: session.user.id,
                scheduledAt: date,
                duration: appointmentDuration,
                status: 'SCHEDULED' as AppointmentStatus,
                notes: notes + (recurring ? ` (Weekly Checkup ${i + 1}/4)` : ""),
                location
            });
        }

        // Check for conflicts for all appointments
        for (const appt of appointmentsToCreate) {
            const startOfDay = new Date(appt.scheduledAt);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(appt.scheduledAt);
            endOfDay.setHours(23, 59, 59, 999);

            const existingAppointments = await prisma.appointment.findMany({
                where: {
                    status: { not: 'CANCELLED' },
                    scheduledAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    OR: [
                        { patientId: appt.patientId },
                        { carerId: appt.carerId }
                    ]
                }
            });

            const apptEnd = new Date(appt.scheduledAt.getTime() + appt.duration * 60000);

            const hasConflict = existingAppointments.some(existing => {
                const exStart = new Date(existing.scheduledAt);
                const exEnd = new Date(exStart.getTime() + existing.duration * 60000);
                return (appt.scheduledAt < exEnd && apptEnd > exStart);
            });

            if (hasConflict) {
                return new NextResponse(`Conflict found for date: ${appt.scheduledAt.toLocaleDateString()}`, { status: 409 });
            }
        }

        // Bulk create (Prisma doesn't have createMany for all DBs easily, so we use multiple creates in a transaction)
        const created = await prisma.$transaction(
            appointmentsToCreate.map(data => prisma.appointment.create({ data }))
        );

        return NextResponse.json(created[0]); // Return the first or a summary
    } catch (error) {
        console.error("[APPOINTMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH /api/appointments - Update appointment status
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { appointmentId, status } = body;

        if (!appointmentId || !status) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify the appointment exists and user has access
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!appointment) {
            return new NextResponse("Appointment not found", { status: 404 });
        }

        // Only the assigned carers can update the appointment
        if (session.user.role === 'CARER' && appointment.carerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: status as AppointmentStatus }
        });

        // Create notification when appointment is completed
        if (status === 'COMPLETED' && appointment.patient?.userId) {
            await prisma.notification.create({
                data: {
                    userId: appointment.patient.userId,
                    type: 'VISIT_COMPLETED',
                    title: 'Visit Completed',
                    message: `Your scheduled visit for ${appointment.patient.name} has been completed by the caretaker. Check the app for the visit report.`,
                    relatedId: appointmentId,
                    relatedType: 'appointment'
                }
            });
        }

        return NextResponse.json(updatedAppointment);
    } catch (error) {
        console.error("[APPOINTMENTS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
