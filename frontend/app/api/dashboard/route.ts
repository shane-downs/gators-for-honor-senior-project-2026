/**
 * ============================================================================
 * GET /api/dashboard
 * ============================================================================
 *
 * Main data loader for the Dashboard page. Returns user info, courses
 * with SEB quiz counts, and recent activity.
 *
 * Data flow:
 *
 *   Browser (dashboard/page.tsx)
 *       │  GET /api/dashboard
 *       │  Cookie: gfh_session=<encrypted payload containing canvasUserId>
 *       ▼
 *   This route
 *       │
 *       ├─ 1. getSession()       → decrypts cookie, gives us canvasUserId
 *       │                           (lib/session.ts)
 *       │
 *       ├─ 2. getValidToken()    → returns { accessToken, canvasUserId, canvasDomain }
 *       │                           refreshes via OAuth if expired
 *       │                           (lib/canvas-token.ts — YOUR existing file)
 *       │
 *       ├─ 3. sql`SELECT ...`    → fetches user row from Neon DB for profile info
 *       │                           (name, email, avatar_url)
 *       │
 *       ├─ 4. canvasGet()        → fetches courses from Canvas REST API
 *       │     └─ canvasGet()     → fetches quizzes per course (parallel)
 *       │
 *       └─ 5. Return JSON        → { user, courses, activity }
 *
 * Why user profile comes from the DB, not Canvas API:
 *   - Saves ~200-400ms (skip a Canvas round-trip on every page load)
 *   - DB row is populated during OAuth callback with Canvas profile data
 *   - Profile data changes rarely; refreshed on next OAuth re-auth
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getValidToken } from "@/lib/canvas-token";
import { sql } from "@/lib/db";


// what we want from the db
interface UserRow {
    canvas_user_id: number;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
}

// canvas course shape
interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
    total_students?: number; // present when include[]=total_students
}

// A single quiz from the Canvas New Quizzes API
interface CanvasNewQuiz {
    id: string;
    title: string;
    quiz_settings?: {
        require_student_access_code?: boolean;
        student_access_code?: string;
    };
}

// dashboard shape
interface DashboardUser {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

interface DashboardCourse {
    id: number;
    name: string;
    course_code: string;
    total_students: number;
    seb_quiz_count: number;
    status: "active" | "setup" | "no_seb";
}

interface DashboardActivity {
    id: string;
    message: string;
    highlight: string;
    time: string;
    color: string;
}


// Canvas API helper

/**
 * Makes an authenticated GET request to the Canvas REST API.
 *
 * @param domain - The user's canvas_domain from getValidToken().
 *                 Already includes protocol, e.g. "https://ufl.instructure.com"
 * @param path   - API path, e.g. "/api/v1/courses"
 * @param token  - Valid Canvas OAuth access token
 * @returns        Parsed JSON response
 * @throws         Error with "401" in the message if Canvas rejects the token
 */
async function canvasGet<T>(
    domain: string,
    path: string,
    token: string
): Promise<T> {
    // Append per_page=100 to reduce pagination overhead.
    const separator = path.includes("?") ? "&" : "?";

    // domain already has protocol (e.g. "https://ufl.instructure.com")
    // so we concatenate directly — no need to prepend https://
    const url = `${domain}${path}${separator}per_page=100`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (res.status === 401) {
        throw new Error(
            `Canvas API returned 401 on ${path} — token may have been revoked`
        );
    }

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `Canvas API ${res.status} on ${path}: ${body.slice(0, 200)}`
        );
    }

    return res.json() as Promise<T>;
}

/* Data fetching helpers
 *
 * @param canvasUserId - The canvas_user_id from the session / getValidToken()
 */
async function fetchUserFromDb(canvasUserId: number): Promise<UserRow> {
    const rows = await sql`
        SELECT canvas_user_id, name, email, avatar_url
        FROM users
        WHERE canvas_user_id = ${canvasUserId}
        LIMIT 1
    `;

    if (rows.length === 0) {
        throw new Error(`User with canvas_user_id ${canvasUserId} not found in database`);
    }

    return rows[0] as UserRow;
}

/**
 * Fetches instructor courses from Canvas, enriches each with SEB quiz count.
 *
 * How it works:
 *   1. GET /api/v1/courses — filtered to teacher enrollments, active state,
 *      with total_students included.
 *
 *   2. For each course, GET /api/quiz/v1/courses/:id/quizzes in PARALLEL
 *      via Promise.allSettled. One course failing doesn't block the rest.
 *
 *   3. Count quizzes where require_student_access_code === true. This is
 *      the primary SEB integration mechanism — if a quiz requires an
 *      access code, it's configured for SEB.
 *
 *   4. Derive status:
 *      - "active"  → has ≥1 SEB quiz
 *      - "setup"   → has quizzes but none with SEB
 *      - "no_seb"  → no quizzes at all
 *
 * @param domain - Canvas domain with protocol (from getValidToken)
 * @param token  - Valid Canvas access token
 */
async function fetchCoursesWithQuizCounts(
    domain: string,
    token: string
): Promise<DashboardCourse[]> {
    // Step 1: Fetch instructor courses
    const canvasCourses = await canvasGet<CanvasCourse[]>(
        domain,
        "/api/v1/courses?enrollment_type=teacher&enrollment_state=active&include[]=total_students&state[]=available",
        token
    );

    // Step 2: Fetch quizzes for each course in parallel
    const results = await Promise.allSettled(
        canvasCourses.map(async (course): Promise<DashboardCourse> => {
            let quizzes: CanvasNewQuiz[] = [];

            try {
                quizzes = await canvasGet<CanvasNewQuiz[]>(
                    domain,
                    `/api/quiz/v1/courses/${course.id}/quizzes`,
                    token
                );
            } catch (err) {
                // Log but don't fail — course shows 0 SEB quizzes.
                // Common: quiz engine not enabled, or no quiz permissions.
                console.warn(
                    `[dashboard] Could not fetch quizzes for course ${course.id} (${course.course_code}):`,
                    err instanceof Error ? err.message : err
                );
            }

            // Step 3: Count SEB-configured quizzes
            const sebQuizCount = quizzes.filter(
                (q) => q.quiz_settings?.require_student_access_code === true
            ).length;

            // Step 4: Derive status
            let status: DashboardCourse["status"];
            if (sebQuizCount > 0) {
                status = "active";
            } else if (quizzes.length > 0) {
                status = "setup";
            } else {
                status = "no_seb";
            }

            return {
                id: course.id,
                name: course.name,
                course_code: course.course_code,
                total_students: course.total_students ?? 0,
                seb_quiz_count: sebQuizCount,
                status,
            };
        })
    );

    // Return only successfully resolved courses
    return results
        .filter(
            (r): r is PromiseFulfilledResult<DashboardCourse> =>
                r.status === "fulfilled"
        )
        .map((r) => r.value);
}

/**
 * Fetches recent activity for the dashboard sidebar.
 *
 * TODO: Replace with DB query once the activity table exists.
 * For now returns empty array — dashboard shows "No recent activity yet."
 */
async function fetchActivity(
    _canvasUserId: number
): Promise<DashboardActivity[]> {
    return [];
}

// Route handler 

export async function GET(_request: NextRequest) {
    // ── Step 1: Read canvasUserId from the encrypted session cookie ──
    //
    // getSession() decrypts the iron-session cookie. If the cookie is
    // missing or tampered with, canvasUserId will be undefined.
    const session = await getSession();

    if (!session.canvasUserId) {
        return NextResponse.json(
            { error: "Not authenticated. Please sign in with Canvas." },
            { status: 401 }
        );
    }

    const canvasUserId = session.canvasUserId;

    try {
        // get token
        const tokenResult = await getValidToken(canvasUserId);
        // get user info from db
        const userRow = await fetchUserFromDb(canvasUserId);

        // get courses and acitivity in parallel
        const [courses, activity] = await Promise.all([
            fetchCoursesWithQuizCounts(
                tokenResult.canvasDomain,
                tokenResult.accessToken
            ),
            fetchActivity(canvasUserId),
        ]);

        // build response
        return NextResponse.json({
            user: {
                id: String(userRow.canvas_user_id),
                name: userRow.name ?? "Unknown User",
                email: userRow.email ?? "",
                avatar_url: userRow.avatar_url || undefined,
            } satisfies DashboardUser,
            courses,
            activity,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        if (
            message.includes("refresh failed") ||
            message.includes("Token expired") ||
            message.includes("No user found") ||
            message.includes("401")
        ) {
            console.error(
                `[dashboard] Auth/token error for canvas_user_id ${canvasUserId}:`,
                message
            );
            return NextResponse.json(
                { error: "Canvas session expired. Please sign in again." },
                { status: 401 }
            );
        }

        // unexpected error (DB down, Canvas API change, etc.)
        console.error(
            `[dashboard] Unexpected error for canvas_user_id ${canvasUserId}:`,
            err
        );

        return NextResponse.json(
            { error: "Failed to load dashboard. Please try again." },
            { status: 500 }
        );
    }
}
