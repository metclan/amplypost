import type { Metadata } from "next";

import MarketingLandingPage from "@/app/components/marketing-landing-page";
import { getLandingPage } from "@/lib/marketing-landing-pages";

const page = getLandingPage("schedule-youtube-shorts");

export const metadata: Metadata = {
    title: page.metaTitle,
    description: page.metaDescription,
};

export default function ScheduleYouTubeShortsPage() {
    return <MarketingLandingPage page={page} />;
}
