import { config } from "@/util/config";

function joinConfiguredUrl(base: string, path: string) {
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
