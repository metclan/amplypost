import type { MetadataRoute } from "next";

const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.amplypost.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: [
                "/",
                "/blog/",
                "/sitemap.xml",
            ],
            disallow: [
                "/api/",
                "/admin/",
                "/billing/",
                "/calendar/",
                "/connected-accounts/",
                "/create-account/",
                "/create-post/",
                "/dashboard/",
                "/login/",
                "/posts/",
                "/subscribe/",
                "/support/",
                "/workspaces/",
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
