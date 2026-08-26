import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Privacy Policy for Amplypost - Learn how we collect, use, and protect your personal information when using our social media scheduling platform.",
    openGraph: {
        title: "Privacy Policy | Amplypost",
        description:
            "Privacy Policy for Amplypost - Learn how we collect, use, and protect your personal information.",
        url: "https://www.amplypost.com/privacy",
    },
};

const sections = [
    {
        number: "1",
        title: "Information We Collect",
        body: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">1.1 Personal Data</h3>
                    <p className="mt-3 text-muted-foreground">
                        We collect the following personal information from you:
                    </p>
                    <ul className="mt-4 space-y-3 text-muted-foreground">
                        {[
                            ["Name", "We collect your name to personalize your experience and communicate with you effectively."],
                            ["Email", "We collect your email address to send you important information regarding your account, updates, and communication."],
                            ["Payment Information", "We collect payment details to process your orders securely."],
                            ["Social Media Authentication Access Keys", "We collect these to enable cross-posting functionality to your social media accounts."],
                        ].map(([label, text]) => (
                            <li key={label} className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>
                                    <strong className="font-semibold text-foreground">{label}:</strong>{" "}
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-5">
                    <h3 className="text-lg font-semibold text-foreground">1.2 Non-Personal Data</h3>
                    <p className="mt-3 text-muted-foreground">
                        We use web cookies to collect non-personal information such as your IP
                        address, browser type, device information, and browsing patterns. This
                        information helps us enhance your browsing experience, analyze trends,
                        and improve our services.
                    </p>
                </div>
            </div>
        ),
    },
    {
        number: "2",
        title: "Purpose of Data Collection",
        body: (
            <p>
                We collect and use your personal data for order processing and social media
                posting. This includes processing your orders, enabling cross-posting
                functionality, sending confirmations, providing customer support, and keeping
                you updated about the status of your account and posts.
            </p>
        ),
    },
    {
        number: "3",
        id: "google-user-data",
        title: "YouTube API Services",
        body: (
            <p>
                Amplypost uses YouTube API Services to enable cross-posting functionality to
                YouTube. By using our service to interact with YouTube, you are also subject to
                the{" "}
                <a
                    href="https://www.youtube.com/t/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    YouTube Terms of Service
                </a>
                .
            </p>
        ),
    },
    {
        number: "4",
        title: "Google Privacy Policy",
        body: (
            <p>
                As we use YouTube API Services, your data may also be subject to Google&apos;s
                Privacy Policy. For more information on how Google collects and processes data,
                please refer to the{" "}
                <a
                    href="http://www.google.com/policies/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    Google Privacy Policy
                </a>
                .
            </p>
        ),
    },
    {
        number: "5",
        title: "Google User Data Retention and Deletion",
        body: (
            <div className="space-y-4">
                <p>
                    Amplypost retains Google user data only for as long as necessary to provide
                    the services requested by the user, such as connecting a YouTube channel
                    and publishing or managing scheduled content.
                </p>
                <p>
                    When a user disconnects their Google account from Amplypost, we delete
                    stored Google OAuth access and refresh tokens associated with that
                    connection and cease accessing the user&apos;s Google account.
                </p>
                <p>
                    Users may also request deletion of their Google-related data by contacting
                    us at{" "}
                    <a
                        href="mailto:support@amplypost.com"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        support@amplypost.com
                    </a>
                    . Upon receiving a valid deletion request, we will delete the associated
                    Google user data from our active systems within 30 days, except where
                    retention is required by law or necessary for legitimate security,
                    fraud-prevention, or compliance purposes.
                </p>
                <p>
                    Deleting an Amplypost account will also result in deletion of Google user
                    data associated with that account, subject to the same limited legal and
                    security exceptions.
                </p>
                <p>
                    Amplypost does not sell Google user data or use Google user data for
                    advertising purposes.
                </p>
            </div>
        ),
    },
    {
        number: "6",
        title: "Data Sharing",
        body: (
            <p>
                We do not share your personal data with any other parties except as required for
                order processing and social media posting functionality. This may include
                sharing necessary data with the social media platforms you choose to post to,
                including YouTube through the YouTube API Services.
            </p>
        ),
    },
    {
        number: "7",
        title: "Children's Privacy",
        body: <p>Amplypost is not intended for children, and we do not collect any data from children.</p>,
    },
    {
        number: "8",
        title: "Updates to the Privacy Policy",
        body: <p>We may update this Privacy Policy from time to time. Users will be notified of any changes via email.</p>,
    },
    {
        number: "9",
        title: "Contact Information",
        body: (
            <div>
                <p>
                    If you have any questions, concerns, or requests related to this Privacy
                    Policy, you can contact us at:
                </p>
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                    <span className="font-semibold text-foreground">Email:</span>{" "}
                    <a
                        href="mailto:support@amplypost.com"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        support@amplypost.com
                    </a>
                </div>
            </div>
        ),
    },
    {
        number: "10",
        title: "Data Protection Mechanisms",
        body: (
            <div className="space-y-4">
                <p>
                    We take the protection of your sensitive data seriously and have implemented
                    the following security measure:
                </p>
                <div className="rounded-xl border border-border bg-muted/30 p-5">
                    <h3 className="font-semibold text-foreground">a) Encryption</h3>
                    <p className="mt-2">
                        Your Google OAuth access keys are encrypted using industry-standard
                        encryption protocols both in transit and at rest.
                    </p>
                </div>
                <p className="rounded-xl border border-border bg-card p-4 text-sm">
                    While we implement this security measure to protect your sensitive
                    information, please be aware that no method of transmission over the
                    Internet or method of electronic storage is 100% secure. We strive to use
                    commercially acceptable means to protect your personal information, but we
                    cannot guarantee its absolute security.
                </p>
            </div>
        ),
    },
];

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Back to Home
                    </Link>
                    <div className="text-sm font-bold text-foreground">Amplypost</div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Privacy and data use
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">for Amplypost</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Last Updated: December 2, 2025
                    </p>
                </div>

                <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <p className="text-lg leading-8 text-muted-foreground">
                        Thank you for using{" "}
                        <span className="font-semibold text-foreground">Amplypost</span>{" "}
                        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy
                        outlines how we collect, use, and protect your personal and non-personal
                        information when you use our website located at{" "}
                        <a
                            href="https://amplypost.com"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            https://amplypost.com
                        </a>{" "}
                        (the &quot;Website&quot;).
                    </p>
                    <p className="mt-4 leading-7 text-muted-foreground">
                        By accessing or using the Website, you agree to the terms of this Privacy
                        Policy. If you do not agree with the practices described in this policy,
                        please do not use the Website.
                    </p>
                </section>

                <div className="mt-10 space-y-5">
                    {sections.map((section) => (
                        <section
                            key={section.number}
                            id={section.id}
                            className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
                        >
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                                    {section.number}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {section.title}
                                    </h2>
                                    <div className="mt-4 leading-7 text-muted-foreground">
                                        {section.body}
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground">
                        Your Privacy is Protected
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        By using Amplypost, you consent to the terms of this Privacy Policy.
                    </p>
                </section>
            </main>

            <footer className="border-t border-border bg-muted/25">
                <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>© 2026 Amplypost. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-foreground">
                            Privacy Policy
                        </Link>
                        <Link href="/tos" className="hover:text-foreground">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
