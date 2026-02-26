import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                carerProfile: true, // Include carer profile if it exists
            }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        // Remove password hash
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, ...safeUser } = user;

        return NextResponse.json(safeUser);
    } catch (error) {
        console.error("[PROFILE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

import { put } from "@vercel/blob";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const contentType = req.headers.get("content-type") || "";
        let name: string | null = null;
        let email: string | null = null;
        let imageUrl: string | undefined;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            name = formData.get("name") as string | null;
            email = formData.get("email") as string | null;
            const file = formData.get("file") as File | null;

            if (!name || !email) {
                return new NextResponse("Missing required fields", { status: 400 });
            }

            if (file && file.size > 0) {
                const extension = file.name.split('.').pop() || 'jpg';
                const filename = `profile/${session.user.id}-${Date.now()}.${extension}`;

                // Read file buffer directly
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const blob = await put(filename, buffer, {
                    access: "public",
                    contentType: file.type || "image/jpeg",
                });
                imageUrl = blob.url;
            }
        } else {
            const body = await req.json();
            name = body.name;
            email = body.email;
            imageUrl = body.image;
        }

        if (!name || !email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                email,
                ...(imageUrl !== undefined && { image: imageUrl })
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("[PROFILE_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
