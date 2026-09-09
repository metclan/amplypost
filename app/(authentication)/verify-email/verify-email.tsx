"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { authFetch } from "@/util/backend-api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const PENDING_EMAIL_VERIFICATION_KEY = "amplypost:pending-email-verification";
const RESEND_COOLDOWN_SECONDS = 60;

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

export default function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("Enter the code from your email, or request a new one.");

    useEffect(() => {
        const pendingEmail = window.localStorage.getItem(PENDING_EMAIL_VERIFICATION_KEY);
        const nextEmail = normalizeEmail(initialEmail || pendingEmail || "");

        if (nextEmail) {
            setEmail(nextEmail);
            setOtpSent(true);
            window.localStorage.setItem(PENDING_EMAIL_VERIFICATION_KEY, nextEmail);
        }
    }, [initialEmail]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = window.setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);

        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const handleSendVerificationCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cooldown > 0) return;

        const normalizedEmail = normalizeEmail(email);
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await authFetch("auth/email-otp/send-verification-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: normalizedEmail,
                    type: "email-verification",
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message ?? "Unable to send verification code.");
            }

            setEmail(normalizedEmail);
            setOtp("");
            setOtpSent(true);
            setCooldown(RESEND_COOLDOWN_SECONDS);
            window.localStorage.setItem(PENDING_EMAIL_VERIFICATION_KEY, normalizedEmail);
            setSuccessMessage("Check your email for a verification code.");
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to send verification code. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        const normalizedEmail = normalizeEmail(email);
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await authFetch("auth/email-otp/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: normalizedEmail,
                    otp: otp.trim(),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message ?? "Invalid or expired verification code.");
            }

            window.localStorage.removeItem(PENDING_EMAIL_VERIFICATION_KEY);
            window.location.assign("/dashboard");
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to verify your email. Please try again.",
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
                    <h1 className="mt-6 text-2xl font-bold text-foreground">Verify your email</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Confirm your email address to continue
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                    {errorMessage && (
                        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={otpSent ? handleVerifyEmail : handleSendVerificationCode} className="space-y-4">
                        <div>
                            <label htmlFor="verify-email" className="mb-2 block text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <input
                                id="verify-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {otpSent && (
                            <div>
                                <label htmlFor="verify-otp" className="mb-2 block text-sm font-medium text-foreground">
                                    Verification code
                                </label>
                                <InputOTP
                                    id="verify-otp"
                                    maxLength={6}
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={isLoading}
                                    containerClassName="justify-center"
                                >
                                    <InputOTPGroup>
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <InputOTPSlot key={index} index={index} />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || (otpSent && otp.length < 6)}
                            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading
                                ? otpSent
                                    ? "Verifying..."
                                    : "Sending code..."
                                : otpSent
                                    ? "Verify email"
                                    : "Send verification code"}
                        </button>

                        {otpSent && (
                            <button
                                type="button"
                                onClick={handleSendVerificationCode}
                                disabled={isLoading || cooldown > 0}
                                className="w-full cursor-pointer text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification code"}
                            </button>
                        )}
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already verified?{" "}
                        <Link href="/login" className="cursor-pointer font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
