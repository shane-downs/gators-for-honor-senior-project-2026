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
    SlidersHorizontal,
    LogOut,
    Plus,
    RefreshCw,
    Upload,
    BarChart3,
    MoreHorizontal,
    ChevronRight,
    Loader2,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────
   Sidebar nav config
   ────────────────────────────────────────────── */

const NAV_MAIN = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, badge: null },
    { label: "Courses", href: "/dashboard/courses", icon: GraduationCap, badge: null },
    { label: "Quizzes", href: "/dashboard/quizzes", icon: FileText, badge: null },
];

const NAV_SEB = [
    { label: "SEB Profiles", href: "/dashboard/seb-profiles", icon: Lock },
    { label: "Settings", href: "/dashboard/settings", icon: SlidersHorizontal },
];

/* ──────────────────────────────────────────────
   Helper: initials from name
   ────────────────────────────────────────────── */
function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/* ──────────────────────────────────────────────
   Status badge component
   ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Course["status"] }) {
    const config = {
        active: { label: "Active", bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400" },
        setup: { label: "Setup", bg: "bg-yellow-500/12", text: "text-yellow-400", dot: "bg-yellow-400" },
        no_seb: { label: "No SEB", bg: "bg-white/[0.04]", text: "text-slate-500", dot: "bg-slate-500" },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11.5px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
    </span>
    );
}

/* ──────────────────────────────────────────────
   Stat card component
   ────────────────────────────────────────────── */
function StatCard({
                      icon: Icon,
                      iconBg,
                      iconColor,
                      value,
                      suffix,
                      label,
                      change,
                      changeType,
                      delay,
                  }: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    value: string | number;
    suffix?: string;
    label: string;
    change: string;
    changeType: "up" | "neutral";
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
            <div
                className={`absolute right-5 top-5 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
                    changeType === "up" ? "bg-green-500/15 text-green-400" : "bg-white/[0.04] text-slate-500"
                }`}
            >
                {change}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main dashboard page
   ────────────────────────────────────────────── */
export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [courseCount, setCourseCount] = useState(0);
    const [quizCount, setQuizCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);

    /* ── Fetch dashboard data ── */
    useEffect(() => {
        async function loadDashboard() {
            try {
                const res = await fetch("/api/dashboard");
                if (res.status === 401) {
                    router.replace("/login");
                    return;
                }
                if (!res.ok) throw new Error("Failed to load dashboard");

                const data = await res.json();
                setUser(data.user);
                setCourses(data.courses);
                setActivity(data.activity);
                setCourseCount(data.courses.length);
                setQuizCount(data.courses.reduce((sum: number, c: Course) => sum + c.seb_quiz_count, 0));
                setStudentCount(data.courses.reduce((sum: number, c: Course) => sum + c.total_students, 0));
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [router]);

    /* ── Sync courses from Canvas ── */
    async function handleSync() {
        setSyncing(true);
        try {
            const res = await fetch("/api/canvas/sync", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses);
            }
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            setSyncing(false);
        }
    }

    /* ── Sign out ── */
    async function handleSignOut() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
    }

    /* ── Loading state ── */
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

    const activePath = "/dashboard";

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-slate-200">

            {/* ════ Ambient background ════ */}
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

            {/* ════ SIDEBAR ════ */}
            <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-white/[0.06] bg-[#0a0e1a]/95 backdrop-blur-xl">

                {/* Logo */}
                <Link href="/" className="group flex items-center gap-3 border-b border-white/[0.06] px-5 py-6">
                    <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] shadow-lg transition-transform group-hover:scale-105"
                        style={{
                            background: "linear-gradient(135deg, #FA4616 0%, #0021A5 100%)",
                            boxShadow: "0 4px 16px rgba(250, 70, 22, 0.25)",
                        }}
                    >
                        <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none">
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

            {/* ════ MAIN CONTENT ════ */}
            <main className="relative z-10 ml-[260px] px-10 pb-16 pt-8">

                {/* ── Top bar ── */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-[26px] font-bold tracking-tight text-white">
                        Dashboard <span className="font-normal text-slate-600">· Spring 2026</span>
                    </h1>
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-slate-300 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                            Sync Canvas
                        </button>
                        <Link
                            href="/dashboard/quizzes/new"
                            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#FA4616] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_12px_rgba(250,70,22,0.3)] transition-all hover:-translate-y-px hover:bg-[#e03e12] hover:shadow-[0_4px_20px_rgba(250,70,22,0.4)]"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                            New SEB Quiz
                        </Link>
                    </div>
                </div>

                {/* ── Stats grid ── */}
                <div className="mb-7 grid grid-cols-4 gap-4">
                    <StatCard
                        icon={GraduationCap}
                        iconBg="rgba(250, 70, 22, 0.15)"
                        iconColor="#FA4616"
                        value={courseCount}
                        label="Active Courses"
                        change="Spring '26"
                        changeType="neutral"
                        delay="0.05s"
                    />
                    <StatCard
                        icon={FileText}
                        iconBg="rgba(0, 33, 165, 0.15)"
                        iconColor="#6d8fff"
                        value={quizCount}
                        label="SEB Quizzes"
                        change={`${quizCount} total`}
                        changeType="up"
                        delay="0.1s"
                    />
                    <StatCard
                        icon={Shield}
                        iconBg="rgba(34, 197, 94, 0.15)"
                        iconColor="#22c55e"
                        value={studentCount}
                        label="Students Enrolled"
                        change={`${courses.length} courses`}
                        changeType="up"
                        delay="0.15s"
                    />
                    <StatCard
                        icon={BarChart3}
                        iconBg="rgba(234, 179, 8, 0.12)"
                        iconColor="#eab308"
                        value="99"
                        suffix="%"
                        label="SEB Compliance"
                        change="+2%"
                        changeType="up"
                        delay="0.2s"
                    />
                </div>

                {/* ── Two-column layout ── */}
                <div className="grid grid-cols-[1fr_380px] gap-5">

                    {/* ── Courses table ── */}
                    <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.025]">
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <h2 className="text-sm font-semibold text-white">Your Courses</h2>
                            <Link href="/dashboard/courses" className="text-xs text-slate-600 transition-colors hover:text-[#FA4616]">
                                View all →
                            </Link>
                        </div>

                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_100px_100px_90px_48px] border-b border-white/[0.06] bg-white/[0.01] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
                            <span>Course</span>
                            <span>Students</span>
                            <span>SEB Quizzes</span>
                            <span>Status</span>
                            <span />
                        </div>

                        {/* Course rows */}
                        {courses.length === 0 ? (
                            <div className="px-5 py-12 text-center text-sm text-slate-600">
                                No courses found. Click <strong className="text-slate-400">Sync Canvas</strong> to import your courses.
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="grid grid-cols-[1fr_100px_100px_90px_48px] items-center border-b border-white/[0.03] px-5 py-3.5 text-[13px] transition-colors hover:bg-white/[0.015]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-white">{course.name}</span>
                                        <span className="font-mono text-[11.5px] text-slate-600">{course.course_code}</span>
                                    </div>
                                    <span className="text-slate-500">{course.total_students}</span>
                                    <span className="text-slate-500">{course.seb_quiz_count}</span>
                                    <StatusBadge status={course.status} />
                                    <button className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-slate-600 transition-all hover:bg-white/[0.04] hover:text-slate-300">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── Right column ── */}
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
                                        href: "/dashboard/quizzes/new",
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
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-semibold text-white">{action.title}</span>
                                            <span className="text-[11.5px] text-slate-600">{action.desc}</span>
                                        </div>
                                        <ChevronRight className="ml-auto h-4 w-4 -translate-x-1 text-slate-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
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