import type { Metadata } from "next";
import Link from "next/link";

const chatgptTools = [
    {
        name: "get_current_user",
        input: "Your authorized Amplypost connection; no additional input fields.",
        output: "Your Amplypost user ID, organization ID and timezone, to identify the account used for the request.",
    },
    {
        name: "list_connected_accounts",
        input: "Your authorized Amplypost connection; no additional input fields.",
        output: "Connected account IDs, platforms, names, usernames, profile pictures, permission scopes, platform settings, connection status, token expiry information and record dates, to select publishing destinations. Social platform token values are not returned.",
    },
    {
        name: "list_hashtags",
        input: "An optional platform filter.",
        output: "Saved hashtag IDs, titles, hashtag text, platforms and record dates, to reuse your saved hashtags.",
    },
    {
        name: "list_posts",
        input: "Pagination and optional status, platform, post type, account, group and creation-date filters.",
        output: "Post and group IDs, platforms, post types, story flags, statuses, schedules, timezones, publication and record dates, plus pagination, to find posts and check progress.",
    },
    {
        name: "get_post",
        input: "The Amplypost post ID you want to retrieve.",
        output: "Post content, caption, media URLs and metadata, destination account ID, account name and profile picture, published URL, schedule, timezone, status, publishing attempts, errors and record dates, to inspect the post and its outcome.",
    },
    {
        name: "upload_media",
        input: "The selected image or video attachment, its download URL and file ID, and optional filename and media type. Amplypost downloads and stores the file for publishing.",
        output: "A public media URL, media and file types, file size, dimensions and video duration when applicable, to preview the file and attach it to a post.",
    },
    {
        name: "create_post",
        input: "Selected account IDs and platforms, captions, media URLs and metadata, story options, platform-specific publishing settings, and an optional scheduled date and timezone. Platform settings can include titles, descriptions, tags, links, alternative text, audience and interaction choices.",
        output: "A queue acknowledgement, group and post IDs, stored post content and media references, destination accounts, schedules, statuses and publishing records. These results confirm queuing; publication happens separately.",
    },
];

export const metadata: Metadata = {
    title: "Privacy Policy",
    alternates: { canonical: "https://www.amplypost.com/privacy" },
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
        id: "chatgpt",
        title: "ChatGPT and Connected AI Clients",
        body: (
            <div className="space-y-6">
                <p>
                    This policy covers the Amplypost plugin in ChatGPT and other AI clients
                    connected to Amplypost. When you authorize a connection, Amplypost associates
                    it with your account and stores authorization and permission records.
                    Read permission allows the client to retrieve account information, connected
                    accounts, posts and saved hashtags. Publish permission allows media uploads
                    and immediate or scheduled publishing. Optional offline access lets the
                    client renew access without asking you to sign in each time.
                </p>
                <p>
                    Amplypost receives the arguments and selected attachments sent with a tool
                    request, together with authorization information. The tools do not request
                    your full ChatGPT conversation history. Tool results are sent back to OpenAI
                    or the AI client you connected so it can answer your request. If you grant
                    the optional identity and email permissions, identity responses can also
                    include your email address and email verification status.
                </p>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Data used by each tool</h3>
                    {chatgptTools.map((tool) => (
                        <div key={tool.name} className="rounded-xl border border-border p-4">
                            <h4 className="break-words font-mono text-sm font-semibold text-foreground">{tool.name}</h4>
                            <p className="mt-2"><strong>Received:</strong> {tool.input}</p>
                            <p className="mt-2"><strong>Returned and why:</strong> {tool.output}</p>
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <h3 className="font-semibold text-foreground">Uploaded media is accessible by public link</h3>
                    <p className="mt-2">
                        Uploading an attachment copies it to Amplypost media storage. Anyone
                        with the resulting URL can access the file, even before a post is
                        published. Publishing sends your selected content and settings to the
                        destination social platforms. Avoid uploading files that must remain private.
                    </p>
                </div>
                <p>
                    Sign in and connect social accounts through Amplypost&apos;s authorization
                    pages. Do not put passwords, sign-in codes, API keys or payment card details
                    into tool inputs. The tools do not need these details to create posts.
                </p>
            </div>
        ),
    },
    {
        title: "Information We Collect",
        body: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Account and service data</h3>
                    <p className="mt-3 text-muted-foreground">
                        We collect the following personal information from you:
                    </p>
                    <ul className="mt-4 space-y-3 text-muted-foreground">
                        {[
                            ["Name", "We collect your name to personalize your experience and communicate with you effectively."],
                            ["Email", "We collect your email address to send you important information regarding your account, updates, and communication."],
                            ["Account and workspace information", "User and organization IDs, workspace membership, timezone, sign-in and verification records help us authenticate you and keep your organization's content accessible to authorized users."],
                            ["Billing information", "Subscription status, payment references and transaction records help us manage your plan and billing. Payment checkout is handled by our payment provider."],
                            ["Connected social accounts", "We store platform account IDs, names, usernames, profile pictures, permissions, connection settings and authorization tokens to access the accounts you connect and publish your posts."],
                            ["Content and publishing records", "We process captions, saved hashtags, images, videos, media URLs and metadata, destination accounts, platform settings, schedules, timezones, publishing results and errors to prepare, schedule and manage posts."],
                            ["Social media analytics", "We retrieve account and post performance data from supported connected platforms to display analytics in your dashboard."],
                            ["Support messages", "We use information you send to support to investigate issues and respond to your requests."],
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
                    <h3 className="text-lg font-semibold text-foreground">Website, session and device data</h3>
                    <p className="mt-3 text-muted-foreground">
                        Session records may include your IP address and browser information.
                        Cookies and browser storage support sign-in and preferences. Our website
                        also uses DataFast, Google Analytics when configured, and the TikTok
                        Pixel for page-view measurement, usage analysis and marketing measurement.
                        These services may receive IP addresses, browser and device information,
                        page URLs, referrers, cookie identifiers and visit events. This information
                        can be personal data. Browser settings can block cookies and tracking
                        requests; blocking essential cookies can prevent sign-in.
                    </p>
                </div>
            </div>
        ),
    },
    {
        title: "Purpose of Data Collection",
        body: (
            <p>
                We use the information described above to authenticate users, enforce account
                permissions, manage subscriptions, store and publish content, show publishing
                status and analytics, provide support, troubleshoot failures and protect the
                service. Website measurement helps us understand usage and marketing performance.
                When you use AI text generation in the website, we send your prompt, post type
                and any existing caption you supply to Google Gemini to generate or improve text.
                The generated text is returned to you and becomes post content if you use it.
            </p>
        ),
    },
    {
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
        title: "Google Privacy Policy",
        body: (
            <p>
                As we use YouTube API Services, your data may also be subject to Google&apos;s
                Privacy Policy. For more information on how Google collects and processes data,
                please refer to the{" "}
                <a
                    href="https://www.google.com/policies/privacy"
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
        title: "Data Sharing",
        body: (
            <div className="space-y-4">
                <p>Data is disclosed to the following recipients for the features you use:</p>
                <ul className="list-disc space-y-3 pl-5">
                    <li><strong>Connected platforms:</strong> the social networks you select receive content, media and publishing settings to publish and manage posts. Canva processes design browsing and export requests when connected.</li>
                    <li><strong>OpenAI or another connected AI client:</strong> receives the tool results described in the ChatGPT section below when you use the integration.</li>
                    <li><strong>Storage and infrastructure providers:</strong> process application records and requests to host and operate Amplypost. Cloudflare R2 stores uploaded media.</li>
                    <li><strong>Billing and email providers:</strong> Dodo Payments processes subscription checkout and billing; Amazon Simple Email Service processes recipient addresses and message content for account and service emails.</li>
                    <li><strong>AI and website measurement providers:</strong> Google Gemini processes requested text generation; DataFast, Google Analytics and TikTok receive the website measurement data described above.</li>
                    <li><strong>People with access:</strong> authorized members of your Amplypost organization can access shared workspace content. Published posts are visible to their platform audience. Anyone with a public media URL can access that file.</li>
                </ul>
                <p>Recipients operating their own services, including OpenAI and social platforms, handle their copies under their own policies and account settings.</p>
            </div>
        ),
    },
    {
        title: "Children's Privacy",
        body: <p>Amplypost is not intended for children, and we do not collect any data from children.</p>,
    },
    {
        title: "Updates to the Privacy Policy",
        body: <p>We may update this Privacy Policy from time to time. Users will be notified of any changes via email.</p>,
    },
    {
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

    {
        id: "canva-data",
        title: "Canva Integration and Customer Data",
        body: (
            <div className="space-y-6">
                <p>
                    When you connect Canva, Amplypost uses the permissions you grant to display
                    your available designs and, where authorized, your Canva display name.
                    Design information may include design IDs, titles, thumbnails, page counts,
                    editor links, and supported export formats. When you choose to add a design,
                    we export the selected pages in your chosen format and import the resulting
                    images or videos for use in your Amplypost posts.
                </p>
                <div id="canva-data-retention" className="scroll-mt-24 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Data retention policy</h3>
                    <p>
                        We retain your Canva connection details and encrypted authorization
                        tokens while your account remains connected, so you can browse and
                        import designs without reconnecting each time. We store export records,
                        including design IDs, formats, and references to imported media, to
                        process your selections and avoid duplicate imports when you retry.
                    </p>
                    <p>
                        Imported images and videos are stored separately from your Canva
                        connection for use in drafts, scheduled posts, and published content.
                        Disconnecting Canva does not automatically remove these files or
                        content you have already added to Amplypost.
                    </p>
                </div>
                <div id="canva-data-removal" className="scroll-mt-24 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Data archival and removal policy</h3>
                    <p>
                        You can disconnect Canva from your connected accounts in Amplypost.
                        On successful disconnection, we remove the stored Canva connection,
                        access and refresh tokens, and associated export records. This ends
                        Amplypost&apos;s access through that connection. Removing an Amplypost
                        user account also removes its associated Canva connection and export
                        records from our database.
                    </p>
                    <p>
                        To request removal of imported Canva media or other customer data,
                        contact <a href="mailto:support@amplypost.com" className="font-medium text-primary underline-offset-4 hover:underline">support@amplypost.com</a>.
                        We verify requests before processing them to protect your account.
                        Please identify whether you want to remove your Canva connection,
                        imported files, or your Amplypost account. Any data that must be
                        retained for legal or security reasons is subject to those obligations.
                    </p>
                    <p>
                        Disconnecting Canva or removing data from Amplypost does not delete
                        your original Canva designs or posts already published to social media.
                        Those copies must be managed on the relevant platform. Copies cached
                        or downloaded outside Amplypost may remain available independently.
                    </p>
                </div>
                <div id="canva-data-storage" className="scroll-mt-24 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Data storage policy</h3>
                    <p>
                        Canva connection and export records are stored in our server-side
                        database and associated with your Amplypost account. Canva access and
                        refresh tokens are encrypted using AES-256-GCM before database storage.
                        The encryption key is supplied through server configuration separately
                        from the stored token values. Canva API requests and export downloads
                        use HTTPS, and integration requests require an authenticated Amplypost
                        session.
                    </p>
                    <p>
                        Imported images and videos are stored in Cloudflare R2 object storage
                        and served through Amplypost&apos;s media URLs for previews and publishing.
                        These media URLs are accessible to anyone who has the link. Files may
                        also be held temporarily on our server while an import is processed;
                        unsuccessful imports can leave temporary files pending cleanup.
                        Canva tokens are handled by the backend and are not returned to the
                        asset picker.
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: "retention",
        title: "How Long Data Is Kept",
        body: (
            <div className="space-y-4">
                <ul className="list-disc space-y-3 pl-5">
                    <li><strong>Account and content records:</strong> account, workspace, connected-account, post and saved-hashtag records are retained to operate your account and provide publishing history. Successful account deletion removes these records from the active database, together with authentication sessions, plugin authorizations and account billing records.</li>
                    <li><strong>Plugin access:</strong> an issued access token expires after 15 minutes. Refresh access and consent records support continued use while authorized. Token expiry ends that token&apos;s use; it does not delete posts, media or other account data. Revoking refresh access does not immediately invalidate an already issued access token, which can remain valid until expiry.</li>
                    <li><strong>Uploaded media:</strong> files are stored separately from database records and do not automatically expire through the upload feature. Disconnecting ChatGPT, deleting a post or deleting your account does not automatically remove the stored file. Contact support with the media URLs to request removal. Plugin media responses allow caching for up to one year; cached or downloaded copies can remain after removal from storage.</li>
                    <li><strong>Temporary plugin uploads:</strong> the upload process removes its temporary server files when processing finishes or fails. The uploaded copy in media storage remains as described above.</li>
                    <li><strong>Google and Canva data:</strong> the integration-specific retention and removal rules in this policy also apply.</li>
                </ul>
                <p>
                    Deletion from Amplypost does not remove copies already sent to OpenAI,
                    other AI clients, payment providers or social platforms. Their retention
                    policies and controls apply to those copies. Disconnecting a client does
                    not cancel posts already queued in Amplypost.
                </p>
            </div>
        ),
    },
    {
        id: "your-controls",
        title: "Your Choices and Data Requests",
        body: (
            <div className="space-y-4">
                <ul className="list-disc space-y-3 pl-5">
                    <li><strong>Choose what to send:</strong> select only the content, attachments and destination accounts needed for your request. Review the permissions on the authorization screen before connecting an AI client.</li>
                    <li><strong>Disconnect integrations:</strong> remove the Amplypost connection in your AI client and disconnect social platforms in Amplypost&apos;s <Link href="/connected-accounts" className="text-primary underline">Connected accounts</Link>. You can also revoke authorization through the relevant platform. For help revoking plugin access, contact support.</li>
                    <li><strong>Manage your account:</strong> update your name in <Link href="/settings" className="text-primary underline">Settings</Link>. The organization owner can use Delete account there to remove the organization and its users, workspaces and database records. This affects everyone in the organization. Deletion may require a retry if publication is in progress or subscription cancellation fails.</li>
                    <li><strong>Request access, correction or removal:</strong> email <a href="mailto:support@amplypost.com" className="text-primary underline">support@amplypost.com</a> from your account email. Identify the account and the records or media URLs involved. We verify requests to protect account data. Organization members who cannot delete the organization can contact support about their own information.</li>
                    <li><strong>Control website tracking:</strong> use your browser&apos;s cookie and tracking controls. These controls apply to the website; disconnecting the ChatGPT plugin does not change website cookies.</li>
                    <li><strong>Manage copies elsewhere:</strong> use the relevant AI client or social platform&apos;s controls for its chat history, published posts and stored copies.</li>
                </ul>
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
                        Last Updated: October 2, 2026
                    </p>
                </div>

                <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <p className="text-lg leading-8 text-muted-foreground">
                        Thank you for using{" "}
                        <span className="font-semibold text-foreground">Amplypost</span>{" "}
                        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy
                        outlines how we collect, use, share and retain your personal
                        information when you use our website located at{" "}
                        <a
                            href="https://amplypost.com"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            https://amplypost.com
                        </a>{" "}
                        (the &quot;Website&quot;), our connected services, and the Amplypost
                        plugin in ChatGPT or another connected AI client.
                    </p>
                    <p className="mt-4 leading-7 text-muted-foreground">
                        Read about <a href="#chatgpt" className="text-primary underline">ChatGPT tool data</a>,{" "}
                        <a href="#retention" className="text-primary underline">data retention</a> and{" "}
                        <a href="#your-controls" className="text-primary underline">your controls</a> below.
                    </p>
                </section>

                <div className="mt-10 space-y-5">
                    {sections.map((section, index) => (
                        <section
                            key={section.title}
                            id={section.id}
                            className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
                        >
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                                    {index + 1}
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
                        Questions About Your Data?
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Contact <a href="mailto:support@amplypost.com" className="text-primary underline">support@amplypost.com</a> for privacy questions and data requests.
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
