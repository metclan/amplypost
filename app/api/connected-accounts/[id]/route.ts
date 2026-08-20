import { NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function proxyAccountRequest(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    return proxyBackendApiRequest(request, `accounts/${id}`);
}

export const GET = proxyAccountRequest;
export const DELETE = proxyAccountRequest;
