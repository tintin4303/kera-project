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
        const medications = await prisma.medication.findMany({
            where: {
                patient: {
                    userId: session.user.id,
                },
                isActive: true,
            },
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

// TODO: Implement POST if needed for creating medications via UI
