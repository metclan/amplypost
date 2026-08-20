import { Metadata } from "next";
import ConnectedAccounts from "./connected-accounts";

export const metadata: Metadata = {
    title: "Connected Accounts | Amplypost",
    description: "Manage your social media accounts and connections. Connect Facebook, Instagram, LinkedIn, TikTok, YouTube, and Twitter/X to start scheduling posts.",
};

export default function ConnectedAccountsPage() {
    return <ConnectedAccounts />;
}
