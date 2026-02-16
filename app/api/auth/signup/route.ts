import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!email || !password || !name) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        // All signups default to MIGRANT (family member) role
        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
                role: 'MIGRANT',
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log('[SIGNUP_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
