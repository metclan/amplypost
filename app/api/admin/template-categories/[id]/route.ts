import { NextRequest } from "next/server";
import { proxyBackendApiRequest } from "@/lib/backend/api-proxy";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function proxyCategoryRequest(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    return proxyBackendApiRequest(request, `admin/template-categories/${id}`);
}

export const GET = proxyCategoryRequest;
export const PUT = proxyCategoryRequest;
export const PATCH = proxyCategoryRequest;
export const DELETE = proxyCategoryRequest;
