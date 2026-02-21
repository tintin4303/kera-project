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

        const whereCondition: Prisma.HealthRecordWhereInput = {};

        if (session.user.role === 'CARER') {
            const carerProfile = await prisma.carer.findUnique({
                where: { userId: session.user.id }
            });

            if (!carerProfile) {
                return NextResponse.json([]); // No profile, no records
            }

            whereCondition.patient = { carerId: carerProfile.id };
        } else {
            // MIGRANT or default
            whereCondition.patient = { userId: session.user.id };
        }

        if (patientId) {
            whereCondition.patientId = patientId;
        }

        const records = await prisma.healthRecord.findMany({
            where: whereCondition,
            include: {
                patient: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                recordedAt: 'desc',
            },
            take: 50,
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error('Error fetching health records:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow CARER role to create health records
    if (session.user.role !== 'CARER') {
        return NextResponse.json({ error: 'Forbidden. Only carers can log vitals.' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { patientId, systolicBP, diastolicBP, glucose, temperature, mood, notes } = body;

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        // Verify patient assignment
        // Since we already checked role is CARER, we check if patient is assigned to this carer
        const carerProfile = await prisma.carer.findUnique({
            where: { userId: session.user.id }
        });

        if (!carerProfile) {
            return NextResponse.json({ error: 'Carer profile not found' }, { status: 403 });
        }

        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                carerId: carerProfile.id
            },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found or unauthorized' }, { status: 404 });
        }

        const record = await prisma.healthRecord.create({
            data: {
                patientId,
                systolicBP: systolicBP ? parseInt(systolicBP) : null,
                diastolicBP: diastolicBP ? parseInt(diastolicBP) : null,
                glucose: glucose ? parseFloat(glucose) : null,
                temperature: temperature ? parseFloat(temperature) : null,
                mood,
                notes,
                recorderId: session.user.id,
            },
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error('Error creating health record:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
