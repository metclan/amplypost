import { NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        reference: string;
    }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
    const { reference } = await context.params;
    return proxyBackendApiRequest(request, `payments/payment-status/${reference}`);
}
