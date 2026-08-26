import { NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    return proxyBackendApiRequest(request, `workspaces/${id}`);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    return proxyBackendApiRequest(request, `workspaces/${id}`);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    return proxyBackendApiRequest(request, `workspaces/${id}`);
}
