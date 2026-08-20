import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Refund Policy",
    description:
        "Refund Policy for Amplypost - Learn about our 14-day refund policy and how to request a refund for your purchase.",
    openGraph: {
        title: "Refund Policy | Amplypost",
        description:
            "Refund Policy for Amplypost - Learn about our 14-day refund policy and how to request a refund.",
        url: "https://www.amplypost.com/refund",
    },
};

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-400/20">
                        <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Your Satisfaction Guaranteed
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                        Refund Policy
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
                        for Amplypost
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        Last Updated: December 10, 2025
                    </p>
                </div>

                {/* Welcome Message */}
                <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                    <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        At{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Amplypost
                        </span>{" "}
                        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to your satisfaction. This Refund Policy outlines the terms and conditions for requesting a refund for purchases made through our website located at{" "}
                        <a
                            href="https://amplypost.com"
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            https://amplypost.com
                        </a>{" "}
                        (the &quot;Website&quot;).
                    </p>
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        By making a purchase on the Website, you agree to the terms of this
                        Refund Policy. Please read this policy carefully before making a purchase.
                    </p>
                </div>

                {/* Refund Sections */}
                <div className="space-y-12">
                    {/* Section 1 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                1
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    14-Day Refund Period
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                                    We offer a <span className="font-semibold text-zinc-800 dark:text-zinc-200">14-day refund period</span> from the date of your purchase. If you are not satisfied with our service for any reason, you may request a full refund within 14 days of your purchase date.
                                </p>
                                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Important:</span> The 14-day period begins on the date of purchase, not the date of account activation or first use.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                                2
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Eligibility for Refunds
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                                    To be eligible for a refund, the following conditions must be met:
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                The refund request must be made within <span className="font-semibold text-zinc-800 dark:text-zinc-200">14 days</span> of the purchase date.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                The purchase must have been made directly through our Website.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                You must provide a valid reason for the refund request (though we do not require extensive justification).
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Your account must not have violated our Terms of Service.
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
                                3
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    How to Request a Refund
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                                    To request a refund, please follow these steps:
                                </p>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 dark:bg-pink-600 flex items-center justify-center text-white text-xs font-bold">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                                    Contact Our Support Team
                                                </p>
                                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                                    Send an email to{" "}
                                                    <a
                                                        href="mailto:support@amplypost.com"
                                                        className="font-medium text-pink-600 dark:text-pink-400 hover:underline"
                                                    >
                                                        support@amplypost.com
                                                    </a>{" "}
                                                    with the subject line &quot;Refund Request.&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 dark:bg-pink-600 flex items-center justify-center text-white text-xs font-bold">
                                                2
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                                    Provide Required Information
                                                </p>
                                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                                    Include your account email, purchase date, transaction ID (if available), and a brief reason for your refund request.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 dark:bg-pink-600 flex items-center justify-center text-white text-xs font-bold">
                                                3
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                                    Wait for Confirmation
                                                </p>
                                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                                    Our team will review your request and respond within 2-3 business days.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                                4
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Refund Processing Time
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                                    Once your refund request is approved:
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Refunds will be processed within <span className="font-semibold text-zinc-800 dark:text-zinc-200">5-7 business days</span>.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                The refund will be issued to the original payment method used for the purchase.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Depending on your bank or payment provider, it may take an additional 3-5 business days for the refund to appear in your account.
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
                                5
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Non-Refundable Items
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                                    The following items are not eligible for refunds:
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Purchases made more than <span className="font-semibold text-zinc-800 dark:text-zinc-200">14 days</span> ago.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Accounts that have been suspended or terminated due to violations of our Terms of Service.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Promotional or discounted purchases (unless otherwise stated).
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20">
                                6
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Subscription Cancellations
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                                    If you have a recurring subscription:
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                You may cancel your subscription at any time through your account settings.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Cancellations will take effect at the end of the current billing period.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></span>
                                        <div>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                Refunds for the current billing period are subject to the 14-day refund policy outlined above.
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                7
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Changes to This Refund Policy
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We reserve the right to update or modify this Refund Policy at any time. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date. We encourage you to review this policy periodically. Your continued use of our service after any changes constitutes acceptance of the updated policy.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                                8
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Contact Information
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    If you have any questions, concerns, or requests related to this
                                    Refund Policy or wish to request a refund, you can contact us at:
                                </p>
                                <div className="mt-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30">
                                    <p className="text-zinc-700 dark:text-zinc-300">
                                        <span className="font-semibold">Email:</span>{" "}
                                        <a
                                            href="mailto:support@amplypost.com"
                                            className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
                                        >
                                            support@amplypost.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Satisfaction Message */}
                <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-center shadow-xl shadow-blue-500/20">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xl font-semibold text-white mb-2">
                        Your Satisfaction is Our Priority
                    </p>
                    <p className="text-blue-50">
                        We stand behind our service with a 14-day money-back guarantee.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <p>© 2025 Metclan Technologies. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link
                                href="/privacy"
                                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/refund"
                                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Refund Policy
                            </Link>
                            <Link
                                href="/tos"
                                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
