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

        const body = await req.json();
        const { serviceId, patientId, scheduledDate, location, notes } = body;

        if (!serviceId) {
            return new NextResponse('Service ID is required', { status: 400 });
        }

        const service = await prisma.addOnService.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return new NextResponse('Service not found', { status: 404 });
        }

        // Create service request
        const request = await prisma.serviceRequest.create({
            data: {
                userId: session.user.id,
                serviceId: service.id,
                patientId: patientId || null,
                status: 'PENDING',
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                location: location || null,
                notes: notes || null,
                price: service.price,
                currency: service.currency,
            },
        });

        // In a real app, we would trigger a payment here or handle it asynchronously
        // For now, we assume the request is placed and payment is handled later or invoice sent

        return NextResponse.json(request);
    } catch (error) {
        console.error('Failed to create service request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const requests = await prisma.serviceRequest.findMany({
            where: { userId: session.user.id },
            include: {
                service: true,
                patient: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Failed to fetch service requests:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
