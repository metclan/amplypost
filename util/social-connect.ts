export const connectFacebook = () => {
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_FACEBOOK;
    const configId = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID; // Add this: your config ID 744486014661099

    if (!configId) {
        console.error("Missing FACEBOOK_CONFIG_ID in env");
        return;
    }

    const facebookAuthUrl =
        `https://www.facebook.com/v24.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri || "")}` +
        `&config_id=${configId}` +
        `&response_type=code` +
        `&state=${Math.random().toString(36).substring(7)}` +
        `&override_default_response_type=true`;
    window.location.href = facebookAuthUrl;
};
export const connectInstagramUsingFacebook = () => {
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    const configId = process.env.NEXT_PUBLIC_INSTAGRAM_CONFIG_ID;
    const redirectUri = "https://amplypost.com/connected-accounts/instagram-facebook"

    if (!configId) {
        console.error("Missing INSTAGRAM_CONFIG_ID in env");
        return;
    }

    const facebookAuthUrl =
        `https://www.facebook.com/v24.0/dialog/oauth?` +
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri || "")}` +
        `&config_id=${configId}` +
        `&response_type=code` +
        `&state=${Math.random().toString(36).substring(7)}` +
        `&override_default_response_type=true`;
    window.location.href = facebookAuthUrl;
};
export const connectInstagram = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_INSTAGRAM;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_INSTAGRAM;
    const scope = [
        "instagram_business_basic",
        "instagram_business_content_publish"
    ].join(",");
    const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&force_reauth=true`;
    window.location.href = instagramAuthUrl;
};

export const connectTiktok = () => {
    const scope = [
        'user.info.basic',
        'video.upload',
        'video.publish',
        'user.info.profile'
    ].join(",");
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_TIKTOK;
    const state = Math.random().toString(36).substring(7);
    const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY_TIKTOK;
    const tiktokUrl = `https://www.tiktok.com/v2/auth/authorize?` +
        `client_key=${clientKey}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&redirect_uri=${redirectUri}` +
        `&state=${state}`;
    window.location.href = tiktokUrl;
}

export const connectThread = () => {
    const scope = [
        'threads_basic',
        'threads_content_publish'
    ].join(",");
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_THREADS;
    const clientKey = process.env.NEXT_PUBLIC_CLIENT_ID_THREADS;
    const threadUrl = `https://threads.net/oauth/authorize?` +
        `client_id=${clientKey}` +
        `&redirect_uri=${redirectUri}` +
        `&scope=${scope}` +
        `&response_type=code`;
    window.location.href = threadUrl;
}

export const connectLinkedIn = () => {
    const scope = [
        'openid',
        'profile',
        'w_member_social'
    ].join(',');
    const clientKey = process.env.NEXT_PUBLIC_CLIENT_ID_LINKEDIN;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_LINKEDIN;
    const state = Math.random().toString(36).substring(7);
    const linkedInUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `client_id=${clientKey}` +
        `&response_type=code` +
        `&redirect_uri=${redirectUri}` +
        `&state=${state}` +
        `&scope=${scope}`
    window.location.href = linkedInUrl;
}

export const connectYouTube = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_YOUTUBE;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_YOUTUBE;

    if (!clientId || !redirectUri) {
        console.error("Missing YouTube OAuth env vars");
        return;
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: [
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.readonly",
        ].join(" "),
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
        state: crypto.randomUUID(),
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export const PINTEREST_OAUTH_SCOPES = [
    "user_accounts:read",
    "boards:read",
    "boards:write",
    "pins:read",
    "pins:write",
];

export const buildPinterestOAuthUrl = ({
    clientId,
    redirectUri,
    state,
}: {
    clientId: string;
    redirectUri: string;
    state: string;
}) => {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: PINTEREST_OAUTH_SCOPES.join(","),
        state,
    });

    return `https://www.pinterest.com/oauth/?${params.toString()}`;
};

export const connectPinterest = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_PINTEREST;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_PINTEREST;

    if (!clientId || !redirectUri) {
        console.error("Missing Pinterest OAuth env vars");
        return;
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem("pinterest_oauth_state", state);

    window.location.href = buildPinterestOAuthUrl({ clientId, redirectUri, state });
}

export const connectX = async () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_X;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_X;

    if (!clientId || !redirectUri) {
        console.error("Missing X OAuth env vars");
        return;
    }

    // 1. Generate random code_verifier (43-128 chars, high entropy)
    const codeVerifier = crypto.randomUUID().replace(/-/g, '') +
        crypto.randomUUID().replace(/-/g, ''); // ~64 chars

    // For plain method: challenge = verifier
    const codeChallenge = codeVerifier;

    const state = crypto.randomUUID(); // better than Math.random()

    // Store BOTH for later (token exchange + CSRF check)
    sessionStorage.setItem('x_code_verifier', codeVerifier);
    sessionStorage.setItem('x_oauth_state', state);

    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access']
        .join(' '); // ← spaces, not commas

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'plain',   // change to 'S256' for production
    });

    const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;

    window.location.href = authUrl;
};
