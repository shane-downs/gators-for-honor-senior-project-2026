/**
 *
 * Returns the authenticated user's profile from the database.
 * 
 * Returns: { user: { id, name, email, avatar_url? } }
 *
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";


export async function GET(_request: NextRequest) {
    const session = await getSession();

    if (!session.canvasUserId) {
        return NextResponse.json(
            { error: "Not authenticated." },
            { status: 401 }
        );
    }

    try {
        const rows = await sql`
            SELECT canvas_user_id, name, email, avatar_url
            FROM users
            WHERE canvas_user_id = ${session.canvasUserId}
            LIMIT 1
        `;

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "User not found in database." },
                { status: 404 }
            );
        }

        const row = rows[0];

        return NextResponse.json({
            user: {
                id: String(row.canvas_user_id),
                name: row.name ?? "Unknown User",
                email: row.email ?? "",
                avatar_url: row.avatar_url || undefined,
            },
        });
    } catch (err) {
        console.error("[user/me] Error:", err);
        return NextResponse.json(
            { error: "Failed to load user profile." },
            { status: 500 }
        );
    }
}
