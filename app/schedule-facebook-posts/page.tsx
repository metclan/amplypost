import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileImage,
    Film,
    Hash,
    ImageIcon,
    Layers3,
    MessageSquareText,
    PlayCircle,
    Send,
    Smartphone,
    Users,
    Video,
    Zap,
} from "lucide-react";

import Footer from "@/app/components/footer";
import MarketingHeader from "@/app/components/marketing-header";
import Pricing from "@/app/components/pricing";

const canonicalUrl = "https://www.amplypost.com/schedule-facebook-posts";
const pageTitle = "Facebook Post Scheduler - Schedule Posts, Reels and Stories | Amplypost";
const pageDescription =
    "Schedule Facebook posts, Reels and Stories with Amplypost. Manage multiple Facebook Pages, customize captions, and publish now or later.";
const socialImage = "https://res.cloudinary.com/deamgyfii/image/upload/v1772100248/Social_media_scheduler_kgx1qd.png";

export const metadata: Metadata = {
    title: {
        absolute: pageTitle,
    },
    description: pageDescription,
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        siteName: "Amplypost",
        type: "website",
        images: [
            {
                url: socialImage,
                width: 1200,
                height: 630,
                alt: "Amplypost social media scheduling dashboard",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [socialImage],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
};

const proofPoints = [
    "Facebook feed posts",
    "Reels and video publishing",
    "Photo and video Stories",
    "Multiple Facebook Pages",
];

const howToSteps = [
    {
        title: "Connect your Facebook Page",
        text: "Start by connecting the Facebook Page you want to publish to. Amplypost's Facebook workflow is built for connected Pages and accounts, not personal-profile publishing claims.",
        screenshot: "Facebook connection or connected Facebook Page state",
    },
    {
        title: "Create your content",
        text: "Open the post composer, add the content for the campaign, and decide whether the Facebook update needs text, images, multiple images, video, a Story, or a mix of feed and Story publishing.",
        screenshot: "Amplypost Facebook post composer with Facebook selected",
    },
    {
        title: "Select one or multiple Facebook Pages",
        text: "Choose a single connected Facebook Page or select multiple Facebook Pages when the same campaign needs to go to more than one destination.",
        screenshot: "Account selector with multiple Facebook Pages selected",
    },
    {
        title: "Add your media",
        text: "Upload images, multiple images, or video content. Facebook videos published through Amplypost can appear in the Page's video/Reels experience, and Stories can use photo or video media.",
        screenshot: "Multi-image or video upload state in the composer",
    },
    {
        title: "Write the Facebook caption",
        text: "Write the caption in the composer, add saved hashtag groups when they are useful, and keep frequently used emojis close instead of hunting for the same small details each time.",
        screenshot: "Caption editor showing hashtag and emoji controls",
    },
    {
        title: "Customize captions for different Pages",
        text: "When more than one Facebook Page is selected, one campaign does not have to mean one identical caption. An agency can reuse campaign media while adapting the wording for each client Page.",
        screenshot: "Different captions mode with two Facebook Pages",
    },
    {
        title: "Publish now or schedule for later",
        text: "Send the post immediately when it needs to go live now, or choose a future date, time, and timezone so the Facebook content is ready before publishing day.",
        screenshot: "Schedule controls with date, time, and timezone selected",
    },
];

const contentFormats = [
    {
        title: "Facebook Posts",
        text: "Prepare standard Facebook feed posts for Page updates, announcements, offers, and campaign messages.",
        icon: MessageSquareText,
    },
    {
        title: "Image Posts",
        text: "Publish a single image with a Facebook caption when the message needs a focused visual.",
        icon: ImageIcon,
    },
    {
        title: "Multi-Image Posts",
        text: "Add multiple images to one Facebook post for launches, event recaps, product drops, or before-and-after updates.",
        icon: Layers3,
    },
    {
        title: "Facebook Reels and Videos",
        text: "Prepare video content in the same workflow as your other Facebook publishing, including content that appears in the video/Reels experience.",
        icon: Film,
    },
    {
        title: "Facebook Stories",
        text: "Plan photo Stories and video Stories alongside feed content so campaign reminders are not left to memory.",
        icon: Smartphone,
    },
];

const workflowFeatures = [
    {
        title: "Hashtag manager",
        text: "Save hashtag groups for repeat use, including Facebook-specific sets when a campaign or brand uses the same tags often.",
        icon: Hash,
    },
    {
        title: "Favorite emojis",
        text: "Keep frequently used emojis accessible while writing captions, especially when different Pages need different tones.",
        icon: MessageSquareText,
    },
    {
        title: "Publish immediately",
        text: "Use publish now for timely announcements, urgent updates, and posts that are ready to go live.",
        icon: Zap,
    },
    {
        title: "Schedule for later",
        text: "Choose a future publishing time so Facebook content is prepared before launch day or campaign week.",
        icon: Clock3,
    },
];

const audiences = [
    {
        title: "Small businesses",
        text: "Prepare promotions, announcements, launches, and regular Page updates in advance.",
        href: "/social-media-scheduler-for-small-businesses",
        linkText: "social media scheduler for small businesses",
    },
    {
        title: "Social media managers",
        text: "Keep Facebook publishing work visible without repeatedly opening individual social networks.",
    },
    {
        title: "Agencies",
        text: "Manage campaign content across multiple client Pages and customize captions where each brand needs its own voice.",
        href: "/social-media-scheduler-for-agencies",
        linkText: "social media scheduler for agencies",
    },
    {
        title: "Ecommerce brands",
        text: "Plan product launches, offers, new arrivals, and campaign reminders before the promotion starts.",
    },
    {
        title: "Creators",
        text: "Prepare Facebook video and Reel-style content alongside feed posts and Stories.",
    },
    {
        title: "Local businesses",
        text: "Schedule offers, event updates, seasonal notices, and regular business announcements.",
    },
];

const schedulingReasons = [
    "Keep Facebook posting consistent without relying on someone to remember every publishing time.",
    "Prepare launch-day content before the launch, then schedule the post for the intended moment.",
    "Reduce repetitive work by creating the Facebook post once instead of reopening Facebook for each update.",
    "Coordinate campaigns across multiple Facebook Pages from one content workflow.",
    "Keep Facebook aligned with Instagram, TikTok, LinkedIn, and other channels in the same calendar.",
    "Separate creation time from publishing time, so content can be made when your team has focus and published when it needs to appear.",
];

const faqs = [
    {
        question: "Can I schedule Facebook posts with Amplypost?",
        answer: "Yes. Amplypost supports Facebook publishing for connected Facebook accounts and Pages, including scheduled publishing.",
    },
    {
        question: "Can I schedule Facebook posts in advance?",
        answer: "Yes. You can choose schedule for later, then set the publishing date, time, and timezone in the Amplypost composer.",
    },
    {
        question: "Can I publish a Facebook post immediately?",
        answer: "Yes. Amplypost supports publishing immediately when the post is ready to go live now.",
    },
    {
        question: "Can I schedule Facebook Reels?",
        answer: "Amplypost supports Facebook video publishing, and published Facebook videos have been verified in the Page's video/Reels experience.",
    },
    {
        question: "Can I schedule Facebook Stories?",
        answer: "Yes. Amplypost supports Facebook Story publishing for eligible selected Facebook accounts.",
    },
    {
        question: "Can I schedule both photo and video Facebook Stories?",
        answer: "Yes. Amplypost supports photo Stories and video Stories for Facebook.",
    },
    {
        question: "Can I manage multiple Facebook Pages?",
        answer: "Yes. You can select one or multiple connected Facebook Pages when preparing a post.",
    },
    {
        question: "Can different Facebook Pages have different captions?",
        answer: "Yes. When multiple accounts are selected, Amplypost can use different captions for individual selected Facebook accounts.",
    },
    {
        question: "Can I publish multiple images in one Facebook post?",
        answer: "Yes. Amplypost supports multi-image Facebook posts.",
    },
    {
        question: "Can I manage Facebook alongside my other social media accounts?",
        answer: "Yes. Amplypost is built for cross-platform publishing, so Facebook can sit beside other supported social channels in one workflow.",
    },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{children}</p>;
}

function PrimaryCta({ children = "Start Scheduling Facebook Posts" }: { children?: React.ReactNode }) {
    return (
        <Link
            href="/create-account"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
            {children}
            <ArrowRight className="h-4 w-4" />
        </Link>
    );
}

function ScreenshotPlaceholder({
    title,
    alt,
    imageSrc = "/create-post.png",
    comment,
}: {
    title: string;
    alt: string;
    imageSrc?: string;
    comment: string;
}) {
    return (
        <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* TODO screenshot: Capture this state for the final page asset: {comment}. */}
            <span className="sr-only">{comment}</span>
            <Image
                src={imageSrc}
                alt={alt}
                width={1200}
                height={760}
                className="h-auto w-full object-cover"
                sizes="(min-width: 1024px) 520px, 100vw"
            />
            <figcaption className="border-t border-border px-4 py-3 text-xs font-medium text-muted-foreground">{title}</figcaption>
        </figure>
    );
}

function VideoDemo() {
    const videoSrc = "";
    const posterSrc = "";

    return (
        <section id="demo" className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                    <SectionLabel>Product demo</SectionLabel>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        See Facebook Scheduling in Amplypost
                    </h2>
                    <p className="mt-5 text-base leading-7 text-muted-foreground">
                        The Screen Studio walkthrough belongs here once the final recording is ready. The page still explains the full workflow below, so visitors can understand Facebook scheduling even before watching the demo.
                    </p>
                    <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
                        {["Select Facebook Pages", "Add image, video, or multi-image media", "Use different captions by Page", "Publish now or schedule for later"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl">
                    {/* TODO video: Add the final Screen Studio video src, poster thumbnail, duration, and upload date before enabling VideoObject schema. */}
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-foreground text-background">
                        {videoSrc ? (
                            <video
                                controls
                                preload="metadata"
                                poster={posterSrc || undefined}
                                className="h-full w-full"
                                aria-label="Screen Studio walkthrough showing how to schedule Facebook posts in Amplypost"
                            >
                                <source src={videoSrc} type="video/mp4" />
                            </video>
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                                <PlayCircle className="h-14 w-14 text-primary" />
                                <p className="mt-4 text-lg font-semibold">Screen Studio demo placeholder</p>
                                <p className="mt-2 max-w-md text-sm leading-6 text-background/70">
                                    Add the final hosted demo video here after recording the real Facebook scheduling workflow.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StructuredData() {
    const schema = [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: pageTitle,
            description: pageDescription,
            url: canonicalUrl,
            isPartOf: {
                "@type": "WebSite",
                name: "Amplypost",
                url: "https://www.amplypost.com/",
            },
            about: {
                "@type": "SoftwareApplication",
                name: "Amplypost",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                url: "https://www.amplypost.com/",
                description: "A social media scheduling and cross-posting platform for supported social networks.",
                featureList: [
                    "Facebook feed publishing",
                    "Facebook video publishing",
                    "Facebook Story publishing",
                    "Multiple Facebook Page selection",
                    "Per-account caption customization",
                    "Publish now or schedule for later",
                ],
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.amplypost.com/",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Facebook Post Scheduler",
                    item: canonicalUrl,
                },
            ],
        },
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
            }}
        />
    );
}

export default function ScheduleFacebookPostsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <StructuredData />
            <MarketingHeader featuresHref="#formats" howItWorksHref="#how-to-schedule" />
            <main>
                <section className="border-b border-border px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                                    <Image src="/facebook-logo.svg" alt="Facebook logo" width={28} height={28} priority className="h-7 w-7" />
                                </span>
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    Facebook scheduler
                                </span>
                            </div>
                            <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                                Schedule Facebook Posts, Reels and Stories with Amplypost
                            </h1>
                            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                                Create Facebook content, select one or multiple Pages, customize captions by Page, and publish immediately or schedule for later from the same workspace you use for your other social channels.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <PrimaryCta>Schedule a Facebook Post</PrimaryCta>
                                <a
                                    href="#demo"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                                >
                                    <PlayCircle className="h-4 w-4" />
                                    Watch How It Works
                                </a>
                            </div>
                            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
                                {proofPoints.map((item) => (
                                    <span key={item} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ScreenshotPlaceholder
                                title="Facebook content prepared inside Amplypost"
                                alt="Amplypost composer for preparing Facebook content"
                                imageSrc="/create-post.png"
                                comment="Facebook post composer with Facebook selected, media uploaded, and caption controls visible"
                            />
                            <div className="grid gap-3 sm:grid-cols-3">
                                {["Feed", "Story", "Schedule"].map((item) => (
                                    <div key={item} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                                        <p className="text-sm font-semibold text-foreground">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <VideoDemo />

                <section id="how-to-schedule" className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <SectionLabel>Step by step</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                How to Schedule Facebook Posts with Amplypost
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Amplypost keeps the full Facebook publishing path in one place: account selection, content creation, media upload, caption writing, Story options, and scheduling.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 lg:grid-cols-2">
                            {howToSteps.map((step, index) => (
                                <article key={step.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
                                            {/* TODO screenshot: Capture {step.screenshot}. */}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="formats" className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
                            <div>
                                <SectionLabel>Content formats</SectionLabel>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    Create More Than Just Facebook Posts
                                </h2>
                                <p className="mt-5 text-base leading-7 text-muted-foreground">
                                    Facebook publishing is not one format anymore. Amplypost supports the feed, multi-image posts, video/Reels content, and Stories from a single composer.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {contentFormats.map((format) => {
                                    const Icon = format.icon;
                                    return (
                                        <article key={format.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="mt-4 text-base font-bold text-foreground">{format.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{format.text}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
                        <div>
                            <SectionLabel>Multiple Pages</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Manage Multiple Facebook Pages from One Workflow
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Select multiple connected Facebook Pages when one campaign needs to reach more than one audience. Then adapt the caption for each Page instead of forcing every brand to use the exact same wording.
                            </p>
                            <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
                                <p className="text-sm font-semibold text-foreground">Same campaign media. Different Page captions.</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-border bg-background p-4">
                                        <p className="text-xs font-semibold text-muted-foreground">Facebook Page A</p>
                                        <p className="mt-2 text-sm text-foreground">New arrivals are here. Visit us today.</p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-background p-4">
                                        <p className="text-xs font-semibold text-muted-foreground">Facebook Page B</p>
                                        <p className="mt-2 text-sm text-foreground">Our latest collection just landed. Explore what is new.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ScreenshotPlaceholder
                            title="Different captions for selected Facebook Pages"
                            alt="Different caption fields for multiple Facebook Pages in Amplypost"
                            comment="Different captions mode with at least two selected Facebook Pages and distinct caption text"
                        />
                    </div>
                </section>

                <section className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
                        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <Video className="h-8 w-8 text-primary" />
                            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                                Schedule Facebook Reels Without Switching Workflows
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                Your Facebook videos do not need a separate planning process. Prepare video content in Amplypost, publish it to Facebook, and keep Reels, posts, and Stories beside the rest of your content schedule.
                            </p>
                            {/* TODO screenshot: Capture Facebook video/Reel creation with a video uploaded and Facebook selected. */}
                        </article>
                        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <FileImage className="h-8 w-8 text-primary" />
                            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                                Plan Facebook Stories Alongside Your Posts
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                Amplypost supports Facebook photo Stories and video Stories. A campaign can include a feed post, a video, and a Story without asking the social media manager to manually remember each publishing task.
                            </p>
                            {/* TODO screenshot: Capture feed plus Story or Story-only mode for a selected Facebook account. */}
                        </article>
                    </div>
                </section>

                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <SectionLabel>Cross-platform calendar</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Facebook Is Only One Part of Your Content Calendar
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Amplypost helps you avoid downloading media, opening Facebook, uploading, then repeating the same work elsewhere. Use one workflow to prepare Facebook content alongside channels like{" "}
                                <Link href="/instagram-post-scheduler" className="font-medium text-primary hover:underline">
                                    Instagram
                                </Link>
                                ,{" "}
                                <Link href="/schedule-tiktok-posts" className="font-medium text-primary hover:underline">
                                    TikTok
                                </Link>
                                , and{" "}
                                <Link href="/linkedin-post-scheduler" className="font-medium text-primary hover:underline">
                                    LinkedIn
                                </Link>
                                .
                            </p>
                            <p className="mt-4 text-base leading-7 text-muted-foreground">
                                For campaigns that need more than Facebook, see how Amplypost can{" "}
                                <Link href="/schedule-one-post-to-multiple-platforms" className="font-medium text-primary hover:underline">
                                    schedule one post to multiple social media platforms
                                </Link>
                                .
                            </p>
                        </div>
                        <ScreenshotPlaceholder
                            title="Scheduled content visible from the Amplypost calendar"
                            alt="Amplypost calendar showing scheduled social media content"
                            imageSrc="/calendar-view.png"
                            comment="Calendar or scheduled content view with Facebook content visible alongside other platforms"
                        />
                    </div>
                </section>

                <section className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <SectionLabel>Small workflow features</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Spend Less Time Repeating the Small Things
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Facebook scheduling is smoother when the little pieces of publishing are close at hand.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-4 md:grid-cols-4">
                            {workflowFeatures.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <article key={feature.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                                        <Icon className="h-6 w-6 text-primary" />
                                        <h3 className="mt-4 text-base font-bold text-foreground">{feature.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <SectionLabel>Use cases</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Who Is Amplypost&apos;s Facebook Scheduler For?
                            </h2>
                        </div>
                        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {audiences.map((audience) => (
                                <article key={audience.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                                    <Users className="h-6 w-6 text-primary" />
                                    <h3 className="mt-4 text-base font-bold text-foreground">{audience.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {audience.text}
                                        {audience.href && (
                                            <>
                                                {" "}
                                                Learn more about Amplypost as a{" "}
                                                <Link href={audience.href} className="font-medium text-primary hover:underline">
                                                    {audience.linkText}
                                                </Link>
                                                .
                                            </>
                                        )}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <SectionLabel>Planning value</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Why Schedule Facebook Content in Advance?
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Scheduling is useful because it separates the moment content is created from the moment it needs to appear on Facebook.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {schedulingReasons.map((reason) => (
                                <div key={reason} className="flex gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
                                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                    <p className="text-sm leading-6 text-muted-foreground">{reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="text-center">
                            <SectionLabel>FAQ</SectionLabel>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Facebook Scheduling Questions
                            </h2>
                        </div>
                        <div className="mt-10 space-y-4">
                            {faqs.map((item) => (
                                <article key={item.question} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl rounded-xl bg-foreground px-6 py-14 text-center text-background shadow-xl sm:px-10">
                        <Send className="mx-auto h-8 w-8 text-primary" />
                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Schedule Your Next Facebook Post with Amplypost
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-background/70">
                            Plan posts, Reels, and Stories, manage multiple Facebook Pages, customize captions, and publish from one streamlined workflow.
                        </p>
                        <div className="mt-8">
                            <PrimaryCta>Start Scheduling Facebook Posts</PrimaryCta>
                        </div>
                    </div>
                </section>

                <Pricing />
            </main>
            <Footer />
        </div>
    );
}
