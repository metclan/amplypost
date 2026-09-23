// app/layout.tsx or app/(marketing)/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleAnalytics } from '@next/third-parties/google'
import ThemeProvider from "./components/theme-provider";
import DataFastAnalytics from "./components/datafast-analytics";

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    const root = document.documentElement;

    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export const metadata: Metadata = {
  // === Basic ===
  title: {
    default: "Amplypost — Schedule Posts to TikTok, Instagram, Twitter, LinkedIn & More",
    template: "%s | Amplypost",
  },
  description:
    "The all-in-one social media scheduling tool. Schedule and crosspost to TikTok, Instagram, Twitter (X), LinkedIn, Threads, YouTube Shorts + send bulk email, SMS & WhatsApp campaigns from one dashboard.",

  // === Open Graph / Facebook ===
  openGraph: {
    title: "Amplypost — Cross-Post to All Social Media in One Click",
    description:
      "Save hours every week. Schedule once and automatically publish to TikTok, Instagram, Twitter/X, LinkedIn, Threads, Facebook, Pinterest + bulk email, SMS & WhatsApp.",
    url: "https://www.amplypost.com",
    siteName: "Amplypost",
    images: [
      {
        url: "https://res.cloudinary.com/deamgyfii/image/upload/v1772100248/Social_media_scheduler_kgx1qd.png", // 1200×630 recommended
        width: 1200,
        height: 630,
        alt: "Amplypost – Social Media Scheduling & Bulk Messaging Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // === Twitter (X) Cards ===
  twitter: {
    card: "summary_large_image",
    title: "Amplypost — Schedule & Crosspost to Every Platform",
    description:
      "One tool to rule them all: TikTok, Instagram, Twitter/X, LinkedIn, Threads + Email, SMS & WhatsApp campaigns.",
    images: ["https://res.cloudinary.com/deamgyfii/image/upload/v1772100248/Social_media_scheduler_kgx1qd.png"], // 1200×628 or same as OG
    creator: "@amplypost", // change to your real handle
    site: "@amplypost",
  },

  // === Icons ===
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },

  // === Robots & Verification ===
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // === Verification (add your real codes) ===
  verification: {
    google: "your-google-search-console-code",
    // yandex: "...",
    // bing: "...",
  },

  // === Canonical URL ===
  alternates: {
    canonical: "https://www.amplypost.com",
  },

  // === Additional SEO Boosters ===
  category: "technology",
  classification: "Social Media Management Software",
  keywords: [
    "social media scheduler",
    "crossposting tool",
    "schedule tiktok posts",
    "instagram scheduler",
    "twitter scheduler",
    "linkedin automation",
    "threads scheduler",
    "bulk email marketing",
    "sms marketing tool",
    "whatsapp business automation",
    "post to multiple platforms",
    "amplypost",
  ],
};

// Optional: Add JSON-LD structured data in your root layout or a separate component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Structured Data - SoftwareApplication */}
         <meta name="facebook-domain-verification" content="f58unlmeqjjlyqcl1kkck5vos94aqw" />
         <meta name="ory-verify" content="orynth-275c9630aa824d5f865a9e421f35e5ed" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Amplypost",
              operatingSystem: "Web",
              applicationCategory: "https://schema.org/BusinessApplication",
              description:
                "All-in-one social media scheduling and bulk messaging platform.",
              url: "https://www.amplypost.com",
              offers: {
                "@type": "Offer",
                price: "29", // update with real pricing or remove
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "342",
              },
              featureList: [
                "Cross-post to TikTok, Instagram, Twitter/X, LinkedIn, Threads",
                "Bulk Email Campaigns",
                "SMS Marketing",
                "WhatsApp Business Automation",
                "Content Calendar & Analytics",
              ],
            }),
          }}
        />
      </head>
      <body>
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

              ttq.load('DAPF643C77UFS4KR5890');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
        <ThemeProvider>
          <DataFastAnalytics />
          <Toaster position="top-right" richColors />
          {children}
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
    </html>
  );
}
