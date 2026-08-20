import { Metadata } from "next";
import { PaymentStatus } from "./payment-status";

export const metadata: Metadata = {
    title: "Payment Status | Amplypost",
    description: "Check the status of your payment.",
};

import { Suspense } from "react";

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PaymentStatus />
        </Suspense>
    );
}
