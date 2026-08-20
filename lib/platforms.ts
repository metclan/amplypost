export type PlatformSlug =
    | "facebook"
    | "instagram"
    | "linkedin"
    | "tiktok"
    | "youtube"
    | "x"
    | "threads"
    | "bluesky"
    | "pinterest"
    | "google-business-profile";

export type PlatformInfo = {
    slug: PlatformSlug;
    name: string;
    logo: string;
    headline: string;
    description: string;
    connectSteps: string[];
};

export const platforms: PlatformInfo[] = [
    {
        slug: "facebook",
        name: "Facebook",
        logo: "/facebook-logo.svg",
        headline: "Schedule and publish Facebook content from Amplypost",
        description: "Connect your Facebook Page, prepare posts, and manage your publishing calendar alongside every other channel.",
        connectSteps: ["Choose Facebook from Connected Accounts.", "Authorize Amplypost with the Facebook account that manages your Page.", "Select the Page you want to publish to."],
    },
    {
        slug: "instagram",
        name: "Instagram",
        logo: "/instagram-logo.svg",
        headline: "Plan Instagram posts and stories in one workflow",
        description: "Connect Instagram through the supported authorization flow, then create, schedule, and publish visual content from Amplypost.",
        connectSteps: ["Choose Instagram from Connected Accounts.", "Authorize the Instagram account or connected Facebook flow.", "Confirm the account and start creating posts."],
    },
    {
        slug: "linkedin",
        name: "LinkedIn",
        logo: "/linkedin-logo.svg",
        headline: "Publish LinkedIn content without switching dashboards",
        description: "Create professional updates in Amplypost and publish them to your connected LinkedIn account.",
        connectSteps: ["Choose LinkedIn from Connected Accounts.", "Sign in and approve the requested publishing access.", "Return to Amplypost and select LinkedIn while creating posts."],
    },
    {
        slug: "tiktok",
        name: "TikTok",
        logo: "/tiktok-logo.png",
        headline: "Prepare TikTok videos and schedule them with Amplypost",
        description: "Connect TikTok, upload videos, configure publishing options, and keep your short-form calendar organized.",
        connectSteps: ["Choose TikTok from Connected Accounts.", "Authorize Amplypost with TikTok.", "Complete TikTok publishing options before posting."],
    },
    {
        slug: "youtube",
        name: "YouTube",
        logo: "/youtube-logo.svg",
        headline: "Connect YouTube and manage video publishing from Amplypost",
        description: "Connect your channel through Google authorization and publish video content from the same workspace as your social posts.",
        connectSteps: ["Choose YouTube from Connected Accounts.", "Sign in with Google and select the channel.", "Upload your video, add details, and publish or schedule."],
    },
    {
        slug: "x",
        name: "X",
        logo: "/twitter-logo.png",
        headline: "Create and schedule X posts from your Amplypost calendar",
        description: "Connect X to include short-form text and media updates in your cross-platform publishing workflow.",
        connectSteps: ["Choose X from Connected Accounts.", "Authorize Amplypost with your X account.", "Select X when composing your next post."],
    },
    {
        slug: "threads",
        name: "Threads",
        logo: "/threads-logo.png",
        headline: "Publish Threads content alongside your other platforms",
        description: "Connect Threads and keep conversational posts organized in your Amplypost publishing calendar.",
        connectSteps: ["Choose Threads from Connected Accounts.", "Authorize the account through the official connection flow.", "Compose and publish Threads posts from Amplypost."],
    },
    {
        slug: "bluesky",
        name: "Bluesky",
        logo: "/bluesky-logo.svg",
        headline: "Bring Bluesky into your social publishing workflow",
        description: "Connect Bluesky with an app password and manage posts without leaving Amplypost.",
        connectSteps: ["Create an app password in Bluesky settings.", "Enter your Bluesky handle and app password in Amplypost.", "Select Bluesky while creating a post."],
    },
    {
        slug: "pinterest",
        name: "Pinterest",
        logo: "/pinterest-logo.svg",
        headline: "Schedule Pinterest content from Amplypost",
        description: "Connect Pinterest, prepare visual posts, and manage your publishing schedule from one dashboard.",
        connectSteps: ["Choose Pinterest from Connected Accounts.", "Authorize Amplypost with Pinterest.", "Pick your Pinterest destination while creating content."],
    },
    {
        slug: "google-business-profile",
        name: "Google Business Profile",
        logo: "/google-my-business-logo.svg",
        headline: "Manage Google Business Profile content with Amplypost",
        description: "Keep business updates in the same planning workflow as your other social platforms.",
        connectSteps: ["Choose Google Business Profile from Connected Accounts.", "Authorize the Google account that manages your profile.", "Create updates from Amplypost when supported."],
    },
];

export function getPlatformBySlug(slug: string) {
    return platforms.find((platform) => platform.slug === slug);
}
