import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/auth/backend-url";

const HOP_BY_HOP_HEADERS = new Set([
    "connection",
    "content-encoding",
    "content-length",
    "keep-alive",
    "set-cookie",
    "transfer-encoding",
    "upgrade",
]);

function getBackendApiUrl(path: string, request: NextRequest) {
    const backendUrl = getBackendUrl();

    if (!backendUrl) {
        return null;
    }

    const targetUrl = new URL(
        `/api/v1/${path.replace(/^\/+/, "")}`,
        backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`,
    );
    targetUrl.search = request.nextUrl.search;

    return targetUrl;
}

export async function proxyBackendApiRequest(request: NextRequest, path: string) {
    const targetUrl = getBackendApiUrl(path, request);

    if (!targetUrl) {
        return NextResponse.json(
            { message: "NEXT_PUBLIC_BACKEND_URL is not configured." },
            { status: 500 },
        );
    }

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        const normalizedKey = key.toLowerCase();

        if (!HOP_BY_HOP_HEADERS.has(normalizedKey) && normalizedKey !== "host") {
            headers.set(key, value);
        }
    });
    headers.set("origin", request.nextUrl.origin);

    if (!headers.has("referer")) {
        headers.set("referer", request.nextUrl.href);
    }

    const backendResponse = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
            ? undefined
            : await request.arrayBuffer(),
        redirect: "manual",
        cache: "no-store",
    });

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
        if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            responseHeaders.set(key, value);
        }
    });

    const response = new NextResponse(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
    });

    const setCookieHeaders =
        (
            backendResponse.headers as Headers & {
                getSetCookie?: () => string[];
            }
        ).getSetCookie?.() ?? [];
    const fallbackSetCookie = backendResponse.headers.get("set-cookie");

    for (const cookie of setCookieHeaders.length
        ? setCookieHeaders
        : fallbackSetCookie
            ? [fallbackSetCookie]
            : []) {
        response.headers.append("set-cookie", cookie);
    }

    return response;
}

export function proxyBackendApiRoute(path: string) {
    return (request: NextRequest) => proxyBackendApiRequest(request, path);
}
