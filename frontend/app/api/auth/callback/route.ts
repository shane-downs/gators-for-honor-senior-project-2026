/**
 * /app/api/auth/callback/route.ts
 *
 * Canvas OAuth 2.0 — Server-Side Token Exchange
 * ──────────────────────────────────────────────
 * This API route receives the authorization code from the login page
 * and exchanges it for an access_token + refresh_token by calling
 * Canvas's token endpoint.
 *
 * WHY server-side?
 *   The client_secret must NEVER be exposed to the browser.
 *   This route runs on the server, so the secret stays safe.
 *
 * Canvas token endpoint response shape:
 *   {
 *     "access_token":  "1/fFAGRNJru1FTz70BzhT3Zg",
 *     "token_type":    "Bearer",
 *     "user":          { "id": 42, "name": "Jimi Hendrix" },
 *     "refresh_token": "tIh2YBWGiC0GgGRglT9Ylwv2MnTvy...",
 *     "expires_in":    3600
 *   }
 *
 * After a successful exchange this route:
 *   1. Sets an HTTP-only cookie with the access token (secure, not readable by JS)
 *   2. Returns the user info (id + name) in the JSON response
 */

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
    expires_in:    number;       // seconds — Canvas tokens expire in 1 hour
}

interface CanvasErrorResponse {
    error:             string;
    error_description: string;
}


export async function POST(request: NextRequest) {
    try {
        // 1. Extract the authorization code from the request body.
        const { code } = await request.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid authorization code." },
                { status: 400 }
            );
        }

        // 2. Exchange the code for tokens at Canvas's token endpoint.
        //
        //    POST https://<canvas>/login/oauth2/token
        //    Content-Type: application/x-www-form-urlencoded
        //
        //    Parameters:
        //      grant_type    = authorization_code
        //      client_id     = <developer key ID>
        //      client_secret = <developer key secret>
        //      redirect_uri  = <must match the URI used in Step 1>
        //      code          = <the authorization code from Canvas>
        //
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

        // 3. Handle Canvas errors (invalid code, expired code, etc.)
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

        // 4. Parse the successful token response.
        const tokenData: CanvasTokenResponse = await tokenResponse.json();

        // 5. Build the response and set secure cookies.
        //
        //    We store the access_token and refresh_token in HTTP-only cookies
        //    so they're automatically sent with every request but can't be
        //    read by client-side JavaScript (XSS protection).
        //
        const response = NextResponse.json({
            success: true,
            user: tokenData.user,     // { id, name } — safe to send to the browser
        });

        // Access token cookie — expires when the token does (1 hour).
        response.cookies.set("canvas_access_token", tokenData.access_token, {
            httpOnly: true,           // Not accessible via document.cookie
            secure:   process.env.NODE_ENV === "production",   // HTTPS only in prod
            sameSite: "lax",          // Sent with same-site navigations
            path:     "/",            // Available to all routes
            maxAge:   tokenData.expires_in,   // 3600 seconds = 1 hour
        });

        // Refresh token cookie — longer-lived, used to get new access tokens.
        // Canvas refresh tokens don't have an explicit expiry, but we set a
        // reasonable max age. The token is invalidated if the user revokes access.
        response.cookies.set("canvas_refresh_token", tokenData.refresh_token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 30,     // 30 days
        });

        // Also store the Canvas user info for quick access (not sensitive).
        response.cookies.set("canvas_user", JSON.stringify(tokenData.user), {
            httpOnly: false,          // Readable by the client for display purposes
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
