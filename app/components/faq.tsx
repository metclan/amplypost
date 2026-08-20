export default function FAQ() {
    return (
        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to know about Amplypost
                    </p>
                </div>

                <div className="mt-16 space-y-6">
                    {/* FAQ Item 2 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">
                                What social platforms do you support?
                            </span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Currently we support Twitter/X, Instagram, LinkedIn, Facebook,
                                TikTok, YouTube, Threads, and Pinterest for scheduled
                                posting and instant posting. If you have a request please feel
                                free to email us.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 3 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">
                                How many social accounts can I connect?
                            </span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Depends on your plan, see the pricing section for more
                                details... You will not find a more fair price anywhere else.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 4 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">What is a social account?</span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Social accounts are accounts of supported social media
                                platforms. For example: Connecting your Instagram account =
                                connecting 1 social account.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 5 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">
                                Can I connect 2 accounts to the same platform?
                            </span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Yes. Example: Starter plan can connect 5 total accounts, all of
                                them can be TikTok accounts, or 3 of them could be TikTok and 2
                                Instagram accounts for their cap of 5.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 6 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">
                                How many posts can I make and schedule per month?
                            </span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Unlimited for paying users. 5 for free users. 1 post to 4
                                platforms = 4 posts total.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 7 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">What types of content can I post?</span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                You can create and schedule various types of posts including:
                                videos, images, text posts, carousels (multiple images), and
                                reels. This gives you the flexibility to share all types of
                                content across your social media platforms.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 8 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">
                                Will my posts get less reach using this app?
                            </span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                No, you will have the same reach as if you posted manually. We
                                understand you may be wary that the algorithm favors manual
                                posting, we were too! However, under our own testing we have
                                found no difference in reach between manual posting and posting
                                from Amplypost.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 9 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">Can I cancel anytime?</span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Yes, there&apos;s no lock-in and you can cancel your subscription
                                at anytime of the month. When cancelling it will cancel at the
                                end of your current billing period; you can still use the pro
                                features until the end of your billing period.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 10 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">Can I get a refund?</span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Yes! You can request a refund within 14 days of being charged.
                                Just reach out by email in this time frame.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 11 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">
                                Do I need to share my social media passwords with you?
                            </span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                No, we never ask for or store your passwords directly. We use
                                official authentication methods provided by each social
                                platform, which means you log in securely through their official
                                login pages. This is the same secure method used by all
                                legitimate social media management tools.
                            </p>
                        </div>
                    </details>

                    {/* FAQ Item 12 */}
                    <details className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-foreground">
                            <span className="text-lg">I have another question</span>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </summary>
                        <div className="mt-4 text-muted-foreground">
                            <p>
                                Cool, contact us by email:{" "}
                                <a
                                    href="mailto:support@amplypost.com"
                                    className="font-medium text-primary hover:underline"
                                >
                                    support@amplypost.com
                                </a>{" "}
                                👋
                            </p>
                        </div>
                    </details>
                </div>
            </div>
        </section>
    );
}
