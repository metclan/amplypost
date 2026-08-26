import type { MetadataRoute } from "next";

import { getAllBlogPosts } from "@/lib/blog";
import { platforms } from "@/lib/platforms";

const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.amplypost.com"
).replace(/\/$/, "");

type SitemapEntry = MetadataRoute.Sitemap[number];

// Static, high-value marketing/product routes.
// Give each a real lastModified date (update it when you actually edit the page)
// instead of `new Date()` on every build — Google trusts accurate dates more.
const staticRoutes: Array<{
    path: string;
    lastModified: Date;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
}> = [
    { path: "", lastModified: new Date("2026-08-01"), changeFrequency: "weekly", priority: 1.0 },
    { path: "/blog", lastModified: new Date("2026-08-22"), changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools", lastModified: new Date("2026-08-01"), changeFrequency: "weekly", priority: 0.7 },
    { path: "/tools/instagram-downloader", lastModified: new Date("2026-07-15"), changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/tiktok-downloader", lastModified: new Date("2026-07-15"), changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/youtube-downloader", lastModified: new Date("2026-07-15"), changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/convert-image", lastModified: new Date("2026-07-15"), changeFrequency: "monthly", priority: 0.7 },
];

// Legal/utility pages — low priority, rarely change, no need to signal freshness
const legalRoutes: Array<{ path: string; lastModified: Date }> = [
    { path: "/privacy", lastModified: new Date("2026-06-01") },
    { path: "/tos", lastModified: new Date("2026-06-01") },
    { path: "/refund", lastModified: new Date("2026-06-01") },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticEntries: SitemapEntry[] = staticRoutes.map((route) => ({
        url: `${siteUrl}${route.path}`,
        lastModified: route.lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));

    const legalEntries: SitemapEntry[] = legalRoutes.map((route) => ({
        url: `${siteUrl}${route.path}`,
        lastModified: route.lastModified,
        changeFrequency: "yearly",
        priority: 0.3,
    }));

    const platformEntries: SitemapEntry[] = platforms.map((platform) => ({
        url: `${siteUrl}/platforms/${platform.slug}`,
        lastModified: new Date("2026-08-01"),
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    const blogPosts = getAllBlogPosts();
    const blogEntries: SitemapEntry[] = blogPosts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.updated ?? post.date,
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    return [
        ...staticEntries,
        ...platformEntries,
        ...legalEntries,
        ...blogEntries,
    ];
}
