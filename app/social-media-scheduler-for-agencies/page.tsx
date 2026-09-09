import type { Metadata } from "next";

import MarketingLandingPage from "@/app/components/marketing-landing-page";
import { getLandingPage } from "@/lib/marketing-landing-pages";

const page = getLandingPage("social-media-scheduler-for-agencies");

export const metadata: Metadata = {
    title: page.metaTitle,
    description: page.metaDescription,
};

export default function AgencySchedulerPage() {
    return <MarketingLandingPage page={page} />;
}
