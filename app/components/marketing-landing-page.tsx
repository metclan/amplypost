import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

import MarketingHeader from "./marketing-header";
import Pricing from "./pricing";
import type { LandingPageData } from "@/lib/marketing-landing-pages";

export default function MarketingLandingPage({ page }: { page: LandingPageData }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MarketingHeader howItWorksHref="#workflow" />
            <main>
            <section className="border-b border-border px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            {page.logos.map((logo) => (
                                <span
                                    key={`${page.slug}-${logo.alt}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm"
                                >
                                    <Image
                                        src={logo.src}
                                        alt={`${logo.alt} logo`}
                                        width={28}
                                        height={28}
                                        className="h-7 w-7 object-contain"
                                        priority
                                    />
                                </span>
                            ))}
                        </div>
                        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            {page.eyebrow}
                        </p>
                        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                            {page.title}
                        </h1>
                        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                            {page.description}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/create-account"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                            >
                                {page.primaryCta}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href={page.demo ? "#demo" : "#workflow"}
                                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-accent"
                            >
                                {page.secondaryCta}
                            </a>
                        </div>
                        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
                            {page.proof.map((item) => (
                                <span key={item} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-xl">
                        <Image
                            src={page.image.src}
                            alt={page.image.alt}
                            width={1200}
                            height={760}
                            className="rounded-xl object-cover"
                            sizes="(min-width: 1024px) 560px, 100vw"
                        />
                    </div>
                </div>
            </section>

            <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-4 md:grid-cols-3">
                        {page.features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <article key={feature.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h2 className="mt-5 text-lg font-bold text-foreground">{feature.title}</h2>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {page.demo && (
                <section id="demo" className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Demo</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {page.demo.title}
                            </h2>
                        </div>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {page.demo.items.map((item) => (
                                <div key={item} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {page.supportedContentTypes && (
                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Supported content</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Supported Content Types
                            </h2>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {page.supportedContentTypes.map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                                    <p className="text-sm text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="workflow" className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Workflow</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {page.workflowTitle}
                        </h2>
                        <p className="mt-5 text-base leading-7 text-muted-foreground">
                            {page.workflowText}
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {page.workflow.map((step, index) => (
                            <div key={step} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                    {index + 1}
                                </span>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={page.supportedContentTypes ? "border-b border-border px-4 py-16 sm:px-6 lg:px-8" : "px-4 py-16 sm:px-6 lg:px-8"}>
                <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Why Amplypost</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {page.comparisonTitle}
                        </h2>
                        <p className="mt-5 text-base leading-7 text-muted-foreground">
                            {page.comparisonText}
                        </p>
                    </div>
                    <div className="space-y-3">
                        {page.comparison.map((item) => (
                            <div key={item} className="flex gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {page.planInfo && (
                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Plans</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {page.planInfo.title}
                            </h2>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                {page.planInfo.text}
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {page.planInfo.items.map((item) => (
                                <div key={item} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="faq" className="border-y border-border bg-muted/25 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">FAQ</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Questions people ask
                        </h2>
                    </div>
                    <div className="mt-10 space-y-4">
                        {page.faq.map((item) => (
                            <details key={item.question} className="group rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-lg font-semibold text-foreground">
                                    {item.question}
                                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-open:rotate-90" />
                                </summary>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl rounded-3xl bg-foreground px-6 py-14 text-center text-background shadow-xl sm:px-10">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {page.cta?.title ?? "Start planning your social media calendar"}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-background/70">
                        {page.cta?.text ?? "Connect your supported accounts, create content, and schedule posts from one Amplypost workspace."}
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link href="/create-account" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90">
                            {page.cta?.button ?? "Try Amplypost for free"}
                        </Link>
                        <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-background/20 px-6 text-sm font-semibold text-background hover:bg-background/10">
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            <Pricing />
            </main>
        </div>
    );
}
