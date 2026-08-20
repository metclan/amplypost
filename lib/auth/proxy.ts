import { NextResponse, type NextRequest } from "next/server";
import { getBackendSession } from "./session";

const PUBLIC_ROUTES = new Set([
  "/",
  "/ng",
  "/tos",
  "/privacy",
  "/refund",
  "/login",
  "/create-account",
  "/api/tools/tiktok-downloader",
  "/tools",
  "/tools/tiktok-downloader",
  "/api/tools/instagram-downloader",
  "/tools/instagram-downloader",
  "/api/tools/download-proxy",
  "/api/proxy-image",
  "/api/plans",
  "/api/tools/youtube-downloader",
  "/tools/youtube-downloader",
  "/offer",
]);

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    PUBLIC_ROUTES.has(path) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/auth")
  ) {
    return NextResponse.next();
  }

  const session = await getBackendSession(request);
  const isApiRoute = path.startsWith("/api/");

  if (!session?.user?.id && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
