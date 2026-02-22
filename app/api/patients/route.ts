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
        const patients = await prisma.patient.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                subscription: {
                    select: {
                        status: true,
                    },
                },
                carer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        healthRecords: true,
                        appointments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
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
        const { name, dateOfBirth, gender, address, city, country } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Use a transaction to create patient and subscription separately
        // to avoid "Unknown argument subscription" error if client is out of sync
        const result = await prisma.$transaction(async (tx) => {
            const newPatient = await tx.patient.create({
                data: {
                    name,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    gender,
                    address,
                    city,
                    country: country || 'Myanmar',
                    userId: session.user.id,
                },
            });

            const newSubscription = await tx.subscription.create({
                data: {
                    userId: session.user.id,
                    patientId: newPatient.id,
                    packageId: 'core-plan',
                    status: 'ACTIVE',
                    startDate: new Date(),
                }
            });

            return { ...newPatient, subscription: newSubscription };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
