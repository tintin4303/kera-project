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
            const carersProfile = await prisma.carer.findUnique({
                where: { userId: session.user.id }
            });

            if (!carersProfile) {
                return NextResponse.json([]); // No profile, no records
            }

            whereCondition.patient = { carerId: carersProfile.id };
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
        const carersProfile = await prisma.carer.findUnique({
            where: { userId: session.user.id }
        });

        if (!carersProfile) {
            return NextResponse.json({ error: 'Carer profile not found' }, { status: 403 });
        }

        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                carerId: carersProfile.id
            },
            include: {
                user: true // Get the migrant owner for notifications
            }
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

        // Check for abnormal vitals and create notifications
        const alerts: string[] = [];

        // Blood Pressure thresholds
        if (systolicBP) {
            const sbp = parseInt(systolicBP);
            if (sbp >= 180 || sbp < 90) {
                alerts.push(`Critical Blood Pressure: ${sbp} mmHg`);
            } else if (sbp >= 140) {
                alerts.push(`High Blood Pressure: ${sbp} mmHg`);
            } else if (sbp < 100) {
                alerts.push(`Low Blood Pressure: ${sbp} mmHg`);
            }
        }

        if (diastolicBP) {
            const dbp = parseInt(diastolicBP);
            if (dbp >= 120 || dbp < 60) {
                alerts.push(`Critical Diastolic: ${dbp} mmHg`);
            } else if (dbp >= 90) {
                alerts.push(`High Diastolic: ${dbp} mmHg`);
            }
        }

        // Glucose thresholds (mg/dL) - fasting
        if (glucose) {
            const gl = parseFloat(glucose);
            if (gl >= 400 || gl < 50) {
                alerts.push(`Critical Glucose: ${gl} mg/dL`);
            } else if (gl >= 200) {
                alerts.push(`High Glucose: ${gl} mg/dL`);
            } else if (gl < 70) {
                alerts.push(`Low Glucose: ${gl} mg/dL`);
            }
        }

        // Create notifications for abnormal vitals
        if (alerts.length > 0 && patient.userId) {
            await prisma.notification.create({
                data: {
                    userId: patient.userId,
                    type: 'VITALS_ALERT',
                    title: 'Health Alert for ' + patient.name,
                    message: `The following readings were detected for ${patient.name}: ${alerts.join(', ')}. Please consult a healthcare provider if symptoms persist.`,
                    relatedId: patientId,
                    relatedType: 'patient'
                }
            });
        }

        return NextResponse.json(record);
    } catch (error) {
        console.error('Error creating health record:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
