"use client";

export class SubscriptionRequiredError extends Error {
    constructor(message = "An active subscription is required to continue.") {
        super(message);
        this.name = "SubscriptionRequiredError";
    }
}

type ApiErrorPayload = {
    code?: string;
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

export async function parseApiErrorResponse(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

    if (isSubscriptionRequired(response.status, payload)) {
        throw new SubscriptionRequiredError(
            getApiErrorMessage(payload, "An active subscription is required to continue."),
        );
    }

    throw new Error(getApiErrorMessage(payload, fallback));
}
