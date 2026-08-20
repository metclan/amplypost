import Image from "next/image";
import Link from "next/link";

const platforms = [
    { name: "Facebook", src: "/facebook-logo.svg" },
    { name: "Instagram", src: "/instagram-logo.svg" },
    { name: "TikTok", src: "/tiktok-logo.svg" },
    { name: "X", src: "/x-logo.svg" },
    { name: "YouTube", src: "/youtube-logo.svg" },
    { name: "LinkedIn", src: "/linkedin-logo.svg" },
    { name: "Threads", src: "/thread-logo.svg" },
];

export function GetAmplypostCard() {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
                {/* Logo */}
                <Image
                    src="/amplypost-logo.png"
                    alt="Amplypost"
                    width={44}
                    height={44}
                    className="mb-4"
                />

                {/* Headline */}
                <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    Schedule posts across all your socials
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Manage and crosspost to every platform from one dashboard — completely free to start.
                </p>

                {/* Platform icons */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
                    {platforms.map((platform) => (
                        <Image
                            key={platform.name}
                            src={platform.src}
                            alt={platform.name}
                            width={32}
                            height={32}
                            title={platform.name}
                        />
                    ))}
                </div>

                {/* CTA */}
                <Link
                    href="/create-account"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
                >
                    Get Started for Free
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4"
                    >
                        <path
                            fillRule="evenodd"
                            d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
