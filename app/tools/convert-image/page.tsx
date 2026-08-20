import Link from "next/link";
import Navigation from "@/app/components/navigation";
import Footer from "@/app/components/footer";
import ConvertImage from "./convert-image";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Image Converter — Convert JPEG, PNG, WebP, AVIF | Amplypost",
    description:
        "Convert images between JPEG, PNG, WebP, AVIF, TIFF, GIF, and HEIF formats for free. Upload your image, choose output format, and download instantly.",
};

export default function ConvertImagePage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/tools" className="transition-colors hover:text-foreground">
                        Tools
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                        <path
                            fillRule="evenodd"
                            d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="font-medium text-foreground">Image Converter</span>
                </nav>

                <div className="mb-10 text-center">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-foreground">
                            <path
                                fillRule="evenodd"
                                d="M10.75 2.75a.75.75 0 0 0-1.5 0v6.44L6.78 6.72a.75.75 0 0 0-1.06 1.06l3.75 3.75a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0-1.06-1.06l-2.47 2.47V2.75Zm-7.5 8a.75.75 0 0 1 .75.75v3a1.25 1.25 0 0 0 1.25 1.25h9.5A1.25 1.25 0 0 0 16 14.5v-3a.75.75 0 0 1 1.5 0v3A2.75 2.75 0 0 1 14.75 17h-9.5A2.75 2.75 0 0 1 2.5 14.5v-3a.75.75 0 0 1 .75-.75Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Image Converter
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                        Upload your image, choose the output format, and download instantly
                    </p>
                </div>

                <ConvertImage />
            </main>

            <Footer />
        </div>
    );
}
