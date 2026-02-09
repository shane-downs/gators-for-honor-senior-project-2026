"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function OAuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<"exchanging" | "success" | "error">("exchanging");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const code  = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // if Canvas returned an error (e.g. user denied access) 
        if (error) {
            setStatus("error");
            setErrorMessage(
                error === "access_denied"
                    ? "You declined the authorization request. Please try again to use the app."
                    : `Canvas returned an error: ${error}`
            );
            return;
        }

        // if no code present (which should never happen)
        if (!code) {
            setStatus("error");
            setErrorMessage("No authorization code received from Canvas.");
            return;
        }

        // verify state matches what we stored for CSRF protection
        const storedState = sessionStorage.getItem("canvas_oauth_state");

        if (!state || state !== storedState) {
            setStatus("error");
            setErrorMessage(
                "OAuth state mismatch — this may be a CSRF attack or your session expired. " +
                "Please try logging in again."
            );
            sessionStorage.removeItem("canvas_oauth_state");
            return;
        }

        // if state is valid, clean it up.
        sessionStorage.removeItem("canvas_oauth_state");

        // exchange code for access token
        async function exchangeCode() {
            try {
                const response = await fetch("/api/auth/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, state }),
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || `Token exchange failed (${response.status})`);
                }

                setStatus("success");
                setTimeout(() => router.replace("/dashboard"), 800);
            } catch (err) {
                setStatus("error");
                setErrorMessage(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred during login."
                );
            }
        }

        exchangeCode();
    }, [searchParams, router]);


    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6">

            {/* Background effects */}
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

            <div className="relative z-10 w-full max-w-md">

                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Link href="/" className="group flex items-center gap-3">
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
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">

                    {/* Exchanging: loading spinner */}
                    {status === "exchanging" && (
                        <div className="flex flex-col items-center py-6">
                            <Loader2
                                className="h-8 w-8 animate-spin"
                                style={{ color: "#FA4616" }}
                            />
                            <p className="mt-4 text-sm font-medium text-slate-300">
                                Completing authentication...
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Exchanging authorization code for access token
                            </p>
                        </div>
                    )}

                    {/* Success: brief confirmation */}
                    {status === "success" && (
                        <div className="flex flex-col items-center py-6">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-full"
                                style={{ background: "rgba(34, 197, 94, 0.15)" }}
                            >
                                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="mt-4 text-sm font-medium text-green-400">
                                Authenticated successfully
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Redirecting to dashboard...
                            </p>
                        </div>
                    )}

                    {/* Error: message + retry */}
                    {status === "error" && (
                        <div className="flex flex-col items-center py-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <AlertCircle className="h-6 w-6 text-red-400" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-red-400">
                                Authentication failed
                            </p>
                            <p className="mt-2 max-w-sm text-center text-xs leading-relaxed text-slate-400">
                                {errorMessage}
                            </p>
                            <Link
                                href="/login"
                                className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
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

export default function OAuthCallbackPage() {
    return (
        <Suspense>
            <OAuthCallbackContent />
        </Suspense>
    );
}