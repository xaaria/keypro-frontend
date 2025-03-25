import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    
    // This middleware only checks that is Auth Token set when accessing certain paths
    // If not, redirect to login page
    // This does NOT check if permission is granted or that the token is valid!
    // This is simply a smoke test before any data is sent to server
    const token = getToken();
    if(token === undefined) {
        console.error("No token found! Auth failed => Redirect")
        return NextResponse.redirect(new URL('/login', request.url));
    }

    console.info("middleware check OK");
    return NextResponse.next();
}

/** Gets Auth Token */
function getToken(): string | undefined {
    // TODO: from local storage?
    return "06907f0f0e44b161474f88487a563a895596d345"
}

// Is used based on this logic:
export const config = {
    // matcher allows you to filter Middleware to run on specific paths.
    matcher: ['/map/:path*'],
}
