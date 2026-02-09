"use client";

// LANDING PAGE

import Link from "next/link";
import {
    Shield,
    FileText,
    Zap,
    ArrowRight,
    ChevronRight,
    Lock,
    Monitor,
    BookOpen,
    Menu,
    X, ShieldIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";


interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
    accent: string;
    shadow: string;
}

const FEATURES: Feature[] = [
    {
        icon: FileText,
        title: "One-Click Quiz Import",
        description:
            "Create SEB-compatible quizzes directly from your Canvas course. No more juggling between platforms or manually configuring exam settings.",
        accent: "from-orange-400 to-orange-500",
        shadow: "shadow-orange-500/15",
    },
    {
        icon: Lock,
        title: "Secure Exam Browser Config",
        description:
            "Automatically generates Safe Exam Browser configuration files with the right lockdown settings, ensuring exam integrity every time.",
        accent: "from-blue-500 to-blue-700",
        shadow: "shadow-blue-500/15",
    },
    {
        icon: Zap,
        title: "Canvas API Integration",
        description:
            "Seamlessly connects with UF's Canvas LMS via OAuth 2.0. Pull courses, push quizzes, and manage everything through one streamlined interface.",
        accent: "from-blue-500 to-blue-700",
        shadow: "shadow-blue-500/15",
    },
    {
        icon: Monitor,
        title: "Real-Time Preview",
        description:
            "Preview exactly how your quiz will appear in SEB before publishing. Catch formatting issues and configuration problems early.",
        accent: "from-orange-400 to-orange-500",
        shadow: "shadow-orange-500/15",
    },
];

const STATS = [
    { value: "OAuth 2.0", label: "Authentication" },
    { value: "< 10 min", label: "Quiz Setup" },
    { value: "UF Canvas", label: "LMS Integration" },
] as const;

function FeatureCard({ icon: Icon, title, description, accent, shadow }: Feature) {
    return (
        <Card
            className={`group border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] ${shadow} hover:shadow-lg`}
        >
            <CardContent className="p-6">
                <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} shadow-md transition-transform group-hover:scale-110`}
                >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{description}</p>
            </CardContent>
        </Card>
    );
}

function HeroSection() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15"
                    style={{
                        background: "radial-gradient(ellipse, #FA4616 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute right-0 bottom-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-10"
                    style={{
                        background: "radial-gradient(ellipse, #0021A5 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />
            </div>

            {/* Badge */}
            <Badge
                variant="outline"
                className="relative mb-8 gap-2 border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-400"
            >
                <BookOpen className="h-3.5 w-3.5" />
                Gators For Honor Senior Capstone Project
            </Badge>

            {/* Heading */}
            <h1 className="relative max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                Secure Exams,{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #FA4616 0%, #FF7A50 40%, #5B8DEF 70%, #0021A5 100%)" }}>
          Simplified
        </span>
            </h1>

            <p className="relative mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                The missing bridge between Canvas LMS and the open-source Safe Exam Browser. Create,
                configure, and deploy locked-down quizzes in minutes, not
                hours.
            </p>

            {/* CTA Buttons */}
            <div className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Button
                    asChild
                    size="lg"
                    className="rounded-2xl px-8 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #FA4616 0%, #E03A0E 100%)", boxShadow: "0 8px 24px rgba(250, 70, 22, 0.3)" }}
                >
                    <Link href="/login">
                        Get Started
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-2xl border-white/10 bg-white/[0.03] px-8 font-semibold text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                    <Link href="https://github.com/shane-downs/gators-for-honor-senior-project-2026.git" target="_blank">View Documentation</Link>
                </Button>
            </div>  

            {/* Stats */}
            <div className="relative mt-20 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
                {STATS.map((stat) => (
                    <div key={stat.label} className="text-center">
                        <div className="text-2xl font-extrabold text-white">
                            {stat.value}
                        </div>
                        <div className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FeaturesSection() {
    return (
        <section className="relative px-6 py-24">
            <div className="mx-auto max-w-5xl">
                <div className="mb-14 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Everything you need for{" "}
                        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #FA4616 0%, #0021A5 100%)" }}>
              secure assessments
            </span>
                    </h2>
                    <p className="mt-4 text-base text-slate-400">
                        A complete middleware solution that handles the complexity so you can
                        focus on teaching.
                    </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    {FEATURES.map((feature) => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="relative px-6 py-24">
            <Card className="mx-auto max-w-2xl border-white/[0.06] bg-white/[0.02]">
                <CardContent className="p-10 text-center sm:p-14">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #FA4616 0%, #0021A5 100%)", boxShadow: "0 8px 24px rgba(250, 70, 22, 0.2)" }}>
                        <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                        Ready to streamline your exams?
                    </h2>
                    <p className="mt-3 text-sm text-slate-400 sm:text-base">
                        Log in with your Canvas account to start creating SEB-compatible
                        quizzes today.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="mt-8 rounded-2xl px-8 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                        style={{ background: "linear-gradient(135deg, #FA4616 0%, #E03A0E 100%)", boxShadow: "0 8px 24px rgba(250, 70, 22, 0.3)" }}
                    >
                        <Link href="/login">
                            Log In with Canvas
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-white/[0.06] px-6 py-10">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldIcon className="h-4 w-4" style={{ color: "#FA4616" }} strokeWidth={2} />
                    <span>Gators For Honor</span>
                    <span className="text-slate-700">·</span>
                    <span>UF Capstone 2026</span>
                    <span className="text-slate-700">·</span>
                    <span className="inline-flex items-center gap-1">
            Made with
            <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            by Wilson Goins & Shane Downs
          </span>
                </div>
                <div className="flex gap-6 text-xs text-slate-600">
                    <a href="https://github.com/shane-downs/gators-for-honor-senior-project-2026.git" target="_blank" className="transition hover:text-slate-400">Documentation</a>
                    <a href="mailto:wilson.goins@ufl.edu,shane.downs@ufl.edu" className="transition hover:text-slate-400">Contact</a>
                    <a href="/about" className="transition hover:text-slate-400">About Us</a>
                </div>
            </div>
        </footer>
    );
}


export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Header />
            <main>
                <HeroSection />
                <FeaturesSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}