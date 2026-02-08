"use client";

/**
 * /app/login/page.tsx
 *
 * Canvas OAuth 2.0 Login Page
 * ───────────────────────────
 * This page serves two purposes in the OAuth flow:
 *
 *   1. INITIATION  — When a user visits /login normally, they see a
 *      "Sign in with Canvas" button. Clicking it redirects them to
 *      Canvas's authorization endpoint.
 *
 *   2. CALLBACK    — After the user authorizes on Canvas, Canvas redirects
 *      back to /login?code=<auth_code>&state=<state>. The page detects
 *      the code, sends it to our server-side API route for a secure
 *      token exchange, and then redirects to /dashboard.
 *
 * Why two concerns on one page?
 *   Keeping the redirect_uri the same as the login page avoids needing
 *   a separate /callback route registered with Canvas. The page simply
 *   checks for a ?code= query param to know which "mode" it's in.
 *
 * Security notes:
 *   • The client_secret never touches the browser — token exchange
 *     happens server-side in /api/auth/callback.
 *   • A random `state` parameter is generated and stored in sessionStorage
 *     to prevent CSRF attacks. It's verified when Canvas redirects back.
 */

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Loader2, AlertCircle, ExternalLink } from "lucide-react";

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
    const searchParams = useSearchParams();
    const router = useRouter();

    // UI state
    const [status, setStatus] = useState<"idle" | "exchanging" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // ── Step 1: Initiate OAuth ──────────────────────────────────────
    // Called when the user clicks "Sign in with Canvas".
    const handleLogin = useCallback(() => {
        const state = generateState();

        // Store state in sessionStorage so we can verify it on callback.
        // This prevents CSRF attacks — an attacker can't forge a valid state.
        sessionStorage.setItem("canvas_oauth_state", state);

        // Redirect the browser to Canvas's authorization page.
        // Canvas will show the user a consent screen, then redirect back
        // to our REDIRECT_URI with ?code=<auth_code>&state=<state>.
        window.location.href = buildCanvasAuthUrl(state);
    }, []);


    // ── Step 2: Handle Callback ─────────────────────────────────────
    // If Canvas redirected back with a ?code= param, exchange it for a token.
    useEffect(() => {
        const code  = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // If Canvas returned an error (e.g. user denied access)
        if (error) {
            setStatus("error");
            setErrorMessage(
                error === "access_denied"
                    ? "You declined the authorization request. Please try again to use the app."
                    : `Canvas returned an error: ${error}`
            );
            return;
        }

        // No code = user hasn't authorized yet. Show the login button.
        if (!code) return;

        // ── CSRF check ──────────────────────────────────────────────
        // Verify the state param matches what we stored before redirect.
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

        // State is valid — clean it up.
        sessionStorage.removeItem("canvas_oauth_state");

        // ── Token exchange ──────────────────────────────────────────
        // Send the authorization code to our server-side API route.
        // The server will use the client_secret (never exposed to the browser)
        // to exchange the code for an access_token + refresh_token.
        async function exchangeCode() {
            setStatus("exchanging");

            try {
                const response = await fetch("/api/auth/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || `Token exchange failed (${response.status})`);
                }

                // Success — the API route has set an HTTP-only session cookie.
                setStatus("success");

                // Brief delay so the user sees the success state, then redirect.
                setTimeout(() => router.push("/dashboard"), 800);

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

                    {/* ── Idle: show login button ─────────────────── */}
                    {status === "idle" && (
                        <>
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
                        </>
                    )}


                    {/* ── Exchanging: loading spinner ─────────────── */}
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


                    {/* ── Success: brief confirmation ─────────────── */}
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


                    {/* ── Error: message + retry ──────────────────── */}
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
                            <button
                                onClick={() => {
                                    // Clear URL params and reset state
                                    window.history.replaceState({}, "", "/login");
                                    setStatus("idle");
                                    setErrorMessage("");
                                }}
                                className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
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
