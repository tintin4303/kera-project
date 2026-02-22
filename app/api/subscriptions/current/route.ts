import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE',
                // Optional: Check endDate
            },
            include: {
                package: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        if (!subscription) {
            return NextResponse.json({ active: false });
        }

        return NextResponse.json({ active: true, subscription });
    } catch (error) {
        console.error('Failed to fetch subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
