import Link from "next/link";
import Image from "next/image";
import Navigation from "@/app/components/navigation";
import Footer from "@/app/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Free Social Tools | Amplypost",
    description:
        "Supercharge your social media presence with our suite of free tools. Download media effortlessly, streamline your content creation, and optimize your strategy, all at zero cost.",
};

type ToolCategory = "downloaders" | "converters";

type Tool = {
    name: string;
    description: string;
    href: string;
    icon?: string;
    badge: string;
    category: ToolCategory;
};

const categories: { key: ToolCategory; title: string; description: string }[] = [
    {
        key: "downloaders",
        title: "Downloaders",
        description: "Grab videos and media from popular social platforms in a few clicks.",
    },
    {
        key: "converters",
        title: "Converters",
        description: "Transform media files into the format you need for publishing or sharing.",
    },
];

const tools: Tool[] = [
    {
        name: "TikTok Downloader",
        description:
            "Download TikTok videos without watermark in HD quality. Just paste the link and download instantly.",
        href: "/tools/tiktok-downloader",
        icon: "/tiktok-logo.png",
        badge: "Free",
        category: "downloaders",
    },
    {
        name: "Instagram Downloader",
        description:
            "Download Instagram Reels, videos, and photos in HD quality for free. Just paste the link and save to your device instantly.",
        href: "/tools/instagram-downloader",
        icon: "/instagram-logo.svg",
        badge: "Free",
        category: "downloaders",
    },
    {
        name: "Youtube Downloader",
        description:
            "Download Youtube videos in HD quality for free. Just paste the link and save to your device instantly.",
        href: "/tools/youtube-downloader",
        icon: "/youtube-logo.svg",
        badge: "Free",
        category: "downloaders",
    },
    {
        name: "Image Converter",
        description:
            "Convert images between JPEG, PNG, WebP, AVIF, TIFF, GIF, and HEIF formats with fast processing.",
        href: "/tools/convert-image",
        badge: "Free",
        category: "converters",
    },
];

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Free Social Tools
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Supercharge your social media presence with our suite of free tools.
                        Download media effortlessly, streamline your content creation, and
                        optimize your strategy—all at zero cost.
                    </p>
                </div>

                {/* Tool list */}
                <div className="mt-12 space-y-12">
                    {categories.map((category) => {
                        const groupedTools = tools.filter((tool) => tool.category === category.key);

                        return (
                            <section key={category.key}>
                                <div className="mb-5">
                                    <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {groupedTools.map((tool) => {
                                        const inner = (
                                            <div className="flex h-full flex-col p-6">
                                                {/* Top area with Icon and Badge */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                                        {tool.icon ? (
                                                            <Image
                                                                src={tool.icon}
                                                                alt={tool.name}
                                                                width={24}
                                                                height={24}
                                                            />
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                className="h-5 w-5 text-muted-foreground"
                                                            >
                                                                <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${tool.badge === "Free"
                                                            ? "bg-emerald-500/10 text-emerald-600"
                                                            : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        {tool.badge}
                                                    </span>
                                                </div>

                                                {/* Text content */}
                                                <div className="mt-5 flex-1 space-y-2">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {tool.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                                        {tool.description}
                                                    </p>
                                                </div>

                                                {/* Footer arrow */}
                                                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                                                    Try it out
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <Link
                                                key={tool.name}
                                                href={tool.href}
                                                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                                            >
                                                {inner}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
}
