"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
    CalendarDays,
    ChevronRight,
    Clock3,
    LayoutDashboard,
    Link2,
    LockKeyhole,
    Send,
    ShieldCheck,
    Sparkles,
    Upload,
    Video,
    X,
} from "lucide-react";

import MarketingHeader from "./marketing-header";
import Pricing from "./pricing";
import { platforms } from "@/lib/platforms";
import { platformLandingHrefBySlug } from "@/lib/marketing-landing-pages";

const steps = [
    {
        title: "Connect your accounts",
        text: "Securely connect the social media accounts and channels you want to manage.",
        icon: Link2,
    },
    {
        title: "Create your content",
        text: "Upload photos or videos, write captions and descriptions, and select where you want your content published.",
        icon: Upload,
    },
    {
        title: "Schedule or publish",
        text: "Publish immediately or choose the exact date and time you want your content to go live.",
        icon: Clock3,
    },
    {
        title: "Manage everything",
        text: "View upcoming posts, manage connected accounts, and organize your publishing calendar from one dashboard.",
        icon: LayoutDashboard,
    },
];

const features = [
    ["Multi-platform publishing", "Create content once and publish it across the social networks you choose.", Send],
    ["Content calendar", "See your upcoming content and publishing schedule at a glance.", CalendarDays],
    ["Video scheduling", "Prepare and schedule video content for supported platforms including YouTube.", Video],
    ["Connected accounts", "Manage your connected social accounts from one place.", Link2],
    ["Flexible scheduling", "Publish immediately or schedule content for later.", Clock3],
    ["Simple workflow", "Spend less time switching between social media dashboards and more time creating.", Sparkles],
] as const;

const faqItems = [
    {
        question: "What is Amplypost?",
        answer:
            "Amplypost is a social media management platform that helps creators and businesses create, schedule, and publish content across supported social networks from one dashboard.",
    },
    {
        question: "Which social platforms does Amplypost support?",
        answer:
            "Amplypost supports Facebook, Instagram, YouTube, TikTok, LinkedIn, X, Threads, Bluesky, Pinterest, and Google Business Profile. Platform capabilities can vary because each social network has its own API rules and publishing limits.",
    },
    {
        question: "Can I connect my YouTube channel?",
        answer:
            "Yes. Users can securely connect supported YouTube channels through Google authorization to use Amplypost's YouTube publishing features.",
    },
    {
        question: "Why does Amplypost request access to my Google account?",
        answer:
            "Amplypost uses Google authorization to connect your YouTube channel and provide the YouTube features you choose to use, such as reading channel details needed for connection and uploading or publishing video content you prepare in Amplypost.",
    },
    {
        question: "Can I disconnect my accounts?",
        answer:
            "Yes. Connected accounts can be disconnected from Amplypost, and you can revoke Google account authorization from your Google account settings at any time.",
    },
    {
        question: "Does Amplypost post automatically?",
        answer:
            "Amplypost publishes content based on the actions and schedules you set. You choose the platforms, content, and timing before publishing or scheduling.",
    },
    {
        question: "Is my account information secure?",
        answer:
            "Amplypost uses official authorization flows for supported platforms and does not ask for your social media passwords. Review the Privacy Policy for more detail on how account data is handled.",
    },
];

const solutionLinks = [
    ["Facebook scheduler", "/schedule-facebook-posts"],
    ["TikTok scheduler", "/schedule-tiktok-posts"],
    ["YouTube Shorts scheduler", "/schedule-youtube-shorts"],
    ["Instagram scheduler", "/instagram-post-scheduler"],
    ["LinkedIn scheduler", "/linkedin-post-scheduler"],
    ["X scheduler", "/schedule-x-posts"],
    ["Threads scheduler", "/schedule-threads-posts"],
    ["Bluesky scheduler", "/schedule-bluesky-posts"],
    ["Pinterest scheduler", "/pinterest-post-scheduler"],
    ["Google Business Profile scheduler", "/google-business-profile-post-scheduler"],
    ["Small business scheduler", "/social-media-scheduler-for-small-businesses"],
    ["Agency scheduler", "/social-media-scheduler-for-agencies"],
    ["Nigerian business scheduler", "/social-media-scheduler-for-nigerian-businesses"],
    ["Buffer alternative", "/buffer-alternative"],
    ["Hootsuite alternative", "/hootsuite-alternative"],
    ["Metricool alternative", "/metricool-alternative"],
    ["Multi-platform scheduler", "/schedule-one-post-to-multiple-platforms"],
];

function SectionHeading({
    eyebrow,
    title,
    text,
    centered = true,
}: {
    eyebrow?: string;
    title: string;
    text: string;
    centered?: boolean;
}) {
    return (
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
            {eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {eyebrow}
                </p>
            )}
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                {text}
            </p>
        </div>
    );
}

function DemoVideo() {
    return (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="group relative aspect-[209/135] bg-black">
                <iframe
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/Mvx7EasIecQ"
                    title="How to schedule and publish contents to social media platforms using Amplypost"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

function BrowserMockup({
    title,
    text,
    imageSrc,
}: {
    title: string;
    text: string;
    imageSrc: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`View ${title} screenshot`}
                >
                    <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <span className="ml-2 text-xs font-medium text-muted-foreground">{title}</span>
                    </div>
                    <div className="relative aspect-[16/10] bg-black">
                        <Image
                            src={imageSrc}
                            alt={`${title} in the Amplypost interface`}
                            fill
                            sizes="(min-width: 1024px) 560px, 100vw"
                            className="object-contain transition-transform duration-300 hover:scale-[1.02]"
                        />
                    </div>
                </button>
                <p className="border-t border-border px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {text}
                </p>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${title} screenshot preview`}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-2 text-sm font-semibold text-foreground">{title}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Close preview"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[calc(92vh-58px)] overflow-auto bg-black p-3">
                            <Image
                                src={imageSrc}
                                alt={`${title} in the Amplypost interface`}
                                width={1800}
                                height={1100}
                                sizes="100vw"
                                className="mx-auto h-auto w-full max-w-none rounded-lg object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function HomePageClient() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MarketingHeader />

            <main>
                <section className="px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
                    <div className="mx-auto max-w-7xl text-center">
                        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
                            {platforms.map((platform) => (
                                <Link
                                    key={platform.name}
                                    href={`/${platformLandingHrefBySlug[platform.slug]}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm"
                                    title={platform.name}
                                >
                                    <Image
                                        src={platform.logo}
                                        alt={`${platform.name} logo`}
                                        width={28}
                                        height={28}
                                        className="h-7 w-7 object-contain"
                                    />
                                </Link>
                            ))}
                        </div>

                        <h1 className="mx-auto mt-8 max-w-5xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                            Schedule and publish your social media content from one place
                        </h1>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                            Amplypost helps creators and businesses create, schedule, and publish content to YouTube,
                            Instagram, Facebook, TikTok, LinkedIn, X, Threads, Bluesky, Pinterest, and Google Business Profile, all from one dashboard.
                        </p>

                        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link href="/create-account" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90">
                                Try it for free
                            </Link>
                            <a href="#how-it-works" className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-7 text-base font-semibold text-foreground transition hover:bg-accent">
                                See how it works
                            </a>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No credit card required</p>

                        <div className="mx-auto mt-14 max-w-5xl">
                            <DemoVideo />
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="https://openhunts.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="OpenHunts Club"
                            >
                                <Image
                                    alt="OpenHunts Club Member"
                                    height={105}
                                    src="https://cdn.openhunts.com/badges/club.webp"
                                    style={{ width: 195, height: "auto" }}
                                    width={486}
                                    unoptimized
                                />
                            </a>
                            <a
                                href="https://index.dodopayments.com/amplypost?utm_source=index&utm_medium=badge&utm_campaign=embed&utm_content=tool-amplypost"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="https://index.dodopayments.com/amplypost/badge.svg?theme=dark&width=250&height=50"
                                    width={250}
                                    height={50}
                                    alt="Amplypost badge"
                                    loading="lazy"
                                    unoptimized
                                />
                            </a>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="border-y border-border bg-muted/25 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            title="Everything you need to publish consistently"
                            text="Connect your accounts once, create your content, and let Amplypost handle your publishing schedule."
                        />

                        <div className="relative mt-12 grid gap-4 md:grid-cols-4">
                            <svg
                                className="pointer-events-none absolute left-[7%] right-[7%] top-12 hidden h-10 w-[86%] text-border md:block"
                                viewBox="0 0 1000 80"
                                fill="none"
                                aria-hidden="true"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M8 38 C 120 6, 205 6, 315 38 S 500 70, 620 38 S 815 6, 992 38"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray="10 12"
                                />
                            </svg>
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <article key={step.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p className="mt-6 text-sm font-bold text-primary">0{index + 1}</p>
                                        <h3 className="mt-2 text-lg font-bold text-foreground">{step.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="platforms" className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            title="One dashboard. All your social platforms."
                            text="Connect the channels your audience already follows and manage your publishing workflow without constantly switching between apps."
                        />
                        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
                            {platforms.map((platform) => (
                                <Link key={platform.name} href={`/${platformLandingHrefBySlug[platform.slug]}`} className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <Image
                                        src={platform.logo}
                                        alt={`${platform.name} logo`}
                                        width={38}
                                        height={38}
                                        className="mx-auto h-10 w-10 object-contain"
                                    />
                                    <h3 className="mt-3 text-sm font-semibold text-foreground">{platform.name}</h3>
                                </Link>
                            ))}
                        </div>
                        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
                            Publishing features depend on each platform&apos;s official API capabilities and account eligibility.
                        </p>
                    </div>
                </section>

                <section className="border-y border-border bg-muted/25 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-xl">
                            <Image
                                src="/amplypost-dashboard.png"
                                alt="Amplypost interface for managing publishing workflows including YouTube content"
                                width={1200}
                                height={675}
                                className="rounded-xl"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">YouTube Integration</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Connect your YouTube channel and publish from Amplypost
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Connect your YouTube channel to Amplypost and manage your video publishing workflow alongside your other social platforms.
                            </p>
                            <div className="mt-8 space-y-5">
                                {[
                                    ["Connect securely", "Sign in with Google and choose the YouTube channel you want to connect.", ShieldCheck],
                                    ["Prepare your video", "Upload your video and provide the information required for publishing.", Video],
                                    ["Schedule your content", "Choose when you want your video published and manage it alongside your other scheduled content.", CalendarDays],
                                ].map(([title, text, Icon]) => (
                                    <div key={title as string} className="flex gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{title as string}</h3>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text as string}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
                                <div className="flex gap-3">
                                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Amplypost requests Google and YouTube permissions only to provide the features you authorize. You remain in control of your connected account and can disconnect it at any time.
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                    <Link href="/privacy#google-user-data" className="text-primary hover:underline">Learn about our use of Google data</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            title="Built to simplify your social media workflow"
                            text="Plan, prepare, and publish content with a straightforward workflow built for creators, businesses, and social media managers."
                        />
                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map(([title, text, Icon]) => (
                                <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-y border-border bg-muted/25 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            title="A real look at the Amplypost workspace"
                            text="Use the Amplypost dashboard to organize your content workflow, review upcoming posts, and manage the accounts connected to your publishing calendar."
                        />
                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            <BrowserMockup
                                title="Create Post"
                                imageSrc="/create-post.png"
                                text="Prepare content, choose platforms, and add the details required by each selected destination."
                            />
                            <BrowserMockup
                                title="Calendar"
                                imageSrc="/calendar-view.png"
                                text="Review scheduled content and keep your publishing plan organized across days and campaigns."
                            />
                            <BrowserMockup
                                title="Connected Accounts"
                                imageSrc="/connected-accounts.png"
                                text="See connected social accounts and manage the channels available for publishing."
                            />
                        </div>
                    </div>
                </section>

                <Pricing />

                <section id="faq" className="border-y border-border bg-muted/25 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <SectionHeading
                            title="Frequently asked questions"
                            text="Clear answers about Amplypost, supported platforms, YouTube authorization, and account control."
                        />
                        <div className="mt-12 space-y-4">
                            {faqItems.map((item) => (
                                <details key={item.question} className="group rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-lg font-semibold text-foreground">
                                        {item.question}
                                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-open:rotate-90" />
                                    </summary>
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl rounded-3xl bg-foreground px-6 py-14 text-center text-background shadow-xl sm:px-10">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Ready to simplify your social media workflow?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-background/70">
                            Connect your accounts and start planning your content from one dashboard.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link href="/create-account" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90">
                                Try Amplypost for free
                            </Link>
                            <a href="#pricing" className="inline-flex h-11 items-center justify-center rounded-lg border border-background/20 px-6 text-sm font-semibold text-background hover:bg-background/10">
                                View pricing
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-muted/25 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2">
                                <Image src="/amplypost-logo.png" alt="Amplypost logo" width={30} height={30} className="h-7 w-7" />
                                <span className="text-lg font-bold">Amplypost</span>
                            </div>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                                Social media scheduling and publishing for creators, businesses, and social media managers.
                            </p>
                        </div>
                        {[
                            ["Product", [["Features", "#features"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Login", "/login"]]],
                            ["Solutions", solutionLinks],
                            ["Legal", [["Privacy Policy", "/privacy"], ["Terms of Service", "/tos"], ["Google User Data Policy", "/privacy#google-user-data"]]],
                            ["Support", [["Contact", "mailto:support@amplypost.com"], ["Help/Support", "/support"]]],
                        ].map(([heading, links]) => (
                            <div key={heading as string}>
                                <h3 className="text-sm font-bold text-foreground">{heading as string}</h3>
                                <ul className="mt-4 space-y-2">
                                    {(links as string[][]).map(([label, href]) => (
                                        <li key={label}>
                                            <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
                        © 2026 Amplypost. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
