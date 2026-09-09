"use client";

export class SubscriptionRequiredError extends Error {
    constructor(message = "An active subscription is required to continue.") {
        super(message);
        this.name = "SubscriptionRequiredError";
    }
}

export type AuthFailureCode =
    | "NO_ACTIVE_SESSION"
    | "SESSION_READ_FAILED"
    | "EMAIL_NOT_VERIFIED"
    | "ORGANIZATION_REQUIRED";

export class AuthFailureError extends Error {
    code: AuthFailureCode;
    redirectTo: string;

    constructor(code: AuthFailureCode, message: string, redirectTo: string) {
        super(message);
        this.name = "AuthFailureError";
        this.code = code;
        this.redirectTo = redirectTo;
    }
}

type ApiErrorPayload = {
    code?: string;
    action?: string;
    email?: string;
    error?: string;
    message?: string;
};

export function getApiErrorMessage(payload: ApiErrorPayload | null | undefined, fallback: string) {
    return payload?.message || payload?.error || fallback;
}

export function isSubscriptionRequired(status: number, payload: ApiErrorPayload | null | undefined) {
    return (
        status === 402 ||
        payload?.code === "SUBSCRIPTION_REQUIRED" ||
        payload?.error === "SUBSCRIPTION_REQUIRED" ||
        payload?.message === "SUBSCRIPTION_REQUIRED"
    );
}

export function isSubscriptionRequiredError(error: unknown) {
    if (error instanceof SubscriptionRequiredError) return true;
    if (!(error instanceof Error)) return false;

    return (
        error.message === "SUBSCRIPTION_REQUIRED" ||
        error.message.includes("SUBSCRIPTION_REQUIRED") ||
        error.message.toLowerCase().includes("subscription required")
    );
}

function getAuthFailureCode(status: number, payload: ApiErrorPayload | null | undefined): AuthFailureCode | null {
    const code = payload?.code || payload?.error;

    if (status === 401 && (code === "NO_ACTIVE_SESSION" || code === "SESSION_READ_FAILED")) {
        return code;
    }

    if (status === 403 && (code === "EMAIL_NOT_VERIFIED" || payload?.action === "VERIFY_EMAIL")) {
        return "EMAIL_NOT_VERIFIED";
    }

    if (status === 403 && code === "ORGANIZATION_REQUIRED") {
        return "ORGANIZATION_REQUIRED";
    }

    return null;
}

function getAuthFailureRedirect(code: AuthFailureCode, payload: ApiErrorPayload | null | undefined) {
    if (code === "EMAIL_NOT_VERIFIED") {
        return payload?.email ? `/verify-email?email=${encodeURIComponent(payload.email)}` : "/verify-email";
    }

    if (code === "ORGANIZATION_REQUIRED") {
        return "/workspaces/create";
    }

    if (code === "SESSION_READ_FAILED") {
        return "/login?message=session_expired";
    }

    return "/login";
}

function redirectForAuthFailure(redirectTo: string) {
    if (typeof window === "undefined") return;

    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (currentPath !== redirectTo) {
        window.location.assign(redirectTo);
    }
}

export async function parseApiErrorResponse(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    const authFailureCode = getAuthFailureCode(response.status, payload);

    if (authFailureCode) {
        const redirectTo = getAuthFailureRedirect(authFailureCode, payload);
        redirectForAuthFailure(redirectTo);

        throw new AuthFailureError(
            authFailureCode,
            getApiErrorMessage(payload, fallback),
            redirectTo,
        );
    }

    if (isSubscriptionRequired(response.status, payload)) {
        throw new SubscriptionRequiredError(
            getApiErrorMessage(payload, "An active subscription is required to continue."),
        );
    }

    throw new Error(getApiErrorMessage(payload, fallback));
}
