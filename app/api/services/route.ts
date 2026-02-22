import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const services = await prisma.addOnService.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error('Failed to fetch add-on services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}
