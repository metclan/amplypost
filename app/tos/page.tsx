import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Terms of Service for Amplypost - Read our terms and conditions for using our social media scheduling and bulk messaging platform.",
    openGraph: {
        title: "Terms of Service | Amplypost",
        description:
            "Terms of Service for Amplypost - Read our terms and conditions for using our social media scheduling platform.",
        url: "https://www.amplypost.com/tos",
    },
};

export default function TermsOfService() {
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
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-400/20">
                        <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Legal Document
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
                        for Amplypost
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        Last Updated: December 2, 2025
                    </p>
                </div>

                {/* Welcome Message */}
                <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/50">
                    <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        Welcome to <span className="font-semibold text-zinc-900 dark:text-zinc-100">Amplypost</span>!
                    </p>
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        These Terms of Service (&quot;Terms&quot;) govern your use of the Amplypost
                        website at{" "}
                        <a
                            href="https://amplypost.com"
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            https://amplypost.com
                        </a>{" "}
                        (&quot;Website&quot;) and the services provided by Amplypost. By using our
                        Website and services, you agree to these Terms.
                    </p>
                </div>

                {/* Terms Sections */}
                <div className="space-y-12">
                    {/* Section 1 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                1
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Description of Amplypost
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Amplypost is a tool that allows users to cross-post and upload
                                    content to all social media platforms from one place.
                                </p>
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
                                    YouTube Terms of Service
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    By using Amplypost to interact with YouTube services, you also
                                    agree to be bound by the{" "}
                                    <a
                                        href="https://www.youtube.com/t/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                        YouTube Terms of Service
                                    </a>
                                    . This includes any use of the YouTube API services through our
                                    platform.
                                </p>
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
                                    User Data and Privacy
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We collect and store user data, including name, email, payment
                                    information, and social media authentication access keys, as
                                    necessary to provide our services. For details on how we handle
                                    your data, please refer to our{" "}
                                    <Link
                                        href="/privacy-policy"
                                        className="font-medium text-pink-600 dark:text-pink-400 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>{" "}
                                    at{" "}
                                    <a
                                        href="https://amplypost.com/privacy-policy"
                                        className="font-medium text-pink-600 dark:text-pink-400 hover:underline"
                                    >
                                        https://amplypost.com/privacy-policy
                                    </a>
                                    .
                                </p>
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
                                    Non-Personal Data Collection
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We use web cookies to collect non-personal data for the purpose
                                    of improving our services and user experience.
                                </p>
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
                                    Ownership and Usage Rights
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    When you purchase a package from Amplypost, you can sign in to
                                    your social media accounts and authorize access to your data to
                                    post to the platforms connected to the Amplypost app. You retain
                                    ownership of your content, but grant us the necessary rights to
                                    post on your behalf.
                                </p>
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
                                    Refund Policy
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We offer a full refund within 24 hours after the purchase. To
                                    request a refund, please contact us at{" "}
                                    <a
                                        href="mailto:support@amplypost.com"
                                        className="font-medium text-green-600 dark:text-green-400 hover:underline"
                                    >
                                        support@amplypost.com
                                    </a>
                                    .
                                </p>
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
                                    Children&apos;s Privacy
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Amplypost is not intended for use by children, and we do not
                                    knowingly collect any data from children.
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
                                    Updates to the Terms
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We may update these Terms from time to time. Users will be
                                    notified of any changes via email.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
                                9
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Governing Law
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    These Terms are governed by the laws of Canada.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section className="group">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20">
                                10
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                                    Contact Information
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    For any questions or concerns regarding these Terms of Service,
                                    please contact us at{" "}
                                    <a
                                        href="mailto:support@amplypost.com"
                                        className="font-medium text-rose-600 dark:text-rose-400 hover:underline"
                                    >
                                        support@amplypost.com
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Closing Message */}
                <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200 text-center">
                    <p className="text-xl font-semibold text-white dark:text-zinc-900">
                        Thank you for using Amplypost!
                    </p>
                    <p className="mt-2 text-zinc-300 dark:text-zinc-600">
                        We&apos;re committed to providing you with the best social media
                        management experience.
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
                                href="/privacy-policy"
                                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Privacy Policy
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
