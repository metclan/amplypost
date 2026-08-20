"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const AUDIENCES = [
    "business owners",
    "founders",
    "content creators",
    "marketers",
    "coaches",
    "agencies",
];

const TYPING_SPEED_MS = 85;
const DELETING_SPEED_MS = 45;
const WORD_HOLD_MS = 1400;
const WORD_SWITCH_DELAY_MS = 250;

export default function Hero() {
    const [audienceIndex, setAudienceIndex] = useState(0);
    const [typedAudience, setTypedAudience] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentAudience = AUDIENCES[audienceIndex];
        let timeoutMs = TYPING_SPEED_MS;

        if (isDeleting) {
            if (typedAudience.length > 0) {
                timeoutMs = DELETING_SPEED_MS;
            } else {
                timeoutMs = WORD_SWITCH_DELAY_MS;
            }
        } else if (typedAudience.length === currentAudience.length) {
            timeoutMs = WORD_HOLD_MS;
        }

        const timeoutId = setTimeout(() => {
            if (isDeleting) {
                if (typedAudience.length > 0) {
                    setTypedAudience((value) => value.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setAudienceIndex((value) => (value + 1) % AUDIENCES.length);
                }
                return;
            }

            if (typedAudience.length < currentAudience.length) {
                setTypedAudience(currentAudience.slice(0, typedAudience.length + 1));
                return;
            }

            setIsDeleting(true);
        }, timeoutMs);

        return () => clearTimeout(timeoutId);
    }, [audienceIndex, typedAudience, isDeleting]);

    return (
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    {/* Social Media Logos */}
                    <div className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
                        {[
                            { name: "Facebook", src: "/facebook-logo.svg", size: 40 },
                            { name: "Instagram", src: "/instagram-logo.svg", size: 32 },
                            { name: "LinkedIn", src: "/linkedin-logo.svg", size: 32 },
                            { name: "TikTok", src: "/tiktok-logo.svg", size: 32 },
                            { name: "YouTube", src: "/youtube-logo.svg", size: 32 },
                            { name: "X", src: "/x-logo.svg", size: 32 },
                            { name: "Threads", src: "/thread-logo.svg", size: 32 },
                        ].map((logo) => (
                            <div key={logo.name} className="flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
                                <Image
                                    src={logo.src}
                                    alt={logo.name}
                                    width={logo.size}
                                    height={logo.size}
                                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                                />
                            </div>
                        ))}
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        The social media scheduler
                        <br />
                        <span className="inline-flex items-baseline gap-2 sm:gap-3">
                            <span>for</span>
                            <span className="inline-flex items-end text-primary">
                                <span className="whitespace-nowrap">{typedAudience}</span>
                                <span
                                    aria-hidden="true"
                                    className="ml-1 inline-block h-[0.95em] w-[2px] animate-pulse bg-primary"
                                />
                            </span>
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        Post to all social platforms from one dashboard. Easy to use and
                        fairly priced.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-4">
                        <a
                            href="/create-account"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                        >
                            Try it for free
                        </a>
                    </div>

                    {/* Dashboard Image */}
                    <div className="mt-16 sm:mt-24">
                        <div className="relative mx-auto max-w-5xl">
                            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                                {/* Dashboard image */}
                                <div className="aspect-video w-full bg-muted/20">
                                    <Image
                                        src="/amplypost-dashboard.png"
                                        alt="Amplypost Dashboard Preview"
                                        width={1200}
                                        height={675}
                                        className="h-full w-full object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                            {/* Decorative gradient blur */}
                            <div className="absolute -bottom-8 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
