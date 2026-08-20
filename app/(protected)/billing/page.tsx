import { Metadata } from "next";
import { Billing } from "./billing";

export const metadata: Metadata = {
    title: "Billing | Amplypost",
    description: "Manage your billing and subscriptions.",
};

export default function BillingPage() {
    return <Billing />;
}
