import { NextRequest, NextResponse } from "next/server";

import { config } from "@/util/config";

export async function GET(request: NextRequest) {
  const response = await fetch(`${config.backendUrl}accounts`, {
    headers: {
      accept: "application/json",
      cookie: request.headers.get("cookie") ?? "",
      origin: request.nextUrl.origin,
      referer: request.nextUrl.href,
    },
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
