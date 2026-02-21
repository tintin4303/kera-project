import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get('patientId');

        const whereCondition: Prisma.MedicationWhereInput = {
            isActive: true
        };

        if (session.user.role === 'CARER') {
            const carerProfile = await prisma.carer.findUnique({
                where: { userId: session.user.id }
            });

            if (!carerProfile) {
                return NextResponse.json([]);
            }

            whereCondition.patient = { carerId: carerProfile.id };
        } else {
            whereCondition.patient = { userId: session.user.id };
        }

        if (patientId) {
            whereCondition.patientId = patientId;
        }

        const medications = await prisma.medication.findMany({
            where: whereCondition,
            include: {
                patient: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json(medications);
    } catch (error) {
        console.error('Error fetching medications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { patientId, name, dosage, frequency, startDate, endDate, notes } = body;

        if (!patientId || !name || !dosage || !frequency) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify patient access
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { carer: true }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        const isOwner = patient.userId === session.user.id;
        const isAssignedCarer = session.user.role === 'CARER' && patient.carer?.userId === session.user.id;

        if (!isOwner && !isAssignedCarer && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const medication = await prisma.medication.create({
            data: {
                patientId,
                name,
                dosage,
                frequency,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                notes,
                isActive: true
            }
        });

        return NextResponse.json(medication, { status: 201 });
    } catch (error) {
        console.error('Error creating medication:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
