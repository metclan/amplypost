"use client";
import AnalyticsDailyChart from "./analytics-daily-chart";
export default function InstagramReachChart({ series, accountId }: { series: { date: string; reach: number }[]; accountId: string }) {
    return <AnalyticsDailyChart series={series.map(point => ({ date: point.date, value: point.reach }))} accountId={accountId} title="Daily reach" description="Unique accounts reached each day · UTC." unit="accounts" note="Daily reach is not additive." />;
}
