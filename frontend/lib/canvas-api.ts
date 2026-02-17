/**  shared canvas api helpers to get canvas data
 * 
 *   - GET  /api/canvas/courses  → fetchCoursesWithQuizCounts()
 *   - POST /api/canvas/sync     → fetchCoursesWithQuizCounts()
 *   - POST /api/canvas/quizzes  → canvasGet() + canvasPost() (future)
 *
 */


export interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
    total_students?: number;
}

export interface CanvasNewQuiz {
    id: string;
    title: string;
    quiz_settings?: {
        require_student_access_code?: boolean;
        student_access_code?: string;
    };
}

export interface DashboardCourse {
    id: number;
    name: string;
    course_code: string;
    total_students: number;
    quiz_count: number;
    status: "has_quizzes" | "empty";
}


/**
 * Authenticated GET request to the Canvas REST API.
 *
 * @param domain - e.g. "https://ufl.instructure.com" (includes protocol)
 * @param path   - e.g. "/api/v1/courses"
 * @param token  - Valid Canvas OAuth access token
 */
export async function canvasGet<T>(
    domain: string,
    path: string,
    token: string
): Promise<T> {
    const separator = path.includes("?") ? "&" : "?";
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


/**
 * Fetches instructor courses from Canvas, adds quiz count
 *
 * 1. GET /api/v1/courses (teacher enrollments, active, with total_students)
 * 2. For each course, GET quizzes in PARALLEL (Promise.allSettled)
 * 3. Count quizzes 
 * 4. Derive status: "has_quizzes" | "empty"
 */
export async function fetchCoursesWithQuizCounts(
    domain: string,
    token: string
): Promise<DashboardCourse[]> {
    const canvasCourses = await canvasGet<CanvasCourse[]>(
        domain,
        "/api/v1/courses?enrollment_type=teacher&enrollment_state=active&include[]=total_students&state[]=available",
        token
    );

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
                console.warn(
                    `[canvas-api] Could not fetch quizzes for course ${course.id}:`,
                    err instanceof Error ? err.message : err
                );
            }

            const quizCount = quizzes.length;

            let status: DashboardCourse["status"] =
                quizCount > 0 ? "has_quizzes" : "empty";

            return {
                id: course.id,
                name: course.name,
                course_code: course.course_code,
                total_students: course.total_students ?? 0,
                quiz_count: quizCount,
                status,
            };
        })
    );

    return results
        .filter(
            (r): r is PromiseFulfilledResult<DashboardCourse> =>
                r.status === "fulfilled"
        )
        .map((r) => r.value);
}
