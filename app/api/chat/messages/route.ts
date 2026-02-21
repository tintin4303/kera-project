import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const recipientId = searchParams.get("recipientId");

        if (!recipientId) return new NextResponse("Recipient ID required", { status: 400 });

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: recipientId },
                    { senderId: recipientId, receiverId: session.user.id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // Mark as read
        await prisma.message.updateMany({
            where: {
                senderId: recipientId,
                receiverId: session.user.id,
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("[CHAT_MESSAGES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { recipientId, content } = await req.json();

        if (!recipientId || !content) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId: recipientId
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("[CHAT_MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
