import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

// GET /api/patients/[id] - Get a single patient
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                healthRecords: {
                    orderBy: { recordedAt: 'desc' },
                    take: 5
                },
                medications: {
                    where: { isActive: true }
                },
                appointments: {
                    where: {
                        scheduledAt: { gte: new Date() }
                    },
                    orderBy: { scheduledAt: 'asc' }
                }
            }
        });

        if (!patient) {
            return new NextResponse("Not found", { status: 404 });
        }

        // Security: Ensure the user owns this patient record
        // OR the user is a CARER assigned to this patient (logic to be added later)
        if (patient.userId !== session.user.id) {
            // Check if user is an assigned carer... implementation pending
            return new NextResponse("Forbidden", { status: 403 });
        }

        return NextResponse.json(patient);
    } catch (error) {
        console.error("[PATIENT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH /api/patients/[id] - Update patient details
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, dateOfBirth, gender, address, city, country } = body;

        // Verify ownership
        const existingPatient = await prisma.patient.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existingPatient) return new NextResponse("Not found", { status: 404 });
        if (existingPatient.userId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                name,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender,
                address,
                city,
                country
            }
        });

        return NextResponse.json(updatedPatient);
    } catch (error) {
        console.error("[PATIENT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE /api/patients/[id] - Delete a patient
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existingPatient = await prisma.patient.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existingPatient) return new NextResponse("Not found", { status: 404 });
        if (existingPatient.userId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

        await prisma.patient.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[PATIENT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
