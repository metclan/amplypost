export interface Hashtag {
    id: string;
    title: string;
    hashtag: string;
    platformId: string;
}

interface BackendHashtag {
    id: string;
    title: string;
    hashtag: string;
    platformId?: string;
}

type HashtagsResponse = BackendHashtag[] | {
    data?: BackendHashtag[];
    message?: string;
};

export type HashtagInput = Pick<Hashtag, "title" | "hashtag"> & {
    platformId?: string | null;
};

function normalizeHashtag(item: BackendHashtag): Hashtag {
    return {
        id: item.id,
        title: item.title,
        hashtag: item.hashtag,
        platformId: item.platformId ?? "",
    };
}

function resolveHashtags(data: HashtagsResponse | null): Hashtag[] {
    if (Array.isArray(data)) {
        return data.map(normalizeHashtag);
    }

    return (data?.data ?? []).map(normalizeHashtag);
}

export async function fetchHashtagGroups(options: { platformId?: string; search?: string } = {}): Promise<Hashtag[]> {
    const params = new URLSearchParams();

    if (options.platformId) {
        params.set("platformId", options.platformId);
    }

    if (options.search?.trim()) {
        params.set("search", options.search.trim());
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`/api/hashtags${query}`, {
        credentials: "include",
        cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as HashtagsResponse | null;

    if (!response.ok) {
        throw new Error(Array.isArray(data) ? "Failed to fetch hashtags." : data?.message || "Failed to fetch hashtags.");
    }

    return resolveHashtags(data);
}

export async function createHashtagGroup(input: HashtagInput) {
    const response = await fetch("/api/hashtags", {
        method: "POST",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Failed to create hashtag group.");
    }
}

export async function updateHashtagGroup(id: string, input: HashtagInput) {
    const response = await fetch(`/api/hashtags/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Failed to update hashtag group.");
    }
}

export async function deleteHashtagGroup(id: string) {
    const response = await fetch(`/api/hashtags/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Failed to delete hashtag group.");
    }
}
