"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authFetch } from "@/util/backend-api";

const PENDING_EMAIL_VERIFICATION_KEY = "amplypost:pending-email-verification";

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

export default function CreateAccountForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await authFetch("auth/sign-in/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: "google",
                    callbackURL: `${window.location.origin}/dashboard`,
                    newUserCallbackURL: `${window.location.origin}/dashboard`,
                    errorCallbackURL: `${window.location.origin}/login`,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message ?? "Unable to continue with Google.");
            }

            if (typeof data?.url === "string") {
                window.location.assign(data.url);
                return;
            }

            if (response.redirected) {
                window.location.assign(response.url);
                return;
            }

            window.location.assign("/dashboard");
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to continue with Google. Please try again.",
            );
            setIsGoogleLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const normalizedName = name.trim();
            const normalizedEmail = normalizeEmail(email);

            if (!normalizedName) {
                throw new Error("Enter your name to create an account.");
            }

            const response = await authFetch("auth/sign-up/email", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    name: normalizedName,
                    email: normalizedEmail,
                    password,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                if (data?.action === "VERIFY_EMAIL" || data?.code === "EMAIL_NOT_VERIFIED") {
                    window.localStorage.setItem(PENDING_EMAIL_VERIFICATION_KEY, normalizedEmail);
                    setSuccessMessage(data?.message ?? "Email verification required.");
                    router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
                    return;
                }

                throw new Error(data?.message ?? "Unable to create account.");
            }

            window.localStorage.setItem(PENDING_EMAIL_VERIFICATION_KEY, normalizedEmail);
            setSuccessMessage("Check your email for a verification code.");
            router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to create account. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex cursor-pointer items-center gap-2">
                        <Image
                            src="/amplypost-logo.png"
                            alt="Amplypost Logo"
                            width={40}
                            height={40}
                            className="h-10 w-10"
                        />
                        <span className="text-3xl font-bold text-foreground">Amplypost</span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-bold text-foreground">Create your account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Start scheduling your social media posts today
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        disabled={isGoogleLoading || isLoading}
                        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
                    </button>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-border"></div>
                        <span className="text-xs text-muted-foreground">OR</span>
                        <div className="h-px flex-1 bg-border"></div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {errorMessage && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
                                autoComplete="name"
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    {/* Terms */}
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By continuing, you agree to our{" "}
                        <Link href="/tos" className="cursor-pointer text-primary hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="cursor-pointer text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </p>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="cursor-pointer font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
