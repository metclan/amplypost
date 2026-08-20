"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ThemeToggle from "./theme-toggle";

type AuthUser = {
    id?: string;
    email?: string;
    name?: string;
};

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const response = await fetch("/api/auth/get-session", {
                credentials: "include",
            });

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data = await response.json();
            setUser(data?.user ?? null);
        };

        getUser();
    }, []);

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/amplypost-logo.png"
                                alt="Amplypost Logo"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                            <span className="text-2xl font-bold text-foreground">
                                Amplypost
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        <a
                            href="#pricing"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Pricing
                        </a>
                        <a
                            href="#faq"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            FAQ
                        </a>
                        <Link
                            href="/tools"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Tools
                        </Link>
                        <ThemeToggle />

                        {/* Login/Dashboard Button - Desktop */}
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="border-t border-border py-4 md:hidden">
                        <div className="space-y-3">
                            <a
                                href="#pricing"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground rounded-lg"
                            >
                                Pricing
                            </a>
                            <a
                                href="#faq"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground rounded-lg"
                            >
                                FAQ
                            </a>
                            <Link
                                href="/tools"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground rounded-lg"
                            >
                                Tools
                            </Link>
                            <div className="px-4">
                                <ThemeToggle />
                            </div>

                            {/* Login/Dashboard Button - Mobile */}
                            <div className="border-t border-border pt-3 mt-3">
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
