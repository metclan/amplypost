import Link from "next/link";
import Image from "next/image";
import Navigation from "@/app/components/navigation";
import Footer from "@/app/components/footer";
import InstagramDownloader from "./instagram-downloader";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Instagram Video Downloader — Download Reels & Posts | Amplypost",
    description:
        "Download Instagram Reels, videos, and photos in HD quality for free. No login required. Just paste the link and save to your device instantly.",
    keywords: [
        "instagram downloader",
        "instagram video downloader",
        "instagram reels downloader",
        "instagram downloader online",
        "instagram downloader free",
        "download instagram video",
        "download instagram reels",
        "instagram photo downloader",
        "save instagram video",
        "instagram story downloader",
        "instagram downloader without watermark",
        "instagram downloader hd",
        "instagram mp4 downloader",
        "reel downloader",
        "download reels from instagram",
        "ig downloader",
        "instagram video download online free",
        "save reel instagram",
    ],
    twitter: {
        card: "summary_large_image",
        title: "Instagram Video Downloader — Download Reels & Posts | Amplypost",
        description:
            "Download Instagram Reels, videos, and photos in HD quality for free. No login required. Just paste the link and save to your device instantly.",
        images: [
            "https://res.cloudinary.com/deamgyfii/image/upload/v1772181350/instagram-video-downloader_lgdrxo.png",
        ],
    },
    openGraph: {
        title: "Instagram Video Downloader — Download Reels & Posts | Amplypost",
        description:
            "Download Instagram Reels, videos, and photos in HD quality for free. No login required. Just paste the link and save to your device instantly.",
        images: [
            "https://res.cloudinary.com/deamgyfii/image/upload/v1772181350/instagram-video-downloader_lgdrxo.png",
        ],
    },
};

export default function InstagramDownloaderPage() {
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
                        Instagram Downloader
                    </span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center">
                    {/* Instagram icon */}
                    <div className="mx-auto mb-5 flex justify-center">
                        <Image
                            src="/instagram-logo.svg"
                            alt="Instagram"
                            width={44}
                            height={44}
                        />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Instagram Video Downloader
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                        Download Instagram Reels, videos & photos — HD quality, completely free
                    </p>
                </div>

                {/* Downloader component */}
                <InstagramDownloader />
            </main>

            <Footer />
        </div>
    );
}
