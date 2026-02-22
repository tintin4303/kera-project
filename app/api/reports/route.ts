import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        if (session.user.role !== 'CARER') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { patientId, title, summary, recommendations, periodStart, periodEnd } = body;

        if (!patientId || !title || !summary || !periodStart || !periodEnd) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify patient exists and get carer info
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { carer: true }
        });

        if (!patient) {
            return new NextResponse("Patient not found", { status: 404 });
        }

        // Verify the carer is assigned to this patient
        const carerProfile = await prisma.carer.findUnique({
            where: { userId: session.user.id }
        });

        if (!carerProfile) {
            return new NextResponse("Carer profile not found", { status: 404 });
        }

        if (patient.carerId !== carerProfile.id) {
            return new NextResponse("You are not assigned to this patient", { status: 403 });
        }

        const report = await prisma.report.create({
            data: {
                patientId,
                carerId: session.user.id, // Report.carerId references User.id
                title,
                summary,
                recommendations,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
            }
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('[REPORTS_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get('patientId');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (patientId) {
            where.patientId = patientId;
        }

        // Role-based filtering
        if (session.user.role === 'MIGRANT') {
            // Migrants can only see reports for their patients (linked via Patient.userId)
            where.patient = { userId: session.user.id };
        } else if (session.user.role === 'CARER') {
            // Carers can see reports for patients they are assigned to
            const carerProfile = await prisma.carer.findUnique({
                where: { userId: session.user.id }
            });

            if (!carerProfile) {
                return NextResponse.json([]);
            }

            // Filter to ensure they only see reports for their patients
            where.patient = { carerId: carerProfile.id };
        } 
        // Admin can see all (no extra filter needed beyond patientId if provided)

        const reports = await prisma.report.findMany({
            where,
            include: {
                carer: {
                    select: {
                        name: true,
                        image: true,
                        carerProfile: {
                            select: {
                                specialty: true
                            }
                        }
                    }
                },
                patient: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error('[REPORTS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
