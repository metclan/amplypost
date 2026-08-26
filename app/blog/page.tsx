import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import Footer from "@/app/components/footer";
import Navigation from "@/app/components/navigation";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
    title: "Blog | Amplypost",
    description: "Guides on social media scheduling, crossposting, content workflows, and growing a consistent publishing habit.",
};

function formatPostDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export default function BlogPage() {
    const posts = getAllBlogPosts();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navigation />
            <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Amplypost Blog</p>
                    <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
                        Better systems for consistent publishing.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                        Practical notes on planning, creating, scheduling, and publishing content across every channel your business uses.
                    </p>
                </div>
            </section>

            <section className="px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-5xl gap-5">
                    {posts.map((post) => (
                        <article key={post.slug} className="rounded-lg border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    {formatPostDate(post.date)}
                                </span>
                                <span>{post.readingTime}</span>
                            </div>
                            <h2 className="mt-4 text-2xl font-bold tracking-tight">
                                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{post.description}</p>
                            {post.tags.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span key={tag} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                Read article
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
            <Footer />
        </main>
    );
}
