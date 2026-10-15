"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type AnalyticsSort = { key: string; direction: "ascending" | "descending" };

export function AnalyticsSortHeader({ column, label, sort, onSort }: {
    column: string; label: string; sort: AnalyticsSort; onSort: (sort: AnalyticsSort) => void;
}) {
    const active = sort.key === column;
    const Icon = active ? sort.direction === "descending" ? ArrowDown : ArrowUp : ArrowUpDown;
    return <th scope="col" aria-sort={active ? sort.direction : "none"} className="p-3 text-right text-xs font-medium">
        <button type="button" className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded px-1 py-1 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary ${active ? "text-foreground" : "text-muted-foreground"}`}
            onClick={() => onSort({ key: column, direction: active && sort.direction === "descending" ? "ascending" : "descending" })}>
            {label}<Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
    </th>;
}
