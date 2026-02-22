import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        const whereCondition: any = {
            userId: session.user.id
        };

        if (unreadOnly) {
            whereCondition.isRead = false;
        }

        const notifications = await prisma.notification.findMany({
            where: whereCondition,
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false
            }
        });

        return NextResponse.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("[NOTIFICATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { notificationId, markAllRead } = await req.json();

        if (markAllRead) {
            // Mark all notifications as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    isRead: false
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });
        } else if (notificationId) {
            // Mark specific notification as read
            await prisma.notification.update({
                where: {
                    id: notificationId,
                    userId: session.user.id
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[NOTIFICATIONS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
