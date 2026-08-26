const rawBackendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? "";

export const config = {
    authUrl : rawBackendUrl ? new URL("/api/", rawBackendUrl).toString()
        : "/api/",
    backendUrl: rawBackendUrl
        ? new URL("/api/v1/", rawBackendUrl).toString()
        : "/api/v1/",
};
