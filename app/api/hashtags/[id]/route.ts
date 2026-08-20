import { NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function proxyHashtagRequest(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    return proxyBackendApiRequest(request, `hashtags/${id}`);
}

export const PUT = proxyHashtagRequest;
export const GET = proxyHashtagRequest;
export const PATCH = proxyHashtagRequest;
export const DELETE = proxyHashtagRequest;
