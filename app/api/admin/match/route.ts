import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
        if (session.user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

        const body = await req.json();
        const { patientId, carerId } = body;

        if (!patientId) {
            return new NextResponse("Patient ID required", { status: 400 });
        }

        const finalCarerId = carerId === "" ? null : carerId;

        if (finalCarerId) {
            const carer = await prisma.carer.findUnique({ where: { id: finalCarerId } });
            if (!carer) {
                return new NextResponse("Carer not found", { status: 404 });
            }
        }

        const updated = await prisma.patient.update({
            where: { id: patientId },
            data: { carerId: finalCarerId }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[ADMIN_MATCH_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
