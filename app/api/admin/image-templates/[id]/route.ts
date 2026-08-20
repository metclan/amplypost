import { NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function proxyTemplateRequest(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    return proxyBackendApiRequest(request, `admin/image-templates/${id}`);
}

export const GET = proxyTemplateRequest;
export const PUT = proxyTemplateRequest;
export const PATCH = proxyTemplateRequest;
export const DELETE = proxyTemplateRequest;
