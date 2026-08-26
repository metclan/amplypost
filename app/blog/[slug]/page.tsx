import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, CalendarDays } from "lucide-react";

import Footer from "@/app/components/footer";
import Navigation from "@/app/components/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

type BlogPostPageProps = {
    params: Promise<{ slug: string }>;
};

function formatPostDate(date: string) {
    return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export function generateStaticParams() {
    return getAllBlogPosts().map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);

    if (!post) {
        return {
            title: "Blog Post | Amplypost",
        };
    }

    return {
        title: post.title,
        description: post.description,
        alternates: {
            canonical: `/blog/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.date,
            modifiedTime: post.updated,
            authors: post.author ? [post.author] : undefined,
            url: `/blog/${post.slug}`,
        },
    };
}

const mdxComponents = {
    h2: (props: React.ComponentProps<"h2">) => (
        <h2 className="mt-12 text-3xl font-bold tracking-tight text-foreground" {...props} />
    ),
    h3: (props: React.ComponentProps<"h3">) => (
        <h3 className="mt-9 text-2xl font-bold tracking-tight text-foreground" {...props} />
    ),
    p: (props: React.ComponentProps<"p">) => (
        <p className="mt-5 leading-8 text-muted-foreground" {...props} />
    ),
    a: (props: React.ComponentProps<"a">) => (
        <a className="font-semibold text-primary underline-offset-4 hover:underline" {...props} />
    ),
    ul: (props: React.ComponentProps<"ul">) => (
        <ul className="mt-5 list-disc space-y-2 pl-6 text-muted-foreground" {...props} />
    ),
    ol: (props: React.ComponentProps<"ol">) => (
        <ol className="mt-5 list-decimal space-y-2 pl-6 text-muted-foreground" {...props} />
    ),
    li: (props: React.ComponentProps<"li">) => (
        <li className="leading-7" {...props} />
    ),
    blockquote: (props: React.ComponentProps<"blockquote">) => (
        <blockquote className="mt-8 border-l-4 border-primary bg-muted px-5 py-4 text-muted-foreground" {...props} />
    ),
    code: (props: React.ComponentProps<"code">) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground" {...props} />
    ),
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);

    if (!post) notFound();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navigation />
            <article>
                <header className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Blog
                        </Link>
                        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                {formatPostDate(post.date)}
                            </span>
                            <span>{post.readingTime}</span>
                            {post.author && <span>{post.author}</span>}
                        </div>
                        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">{post.title}</h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">{post.description}</p>
                    </div>
                </header>

                <div className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <MDXRemote source={post.content} components={mdxComponents} />
                    </div>
                </div>
            </article>
            <Footer />
        </main>
    );
}
