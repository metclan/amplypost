import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/auth/backend-url";

type RouteContext = {
  params: Promise<{
    auth?: string[];
  }>;
};

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "set-cookie",
  "transfer-encoding",
  "upgrade",
]);

function getBackendAuthUrl(pathSegments: string[], request: NextRequest) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return null;
  }

  const targetUrl = new URL(
    `/api/auth/${pathSegments.join("/")}`,
    backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`,
  );
  targetUrl.search = request.nextUrl.search;

  return targetUrl;
}

async function proxyAuthRequest(request: NextRequest, context: RouteContext) {
  const { auth = [] } = await context.params;
  const targetUrl = getBackendAuthUrl(auth, request);

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
    headers.set("referer", request.nextUrl.origin);
  }

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: "manual",
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

export const GET = proxyAuthRequest;
export const POST = proxyAuthRequest;
export const PUT = proxyAuthRequest;
export const PATCH = proxyAuthRequest;
export const DELETE = proxyAuthRequest;
