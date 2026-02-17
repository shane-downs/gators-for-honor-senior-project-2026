/**
 * ============================================================================
 * GET /api/activity
 * ============================================================================
 *
 * Returns recent activity for the authenticated user.
 *
 * Used by:
 *   - Dashboard (activity feed sidebar)
 *
 * TODO: Replace placeholder with real DB query once the activity table
 * exists. Potential events to track:
 *   - Quiz created / updated / published
 *   - SEB config generated / downloaded
 *   - Canvas sync completed
 *
 * Returns: { activity: ActivityItem[] }
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";


export async function GET(_request: NextRequest) {
    const session = await getSession();

    if (!session.canvasUserId) {
        return NextResponse.json(
            { error: "Not authenticated." },
            { status: 401 }
        );
    }

    // TODO: Query activity table when it exists.
    // For now, return empty array — dashboard shows "No recent activity yet."
    return NextResponse.json({ activity: [] });
}