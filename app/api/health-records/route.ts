import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch health records for all patients belonging to the user
        const records = await prisma.healthRecord.findMany({
            where: {
                patient: {
                    userId: session.user.id,
                },
            },
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
            take: 50, // Limit to recent 50 records
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

    try {
        const body = await req.json();
        const { patientId, sysBP, diaBP, glucose, temp, mood, notes } = body;

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        // Verify patient belongs to user
        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                userId: session.user.id,
            },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found or unauthorized' }, { status: 404 });
        }

        const record = await prisma.healthRecord.create({
            data: {
                patientId,
                systolicBP: sysBP ? parseInt(sysBP) : null,
                diastolicBP: diaBP ? parseInt(diaBP) : null,
                glucose: glucose ? parseFloat(glucose) : null,
                temperature: temp ? parseFloat(temp) : null,
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
