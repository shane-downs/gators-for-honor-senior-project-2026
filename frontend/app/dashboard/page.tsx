"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Shield,
    LayoutGrid,
    GraduationCap,
    FileText,
    Lock,
    LogOut,
    Plus,
    RefreshCw,
    Upload,
    BarChart3,
    ChevronRight,
    Loader2,
} from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

interface Course {
    id: number;
    name: string;
    course_code: string;
    total_students: number;
    seb_quiz_count: number;
    status: "active" | "setup" | "no_seb";
}

interface ActivityItem {
    id: string;
    message: string;
    highlight: string;
    time: string;
    color: string;
}

const NAV_MAIN = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, badge: null },
    { label: "Courses", href: "/dashboard/courses", icon: GraduationCap, badge: null },
    { label: "Quizzes", href: "/dashboard/quizzes", icon: FileText, badge: null },
];

const NAV_SEB = [
    { label: "SEB Profiles", href: "/dashboard/seb-profiles", icon: Lock },
];

function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function StatCard({
                      icon: Icon,
                      iconBg,
                      iconColor,
                      value,
                      suffix,
                      label,
                      delay,
                  }: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    value: string | number;
    suffix?: string;
    label: string;
    delay: string;
}) {
    return (
        <div
            className="group relative overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            style={{ animationDelay: delay }}
        >
            <div className={`mb-3.5 flex h-9 w-9 items-center justify-center rounded-[9px]`} style={{ background: iconBg }}>
                <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} strokeWidth={2} />
            </div>
            <div className="font-mono text-[28px] font-bold leading-none tracking-tight text-white">
                {value}
                {suffix && <span className="text-base text-slate-500">{suffix}</span>}
            </div>
            <div className="mt-1 text-[12.5px] font-medium text-slate-500">{label}</div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [courseCount, setCourseCount] = useState(0);
    const [quizCount, setQuizCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);

    // to get the dashboard data
    async function loadDashboard() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/dashboard");

            if (res.status === 401) {           // means we need to reauthenticate
                router.replace("/login");
                return;
            }

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to load dashboard");
            }

            const data = await res.json();
            setUser(data.user);
            setCourses(data.courses);
            setActivity(data.activity);
            setCourseCount(data.courses.length);
            setQuizCount(
                data.courses.reduce(
                    (sum: number, c: Course) => sum + c.seb_quiz_count,
                    0
                )
            );
            setStudentCount(
                data.courses.reduce(
                    (sum: number, c: Course) => sum + c.total_students,
                    0
                )
            );
        } catch (err) {
            console.error("Dashboard load error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    // fetch on entry
    useEffect(() => {
        loadDashboard();
    }, []);

    // sync course info from Canvas
    async function handleSync() {
        setSyncing(true);
        try {
            const res = await fetch("/api/canvas/sync", { method: "POST" });        // TODO in /app/api/canvas/sync/route.ts
            if (res.status === 401) {       // reauthenticate
                router.replace("/login");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses);

                // recalculate stat counts from the fresh course data
                setCourseCount(data.courses.length);
                setQuizCount(
                    data.courses.reduce(
                        (sum: number, c: Course) => sum + c.seb_quiz_count,
                        0
                    )
                );
                setStudentCount(
                    data.courses.reduce(
                        (sum: number, c: Course) => sum + c.total_students,
                        0
                    )
                );
            }
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            setSyncing(false);
        }
    }

    // sign out
    async function handleSignOut() {
        await fetch("/api/auth/logout", { method: "POST" });        // TODO in /app/api/auth/logout/route.ts
        router.replace("/");
    }

    // loading state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FA4616]" />
                    <p className="text-sm text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a]">
                <div className="flex flex-col items-center gap-5 rounded-[16px] border border-white/[0.06] bg-white/[0.025] px-10 py-10 text-center">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ background: "rgba(250, 70, 22, 0.15)" }}
                    >
                        <Shield className="h-6 w-6 text-[#FA4616]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-lg font-bold text-white">Unable to Load Dashboard</h2>
                        <p className="max-w-sm text-sm text-slate-500">{error}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => loadDashboard()}
                            className="inline-flex items-center gap-2 rounded-[10px] bg-[#FA4616] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_12px_rgba(250,70,22,0.3)] transition-all hover:-translate-y-px hover:bg-[#e03e12]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.06] bg-white/[0.025] px-5 py-2.5 text-[13px] font-semibold text-slate-400 transition-all hover:border-white/[0.12] hover:text-slate-300"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const activePath = "/dashboard";

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-slate-200">

            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div
                    className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(ellipse, #FA4616 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-0 right-0 h-[500px] w-[700px] translate-x-1/4 translate-y-1/4 rounded-full opacity-[0.05]"
                    style={{ background: "radial-gradient(ellipse, #0021A5 0%, transparent 70%)" }}
                />
            </div>

            <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[260px] flex-col border-r border-white/[0.06] bg-[#0a0e1a]/95 backdrop-blur-xl lg:flex">

                <Link href="/dashboard" className="group flex items-center gap-3 border-b border-white/[0.06] px-5 py-6">
                    <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] shadow-lg transition-transform group-hover:scale-105"
                        style={{
                            background: "linear-gradient(135deg, #FA4616 0%, #0021A5 100%)",
                            boxShadow: "0 4px 16px rgba(250, 70, 22, 0.25)",
                        }}
                    >
                        <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none gap-1.5">
                        <span className="text-[15px] font-bold tracking-tight text-white">Gators For Honor</span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: "rgba(250, 70, 22, 0.7)" }}>
              Canvas Middleware
            </span>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">Main</p>
                    {NAV_MAIN.map((item) => {
                        const isActive = activePath === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                                    isActive
                                        ? "bg-[rgba(250,70,22,0.15)] text-white"
                                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                                }`}
                            >
                                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-[#FA4616]" : "opacity-60"}`} strokeWidth={1.8} />
                                {item.label}
                                {item.badge && (
                                    <span className="ml-auto rounded-full bg-[#FA4616] px-[7px] py-px font-mono text-[11px] font-semibold text-white">
                    {item.badge}
                  </span>
                                )}
                            </Link>
                        );
                    })}

                    <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">SEB Config</p>
                    {NAV_SEB.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-500 transition-all hover:bg-white/[0.04] hover:text-slate-300"
                        >
                            <item.icon className="h-[18px] w-[18px] opacity-60" strokeWidth={1.8} />
                            {item.label}
                        </Link>
                    ))}

                    <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">Account</p>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-500 transition-all hover:bg-white/[0.04] hover:text-slate-300"
                    >
                        <LogOut className="h-[18px] w-[18px] opacity-60" strokeWidth={1.8} />
                        Sign Out
                    </button>
                </nav>

                {/* User footer */}
                <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-4 py-4">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-[34px] w-[34px] rounded-lg object-cover" />
                    ) : (
                        <div
                            className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #FA4616 0%, #e03a10 100%)" }}
                        >
                            {user ? getInitials(user.name) : "??"}
                        </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-px">
                        <span className="truncate text-[13px] font-semibold text-white">{user?.name ?? "Loading..."}</span>
                        <span className="text-[11px] text-slate-600">Instructor · UF Canvas</span>
                    </div>
                </div>
            </aside>

            {/* mobile nav */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0e1a]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
                {/* CHANGE 4: Logo also links to /dashboard here */}
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] shadow-lg"
                        style={{
                            background: "linear-gradient(135deg, #FA4616 0%, #0021A5 100%)",
                            boxShadow: "0 4px 16px rgba(250, 70, 22, 0.25)",
                        }}
                    >
                        <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[14px] font-bold tracking-tight text-white">Gators For Honor</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[12px] font-semibold text-slate-500 transition-all hover:border-white/[0.12] hover:text-slate-300 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Sync</span>
                    </button>
                    <Link
                        href="/dashboard/create-quiz"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#FA4616] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_2px_12px_rgba(250,70,22,0.3)] transition-all hover:bg-[#e03e12]"
                    >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        <span className="hidden sm:inline">New Quiz</span>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="inline-flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] p-2 text-slate-500 transition-all hover:border-white/[0.12] hover:text-slate-300"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </header>

            {/* Mobile sub-nav with horizontal scroll for page links */}
            <nav className="sticky top-[57px] z-40 flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0a0e1a]/95 px-4 py-2 backdrop-blur-xl lg:hidden">
                {NAV_MAIN.map((item) => {
                    const isActive = activePath === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                                isActive
                                    ? "bg-[rgba(250,70,22,0.15)] text-white"
                                    : "text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-[#FA4616]" : "opacity-60"}`} strokeWidth={1.8} />
                            {item.label}
                        </Link>
                    );
                })}
                {NAV_SEB.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-slate-500 transition-all hover:text-slate-300"
                    >
                        <item.icon className="h-3.5 w-3.5 opacity-60" strokeWidth={1.8} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* main content */}
            <main className="relative z-10 px-4 pb-16 pt-6 sm:px-6 lg:ml-[260px] lg:px-10 lg:pt-8">

                {/* ── Top bar ── */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-[22px] font-bold tracking-tight text-white sm:text-[26px]">
                        Dashboard
                    </h1>
                    {/*
                     * Desktop-only action buttons (mobile ones are in the top nav).
                     * Hidden below `lg` to avoid duplicating buttons.
                     */}
                    <div className="hidden items-center gap-2.5 lg:flex">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-slate-300 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                            Sync Canvas
                        </button>
                        <Link
                            href="/dashboard/create-quiz"
                            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#FA4616] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_12px_rgba(250,70,22,0.3)] transition-all hover:-translate-y-px hover:bg-[#e03e12] hover:shadow-[0_4px_20px_rgba(250,70,22,0.4)]"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                            New SEB Quiz
                        </Link>
                    </div>
                </div>

                {/* stats grid  */}
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        icon={GraduationCap}
                        iconBg="rgba(250, 70, 22, 0.15)"
                        iconColor="#FA4616"
                        value={courseCount}
                        label="Active Courses"
                        delay="0.05s"
                    />
                    <StatCard
                        icon={FileText}
                        iconBg="rgba(0, 33, 165, 0.15)"
                        iconColor="#6d8fff"
                        value={quizCount}
                        label="SEB Quizzes"
                        delay="0.1s"
                    />
                    <StatCard
                        icon={Shield}
                        iconBg="rgba(34, 197, 94, 0.15)"
                        iconColor="#22c55e"
                        value={studentCount}
                        label="Students Enrolled"
                        delay="0.15s"
                    />
                </div>

                {/* two col layout for courses and quick actions/recent activity sections */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">

                    {/* course list  */}
                    <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.025]">
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <h2 className="text-sm font-semibold text-white">Your Courses</h2>
                            <Link href="/dashboard/courses" className="text-xs text-slate-600 transition-colors hover:text-[#FA4616]">
                                View all →
                            </Link>
                        </div>

                        <div className="grid grid-cols-[1fr_100px_100px] border-b border-white/[0.06] bg-white/[0.01] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
                            <span>Course</span>
                            <span>Students</span>
                            <span>SEB Quizzes</span>
                        </div>

                        {/* each course row */}
                        {courses.length === 0 ? (
                            <div className="px-5 py-12 text-center text-sm text-slate-600">
                                No courses found. Click{" "}
                                <button onClick={handleSync} className="cursor-pointer font-semibold text-slate-400 hover:text-[#FA4616] transition-colors">
                                    Sync Canvas
                                </button>{" "}
                                to import your courses.
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="grid grid-cols-[1fr_100px_100px] items-center border-b border-white/[0.03] px-5 py-3.5 text-[13px] transition-colors hover:bg-white/[0.015]"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="font-semibold text-white truncate">{course.name}</span>
                                        <span className="font-mono text-[11.5px] text-slate-600">{course.course_code}</span>
                                    </div>
                                    <span className="text-slate-500">{course.total_students}</span>
                                    <span className="text-slate-500">{course.seb_quiz_count}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* right column in the 2 col layout  */}
                    <div className="flex flex-col gap-5">

                        {/* Quick Actions */}
                        <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.025]">
                            <div className="border-b border-white/[0.06] px-5 py-4">
                                <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
                            </div>
                            <div className="flex flex-col gap-0.5 p-1.5">
                                {[
                                    {
                                        icon: Plus,
                                        iconBg: "rgba(250, 70, 22, 0.15)",
                                        iconColor: "#FA4616",
                                        title: "Create SEB Quiz",
                                        desc: "Build a new locked-down assessment",
                                        href: "/dashboard/create-quiz",
                                    },
                                    {
                                        icon: Upload,
                                        iconBg: "rgba(0, 33, 165, 0.12)",
                                        iconColor: "#6d8fff",
                                        title: "Import from Canvas",
                                        desc: "Convert existing quiz to SEB",
                                        href: "/dashboard/quizzes/import",
                                    },
                                    {
                                        icon: BarChart3,
                                        iconBg: "rgba(34, 197, 94, 0.15)",
                                        iconColor: "#22c55e",
                                        title: "View Analytics",
                                        desc: "SEB compliance & attempt reports",
                                        href: "/dashboard/analytics",
                                    },
                                ].map((action) => (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        className="group flex items-center gap-3 rounded-[10px] px-3.5 py-3.5 transition-all hover:bg-white/[0.04]"
                                    >
                                        <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[9px]" style={{ background: action.iconBg }}>
                                            <action.icon className="h-[18px] w-[18px]" style={{ color: action.iconColor }} strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-[13px] font-semibold text-white">{action.title}</span>
                                            <span className="text-[11.5px] text-slate-600">{action.desc}</span>
                                        </div>
                                        <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 -translate-x-1 text-slate-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="flex-1 overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.025]">
                            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                                <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
                                <Link href="/dashboard/activity" className="text-xs text-slate-600 transition-colors hover:text-[#FA4616]">
                                    View all →
                                </Link>
                            </div>

                            {activity.length === 0 ? (
                                <div className="px-5 py-10 text-center text-sm text-slate-600">No recent activity yet.</div>
                            ) : (
                                activity.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 border-b border-white/[0.03] px-5 py-3.5 transition-colors hover:bg-white/[0.015]"
                                    >
                                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: item.color }} />
                                        <div className="flex min-w-0 flex-col gap-0.5">
                                            <p className="text-[13px] leading-relaxed text-slate-500">
                                                <strong className="font-semibold text-white">{item.highlight}</strong> {item.message}
                                            </p>
                                            <span className="font-mono text-[11px] text-slate-600">{item.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}