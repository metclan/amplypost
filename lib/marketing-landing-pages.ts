import type { LucideIcon } from "lucide-react";
import {
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Globe2,
    Layers3,
    Megaphone,
    Repeat2,
    ShieldCheck,
    Sparkles,
    Users,
    Video,
    WalletCards,
    Zap,
} from "lucide-react";

export type LandingPageSlug =
    | "schedule-facebook-posts"
    | "schedule-tiktok-posts"
    | "schedule-youtube-shorts"
    | "instagram-post-scheduler"
    | "linkedin-post-scheduler"
    | "schedule-x-posts"
    | "schedule-threads-posts"
    | "schedule-bluesky-posts"
    | "pinterest-post-scheduler"
    | "google-business-profile-post-scheduler"
    | "social-media-scheduler-for-small-businesses"
    | "social-media-scheduler-for-agencies"
    | "social-media-scheduler-for-nigerian-businesses"
    | "buffer-alternative"
    | "hootsuite-alternative"
    | "metricool-alternative"
    | "schedule-one-post-to-multiple-platforms";

export type LandingPageFeature = {
    title: string;
    text: string;
    icon: LucideIcon;
};

export type LandingPageData = {
    slug: LandingPageSlug;
    eyebrow: string;
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    primaryCta: string;
    secondaryCta: string;
    image: {
        src: string;
        alt: string;
    };
    logos: Array<{
        src: string;
        alt: string;
    }>;
    proof: string[];
    features: LandingPageFeature[];
    workflowTitle: string;
    workflowText: string;
    workflow: string[];
    comparisonTitle: string;
    comparisonText: string;
    comparison: string[];
    demo?: {
        title: string;
        items: string[];
    };
    supportedContentTypes?: string[];
    planInfo?: {
        title: string;
        text: string;
        items: string[];
    };
    cta?: {
        title: string;
        text: string;
        button: string;
    };
    faq: Array<{
        question: string;
        answer: string;
    }>;
};

const allPlatformLogos = [
    { src: "/instagram-logo.svg", alt: "Instagram" },
    { src: "/tiktok-logo.png", alt: "TikTok" },
    { src: "/youtube-logo.svg", alt: "YouTube" },
    { src: "/linkedin-logo.svg", alt: "LinkedIn" },
    { src: "/facebook-logo.svg", alt: "Facebook" },
    { src: "/threads-logo.png", alt: "Threads" },
    { src: "/twitter-logo.png", alt: "X" },
    { src: "/pinterest-logo.svg", alt: "Pinterest" },
    { src: "/google-my-business-logo.svg", alt: "Google Business Profile" },
];

export const landingPages: Record<LandingPageSlug, LandingPageData> = {
    "schedule-facebook-posts": {
        slug: "schedule-facebook-posts",
        eyebrow: "Facebook scheduler",
        title: "Schedule Facebook posts from the same calendar as every campaign",
        description: "Plan Page updates, product announcements, promotions, and community posts without jumping between social media dashboards.",
        metaTitle: "Schedule Facebook Posts | Amplypost",
        metaDescription: "Use Amplypost to schedule Facebook posts and manage Facebook publishing alongside your other social channels.",
        primaryCta: "Schedule Facebook posts",
        secondaryCta: "See Facebook workflow",
        image: { src: "/calendar-view.png", alt: "Amplypost calendar for scheduling Facebook posts" },
        logos: [{ src: "/facebook-logo.svg", alt: "Facebook" }],
        proof: ["Facebook Page planning", "Campaign calendar", "Multi-platform support"],
        features: [
            { title: "Plan Page updates", text: "Prepare business news, promos, launches, and regular updates before publishing day.", icon: Megaphone },
            { title: "Keep timing visible", text: "See Facebook posts beside your Instagram, LinkedIn, TikTok, and other scheduled content.", icon: CalendarDays },
            { title: "Reduce platform switching", text: "Use one workflow for creating and scheduling posts across connected social accounts.", icon: Layers3 },
        ],
        workflowTitle: "Put Facebook into your real publishing plan",
        workflowText: "Amplypost gives Facebook content a clear route from draft to scheduled post.",
        workflow: ["Connect your Facebook account.", "Prepare your post copy and media.", "Choose the publishing date and time.", "Review it from your Amplypost calendar."],
        comparisonTitle: "For businesses that still rely on Facebook reach",
        comparisonText: "Facebook works better when it is planned with the rest of your campaign, not treated as an afterthought.",
        comparison: ["Useful for community updates", "Good for launch and promo calendars", "Easy to coordinate with Instagram and other channels"],
        faq: [
            { question: "Can Amplypost schedule Facebook posts?", answer: "Yes. Amplypost supports Facebook publishing workflows for connected accounts." },
            { question: "Can I schedule Facebook with other platforms?", answer: "Yes. Amplypost is built to help you manage Facebook alongside supported platforms like Instagram, TikTok, LinkedIn, YouTube, X, Threads, Pinterest, Bluesky, and Google Business Profile." },
        ],
    },
    "schedule-tiktok-posts": {
        slug: "schedule-tiktok-posts",
        eyebrow: "TikTok page",
        title: "TikTok Content Publishing",
        description: "Plan, create, schedule, and publish TikTok videos from one simple workspace.",
        metaTitle: "TikTok Content Publishing | Amplypost",
        metaDescription: "Plan, create, schedule, and publish TikTok videos from one simple Amplypost workspace.",
        primaryCta: "Start free",
        secondaryCta: "See it in action",
        image: { src: "/create-post.png", alt: "Amplypost create post screen for scheduling TikTok content" },
        logos: [{ src: "/tiktok-logo.png", alt: "TikTok" }],
        proof: ["Upload videos", "Add captions and hashtags", "Schedule TikTok posts"],
        features: [
            { title: "Create TikTok posts", text: "Upload videos, write captions, add hashtags, and prepare publishing details without switching between tools.", icon: Video },
            { title: "Preview before publishing", text: "Review your video, caption, hashtags, mentions, and publishing details before your TikTok post goes live.", icon: ShieldCheck },
            { title: "Schedule at the right time", text: "Choose when each TikTok video should publish and manage upcoming posts from your content calendar.", icon: CalendarDays },
        ],
        workflowTitle: "Step-by-step TikTok publishing",
        workflowText: "Create and manage TikTok posts without switching between tools. Perfect for creators, brands, agencies, and social media teams managing TikTok content at scale.",
        workflow: ["Connect your TikTok account.", "Upload your video.", "Add a caption, hashtags, and mentions.", "Choose a cover image or thumbnail.", "Preview your TikTok post.", "Publish immediately or schedule for later.", "Track and manage your scheduled posts from the content calendar."],
        comparisonTitle: "See It in Action",
        comparisonText: "Use Amplypost to move TikTok content from upload to scheduled post in one focused workflow.",
        comparison: ["Upload and prepare your TikTok video", "Add captions, hashtags, and publishing details", "Preview how your post will appear", "Schedule TikTok posts ahead of time"],
        demo: {
            title: "See It in Action",
            items: [
                "Uploading a TikTok video",
                "Writing a caption with hashtags",
                "Previewing the TikTok post",
                "Scheduling a publishing time",
                "Viewing scheduled TikTok posts in the calendar",
            ],
        },
        supportedContentTypes: [
            "TikTok videos",
            "Short-form vertical videos",
            "Captions",
            "Hashtags",
            "Mentions",
            "Scheduled posts",
            "Draft posts",
            "Video thumbnails or cover images, if supported",
            "Multi-account TikTok publishing, if available",
        ],
        planInfo: {
            title: "TikTok publishing plans",
            text: "TikTok publishing is available on selected plans.",
            items: [
                "Free Plan: Try basic content planning and draft creation.",
                "Pro Plan: Schedule and publish TikTok posts.",
                "Team Plan: Collaborate with teammates, manage approvals, and handle multiple accounts.",
                "Agency Plan: Manage TikTok publishing for multiple brands or clients.",
            ],
        },
        cta: {
            title: "Ready to plan your next TikTok post?",
            text: "Start creating, scheduling, and publishing TikTok content in minutes.",
            button: "Start free",
        },
        faq: [
            { question: "Can I schedule TikTok posts in advance?", answer: "Yes. You can create TikTok posts and schedule them for a future date and time." },
            { question: "Can I add hashtags and mentions?", answer: "Yes. Captions can include hashtags, mentions, and custom text." },
            { question: "Can I preview my TikTok post before publishing?", answer: "Yes. You can review your video, caption, and publishing details before it goes live." },
            { question: "Do I need a TikTok Business account?", answer: "Some TikTok publishing features may require a TikTok Business or connected professional account, depending on TikTok's API permissions." },
            { question: "Can teams manage TikTok content together?", answer: "Yes, if your plan includes team collaboration, multiple users can create, review, and schedule content." },
        ],
    },
    "schedule-youtube-shorts": {
        slug: "schedule-youtube-shorts",
        eyebrow: "YouTube Shorts scheduler",
        title: "Schedule YouTube Shorts from the same place you plan social content",
        description: "Connect your YouTube channel, prepare vertical video posts, and organize Shorts with your wider publishing calendar.",
        metaTitle: "Schedule YouTube Shorts | Amplypost",
        metaDescription: "Plan and schedule YouTube Shorts with Amplypost while managing your full social media publishing workflow.",
        primaryCta: "Schedule YouTube Shorts",
        secondaryCta: "View features",
        image: { src: "/amplypost-dashboard.png", alt: "Amplypost dashboard for managing YouTube Shorts schedules" },
        logos: [{ src: "/youtube-logo.svg", alt: "YouTube" }],
        proof: ["YouTube channel connection", "Short-video planning", "Cross-channel calendar"],
        features: [
            { title: "Connect YouTube securely", text: "Use Google authorization to connect the channel you want to manage in Amplypost.", icon: ShieldCheck },
            { title: "Prepare video details", text: "Upload video content and organize the information needed for publishing.", icon: FileText },
            { title: "Plan with the calendar", text: "Keep Shorts visible next to other social posts and campaign moments.", icon: CalendarDays },
        ],
        workflowTitle: "From video idea to scheduled Short",
        workflowText: "Create a predictable path for every Short instead of scrambling inside multiple dashboards.",
        workflow: ["Connect your YouTube channel.", "Upload the Short and add the required details.", "Pick a publishing time.", "Review upcoming videos from the dashboard."],
        comparisonTitle: "A YouTube workflow that fits your social plan",
        comparisonText: "Amplypost is useful when Shorts are part of a larger content engine, not a one-off upload.",
        comparison: ["Coordinate Shorts with TikTok and Instagram posts", "Use one publishing calendar", "Manage connected accounts in one workspace"],
        faq: [
            { question: "Does Amplypost connect to YouTube?", answer: "Yes. Amplypost lets users connect supported YouTube channels through Google authorization." },
            { question: "Can I use Amplypost for Shorts campaigns?", answer: "Yes. Amplypost is designed to help you plan short-video campaigns alongside the rest of your social media schedule." },
        ],
    },
    "instagram-post-scheduler": {
        slug: "instagram-post-scheduler",
        eyebrow: "Instagram scheduler",
        title: "An Instagram post scheduler for consistent visual publishing",
        description: "Create Instagram content, prepare captions, and organize posts in a publishing calendar built for creators, businesses, and teams.",
        metaTitle: "Instagram Post Scheduler | Amplypost",
        metaDescription: "Schedule Instagram posts with Amplypost and manage your Instagram workflow alongside other social channels.",
        primaryCta: "Schedule Instagram posts",
        secondaryCta: "Explore workflow",
        image: { src: "/calendar-view.png", alt: "Amplypost calendar view for Instagram post scheduling" },
        logos: [{ src: "/instagram-logo.svg", alt: "Instagram" }],
        proof: ["Visual content planning", "Caption workflow", "Connected account management"],
        features: [
            { title: "Plan content visually", text: "Build a clear posting schedule around campaigns, launches, and repeatable content pillars.", icon: CalendarDays },
            { title: "Write captions once", text: "Prepare captions before publishing day and keep the post details attached to the schedule.", icon: FileText },
            { title: "Work across channels", text: "Plan Instagram alongside TikTok, Facebook, LinkedIn, YouTube, and other supported platforms.", icon: Layers3 },
        ],
        workflowTitle: "Instagram planning that does not live in a notes app",
        workflowText: "Give every Instagram post a place in your calendar before it reaches your audience.",
        workflow: ["Connect your Instagram account.", "Upload your media and caption.", "Choose the date and time.", "Review scheduled posts from your calendar."],
        comparisonTitle: "For teams that need more than a reminder",
        comparisonText: "Amplypost helps you move from scattered reminders to a real publishing workflow.",
        comparison: ["Central calendar visibility", "Post creation and scheduling in one flow", "Support for multi-channel campaigns"],
        faq: [
            { question: "Is Amplypost an Instagram scheduler?", answer: "Yes. Amplypost helps users prepare and schedule Instagram content through its social media publishing workflow." },
            { question: "Can I schedule Instagram and Facebook together?", answer: "Yes. Amplypost supports workflows for multiple connected social accounts, including Instagram and Facebook." },
        ],
    },
    "linkedin-post-scheduler": {
        slug: "linkedin-post-scheduler",
        eyebrow: "LinkedIn scheduler",
        title: "Schedule LinkedIn posts with a workflow built for professional content",
        description: "Plan thought leadership, company updates, launches, and founder content in the same calendar as the rest of your social media.",
        metaTitle: "LinkedIn Post Scheduler | Amplypost",
        metaDescription: "Use Amplypost to create, schedule, and manage LinkedIn posts from a clean social media publishing dashboard.",
        primaryCta: "Schedule LinkedIn posts",
        secondaryCta: "See how it works",
        image: { src: "/create-post.png", alt: "Amplypost create post screen for LinkedIn post scheduling" },
        logos: [{ src: "/linkedin-logo.svg", alt: "LinkedIn" }],
        proof: ["Professional post planning", "Campaign calendar", "Team-friendly workflow"],
        features: [
            { title: "Plan professional content", text: "Organize company updates, founder posts, and campaign announcements before they go live.", icon: BriefcaseBusiness },
            { title: "Stay consistent", text: "Turn LinkedIn from an occasional task into a visible, scheduled rhythm.", icon: Repeat2 },
            { title: "Coordinate launches", text: "Line up LinkedIn with Instagram, X, Facebook, and other supporting channels.", icon: Megaphone },
        ],
        workflowTitle: "Make LinkedIn part of the campaign calendar",
        workflowText: "Amplypost helps you keep professional publishing structured without overcomplicating the workflow.",
        workflow: ["Connect LinkedIn.", "Write and prepare the update.", "Schedule the post.", "Track it with the rest of your upcoming content."],
        comparisonTitle: "Better than last-minute LinkedIn posting",
        comparisonText: "Use Amplypost when LinkedIn content needs planning, review, and timing across campaigns.",
        comparison: ["Calendar-based planning", "Consistent post preparation", "Simple multi-platform coordination"],
        faq: [
            { question: "Can Amplypost schedule LinkedIn posts?", answer: "Yes. Amplypost includes LinkedIn publishing workflows for connected accounts." },
            { question: "Who is this useful for?", answer: "It is useful for founders, small businesses, marketers, agencies, and teams publishing professional social content." },
        ],
    },
    "schedule-x-posts": {
        slug: "schedule-x-posts",
        eyebrow: "X scheduler",
        title: "Schedule X posts without breaking your publishing flow",
        description: "Plan short updates, campaign posts, media announcements, and thought-led content for X from your Amplypost calendar.",
        metaTitle: "Schedule X Posts | Amplypost",
        metaDescription: "Schedule X posts with Amplypost and manage X publishing alongside your other social media content.",
        primaryCta: "Schedule X posts",
        secondaryCta: "See X workflow",
        image: { src: "/create-post.png", alt: "Amplypost create post screen for scheduling X posts" },
        logos: [{ src: "/twitter-logo.png", alt: "X" }],
        proof: ["Short-form post planning", "Campaign timing", "Cross-platform workflow"],
        features: [
            { title: "Draft timely updates", text: "Prepare announcements, campaign notes, and commentary before the moment arrives.", icon: FileText },
            { title: "Coordinate with launches", text: "Line up X posts with other channels so your message lands clearly.", icon: Megaphone },
            { title: "Keep the calendar honest", text: "See what is scheduled and avoid bunching posts into the same window.", icon: CalendarDays },
        ],
        workflowTitle: "Make X part of your content calendar",
        workflowText: "Amplypost helps you keep fast-moving social updates organized before they go live.",
        workflow: ["Connect X.", "Write your post and add media where needed.", "Pick a date and time.", "Track the scheduled post from your dashboard."],
        comparisonTitle: "For posts that need timing, not panic",
        comparisonText: "X moves quickly, but your publishing process does not have to feel rushed.",
        comparison: ["Plan launch threads and announcements", "Coordinate X with LinkedIn and Instagram", "Review scheduled posts from one place"],
        faq: [
            { question: "Can Amplypost schedule X posts?", answer: "Yes. Amplypost includes scheduling workflows for X through connected accounts." },
            { question: "Can I use it for campaign announcements?", answer: "Yes. Amplypost is useful for preparing and timing announcements across X and your other supported channels." },
        ],
    },
    "schedule-threads-posts": {
        slug: "schedule-threads-posts",
        eyebrow: "Threads scheduler",
        title: "Schedule Threads posts alongside your wider social calendar",
        description: "Plan conversational posts, campaign updates, and community content for Threads while keeping every channel in view.",
        metaTitle: "Schedule Threads Posts | Amplypost",
        metaDescription: "Use Amplypost to schedule Threads posts and organize Threads publishing with your wider social media calendar.",
        primaryCta: "Schedule Threads posts",
        secondaryCta: "See Threads workflow",
        image: { src: "/calendar-view.png", alt: "Amplypost calendar for scheduling Threads posts" },
        logos: [{ src: "/threads-logo.png", alt: "Threads" }],
        proof: ["Conversational content planning", "Calendar visibility", "Multi-channel coordination"],
        features: [
            { title: "Plan conversation starters", text: "Prepare short updates and discussion prompts before your posting window.", icon: FileText },
            { title: "Coordinate social moments", text: "Keep Threads aligned with Instagram, X, LinkedIn, and other campaign channels.", icon: Layers3 },
            { title: "Stay consistent", text: "Use a calendar to maintain a repeatable rhythm instead of posting only when you remember.", icon: Repeat2 },
        ],
        workflowTitle: "Give Threads content a repeatable rhythm",
        workflowText: "Amplypost keeps conversational publishing organized without making it heavy.",
        workflow: ["Connect Threads.", "Prepare the post.", "Schedule the publishing time.", "Review it with your upcoming social content."],
        comparisonTitle: "Useful for brands building community",
        comparisonText: "Threads works best when it supports an ongoing voice, campaign, or audience relationship.",
        comparison: ["Plan short-form updates", "Coordinate with Instagram-led campaigns", "Keep upcoming posts visible"],
        faq: [
            { question: "Can Amplypost schedule Threads posts?", answer: "Yes. Amplypost supports Threads publishing workflows through connected accounts." },
            { question: "Can I plan Threads with Instagram?", answer: "Yes. Amplypost helps you organize Threads alongside Instagram and other supported platforms." },
        ],
    },
    "schedule-bluesky-posts": {
        slug: "schedule-bluesky-posts",
        eyebrow: "Bluesky scheduler",
        title: "Schedule Bluesky posts from your Amplypost workspace",
        description: "Bring Bluesky into your publishing plan and manage posts beside the rest of your social media calendar.",
        metaTitle: "Schedule Bluesky Posts | Amplypost",
        metaDescription: "Schedule Bluesky posts with Amplypost and manage Bluesky alongside your wider social media publishing workflow.",
        primaryCta: "Schedule Bluesky posts",
        secondaryCta: "See Bluesky workflow",
        image: { src: "/create-post.png", alt: "Amplypost create post screen for scheduling Bluesky posts" },
        logos: [{ src: "/bluesky-logo.svg", alt: "Bluesky" }],
        proof: ["Bluesky planning", "Simple account connection", "Unified calendar"],
        features: [
            { title: "Add Bluesky to the plan", text: "Keep Bluesky posts visible alongside your other scheduled content.", icon: Globe2 },
            { title: "Prepare posts ahead", text: "Draft short updates in advance and keep them attached to your calendar.", icon: FileText },
            { title: "Coordinate channels", text: "Make Bluesky part of a broader launch, community, or thought-leadership workflow.", icon: Layers3 },
        ],
        workflowTitle: "Schedule Bluesky without a separate process",
        workflowText: "Amplypost helps emerging-channel publishing fit your existing social routine.",
        workflow: ["Connect Bluesky.", "Create your post.", "Choose the posting time.", "Track it from the calendar."],
        comparisonTitle: "For teams expanding beyond the usual channels",
        comparisonText: "Bluesky can be part of your content system without becoming another disconnected task.",
        comparison: ["One workspace for core and emerging channels", "Clear scheduling visibility", "Reusable content planning workflow"],
        faq: [
            { question: "Can Amplypost schedule Bluesky posts?", answer: "Yes. Amplypost supports Bluesky publishing workflows for connected accounts." },
            { question: "How does Bluesky connect?", answer: "Amplypost supports Bluesky connection through the app's connected account flow, including app-password based setup where applicable." },
        ],
    },
    "pinterest-post-scheduler": {
        slug: "pinterest-post-scheduler",
        eyebrow: "Pinterest scheduler",
        title: "Schedule Pinterest posts with your visual content calendar",
        description: "Plan Pins and visual campaigns in Amplypost so Pinterest supports the same content rhythm as your other channels.",
        metaTitle: "Pinterest Post Scheduler | Amplypost",
        metaDescription: "Use Amplypost as a Pinterest post scheduler and manage Pinterest publishing with your social media calendar.",
        primaryCta: "Schedule Pinterest posts",
        secondaryCta: "See Pinterest workflow",
        image: { src: "/calendar-view.png", alt: "Amplypost calendar view for scheduling Pinterest posts" },
        logos: [{ src: "/pinterest-logo.svg", alt: "Pinterest" }],
        proof: ["Visual post planning", "Campaign calendar", "Cross-channel publishing"],
        features: [
            { title: "Plan visual content", text: "Prepare product visuals, inspiration content, and campaign posts before publishing day.", icon: Sparkles },
            { title: "Build content runs", text: "Batch Pinterest content around launches, seasonal moments, and evergreen themes.", icon: Repeat2 },
            { title: "Coordinate discovery channels", text: "Keep Pinterest aligned with Instagram, Facebook, and your wider marketing calendar.", icon: Layers3 },
        ],
        workflowTitle: "Pinterest planning that stays visible",
        workflowText: "Amplypost helps visual content stay organized instead of sitting in scattered folders and notes.",
        workflow: ["Connect Pinterest.", "Create the post and add visual media.", "Schedule the publishing time.", "Review upcoming Pins from the calendar."],
        comparisonTitle: "Built for repeatable visual publishing",
        comparisonText: "Pinterest rewards planning, and Amplypost gives that planning a simple home.",
        comparison: ["Useful for product and inspiration content", "Easy to batch visual campaigns", "Calendar view for upcoming posts"],
        faq: [
            { question: "Can Amplypost schedule Pinterest posts?", answer: "Yes. Amplypost supports Pinterest publishing workflows through connected accounts." },
            { question: "Can I plan Pinterest with Instagram?", answer: "Yes. You can manage Pinterest alongside Instagram and other supported social platforms in Amplypost." },
        ],
    },
    "google-business-profile-post-scheduler": {
        slug: "google-business-profile-post-scheduler",
        eyebrow: "Google Business Profile scheduler",
        title: "Schedule Google Business Profile posts for local business updates",
        description: "Plan service updates, offers, event posts, and local announcements alongside the rest of your social media calendar.",
        metaTitle: "Google Business Profile Post Scheduler | Amplypost",
        metaDescription: "Use Amplypost to plan Google Business Profile posts and keep local business updates organized with your social schedule.",
        primaryCta: "Schedule business profile posts",
        secondaryCta: "See local workflow",
        image: { src: "/connected-accounts.png", alt: "Amplypost connected accounts screen for Google Business Profile scheduling" },
        logos: [{ src: "/google-my-business-logo.svg", alt: "Google Business Profile" }],
        proof: ["Local business updates", "Google account connection", "One publishing calendar"],
        features: [
            { title: "Plan local updates", text: "Prepare posts around offers, hours, events, services, and business announcements.", icon: Building2 },
            { title: "Coordinate social proof", text: "Keep Google Business Profile updates aligned with Instagram, Facebook, and other customer-facing channels.", icon: Globe2 },
            { title: "Stay organized", text: "Use one calendar for local visibility and social publishing work.", icon: CalendarDays },
        ],
        workflowTitle: "Keep local updates out of the last-minute pile",
        workflowText: "Amplypost helps business profile content become part of your regular marketing plan.",
        workflow: ["Connect Google Business Profile.", "Prepare your business update.", "Choose a posting time.", "Review it with your other scheduled content."],
        comparisonTitle: "Useful for service, retail, and local brands",
        comparisonText: "Your Google presence deserves planning just like Instagram, Facebook, and LinkedIn do.",
        comparison: ["Good for offers and announcements", "Helps local updates stay consistent", "Fits into the wider social calendar"],
        faq: [
            { question: "Can Amplypost schedule Google Business Profile posts?", answer: "Amplypost supports Google Business Profile publishing workflows where available through connected accounts and platform capabilities." },
            { question: "Who should use this page?", answer: "Local businesses, service providers, shops, venues, and teams that want business profile updates planned with their social calendar." },
        ],
    },
    "social-media-scheduler-for-small-businesses": {
        slug: "social-media-scheduler-for-small-businesses",
        eyebrow: "Small business scheduler",
        title: "A social media scheduler for small businesses that need consistency",
        description: "Plan posts, publish across channels, and keep your business visible without spending your whole day inside social media apps.",
        metaTitle: "Social Media Scheduler for Small Businesses | Amplypost",
        metaDescription: "Amplypost helps small businesses schedule social media posts, manage channels, and plan content from one dashboard.",
        primaryCta: "Start scheduling",
        secondaryCta: "See small business features",
        image: { src: "/amplypost-dashboard.png", alt: "Amplypost dashboard for small business social media scheduling" },
        logos: allPlatformLogos.slice(0, 6),
        proof: ["No credit card required", "One dashboard", "Built for busy teams"],
        features: [
            { title: "Save owner time", text: "Batch content when you have focus, then let the calendar keep the plan moving.", icon: Clock3 },
            { title: "Show up everywhere", text: "Manage posts for the channels customers actually check before buying.", icon: Globe2 },
            { title: "Keep it simple", text: "Use a straightforward scheduling workflow without heavy enterprise complexity.", icon: CheckCircle2 },
        ],
        workflowTitle: "A weekly rhythm your business can keep",
        workflowText: "Amplypost makes social media easier to manage even when marketing is only one part of the job.",
        workflow: ["Connect your business channels.", "Create posts in batches.", "Schedule the week ahead.", "Review upcoming content from the calendar."],
        comparisonTitle: "Made for practical publishing",
        comparisonText: "Small businesses need a reliable workflow more than a crowded control room.",
        comparison: ["Simple setup", "Useful calendar visibility", "Support for multiple social platforms"],
        faq: [
            { question: "Is Amplypost good for small businesses?", answer: "Yes. Amplypost is built to help small businesses create, schedule, and publish content from one dashboard." },
            { question: "Can I manage multiple business pages?", answer: "You can connect supported accounts and manage publishing from your Amplypost workspace." },
        ],
    },
    "social-media-scheduler-for-agencies": {
        slug: "social-media-scheduler-for-agencies",
        eyebrow: "Agency scheduler",
        title: "A social media scheduler for agencies managing multiple brands",
        description: "Organize client content, connected accounts, and publishing calendars without rebuilding the same workflow for every campaign.",
        metaTitle: "Social Media Scheduler for Agencies | Amplypost",
        metaDescription: "Amplypost helps agencies plan, schedule, and publish social media content across supported platforms.",
        primaryCta: "Schedule client content",
        secondaryCta: "Explore agency workflow",
        image: { src: "/connected-accounts.png", alt: "Amplypost connected accounts screen for agency social media management" },
        logos: allPlatformLogos,
        proof: ["Multi-account workflows", "Calendar visibility", "Fast client publishing"],
        features: [
            { title: "Organize client channels", text: "Keep connected accounts visible so each brand's publishing destinations are easier to manage.", icon: Users },
            { title: "Batch campaign work", text: "Prepare content runs in focused sessions and schedule them across the right channels.", icon: Layers3 },
            { title: "Move faster", text: "Reduce repeated platform switching when publishing similar content across client accounts.", icon: Zap },
        ],
        workflowTitle: "Repeatable scheduling for client work",
        workflowText: "Give each campaign a clear route from creative asset to scheduled content.",
        workflow: ["Connect the supported client accounts.", "Create posts and select destinations.", "Schedule campaign content.", "Monitor upcoming work from the calendar."],
        comparisonTitle: "Useful without becoming bloated",
        comparisonText: "Amplypost focuses on the core agency need: getting approved content scheduled across the right channels.",
        comparison: ["Connected account management", "Cross-platform scheduling", "Calendar-first review"],
        faq: [
            { question: "Can agencies use Amplypost?", answer: "Yes. Agencies can use Amplypost to manage connected social accounts and schedule content for supported platforms." },
            { question: "Does it support multiple platforms?", answer: "Yes. Amplypost supports Facebook, Instagram, YouTube, TikTok, LinkedIn, X, Threads, Bluesky, Pinterest, and Google Business Profile." },
        ],
    },
    "social-media-scheduler-for-nigerian-businesses": {
        slug: "social-media-scheduler-for-nigerian-businesses",
        eyebrow: "Built for Nigerian businesses",
        title: "A social media scheduler for Nigerian businesses growing online",
        description: "Plan social posts for launches, promos, market days, services, and community updates from one simple publishing dashboard.",
        metaTitle: "Social Media Scheduler for Nigerian Businesses | Amplypost",
        metaDescription: "Amplypost helps Nigerian businesses schedule social media posts and manage publishing across supported platforms.",
        primaryCta: "Start scheduling",
        secondaryCta: "See local workflow",
        image: { src: "/calendar-view.png", alt: "Amplypost calendar for Nigerian business social media planning" },
        logos: allPlatformLogos.slice(0, 7),
        proof: ["Plan promos ahead", "Support key social channels", "Simple business workflow"],
        features: [
            { title: "Plan campaign days", text: "Prepare posts for product drops, service promos, events, and seasonal campaigns before things get busy.", icon: Megaphone },
            { title: "Keep channels active", text: "Stay visible across the platforms where your customers discover and trust your business.", icon: Globe2 },
            { title: "Work within your budget", text: "Use a focused scheduler that helps your team save time without heavy tooling overhead.", icon: WalletCards },
        ],
        workflowTitle: "Make social media less last-minute",
        workflowText: "Amplypost helps Nigerian businesses plan posts around real selling moments and customer attention.",
        workflow: ["Connect your supported channels.", "Create campaign posts in advance.", "Schedule for the best publishing windows.", "Check the calendar before launch day."],
        comparisonTitle: "Simple enough for everyday business use",
        comparisonText: "Whether you sell products, services, events, or professional expertise, Amplypost keeps publishing organized.",
        comparison: ["Useful for Instagram-led businesses", "Good for LinkedIn and Facebook visibility", "Works for teams handling many responsibilities"],
        faq: [
            { question: "Is Amplypost for Nigerian businesses?", answer: "Yes. Amplypost is built by a team focused on practical social media scheduling for businesses, including Nigerian businesses." },
            { question: "Which platforms can Nigerian businesses use?", answer: "Amplypost supports major social platforms including Instagram, TikTok, YouTube, LinkedIn, Facebook, X, Threads, Pinterest, Bluesky, and Google Business Profile." },
        ],
    },
    "buffer-alternative": {
        slug: "buffer-alternative",
        eyebrow: "Buffer alternative",
        title: "A Buffer alternative for straightforward social media scheduling",
        description: "Use Amplypost when you want a clean way to create, schedule, and publish social content without turning your workflow into a maze.",
        metaTitle: "Buffer Alternative | Amplypost",
        metaDescription: "Looking for a Buffer alternative? Amplypost helps you schedule social media posts across supported platforms from one dashboard.",
        primaryCta: "Try Amplypost",
        secondaryCta: "Compare workflow",
        image: { src: "/amplypost-dashboard.png", alt: "Amplypost dashboard as a Buffer alternative" },
        logos: allPlatformLogos,
        proof: ["Simple scheduling", "Multi-platform publishing", "Creator and business friendly"],
        features: [
            { title: "Familiar scheduling flow", text: "Create posts, select destinations, and choose publishing times from one workspace.", icon: CalendarDays },
            { title: "Less tool noise", text: "Focus on planning and publishing content without extra complexity you do not need yet.", icon: Sparkles },
            { title: "Built for modern channels", text: "Plan content for short video, professional posts, visual platforms, and business updates.", icon: Layers3 },
        ],
        workflowTitle: "Switch to a leaner publishing workflow",
        workflowText: "Amplypost gives you the essentials for getting social content planned and shipped.",
        workflow: ["Connect supported accounts.", "Create your post.", "Select one or more platforms.", "Schedule and monitor from the dashboard."],
        comparisonTitle: "Why teams look for a Buffer alternative",
        comparisonText: "Some teams want a scheduler that feels direct, practical, and centered on publishing rather than process overhead.",
        comparison: ["Simple calendar workflow", "Clear connected account management", "Support for cross-platform publishing"],
        faq: [
            { question: "Is Amplypost a Buffer alternative?", answer: "Yes. Amplypost is an alternative for people who want to create, schedule, and publish social media content from one dashboard." },
            { question: "Can I use Amplypost for multiple platforms?", answer: "Yes. Amplypost supports scheduling workflows across many popular social platforms." },
        ],
    },
    "hootsuite-alternative": {
        slug: "hootsuite-alternative",
        eyebrow: "Hootsuite alternative",
        title: "A Hootsuite alternative for teams that want simpler scheduling",
        description: "Amplypost helps you manage social publishing with a clean dashboard, connected accounts, and a calendar-first workflow.",
        metaTitle: "Hootsuite Alternative | Amplypost",
        metaDescription: "Amplypost is a Hootsuite alternative for scheduling social media posts across supported platforms from one dashboard.",
        primaryCta: "Try Amplypost",
        secondaryCta: "See the workflow",
        image: { src: "/calendar-view.png", alt: "Amplypost calendar as a Hootsuite alternative" },
        logos: allPlatformLogos,
        proof: ["Clean dashboard", "Calendar planning", "Multi-channel scheduling"],
        features: [
            { title: "Less operational weight", text: "Keep the workflow focused on creating, scheduling, and managing upcoming content.", icon: CheckCircle2 },
            { title: "One calendar view", text: "See what is planned across your channels before posts go live.", icon: CalendarDays },
            { title: "Good for lean teams", text: "Give small teams and agencies a practical publishing system without enterprise heaviness.", icon: Building2 },
        ],
        workflowTitle: "A simpler way to keep social publishing moving",
        workflowText: "Amplypost keeps everyday scheduling tasks close together and easy to repeat.",
        workflow: ["Connect accounts.", "Create posts for selected platforms.", "Schedule content.", "Review the calendar."],
        comparisonTitle: "Why choose Amplypost over heavier suites",
        comparisonText: "Amplypost is for teams that care most about getting content planned and published reliably.",
        comparison: ["Cleaner setup for core scheduling", "Straightforward connected account management", "Focused publishing calendar"],
        faq: [
            { question: "Is Amplypost a Hootsuite alternative?", answer: "Yes. Amplypost can be used as a Hootsuite alternative for social media scheduling and publishing." },
            { question: "Who should consider it?", answer: "Creators, small businesses, agencies, and lean marketing teams that want a direct scheduling workflow." },
        ],
    },
    "metricool-alternative": {
        slug: "metricool-alternative",
        eyebrow: "Metricool alternative",
        title: "A Metricool alternative focused on scheduling and publishing",
        description: "Plan content, connect social accounts, and keep your posting calendar organized with Amplypost.",
        metaTitle: "Metricool Alternative | Amplypost",
        metaDescription: "Amplypost is a Metricool alternative for teams that want simple social media scheduling and publishing workflows.",
        primaryCta: "Try Amplypost",
        secondaryCta: "View scheduling features",
        image: { src: "/create-post.png", alt: "Amplypost create post screen as a Metricool alternative" },
        logos: allPlatformLogos,
        proof: ["Publishing-first workflow", "Cross-platform content", "Simple calendar"],
        features: [
            { title: "Scheduling at the center", text: "Amplypost focuses the experience on preparing posts and getting them onto the calendar.", icon: CalendarDays },
            { title: "Useful cross-posting", text: "Create once and adapt content for the channels you choose.", icon: Repeat2 },
            { title: "Clear workspace", text: "Manage connected accounts, upcoming posts, and content creation from a straightforward interface.", icon: BarChart3 },
        ],
        workflowTitle: "Publishing without overthinking it",
        workflowText: "Amplypost helps teams that need a dependable content calendar more than a complicated analytics suite.",
        workflow: ["Connect social platforms.", "Create a post.", "Choose platforms and timing.", "Use the dashboard to manage upcoming content."],
        comparisonTitle: "A Metricool alternative for scheduling-led teams",
        comparisonText: "If your priority is getting content created and scheduled, Amplypost keeps the workflow focused.",
        comparison: ["Scheduling-first product flow", "Multi-platform support", "Simple campaign visibility"],
        faq: [
            { question: "Is Amplypost a Metricool alternative?", answer: "Yes. Amplypost is an alternative for users who primarily need social media scheduling and publishing." },
            { question: "Does Amplypost include analytics?", answer: "Amplypost is focused on scheduling and publishing workflows. Feature availability can change as the product develops." },
        ],
    },
    "schedule-one-post-to-multiple-platforms": {
        slug: "schedule-one-post-to-multiple-platforms",
        eyebrow: "Multi-platform scheduler",
        title: "Schedule one post to multiple social media platforms",
        description: "Create content once, choose the channels that need it, and schedule your post across supported platforms from one Amplypost dashboard.",
        metaTitle: "Schedule One Post to Multiple Platforms | Amplypost",
        metaDescription: "Use Amplypost to schedule one post to multiple social media platforms including Instagram, TikTok, YouTube, LinkedIn, Facebook, and more.",
        primaryCta: "Schedule across platforms",
        secondaryCta: "See supported channels",
        image: { src: "/create-post.png", alt: "Amplypost screen for scheduling one post to multiple platforms" },
        logos: allPlatformLogos,
        proof: ["Create once", "Choose multiple channels", "Calendar visibility"],
        features: [
            { title: "Create once", text: "Prepare your content in one workflow instead of starting from scratch in every social app.", icon: FileText },
            { title: "Choose destinations", text: "Select the supported platforms that should receive the post.", icon: Layers3 },
            { title: "Keep timing aligned", text: "Schedule campaigns across channels so each platform supports the same message.", icon: CalendarDays },
        ],
        workflowTitle: "Cross-posting without the copy-paste loop",
        workflowText: "Amplypost helps you turn one content idea into scheduled posts across your connected platforms.",
        workflow: ["Connect your supported accounts.", "Create the post and upload media.", "Select multiple platforms.", "Schedule and track everything in the calendar."],
        comparisonTitle: "Best for campaigns that need coordinated reach",
        comparisonText: "Use this workflow for launches, announcements, promotions, evergreen content, and repeatable content pillars.",
        comparison: ["Coordinate the same message across channels", "Reduce duplicate manual posting", "Keep upcoming posts easy to review"],
        faq: [
            { question: "Can I schedule one post to multiple platforms?", answer: "Yes. Amplypost is built to help users create content once and publish or schedule it across selected supported platforms." },
            { question: "Which platforms are supported?", answer: "Amplypost supports Facebook, Instagram, YouTube, TikTok, LinkedIn, X, Threads, Bluesky, Pinterest, and Google Business Profile. Capabilities vary by platform API rules." },
        ],
    },
};

export const landingPageSlugs = Object.keys(landingPages) as LandingPageSlug[];

export function getLandingPage(slug: LandingPageSlug) {
    return landingPages[slug];
}

export const platformLandingHrefBySlug: Record<string, LandingPageSlug> = {
    facebook: "schedule-facebook-posts",
    instagram: "instagram-post-scheduler",
    linkedin: "linkedin-post-scheduler",
    tiktok: "schedule-tiktok-posts",
    youtube: "schedule-youtube-shorts",
    x: "schedule-x-posts",
    threads: "schedule-threads-posts",
    bluesky: "schedule-bluesky-posts",
    pinterest: "pinterest-post-scheduler",
    "google-business-profile": "google-business-profile-post-scheduler",
};
