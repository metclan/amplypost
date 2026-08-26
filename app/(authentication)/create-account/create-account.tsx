"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { backendAuthUrl } from "@/util/backend-api";

export default function CreateAccountForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch(backendAuthUrl("auth/sign-up/email"), {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: email.split("@")[0],
                    email,
                    password,
                    rememberMe: true,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message ?? "Unable to create account.");
            }

            window.location.assign("/dashboard");
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
                    <Link href="/" className="inline-flex items-center gap-2">
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
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground opacity-75"
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
                        <span>Continue with Google</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            Coming soon
                        </span>
                    </button>

                    {/* Divider */}
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
                            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    {/* Terms */}
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By continuing, you agree to our{" "}
                        <Link href="/tos" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </p>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
