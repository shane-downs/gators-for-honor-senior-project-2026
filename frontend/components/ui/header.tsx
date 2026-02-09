"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Shield,
    ArrowRight,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";


interface NavLink {
    label: string;
    href: string;
    target?: string;
}

const NAV_LINKS: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Documentation", href: "https://github.com/shane-downs/gators-for-honor-senior-project-2026.git", target: "_blank" },
    { label: "Support", href: "mailto:wilson.goins@ufl.edu, shane.downs@ufl.edu" },
    { label: "About Us", href: "/about" },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div
                className="mx-4 mt-4 rounded-2xl border border-white/10 bg-slate-950/80 px-6 py-3 shadow-lg shadow-black/20"
                style={{
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                }}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shadow-md transition-transform group-hover:scale-105" style={{ background: "linear-gradient(135deg, #FA4616 0%, #0021A5 100%)", boxShadow: "0 4px 12px rgba(250, 70, 22, 0.25)" }}>
                            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-white">
                Gators For Honor
              </span>
                            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "rgba(250, 70, 22, 0.7)" }}>
                Canvas Middleware
              </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                target={link.target}
                                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Login Button */}
                    <div className="hidden items-center gap-3 md:flex">
                        <Button
                            asChild
                            className="rounded-xl px-5 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                            style={{ background: "linear-gradient(135deg, #FA4616 0%, #E03A0E 100%)", boxShadow: "0 4px 14px rgba(250, 70, 22, 0.3)" }}
                        >
                            <Link href="/login">
                                Log In
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Mobile Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
                    >
                        {mobileOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="mt-3 border-t border-white/10 pt-3 pb-2 md:hidden">
                        <nav className="flex flex-col gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    target={link.target}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Button
                                asChild
                                className="mt-2 rounded-xl font-semibold text-white"
                                style={{ background: "linear-gradient(135deg, #FA4616 0%, #E03A0E 100%)" }}
                            >
                                <Link href="/login">
                                    Log In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}