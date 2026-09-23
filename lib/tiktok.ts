"use client";

export type TikTokIdentity = { email?: string; phoneNumber?: string; id?: string };
type EventName = "ViewContent" | "CompleteRegistration" | "StartTrial" | "Purchase";
type EventProperties = {
    contents?: { content_id: string; content_type: "product"; content_name: string }[];
    value?: number;
    currency?: string;
};

declare global {
    interface Window {
        ttq?: {
            identify: (identity: Record<string, string>) => void;
            track: (event: EventName, properties: EventProperties) => void;
        };
    }
}

const sent = new Set<string>();
let queue = Promise.resolve();

async function sha256(value: string) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Serialize identify + track so concurrent events cannot switch identities midway.
// Analytics failures must never interrupt signup, billing, or navigation.
export function trackTikTok(event: EventName, properties: EventProperties = {}, identity: TikTokIdentity = {}, key?: string) {
    const task = async () => {
        try {
            const storageKey = key ? `amplypost:tiktok:${event}:${await sha256(key)}` : undefined;
            if (storageKey && (sent.has(storageKey) || localStorage.getItem(storageKey))) return;
            const hashed: Record<string, string> = {};
            if (identity.email?.trim()) hashed.email = await sha256(identity.email.trim().toLowerCase());
            // Only accept international phone numbers; never guess a country code.
            const phone = identity.phoneNumber?.replace(/[\s()-]/g, "");
            if (phone && /^\+[1-9]\d{7,14}$/.test(phone)) hashed.phone_number = await sha256(phone);
            if (identity.id?.trim()) hashed.external_id = await sha256(identity.id.trim());
            // The base pixel loads after hydration. Wait briefly for its command queue.
            for (let attempt = 0; !window.ttq?.track && attempt < 20; attempt++) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            if (!window.ttq?.track) return;
            if (Object.keys(hashed).length) window.ttq.identify(hashed);
            window.ttq.track(event, properties);
            if (storageKey) {
                sent.add(storageKey);
                localStorage.setItem(storageKey, "1");
            }
        } catch {
            // Tracking is best effort, including when browser storage is disabled.
        }
    };
    queue = queue.then(task, task);
    return queue;
}

export type TrackedSubscription = {
    id?: string;
    dodoSubscriptionId?: string | null;
    status?: string;
    hasAccess?: boolean;
    isTrialing?: boolean;
    trialStartedAt?: string | null;
    confirmedPayment?: { id: string; dodoPaymentId?: string | null; status: string; amount: number; currency: string } | null;
    plan?: { id: string; name: string; price: number; currency: string };
};

export async function trackConfirmedSubscription(subscription: TrackedSubscription, identity: TikTokIdentity, checkoutSubscriptionId?: string | null) {
    const { plan } = subscription;
    if (!subscription.id || !subscription.hasAccess || !plan) return Promise.resolve();
    const contents = [{ content_id: plan.id, content_type: "product" as const, content_name: plan.name }];
    if (subscription.isTrialing && subscription.trialStartedAt) {
        await trackTikTok("StartTrial", { contents, value: 0, currency: plan.currency }, identity, subscription.id);
    }
    const payment = subscription.confirmedPayment;
    // Only a webhook-confirmed payment for the returned subscription proves a purchase.
    if (checkoutSubscriptionId && subscription.dodoSubscriptionId === checkoutSubscriptionId &&
        payment?.id && payment.status === "succeeded" &&
        Number.isFinite(payment.amount) && payment.amount > 0 && /^[A-Z]{3}$/.test(payment.currency)) {
        return trackTikTok("Purchase", { contents, value: payment.amount, currency: payment.currency }, identity, payment.id);
    }
    return Promise.resolve();
}
