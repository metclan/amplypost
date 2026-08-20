import { Suspense } from "react";
import { Metadata } from "next";
import YouTubeCallback from "./connect-youtube";

export const metadata: Metadata = {
    title: "Connect YouTube | Amplypost",
    description: "Complete your YouTube channel connection",
};

function LoadingFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="space-y-4 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}

export default function YouTubePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <YouTubeCallback />
        </Suspense>
    );
}
