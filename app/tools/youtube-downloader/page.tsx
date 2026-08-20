import Link from "next/link";
import Image from "next/image";
import Navigation from "@/app/components/navigation";
import Footer from "@/app/components/footer";
import YouTubeDownloader from "./youtube-downloader";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "YouTube Video Downloader — Download YouTube Videos & Shorts | Amplypost",
    description:
        "Download YouTube videos and Shorts in HD quality for free. No login required. Just paste the link and save to your device instantly.",
    keywords: [
        "youtube downloader",
        "youtube video downloader",
        "youtube shorts downloader",
        "youtube to mp4",
        "download youtube video",
        "download youtube shorts",
        "save youtube video",
        "youtube downloader free",
        "youtube downloader hd",
        "youtube video download online free",
    ],
    twitter: {
        card: "summary_large_image",
        title: "YouTube Video Downloader — Download Videos & Shorts | Amplypost",
        description:
            "Download YouTube videos and Shorts in HD quality for free. No login required. Just paste the link and save to your device instantly.",
        images: [
            "https://res.cloudinary.com/deamgyfii/image/upload/v1772195886/Your_paragraph_text_jkqljv.png",
        ],
    },
    openGraph: {
        title: "YouTube Video Downloader — Download Videos & Shorts | Amplypost",
        description:
            "Download YouTube videos and Shorts in HD quality for free. No login required. Just paste the link and save to your device instantly.",
        images: [
            "https://res.cloudinary.com/deamgyfii/image/upload/v1772195886/Your_paragraph_text_jkqljv.png",
        ],
    },
};

export default function YouTubeDownloaderPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        href="/tools"
                        className="transition-colors hover:text-foreground"
                    >
                        Tools
                    </Link>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="font-medium text-foreground">
                        YouTube Downloader
                    </span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center">
                    {/* YouTube icon */}
                    <div className="mx-auto mb-5 flex justify-center">
                        <Image
                            src="/youtube-logo.svg"
                            alt="YouTube"
                            width={44}
                            height={44}
                        />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        YouTube Video Downloader
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                        Download YouTube videos and Shorts — HD quality, completely free
                    </p>
                </div>

                {/* Downloader component */}
                <YouTubeDownloader />
            </main>

            <Footer />
        </div>
    );
}
