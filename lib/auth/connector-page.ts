import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/auth/backend-url";

// Keep OAuth pages on the frontend origin so their /api/auth requests use
// the same cookies and auth proxy as the rest of the application.
export function connectorPage(page: "consent" | "sign-in") {
  return async function GET(request: NextRequest) {
    const target = new URL(`/mcp/${page}`, getBackendUrl());
    // Do not rebuild signed parameters: duplicate ba_param entries matter.
    target.search = request.nextUrl.search;

    try {
      const upstream = await fetch(target, {
        headers: { accept: "text/html", cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
        redirect: "manual",
      });
      const headers = new Headers(upstream.headers);
      // fetch decompresses the body; transport headers no longer describe it.
      for (const name of ["content-encoding", "content-length", "transfer-encoding", "connection"]) {
        headers.delete(name);
      }
      headers.set("cache-control", "no-store");
      headers.set("referrer-policy", "no-referrer");
      return new NextResponse(upstream.body, { status: upstream.status, headers });
    } catch {
      return new NextResponse("Unable to load the connection page. Please restart the connection from your AI client.", {
        status: 502,
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" },
      });
    }
  };
}
