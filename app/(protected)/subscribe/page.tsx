import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
    title: "Subscription Required | Amplypost",
    description: "An active subscription is required to create and schedule posts on Amplypost.",
};

const perks = [
    "Post to TikTok, Instagram, X, LinkedIn & more",
    "Schedule posts in advance, any time zone",
    "Manage all your accounts from one place",
    "Detailed analytics on every post",
];

export default function SubscribePage() {
    return (
        <div className="flex items-start justify-center px-4 pt-8 pb-12">
            <div className="w-full max-w-sm sm:max-w-md border border-border rounded-2xl bg-card p-6 sm:p-8 space-y-6 shadow-sm">

                {/* Eyebrow + Heading */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                        Subscription Required
                    </p>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight">
                        You don&apos;t have an active subscription
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Creating and scheduling posts requires an active Amplypost plan.
                        Subscribe to a plan to get started.
                    </p>
                </div>

                {/* Perks */}
                <ul className="space-y-3 border border-border rounded-xl p-4 bg-muted/40">
                    {perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-3 text-sm text-foreground">
                            <span className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                            </span>
                            {perk}
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/billing"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Subscribe
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted active:scale-[0.98] transition-all"
                    >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
