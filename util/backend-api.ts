import { config } from "@/util/config";

export function joinConfiguredUrl(base: string, path: string) {
    const baseUrl = base.endsWith("/") ? base : `${base}/`;
    const normalizedPath = path.replace(/^\/+/, "");

    return `${baseUrl}${normalizedPath}`;
}

export function backendApiUrl(path: string) {
    return joinConfiguredUrl(config.backendUrl, path);
}

export function backendAuthUrl(path: string) {
    return joinConfiguredUrl(config.authUrl, path);
}

export function backendApiUrlWithParams(path: string, params: URLSearchParams) {
    const query = params.toString();

    return query ? `${backendApiUrl(path)}?${query}` : backendApiUrl(path);
}

export function apiFetch(path: string, init: RequestInit = {}) {
    return fetch(backendApiUrl(path), {
        ...init,
        credentials: "include",
    });
}

export function authFetch(path: string, init: RequestInit = {}) {
    return fetch(backendAuthUrl(path), {
        ...init,
        credentials: "include",
    });
}
