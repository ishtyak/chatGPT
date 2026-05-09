import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    console.log("request", request)
    if (request.method === "POST" && !request.url.includes('auth')) {
        return NextResponse.json({
            blocked: true,
            route: request.nextUrl.pathname,
            message: "Feature not availiable in demo mode"
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};