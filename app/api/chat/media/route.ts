import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import sharp from "sharp";

// Configuration for media compression
const IMAGE_CONFIG = {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 80, // JPEG/WebP quality (0-100)
    format: "webp" as const, // WebP offers better compression than JPEG
};

const VIDEO_CONFIG = {
    maxSizeMB: 5, // Stricter limit for videos (5MB after compression not implemented - just size check)
};

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
        const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const allowedVideoTypes = ["video/mp4", "video/webm"];
        const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

        if (!allowedTypes.includes(file.type)) {
            return new NextResponse("Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed.", { status: 400 });
        }

        // Validate file size (max 20MB before compression for images, 10MB for videos)
        const isImage = allowedImageTypes.includes(file.type);
        const maxOriginalSize = isImage ? 20 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxOriginalSize) {
            return new NextResponse(`File too large. Maximum size is ${isImage ? '20MB' : '10MB'}.`, { status: 400 });
        }

        // Determine media type
        const mediaType = isImage ? "image" : "video";

        // Get file bytes
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let processedBuffer: Buffer;
        let fileExtension: string;

        if (isImage) {
            // Compress and resize image
            try {
                const sharpInstance = sharp(buffer)
                    .rotate() // Auto-rotate based on EXIF data
                    .resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
                        fit: "inside", // Maintain aspect ratio, fit within bounds
                        withoutEnlargement: true, // Don't upscale small images
                    });

                // Convert to WebP for better compression
                processedBuffer = await sharpInstance
                    .webp({ quality: IMAGE_CONFIG.quality })
                    .toBuffer();

                fileExtension = "webp";
            } catch (compressionError) {
                console.error("[IMAGE_COMPRESSION_ERROR]", compressionError);
                // Fallback to original if compression fails
                processedBuffer = buffer;
                fileExtension = file.name.split(".").pop() || "jpg";
            }
        } else {
            // For videos, we just pass through (video compression requires ffmpeg which isn't available in serverless)
            // Instead, we enforce stricter size limits
            if (file.size > VIDEO_CONFIG.maxSizeMB * 1024 * 1024) {
                return new NextResponse(`Video file too large. Maximum size is ${VIDEO_CONFIG.maxSizeMB}MB.`, { status: 400 });
            }
            processedBuffer = buffer;
            fileExtension = file.name.split(".").pop() || "mp4";
        }

        // Generate unique filename
        const filename = `chat/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        // Upload to Vercel Blob Storage
        const blob = await put(filename, processedBuffer, {
            access: "public",
            contentType: isImage ? `image/${fileExtension}` : file.type,
        });

        // Create message with media
        const message = await prisma.message.create({
            data: {
                content: content || "",
                senderId: session.user.id,
                receiverId: recipientId,
                mediaType,
                mediaUrl: blob.url
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("[CHAT_MEDIA_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
