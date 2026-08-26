"use client";

import { useEffect } from "react";
import { initDataFast } from "datafast";

let dataFastInitPromise: ReturnType<typeof initDataFast> | null = null;

export default function DataFastAnalytics() {
    useEffect(() => {
        dataFastInitPromise ??= initDataFast({
            websiteId: "dfid_AC7fsOrQEBIpjTbPfZIwH",
            autoCapturePageviews: true,
        });

        void dataFastInitPromise.catch((error) => {
            console.error("Failed to initialize DataFast:", error);
        });
    }, []);

    return null;
}
