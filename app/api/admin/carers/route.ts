import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
        if (session.user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

        const carers = await prisma.carer.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        patients: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(carers);
    } catch (error) {
        console.error("[ADMIN_CARERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
        if (session.user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

        const body = await req.json();
        const { carerId, verified } = body;

        if (!carerId || typeof verified !== "boolean") {
            return new NextResponse("Invalid payload", { status: 400 });
        }

        const updated = await prisma.carer.update({
            where: { id: carerId },
            data: { verified }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[ADMIN_CARERS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
