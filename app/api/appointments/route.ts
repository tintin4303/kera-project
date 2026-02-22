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

        const body = await req.json();
        const { patientId, carerId, scheduledAt, duration, notes, location } = body;

        if (!patientId || !scheduledAt) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify patient ownership (if Migrant)
        if (session.user.role !== 'CARER') {
            const patient = await prisma.patient.findUnique({
                where: { id: patientId },
                select: { userId: true }
            });
            if (!patient || patient.userId !== session.user.id) {
                return new NextResponse("Forbidden: You allow only schedule for your own family", { status: 403 });
            }
        }

        const appointmentStart = new Date(scheduledAt);
        const appointmentDuration = duration || 60;
        const appointmentEnd = new Date(appointmentStart.getTime() + appointmentDuration * 60000);

        // Conflict Detection: Check for overlapping appointments for this patient
        // We fetch appointments around the requested time to check for overlaps
        // Optimization: Filter by day to reduce data fetched
        const startOfDay = new Date(appointmentStart);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentStart);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointments = await prisma.appointment.findMany({
            where: {
                status: { not: 'CANCELLED' },
                scheduledAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                OR: [
                    { patientId },
                    carerId ? { carerId } : {}
                ]
            }
        });

        const hasConflict = existingAppointments.some(appt => {
            const apptStart = new Date(appt.scheduledAt);
            const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            const isOverlapping = (appointmentStart < apptEnd && appointmentEnd > apptStart);

            if (!isOverlapping) return false;

            // Identify the type of conflict
            if (appt.patientId === patientId) return true; // Patient is busy
            if (carerId && appt.carerId === carerId) return true; // Carer is busy

            return false;
        });

        if (hasConflict) {
            return new NextResponse("Time slot already booked for this patient or carer", { status: 409 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                carerId: carerId || null, // Can be unassigned initially?
                scheduledAt: new Date(scheduledAt),
                duration: duration || 60,
                status: 'PENDING',
                notes,
                location
            }
        });

        return NextResponse.json(appointment);
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
