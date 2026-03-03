import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const { token } = req.nextauth;

        // Redirect from root to dashboard if authenticated
        if (pathname === "/" && token) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Role-based access for /dashboard/users (Admin only)
        if (pathname.startsWith("/dashboard/users") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/"],
};
