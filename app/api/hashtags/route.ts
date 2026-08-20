import { NextRequest, NextResponse } from "next/server";
import { proxyBackendApiRequest, proxyBackendApiRoute } from "@/lib/backend/api-proxy";

interface Hashtag {
    title?: string | null;
    hashtag?: string | null;
    platformId?: string | null;
}

type HashtagsResponse = Hashtag[] | {
    data?: Hashtag[];
    message?: string;
};

function matchesSearch(hashtag: Hashtag, search: string) {
    return [
        hashtag.title,
        hashtag.hashtag,
        hashtag.platformId,
    ].some((value) => value?.toLowerCase().includes(search));
}

export async function GET(request: NextRequest) {
    const response = await proxyBackendApiRequest(request, "hashtags");
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

    if (!search || !response.ok) {
        return response;
    }

    const payload = (await response.json().catch(() => null)) as HashtagsResponse | null;

    if (Array.isArray(payload)) {
        return NextResponse.json(payload.filter((item) => matchesSearch(item, search)), {
            status: response.status,
        });
    }

    return NextResponse.json({
        ...payload,
        data: (payload?.data ?? []).filter((item) => matchesSearch(item, search)),
    }, {
        status: response.status,
    });
}

export const POST = proxyBackendApiRoute("hashtags");
