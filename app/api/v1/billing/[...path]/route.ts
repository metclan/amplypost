import { type NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        path?: string[];
    }>;
};

async function proxyBillingRequest(request: NextRequest, context: RouteContext) {
    const { path = [] } = await context.params;

    return proxyBackendApiRequest(request, `billing/${path.join("/")}`);
}

export const GET = proxyBillingRequest;
export const POST = proxyBillingRequest;
