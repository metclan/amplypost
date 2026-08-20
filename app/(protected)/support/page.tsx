import { Metadata } from "next";
import { Support } from "./support";

export const metadata: Metadata = {
    title: "Support | Amplypost",
    description: "Contact Amplypost support via WhatsApp or email.",
};

export default function SupportPage() {
    return <Support />;
}
