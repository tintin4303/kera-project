import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isSignInPage = req.nextUrl.pathname.startsWith("/signin");
        const isSignUpPage = req.nextUrl.pathname.startsWith("/signup");

        if (isSignInPage || isSignUpPage) {
            if (isAuth) {
                if (token?.role === "ADMIN") {
                    return NextResponse.redirect(new URL("/admin", req.url));
                }
                if (token?.role === "CARER") {
                    return NextResponse.redirect(new URL("/carer", req.url));
                }
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            return null;
        }

        // Authenticated landing: send users to their portal from root
        if (isAuth && req.nextUrl.pathname === "/") {
            if (token?.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", req.url));
            }
            if (token?.role === "CARER") {
                return NextResponse.redirect(new URL("/carer", req.url));
            }
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }
            return NextResponse.redirect(
                new URL(`/signin?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        // Role-based protection
        if (req.nextUrl.pathname.startsWith("/carer") && token?.role !== "CARER") {
            const target = token?.role === "ADMIN" ? "/admin" : "/dashboard";
            return NextResponse.redirect(new URL(target, req.url));
        }

        if (req.nextUrl.pathname.startsWith("/dashboard") && token?.role !== "MIGRANT") {
            const target = token?.role === "ADMIN" ? "/admin" : "/carer";
            return NextResponse.redirect(new URL(target, req.url));
        }

        if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
            if (token?.role === "CARER") {
                return NextResponse.redirect(new URL("/carer", req.url));
            }
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: () => true, // We handle logic in middleware function
        },
    }
);

export const config = {
    matcher: ["/", "/dashboard/:path*", "/carer/:path*", "/admin/:path*", "/signin", "/signup"],
};
