import { BarChart3 } from "lucide-react";

export default async function PlatformAnalyticsPage({ params }: { params: Promise<{ platform: string }> }) {
    const { platform } = await params;
    return <section className="rounded-2xl border border-dashed border-border p-10 text-center"><BarChart3 className="mx-auto mb-4 h-9 w-9 text-muted-foreground" aria-hidden="true" /><h2 className="text-xl font-semibold capitalize">{platform.replaceAll("_", " ")} analytics</h2><p className="mt-2 text-sm text-muted-foreground">Analytics for this platform aren’t available yet. Select a TikTok, Instagram, Facebook, Threads, or Pinterest account above to explore its performance.</p></section>;
}
