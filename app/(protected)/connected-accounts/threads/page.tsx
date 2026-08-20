import { Suspense } from "react";
import { Metadata } from "next";
import ThreadsCallback from "./connect-threads";

export const metadata: Metadata = {
    title: "Connect Threads | Amplypost",
    description: "Complete your Threads account connection",
};

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}

export default function ThreadsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ThreadsCallback />
        </Suspense>
    );
}