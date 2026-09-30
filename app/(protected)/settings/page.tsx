import type { Metadata } from "next";
import Settings from "./settings";

export const metadata: Metadata = {
    title: "Settings | Amplypost",
    description: "Manage your profile, password, and account.",
};

export default function SettingsPage() {
    return <Settings />;
}
