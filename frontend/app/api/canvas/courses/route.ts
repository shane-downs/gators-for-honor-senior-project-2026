/** returns courses with quiz counts
 *
 * Used by:
 *   - Dashboard (course table, stat cards)
 *   - Create Quiz page (course selector dropdown)
 *   - Courses page (full course list)
 *
 * Returns: { courses: DashboardCourse[] }
 *
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getValidToken } from "@/lib/canvas-token";
import { fetchCoursesWithQuizCounts } from "@/lib/canvas-api";


export async function GET(_request: NextRequest) {
    const session = await getSession();

    if (!session.canvasUserId) {
        return NextResponse.json(
            { error: "Not authenticated." },
            { status: 401 }
        );
    }

    try {
        const tokenResult = await getValidToken(session.canvasUserId);

        const courses = await fetchCoursesWithQuizCounts(
            tokenResult.canvasDomain,
            tokenResult.accessToken
        );

        return NextResponse.json({ courses });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        if (
            message.includes("refresh failed") ||
            message.includes("Token expired") ||
            message.includes("No user found") ||
            message.includes("401")
        ) {
            console.error(`[canvas/courses] Auth error:`, message);
            return NextResponse.json(
                { error: "Canvas session expired. Please sign in again." },
                { status: 401 }
            );
        }

        console.error(`[canvas/courses] Error:`, err);
        return NextResponse.json(
            { error: "Failed to load courses." },
            { status: 500 }
        );
    }
}