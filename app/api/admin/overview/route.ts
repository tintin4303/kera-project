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

        const [
            totalPatients,
            totalCarers,
            totalMigrants,
            totalAdmins,
            unassignedPatients,
            unverifiedCarers
        ] = await Promise.all([
            prisma.patient.count(),
            prisma.carer.count(),
            prisma.user.count({ where: { role: "MIGRANT" } }),
            prisma.user.count({ where: { role: "ADMIN" } }),
            prisma.patient.count({ where: { carerId: null } }),
            prisma.carer.count({ where: { verified: false } })
        ]);

        return NextResponse.json({
            totalPatients,
            totalCarers,
            totalMigrants,
            totalAdmins,
            unassignedPatients,
            unverifiedCarers
        });
    } catch (error) {
        console.error("[ADMIN_OVERVIEW_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
