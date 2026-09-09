const API_ORIGIN = (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://api.amplypost.com"
).replace(/\/+$/, "");

export const config = {
    apiOrigin: API_ORIGIN,
    authUrl: `${API_ORIGIN}/api/`,
    backendUrl: `${API_ORIGIN}/api/v1/`,
};
