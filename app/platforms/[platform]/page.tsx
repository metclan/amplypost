import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Play } from "lucide-react";

import { getPlatformBySlug, platforms } from "@/lib/platforms";

export function generateStaticParams() {
    return platforms.map((platform) => ({
        platform: platform.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
    const { platform: slug } = await params;
    const platform = getPlatformBySlug(slug);

    if (!platform) {
        return {
            title: "Platform | Amplypost",
        };
    }

    return {
        title: `${platform.name} Publishing | Amplypost`,
        description: platform.description,
    };
}

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
    const { platform: slug } = await params;
    const platform = getPlatformBySlug(slug);

    if (!platform) notFound();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <Link href="/#platforms" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Platforms
                    </Link>

                    <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
                        <div>
                            <div className="flex items-center gap-4">
                                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                                    <Image
                                        src={platform.logo}
                                        alt={`${platform.name} logo`}
                                        width={44}
                                        height={44}
                                        className="h-11 w-11 object-contain"
                                        priority
                                    />
                                </span>
                                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                                    {platform.name}
                                </p>
                            </div>
                            <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                                {platform.headline}
                            </h1>
                            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                                {platform.description}
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link href="/create-account" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90">
                                    Start publishing
                                </Link>
                                <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground hover:bg-muted">
                                    Login
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="text-lg font-bold">How to connect {platform.name}</h2>
                            <div className="mt-5 space-y-4">
                                {platform.connectSteps.map((step, index) => (
                                    <div key={step} className="flex gap-3">
                                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-bold">Connection walkthrough</h2>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                        <div className="relative aspect-video bg-muted">
                            <Image
                                src="/amplypost-dashboard.png"
                                alt={`Amplypost walkthrough for connecting ${platform.name}`}
                                fill
                                sizes="(min-width: 1024px) 960px, 100vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-2xl">
                                <Play className="ml-1 h-8 w-8 fill-current" />
                            </div>
                            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/95 px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
                                {platform.name} connection video coming soon
                            </span>
                        </div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-muted-foreground">
                        This page is ready for the final platform-specific video embed when the walkthrough is available.
                    </p>
                </div>
            </section>
        </main>
    );
}
