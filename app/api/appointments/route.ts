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
