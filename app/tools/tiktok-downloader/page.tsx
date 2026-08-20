import Link from "next/link";
import Image from "next/image";
import Navigation from "@/app/components/navigation";
import Footer from "@/app/components/footer";
import TikTokDownloader from "./tiktok-downloader";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "TikTok Video Downloader — Without Watermark | Amplypost",
    description:
        "Download TikTok videos without watermark in HD quality for free. No login required. Just paste the link and save.",
    keywords: [
        "tiktok downloader",
        "tiktok downloader app",
        "tiktok downloader no watermark",
        "tiktok downloader mp3",
        "tiktok downloader without watermark",
        "tiktok downloader hd",
        "hd tiktok downloader",
        "tiktok downloader 4k",
        "tiktok downloader video",
        "ssstik.io tiktok downloader",
        "4k tiktok downloader",
        "mp3 tiktok downloader",
        "video tiktok downloader",
        "tiktok downloader with watermark",
        "tiktok downloader mp4",
        "tiktok downloader apk",
        "tiktok downloader extension",
        "tiktok downloader online",
        "musicallydown tiktok downloader",
        "mass tiktok downloader",
    ],
    twitter: {
        card: "summary_large_image",
        title: "TikTok Video Downloader — Without Watermark | Amplypost",
        description:
            "Download TikTok videos without watermark in HD quality for free. No login required. Just paste the link and save.",
        images: [
            "https://res.cloudinary.com/deamgyfii/image/upload/v1771883125/Download_Tiktok_Video_With_Amplypost_hofff3.png",
        ],
    },
    openGraph: {
        images: [
            "https://res.cloudinary.com/deamgyfii/image/upload/v1771883125/Download_Tiktok_Video_With_Amplypost_hofff3.png",
        ],
    },
};

export default function TikTokDownloaderPage() {
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
                        TikTok Downloader
                    </span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center">
                    {/* TikTok icon */}
                    <div className="mx-auto mb-5 flex justify-center">
                        <Image
                            src="/tiktok-logo.svg"
                            alt="TikTok"
                            width={44}
                            height={44}
                        />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        TikTok Video Downloader
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                        Download TikTok videos without watermark — HD quality, completely free
                    </p>
                </div>

                {/* Downloader component */}
                <TikTokDownloader />
            </main>

            <Footer />
        </div>
    );
}
