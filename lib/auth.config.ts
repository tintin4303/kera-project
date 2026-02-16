import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/signin",
        newUser: "/signup", // Redirect here after sign up if needed, or handle in component
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null; // Invalid credentials
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.hashedPassword) {
                    return null; // User not found or no password set (OAuth user trying to sign in with password)
                }

                const isValid = await verifyPassword(credentials.password, user.hashedPassword);

                if (!isValid) {
                    return null; // Wrong password
                }

                return user;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // For OAuth sign-ins, ensure user has MIGRANT role by default
            if (account?.provider && user?.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                });

                // If user doesn't have a role set, default to MIGRANT
                if (dbUser && !dbUser.role) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: 'MIGRANT' },
                    });
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'MIGRANT'; // Default to MIGRANT if not set
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
};
