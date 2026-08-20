"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

interface PostSuccessDialogProps {
    isOpen: boolean;
    onCreateAnother: () => void;
}

export default function PostSuccessDialog({ isOpen, onCreateAnother }: PostSuccessDialogProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl m-4">
                {/* Success Icon */}
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                            <CheckCircle2 className="relative h-20 w-20 text-green-500" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Post Successful!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8">
                        Your post has been published successfully to all selected accounts.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={onCreateAnother}
                            className="flex-1 px-6 py-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Create Another Post
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 px-6 py-3 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
