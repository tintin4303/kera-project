import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a carer
        if (session.user.role !== 'CARER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get the carer profile
        const carer = await prisma.carer.findUnique({
            where: { userId: session.user.id },
            include: {
                patients: {
                    include: {
                        _count: {
                            select: {
                                healthRecords: true,
                                medications: true,
                                appointments: true,
                            },
                        },
                    },
                },
            },
        });

        if (!carer) {
            // Carer profile doesn't exist yet, return empty array
            return NextResponse.json([]);
        }

        return NextResponse.json(carer.patients);
    } catch (error) {
        console.error('Error fetching carer patients:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
