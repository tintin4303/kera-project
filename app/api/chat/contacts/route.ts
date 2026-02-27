import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface Contact {
    id: string;
    name: string | null;
    image: string | null;
    role: Role;
    lastMessage?: string | null;
    lastMessageTime?: Date | null;
}

async function getLastMessage(userId: string, contactId: string) {
    const lastMessage = await prisma.message.findFirst({
        where: {
            OR: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId }
            ]
        },
        orderBy: { createdAt: 'desc' },
        select: {
            content: true,
            mediaUrl: true,
            createdAt: true
        }
    });
    return lastMessage;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        let contactObjects: Contact[] = [];

        if (user.role === 'MIGRANT') {
            // Get carers assigned to this migrant's patients
            const patients = await prisma.patient.findMany({
                where: { userId: session.user.id },
                include: {
                    carer: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    role: true
                                }
                            }
                        }
                    }
                }
            });

            // Extract unique carers
            const carerMap = new Map<string, Contact>();
            patients.forEach(p => {
                if (p.carer?.user) {
                    carerMap.set(p.carer.user.id, p.carer.user);
                }
            });
            contactObjects = Array.from(carerMap.values());
        } else if (user.role === 'CARER') {
            // Get diagnostic - find the carer record for this user
            const carerRecord = await prisma.carer.findUnique({
                where: { userId: session.user.id }
            });

            if (carerRecord) {
                // Get migrants who own patients assigned to this carer
                const patients = await prisma.patient.findMany({
                    where: { carerId: carerRecord.id },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                role: true
                            }
                        }
                    }
                });

                // Extract unique migrants
                const migrantMap = new Map<string, Contact>();
                patients.forEach(p => {
                    if (p.user) {
                        migrantMap.set(p.user.id, p.user);
                    }
                });
                contactObjects = Array.from(migrantMap.values());
            }
        }

        // Fetch last message for each contact
        const contactsWithMessages = await Promise.all(
            contactObjects.map(async (contact) => {
                const lastMessage = await getLastMessage(session.user.id, contact.id);
                return {
                    ...contact,
                    lastMessage: lastMessage?.content || (lastMessage?.mediaUrl ? '[Media]' : null),
                    lastMessageTime: lastMessage?.createdAt
                };
            })
        );

        // Sort by last message time (most recent first)
        contactsWithMessages.sort((a, b) => {
            const timeA = a.lastMessageTime?.getTime() || 0;
            const timeB = b.lastMessageTime?.getTime() || 0;
            return timeB - timeA;
        });

        return NextResponse.json(contactsWithMessages);
    } catch (error) {
        console.error("[CHAT_CONTACTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
