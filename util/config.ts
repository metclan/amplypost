const rawBackendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? "";

export const config = {
    backendUrl: rawBackendUrl
        ? new URL("/api/v1/", rawBackendUrl).toString()
        : "/api/v1/",
};
