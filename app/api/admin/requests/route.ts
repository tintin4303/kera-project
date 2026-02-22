import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

// GET /api/admin/requests - List all service requests
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) { // Simple check, ideally role check
             return new NextResponse("Unauthorized", { status: 401 });
        }
        
        // Double check admin role from DB if needed, but session role should be enough if set correctly
        if (session.user.role !== 'ADMIN') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const requests = await prisma.serviceRequest.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                patient: {
                    select: {
                        name: true,
                    }
                },
                service: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("[ADMIN_REQUESTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH /api/admin/requests - Update request status
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("[ADMIN_REQUESTS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
