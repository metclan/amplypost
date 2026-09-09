"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import ThemeToggle from "./theme-toggle";
import { authFetch } from "@/util/backend-api";

type AuthUser = {
    id?: string;
    email?: string;
    name?: string;
};

export default function MarketingHeader({
    featuresHref = "#features",
    howItWorksHref = "#how-it-works",
}: {
    featuresHref?: string;
    howItWorksHref?: string;
}) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let ignore = false;

        async function getUser() {
            try {
                const response = await authFetch("auth/get-session");

                if (!response.ok) {
                    if (!ignore) setUser(null);
                    return;
                }

                const data = await response.json();
                if (!ignore) setUser(data?.user ?? null);
            } catch {
                if (!ignore) setUser(null);
            }
        }

        getUser();

        return () => {
            ignore = true;
        };
    }, []);

    const navLinks = [
        ["Pricing", "#pricing"],
        ["Features", featuresHref],
        ["How it Works", howItWorksHref],
        ["FAQ", "#faq"],
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
            <nav className="mx-auto grid h-16 max-w-7xl grid-cols-2 items-center px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
                <Link href="/" className="flex items-center gap-2" aria-label="Amplypost home">
                    <Image
                        src="/amplypost-logo.png"
                        alt="Amplypost logo"
                        width={34}
                        height={34}
                        className="h-8 w-8"
                        priority
                    />
                    <span className="text-xl font-bold tracking-tight">Amplypost</span>
                </Link>

                <div className="hidden items-center justify-center gap-6 lg:flex">
                    {navLinks.map(([label, href]) => (
                        <a key={label} href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            {label}
                        </a>
                    ))}
                </div>

                <div className="hidden items-center justify-end gap-3 lg:flex">
                    {user ? (
                        <Link href="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Login</Link>
                            <Link href="/create-account" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                                Try it for free
                            </Link>
                        </>
                    )}
                    <ThemeToggle showLabel={false} />
                </div>

                <div className="flex items-center justify-end gap-2 lg:hidden">
                    <Link href={user ? "/dashboard" : "/create-account"} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90">
                        {user ? "Dashboard" : "Try free"}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((value) => !value)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm hover:bg-accent"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="border-t border-border px-4 py-4 lg:hidden">
                    <div className="mx-auto max-w-7xl space-y-2">
                        {navLinks.map(([label, href]) => (
                            <a
                                key={label}
                                href={href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                {label}
                            </a>
                        ))}
                        <div className="border-t border-border pt-3">
                            <ThemeToggle />
                        </div>
                        {!user && (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
