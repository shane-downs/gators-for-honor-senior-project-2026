"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";


const CANVAS_URL = process.env.NEXT_PUBLIC_CANVAS_URL!;        
const CLIENT_ID  = process.env.NEXT_PUBLIC_CANVAS_CLIENT_ID!;     
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI!;     


/** Generate a random string for the OAuth state param. */
function generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Build the Canvas OAuth authorization URL with all required params. */
function buildCanvasAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id:     CLIENT_ID,
        response_type: "code",
        redirect_uri:  REDIRECT_URI,
        state:         state,
    });

    return `${CANVAS_URL}/login/oauth2/auth?${params.toString()}`;
}


export default function LoginPage() {
    // initiate oauth, called when the user clicks "Sign in with Canvas".
    const handleLogin = useCallback(() => {
        const state = generateState();

        // store state in sessionStorage so we can verify it on callback for CSRF protection on client side
        sessionStorage.setItem("canvas_oauth_state", state);

        // also store in an httpOnly cookie for the server-side check
        document.cookie = `canvas_oauth_state=${state}; path=/; max-age=600; SameSite=Lax`;

        // redirect the browser to Canvas's authorization page.
        window.location.replace(buildCanvasAuthUrl(state));
    }, []);

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6">

            {/* Background effects — matches landing page aesthetic */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-12"
                    style={{ background: "radial-gradient(ellipse, #FA4616 0%, transparent 70%)" }}
                />
                <div
                    className="absolute right-0 bottom-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-8"
                    style={{ background: "radial-gradient(ellipse, #0021A5 0%, transparent 70%)" }}
                />
            </div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md">

                {/* Logo / Brand */}
                <div className="mb-8 flex flex-col items-center">
                    <Link href="/" className="group mb-6 flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #FA4616 0%, #0021A5 100%)",
                                boxShadow: "0 8px 24px rgba(250, 70, 22, 0.25)",
                            }}
                        >
                            <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-bold tracking-tight text-white">
                                Gators For Honor
                            </span>
                            <span
                                className="text-[11px] font-medium uppercase tracking-widest"
                                style={{ color: "rgba(250, 70, 22, 0.7)" }}
                            >
                                Canvas Middleware
                            </span>
                        </div>
                    </Link>

                    <h1 className="text-2xl font-bold text-white">Sign in to continue</h1>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Authenticate with your Canvas account to create and manage
                        SEB-proctored exams.
                    </p>
                </div>


                {/* Card body */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">

                    {/* show login button */}
                        <button
                            onClick={handleLogin}
                            className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                            style={{
                                background: "linear-gradient(135deg, #FA4616 0%, #E03A0E 100%)",
                                boxShadow: "0 8px 24px rgba(250, 70, 22, 0.3)",
                            }}
                        >
                            Sign in with Canvas
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-start gap-3 text-xs text-slate-500">
                                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-600" />
                                <span>
                                    You&apos;ll be redirected to UF&apos;s Canvas login page to
                                    authorize this application.
                                </span>
                            </div>
                            <div className="flex items-start gap-3 text-xs text-slate-500">
                                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-600" />
                                <span>
                                    We only request access to your courses and quizzes,
                                    never your personal data or grades.
                                </span>
                            </div>
                            <div className="flex items-start gap-3 text-xs text-slate-500">
                                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-600" />
                                <span>
                                    Your credentials are handled entirely by Canvas.
                                    We never see your password.
                                </span>
                            </div>
                        </div>
                </div>


                {/* Footer links */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-600">
                    <Link href="/" className="transition hover:text-slate-400">
                        ← Back to Home
                    </Link>
                    <span>·</span>
                    <a
                        href="mailto:wilson.goins@ufl.edu,shane.downs@ufl.edu"
                        className="transition hover:text-slate-400"
                    >
                        Need help?
                    </a>
                </div>

            </div>
        </div>
    );
}
