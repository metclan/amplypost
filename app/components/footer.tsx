import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/amplypost-logo.png"
                                alt="Amplypost Logo"
                                width={24}
                                height={24}
                                className="h-6 w-6"
                            />
                            <h3 className="text-lg font-bold text-foreground">Amplypost</h3>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            The social media scheduler for business owners and marketers.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Product</h4>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <a
                                    href="#pricing"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#faq"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tools"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Tools
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Legal</h4>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tos"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/refund"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Contact</h4>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <a
                                    href="mailto:support@amplypost.com"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    support@amplypost.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-border pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2025 Metclan Technologies. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
