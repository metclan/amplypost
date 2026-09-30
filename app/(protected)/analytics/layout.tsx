import { Suspense, type ReactNode } from "react";
import AnalyticsShell from "./analytics-shell";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={<p role="status" className="p-6 text-muted-foreground">Loading analytics…</p>}><AnalyticsShell>{children}</AnalyticsShell></Suspense>;
}
