import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const recipientId = formData.get("recipientId") as string | null;
        const content = formData.get("content") as string | null;

        if (!file || !recipientId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
        if (!allowedTypes.includes(file.type)) {
            return new NextResponse("Invalid file type. Only images and videos are allowed.", { status: 400 });
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return new NextResponse("File too large. Maximum size is 10MB.", { status: 400 });
        }

        // Determine media type
        const mediaType = file.type.startsWith("video/") ? "video" : "image";

        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        // Create message with media
        const message = await prisma.message.create({
            data: {
                content: content || "",
                senderId: session.user.id,
                receiverId: recipientId,
                mediaType,
                mediaUrl: `/uploads/chat/${filename}`
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("[CHAT_MEDIA_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
