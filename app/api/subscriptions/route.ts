import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { packageId, paymentMethodId } = await req.json();

        if (!packageId) {
            return new NextResponse('Package ID is required', { status: 400 });
        }

        const pkg = await prisma.package.findUnique({
            where: { id: packageId },
        });

        if (!pkg) {
            return new NextResponse('Package not found', { status: 404 });
        }

        // Check if user already has an active subscription
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE',
            },
        });

        if (existingSubscription) {
            return new NextResponse('User already has an active subscription', { status: 400 });
        }

        // Create subscription
        const startDate = new Date();
        const endDate = new Date();
        if (pkg.interval === 'MONTHLY') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (pkg.interval === 'YEARLY') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const subscription = await prisma.subscription.create({
            data: {
                userId: session.user.id,
                packageId: pkg.id,
                status: 'ACTIVE',
                startDate,
                endDate,
                autoRenew: true,
                payments: {
                    create: {
                        amount: pkg.price,
                        currency: pkg.currency,
                        status: 'COMPLETED', // Simulate successful payment
                        provider: 'manual', // or 'stripe' later
                        transactionId: `sim_${Date.now()}`,
                    },
                },
            },
            include: {
                package: true,
            },
        });

        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Failed to create subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
