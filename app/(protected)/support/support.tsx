import Image from "next/image";

const SUPPORT_EMAIL = "support@amplypost.com";
const SUPPORT_INSTAGRAM_URL =
    process.env.NEXT_PUBLIC_SUPPORT_INSTAGRAM_URL || "https://instagram.com/amplypost";

function getWhatsappLink() {
    const configuredNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || "";
    const sanitizedNumber = configuredNumber.replace(/\D/g, "");
    const message = encodeURIComponent(
        "Hi Amplypost support, I need help with my account."
    );

    if (sanitizedNumber) {
        return `https://wa.me/${sanitizedNumber}?text=${message}`;
    }

    return `https://wa.me/?text=${message}`;
}

export function Support() {
    const whatsappLink = getWhatsappLink();

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div className="border-b border-border pb-5">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Support
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Reach out and we&apos;ll help you quickly.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <Image
                            src="/whatsapp-logo.svg"
                            alt="WhatsApp"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                        WhatsApp
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Chat with us directly on WhatsApp for fast support.
                    </p>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                    >
                        Message on WhatsApp
                    </a>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                        <Image
                            src="/email.svg"
                            alt="Email"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Email</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Send us an email and we&apos;ll get back to you as soon as possible.
                    </p>
                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="mt-5 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        {SUPPORT_EMAIL}
                    </a>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10">
                        <Image
                            src="/instagram-logo.svg"
                            alt="Instagram"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Instagram</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Send us a direct message on Instagram and our team will reply.
                    </p>
                    <a
                        href={SUPPORT_INSTAGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        Open Instagram
                    </a>
                </div>
            </div>
        </div>
    );
}
