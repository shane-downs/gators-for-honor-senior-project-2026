import { NextRequest, NextResponse } from "next/server";

const CANVAS_URL     = process.env.NEXT_PUBLIC_CANVAS_URL!;
const CLIENT_ID      = process.env.NEXT_PUBLIC_CANVAS_CLIENT_ID!;
const CLIENT_SECRET  = process.env.CANVAS_CLIENT_SECRET!;        
const REDIRECT_URI   = process.env.NEXT_PUBLIC_REDIRECT_URI!;


interface CanvasTokenResponse {
    access_token:  string;
    token_type:    string;
    user:          { id: number; name: string };
    refresh_token: string;
    expires_in:    number;       
}

interface CanvasErrorResponse {
    error:             string;
    error_description: string;
}


export async function POST(request: NextRequest) {
    try {
        // extract the authorization code from the request body
        const { code } = await request.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid authorization code." },
                { status: 400 }
            );
        }

        // exchange the code for tokens at Canvas's token endpoint
        const tokenResponse = await fetch(`${CANVAS_URL}/login/oauth2/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type:    "authorization_code",
                client_id:     CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri:  REDIRECT_URI,
                code:          code,
            }),
        });

        // handle Canvas errors (invalid code, expired code, etc.)
        if (!tokenResponse.ok) {
            const errorData: CanvasErrorResponse = await tokenResponse.json().catch(() => ({
                error: "unknown_error",
                error_description: "Canvas returned a non-OK response.",
            }));

            console.error("[OAuth] Token exchange failed:", errorData);

            return NextResponse.json(
                { error: errorData.error_description || "Token exchange failed." },
                { status: tokenResponse.status }
            );
        }

        // parse successful token response
        const tokenData: CanvasTokenResponse = await tokenResponse.json();

        const response = NextResponse.json({
            success: true,
            user: tokenData.user,     
        });

        // access token cookie, expires when the token does (1 hour)
        response.cookies.set("canvas_access_token", tokenData.access_token, {
            httpOnly: true,           // Not accessible via document.cookie
            secure:   process.env.NODE_ENV === "production",   // HTTPS only in prod
            sameSite: "lax",          // Sent with same-site navigations
            path:     "/",            // Available to all routes
            maxAge:   tokenData.expires_in,   // 3600 seconds = 1 hour
        });

        // Refresh token cookie, which is to get new access tokens
        response.cookies.set("canvas_refresh_token", tokenData.refresh_token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 30,     // 30 days
        });

        // also store the Canvas user info for quick access (not sensitive)
        response.cookies.set("canvas_user", JSON.stringify(tokenData.user), {
            httpOnly: false,          
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   tokenData.expires_in,
        });

        return response;

    } catch (error) {
        console.error("[OAuth] Unexpected error during token exchange:", error);

        return NextResponse.json(
            { error: "An internal error occurred during authentication." },
            { status: 500 }
        );
    }
}
