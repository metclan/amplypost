"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface InstagramConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnectInstagram: () => void;
    onConnectFacebook: () => void;
}

export default function InstagramConnectionModal({
    isOpen,
    onClose,
    onConnectInstagram,
    onConnectFacebook,
}: InstagramConnectionModalProps) {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200 overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Choose your Instagram connection method
                    </h2>
                    <p className="text-muted-foreground">
                        Select the most suitable option for your account.
                    </p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Instagram (Recommended) */}
                    <div className="relative flex flex-col items-center p-6 rounded-xl border-2 border-primary/20 bg-muted/10 hover:bg-muted/20 transition-colors">
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Recommended
                            </span>
                        </div>

                        <div className="h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6cd] p-1">
                            <div className="bg-white dark:bg-black rounded-full p-3 w-full h-full flex items-center justify-center">
                                <Image
                                    src="/instagram-logo.svg"
                                    alt="Instagram"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2">Login with Instagram</h3>
                        <p className="text-sm text-center text-muted-foreground mb-6 h-10">
                            The simplest way to directly link your Instagram Business or Creator account.
                        </p>

                        <div className="w-full space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                            <div className="flex gap-2">
                                <span className="text-primary">•</span>
                                <div>
                                    Requires Instagram Business or Creator profile.{" "}
                                    <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        (How to set up?)
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-primary">•</span>
                                <p>To add another account, log out/switch on instagram.com first.</p>
                            </div>
                        </div>

                        <Button
                            onClick={onConnectInstagram}
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm"
                        >
                            Connect via Instagram
                        </Button>
                    </div>

                    {/* Option 2: Facebook */}
                    <div className="flex flex-col items-center p-6 rounded-xl border border-border bg-card hover:bg-muted/10 transition-colors">
                        <div className="h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                            <Image
                                src="/facebook-logo.svg"
                                alt="Facebook"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                        </div>

                        <h3 className="text-xl font-bold mb-2">Login with Facebook</h3>
                        <p className="text-sm text-center text-muted-foreground mb-6 h-10">
                            Connects your Instagram account through its linked Facebook Page.
                        </p>

                        <div className="w-full space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                            <div className="flex gap-2">
                                <span className="text-primary">•</span>
                                <div>
                                    Requires Instagram Business or Creator profile.{" "}
                                    <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        (How to set up?)
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-primary">•</span>
                                <div>
                                    Instagram profile must be linked to a Facebook Page.{" "}
                                    <a href="https://help.instagram.com/192857082456744/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        (How to link?)
                                    </a>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={onConnectFacebook}
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm"
                        >
                            Connect via Facebook
                        </Button>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
