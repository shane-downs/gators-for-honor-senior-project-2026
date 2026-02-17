import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";          
import { neon } from "@neondatabase/serverless";
import { createSession, getSession } from "@/lib/session";

const sql = neon(process.env.DATABASE_URL!);
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
        // extract the authorization code and state from the request body
        const { code, state } = await request.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid authorization code." },
                { status: 400 }
            );
        }

        if (!state || typeof state !== "string") {
            return NextResponse.json(
                { error: "Missing OAuth state parameter." },
                { status: 400 }
            );
        }

        // read the state we stored in the cookie before redirecting to Canvas
        const storedState = request.cookies.get("canvas_oauth_state")?.value;
        if (!storedState || storedState !== state) {
            return NextResponse.json(
                { error: "OAuth state mismatch. Please try logging in again." },
                { status: 403 }
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

        // now fetch full profile from Canvas
        const profileRes = await fetch(`${CANVAS_URL}/api/v1/users/self/profile`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
        const profile = await profileRes.json();        // what we'll store in the database

        // now upsetsert the user and access token into db (create if new, update if existing)
        const [dbUser] = await sql`
        INSERT INTO users (canvas_user_id, name, email, avatar_url, canvas_domain, access_token, refresh_token, token_expires_at)
        VALUES (
            ${profile.id},
            ${profile.name},
            ${profile.primary_email},
            ${profile.avatar_url},
            ${CANVAS_URL},
            ${tokenData.access_token},
            ${tokenData.refresh_token},
            ${new Date(Date.now() + tokenData.expires_in * 1000).toISOString()}
        )
        ON CONFLICT (canvas_user_id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url,
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            token_expires_at = EXCLUDED.token_expires_at,
            updated_at = NOW()
        RETURNING id, canvas_user_id
        `;

        const response = NextResponse.json({
            success: true,
            user: tokenData.user,     
        });

        // also store the Canvas profile id so we can query to the db with it later on
        response.cookies.set("canvas_user", String(profile.id), {
            httpOnly: true,          
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 30,     // expires after 30 days which is as long as the refresh token is valid
        });

        await createSession(dbUser.canvas_user_id);

        const cookieStore = await cookies();
        cookieStore.delete("canvas_oauth_state");

        // return success bc the gfh_session cookie is already set by createSession() in lib/session.ts
        return NextResponse.json({
            success: true,
            user: tokenData.user,     
        });


    } catch (error) {
        console.error("[OAuth] Unexpected error during token exchange:", error);

        return NextResponse.json(
            { error: "An internal error occurred during authentication." },
            { status: 500 }
        );
    }
}
