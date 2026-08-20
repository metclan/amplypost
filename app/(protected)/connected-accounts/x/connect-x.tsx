"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { config } from "@/util/config";

type ConnectionState = "loading" | "success" | "error";

type StatusPanelProps = {
    state: Exclude<ConnectionState, "loading">;
    title: string;
    message: string;
    details?: string;
};

const xConnectUrl = `${config.backendUrl}accounts/x/connect`;

function PageHeader() {
    return (
        <div className="border-b border-border pb-5">
            <div className="flex items-center gap-3">
                <Image
                    src="/x-logo.svg"
                    alt="X"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Link X
                </h1>
            </div>
        </div>
    );
}

function StatusPanel({ state, title, message, details }: StatusPanelProps) {
    const isSuccess = state === "success";
    const Icon = isSuccess ? CheckCircle2 : XCircle;

    return (
        <div className="space-y-6">
            <PageHeader />

            <div
                className={[
                    "rounded-2xl border p-8",
                    isSuccess
                        ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                        : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
                ].join(" ")}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                            isSuccess
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                        ].join(" ")}
                    >
                        <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                        <p className="text-muted-foreground">{message}</p>

                        {details && (
                            <div className="mt-3 break-words rounded-md bg-background/70 p-3 font-mono text-sm text-muted-foreground">
                                {details}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Button asChild className={isSuccess ? "bg-green-600 text-white hover:bg-green-700" : undefined}>
                        <Link href="/connected-accounts">Back to Connected Accounts</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function ConnectX() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const oauthState = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const [state, setState] = useState<ConnectionState>("loading");
    const [message, setMessage] = useState("Connecting your X account...");
    const [details, setDetails] = useState<string | undefined>();
    const processedRef = useRef(false);

    useEffect(() => {
        async function connectX() {
            if (processedRef.current) return;
            processedRef.current = true;

            if (!code || !oauthState) {
                setState("error");
                setMessage("Missing authorization code or state from X.");
                return;
            }

            const storedState = sessionStorage.getItem("x_oauth_state");
            const codeVerifier = sessionStorage.getItem("x_code_verifier");

            if (!storedState || !codeVerifier) {
                setState("error");
                setMessage("Missing saved X authorization session. Please try connecting again.");
                return;
            }

            if (oauthState !== storedState) {
                setState("error");
                setMessage("The X authorization state did not match. Please try connecting again.");
                return;
            }

            try {
                const response = await fetch(xConnectUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ code, codeVerifier }),
                });

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data?.error ||
                        "Failed to connect X account.",
                    );
                }

                sessionStorage.removeItem("x_oauth_state");
                sessionStorage.removeItem("x_code_verifier");

                setState("success");
                setMessage(data?.message || "Your X account has been connected.");
            } catch (err) {
                console.error("Error during X authorization:", err);
                setState("error");
                setMessage("We could not connect your X account.");
                setDetails(err instanceof Error ? err.message : "An unexpected error occurred.");
            }
        }

        if (error) return;

        const connectTimer = window.setTimeout(() => {
            void connectX();
        }, 100);

        return () => {
            window.clearTimeout(connectTimer);
        };
    }, [code, error, oauthState]);

    if (error) {
        const isUserCancelled =
            error === "access_denied" ||
            errorDescription?.toLowerCase().includes("user denied");

        return (
            <StatusPanel
                state="error"
                title={isUserCancelled ? "Connection Cancelled" : "Connection Error"}
                message={
                    isUserCancelled
                        ? "You cancelled the X connection request. You can try again whenever you are ready."
                        : errorDescription || "X returned an error before the account could be connected."
                }
            />
        );
    }

    if (state === "loading") {
        return (
            <div className="space-y-6">
                <PageHeader />

                <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-2xl border border-border bg-card p-8">
                    <Spinner />
                    <p className="text-lg text-muted-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground/80">Please do not close this window.</p>
                </div>
            </div>
        );
    }

    if (state === "error") {
        return (
            <StatusPanel
                state="error"
                title="Connection Failed"
                message={message}
                details={details}
            />
        );
    }

    return (
        <StatusPanel
            state="success"
            title="X Connected"
            message={message}
        />
    );
}
