import { Suspense } from "react";
import { Metadata } from "next";
import ConnectLinkedIn from "./connect-linkedin";

export const metadata: Metadata = {
    title: "Connect Linkedin | Amplypost",
    description: "Complete your Linkedin account connection",
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

export default function LinkedPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ConnectLinkedIn />
        </Suspense>
    );
}