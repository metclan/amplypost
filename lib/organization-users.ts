"use client";

import { parseApiErrorResponse } from "@/lib/client-errors";
import { apiFetch } from "@/util/backend-api";

export const ORGANIZATION_USERS_CACHE_KEY = "organization-users";

export type OrganizationUser = {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
    timezone: string | null;
    createdAt?: string;
    updatedAt?: string;
    isActive: boolean;
};

type RawOrganizationUser = {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    image?: unknown;
    timezone?: unknown;
    createdAt?: string;
    updatedAt?: string;
    isActive?: unknown;
    is_active?: unknown;
};

type UsersResponse = {
    data?: RawOrganizationUser[];
    users?: RawOrganizationUser[];
    message?: string;
};

function getString(value: unknown) {
    return typeof value === "string" ? value : "";
}

function normalizeUser(user: RawOrganizationUser): OrganizationUser | null {
    const id = getString(user.id);
    if (!id) return null;

    const email = getString(user.email);
    const name = getString(user.name) || email || id;
    const image = getString(user.image);
    const timezone = getString(user.timezone);
    const isActive = typeof user.isActive === "boolean"
        ? user.isActive
        : typeof user.is_active === "boolean"
            ? user.is_active
            : true;

    return {
        id,
        name,
        email: email || null,
        image: image || null,
        timezone: timezone || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive,
    };
}

function extractUsers(payload: UsersResponse | RawOrganizationUser[] | null) {
    const users = Array.isArray(payload) ? payload : payload?.data ?? payload?.users ?? [];
    return users.map(normalizeUser).filter((user): user is OrganizationUser => Boolean(user));
}

export async function fetchOrganizationUsers() {
    const response = await apiFetch("users");

    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to fetch organization users.");
    }

    const payload = (await response.json().catch(() => null)) as UsersResponse | RawOrganizationUser[] | null;
    return extractUsers(payload);
}
