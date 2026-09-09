import { NextRequest } from "next/server";
import { getBackendUrl } from "./backend-url";

export type BetterAuthSession = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  session?: {
    id?: string;
    userId?: string;
    expiresAt?: string;
  };
} | null;

export async function getBackendSession(request: NextRequest) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return null;
  }

  try {
    const response = await fetch(new URL("/api/auth/get-session", backendUrl), {
      headers: {
        accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
        origin: request.nextUrl.origin,
        referer: request.nextUrl.href,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as BetterAuthSession;
  } catch (error) {
    console.error("Failed to get Better Auth session", error);
    return null;
  }
}
