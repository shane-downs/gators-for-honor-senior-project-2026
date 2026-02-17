/*
 * Uses `iron-session` to store the authenticated user's Canvas user ID
 * in an encrypted, HTTP-only cookie. This is how API routes identify
 * which user is making the request.
 *
 * Why canvas_user_id and not the DB serial id?
 *   Our token helper (lib/canvas-token.ts) looks up users by
 *   canvas_user_id, and most Canvas API responses reference this ID.
 *   Storing it directly in the session avoids an extra DB lookup on
 *   every request just to translate id → canvas_user_id.
 *
 * Auth flow:
 *   1. User completes Canvas OAuth → /api/auth/callback
 *   2. Callback upserts user row in DB, gets back canvas_user_id
 *   3. Callback calls createSession(canvasUserId) → encrypted cookie set
 *   4. Browser requests /api/dashboard with cookie
 *   5. Route calls getSession() → reads canvasUserId from cookie
 *   6. Route calls getValidToken(canvasUserId) → Canvas access token
 *
 * This required a new environment variable, SESSION_SECRET
 */

import { cookies } from "next/headers";
import { getIronSession, IronSession } from "iron-session";

/*
 * Data stored inside the encrypted session cookie is only user ID
*/
export interface SessionData {
    canvasUserId?: number;
}

const SESSION_OPTIONS = {
    password: process.env.SESSION_SECRET || "",
    cookieName: "gfh_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 7, 
    },
};

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.warn(
        "⚠️  SESSION_SECRET is missing or too short (need 32+ chars). " +
        "Sessions will NOT work. Generate one with: openssl rand -hex 32"
    );
}

/**
 * Reads the current session from the encrypted cookie.
 *
 * Usage:
 *   const session = await getSession();
 *   if (!session.canvasUserId) return 401;
 */
export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

/**
 * Creates a new session after successful OAuth login.
 * Called from /api/auth/callback after the user row is upserted.
 *
 * @param canvasUserId 
 */
export async function createSession(canvasUserId: number): Promise<void> {
    const session = await getSession();
    session.canvasUserId = canvasUserId;
    await session.save();
}

/**
 * Destroys the current session (logout).
 * Called from /api/auth/logout.
 */
export async function destroySession(): Promise<void> {
    const session = await getSession();
    session.destroy();
}
