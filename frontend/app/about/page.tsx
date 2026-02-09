"use client";

import Header from "@/components/ui/header";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineAcademicCap, HiOutlineCode } from "react-icons/hi";

const teamMembers = [
  {
    name: "Wilson Goins",
    role: "Scrum Master & Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/wilson-goins/",
    bio: "Wilson coordinates sprint planning, keeps the project on schedule, and contributes across the full stack. He leads task tracking, facilitates retrospectives, and ensures deadlines are met while building key features like SEB configuration generation and quiz template systems.",
    initials: "WG",
    focus: ["Project Coordination", "SEB Config Generation", "Backend Development"],
  },
  {
    name: "Shane Downs",
    role: "Project Manager & Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/shanemdowns/",
    bio: "Shane leads technical design decisions and system architecture for the Canvas SEB Quiz Creator. He drives core feature implementation including Canvas OAuth integration, the quiz creation interface, and API orchestration while maintaining code quality and technical documentation.",
    initials: "SD",
    focus: ["System Architecture", "Canvas API Integration", "Frontend Development"],
  },
];

export default function AboutPage() {
  return (
    <div>
        <Header />
        <main className="min-h-screen bg-[#0a0e1a] text-white">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden pt-32 pb-20 px-6">
            {/* Subtle radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.08)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-orange-500/30 bg-orange-500/5 text-xs font-semibold tracking-[0.2em] uppercase text-orange-400">
                <HiOutlineAcademicCap className="w-4 h-4" />
                About the Team
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Built by Gators,{" "}
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 bg-clip-text text-transparent">
                For Honor
                </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                The Canvas SEB Quiz Creator is a senior capstone project at the
                University of Florida that bridges the gap between Canvas LMS and the
                open-source Safe Exam Browser.{" "}
                Our mission is to eliminate the fragmented, error-prone workflow
                instructors face when setting up secure online exams, with the goal of reducing setup
                time from 30+ minutes to under 10.
            </p>
            </div>
        </section>

        {/* ── Divider ── */}
        <div className="max-w-5xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* ── Team Section ── */}
        <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-sm font-semibold tracking-[0.2em] uppercase text-orange-400 mb-12">
                Meet the Team
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
                {teamMembers.map((member) => (
                <div
                    key={member.name}
                    className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-orange-500/20 hover:bg-white/[0.04]"
                >
                    {/* Card glow on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_rgba(234,88,12,0.04)_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative z-10">
                    {/* Avatar + Name row */}
                    <div className="flex items-center gap-5 mb-6">
                        <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex-shrink-0"
                        >
                        <img
                            src={`/images/${member.initials.toLowerCase().replace(/\s/g, "-")}.jpg`}
                            alt={member.initials}
                            className="w-20 h-20 rounded-full object-cover border border-orange-500/20 transition-all duration-300 group-hover:border-orange-500/40 group-hover:shadow-[0_0_20px_rgba(234,88,12,0.15)]"
                        />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a0e1a] border border-white/10 flex items-center justify-center">
                            <FaLinkedin className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        </a>

                        <div>
                        <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-white hover:text-orange-400 transition-colors"
                        >
                            {member.name}
                        </a>
                        <p className="text-sm text-orange-400/80 font-medium mt-0.5">
                            {member.role}
                        </p>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-400 leading-relaxed text-[0.95rem] mb-6">
                        {member.bio}
                    </p>

                    {/* Focus areas */}
                    <div className="flex flex-wrap gap-2">
                        {member.focus.map((area) => (
                        <span
                            key={area}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-gray-300"
                        >
                            <HiOutlineCode className="w-3 h-3 text-orange-400/60" />
                            {area}
                        </span>
                        ))}
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </section>

        {/* ── Divider ── */}
        <div className="max-w-5xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        {/* ── Project Info Banner ── */}
        <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-500 uppercase tracking-[0.15em] font-medium mb-3">
                CIS4914 — Senior Design
            </p>
            <p className="text-gray-400 leading-relaxed">
                Faculty Advisor:{" "}
                <span className="text-white font-medium">Dr. Jeremiah Blanchard</span>
                <span className="mx-2 text-gray-600">·</span>
                University of Florida
                <span className="mx-2 text-gray-600">·</span>
                Spring 2026
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
                <a
                href="https://github.com/shane-downs/gators-for-honor-senior-project-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-sm font-medium text-gray-300 hover:border-orange-500/30 hover:text-white transition-all duration-200"
                >
                <FaGithub className="w-4 h-4" />
                View on GitHub
                </a>
            </div>
            </div>
        </section>
        </main>
    </div>
  );
}
