"use client";

import { parseApiErrorResponse } from "@/lib/client-errors";
import { backendApiUrl } from "@/util/backend-api";

export const WORKSPACES_CACHE_KEY = "workspaces";
export const SELECTED_WORKSPACE_STORAGE_KEY = "amplypost:selected-workspace-id";

export type WorkspacePayload = {
    name: string;
    userIds?: string[];
    socialMediaAccountIds: string[];
    isActive?: boolean;
};

export type WorkspaceMember = {
    id: string;
    userId: string;
    createdAt?: string;
    user?: {
        id: string;
        name: string | null;
        email: string | null;
        image?: string | null;
        timezone?: string | null;
        isActive?: boolean;
    };
};

export type WorkspaceSocialMediaAccount = {
    id: string;
    socialMediaAccountId: string;
    createdAt?: string;
    socialMediaAccount?: {
        id: string;
        provider: string;
        accountId: string;
        accountName: string;
        accountUsername: string | null;
        profilePicture: string | null;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
    };
};

export type Workspace = {
    id: string;
    organizationId?: string;
    createdById?: string;
    name: string;
    userIds: string[];
    socialMediaAccountIds: string[];
    users: WorkspaceMember[];
    socialMediaAccounts: WorkspaceSocialMediaAccount[];
    isActive: boolean;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type WorkspaceResponse = {
    data?: Workspace[] | Workspace;
    workspaces?: Workspace[];
    workspace?: Workspace;
    message?: string;
};

type RawWorkspace = Partial<Workspace> & {
    social_media_account_ids?: unknown;
    user_ids?: unknown;
    is_active?: unknown;
    is_default?: unknown;
    users?: unknown;
    socialMediaAccounts?: unknown;
    social_media_accounts?: unknown;
};

function getStringArray(value: unknown) {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getString(value: unknown) {
    return typeof value === "string" ? value : "";
}

function getBoolean(value: unknown, fallback = false) {
    return typeof value === "boolean" ? value : fallback;
}

function normalizeWorkspaceMembers(value: unknown) {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => item as Partial<WorkspaceMember>)
        .filter((member): member is WorkspaceMember => Boolean(member?.id && member?.userId));
}

function normalizeWorkspaceSocialAccounts(value: unknown) {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => item as Partial<WorkspaceSocialMediaAccount>)
        .filter((account): account is WorkspaceSocialMediaAccount => Boolean(account?.id && account?.socialMediaAccountId));
}

function normalizeWorkspace(workspace: Workspace): Workspace {
    const rawWorkspace = workspace as RawWorkspace;
    const users = normalizeWorkspaceMembers(rawWorkspace.users);
    const socialMediaAccounts = normalizeWorkspaceSocialAccounts(
        rawWorkspace.socialMediaAccounts ?? rawWorkspace.social_media_accounts,
    );
    const userIds = getStringArray(rawWorkspace.userIds ?? rawWorkspace.user_ids);
    const socialMediaAccountIds = getStringArray(rawWorkspace.socialMediaAccountIds ?? rawWorkspace.social_media_account_ids);

    return {
        ...workspace,
        id: getString(rawWorkspace.id),
        name: getString(rawWorkspace.name),
        users,
        socialMediaAccounts,
        userIds: userIds.length > 0 ? userIds : users.map((member) => member.userId),
        socialMediaAccountIds: socialMediaAccountIds.length > 0
            ? socialMediaAccountIds
            : socialMediaAccounts.map((account) => account.socialMediaAccountId),
        isActive: getBoolean(rawWorkspace.isActive ?? rawWorkspace.is_active, true),
        isDefault: getBoolean(rawWorkspace.isDefault ?? rawWorkspace.is_default),
    };
}

function extractWorkspaces(payload: WorkspaceResponse | Workspace[] | null) {
    if (Array.isArray(payload)) return payload.map(normalizeWorkspace);
    if (Array.isArray(payload?.data)) return payload.data.map(normalizeWorkspace);
    if (Array.isArray(payload?.workspaces)) return payload.workspaces.map(normalizeWorkspace);
    if (payload?.workspace) return [normalizeWorkspace(payload.workspace)];
    if (payload?.data && !Array.isArray(payload.data)) return [normalizeWorkspace(payload.data)];
    return [];
}

function extractWorkspace(payload: WorkspaceResponse | Workspace | null) {
    if (!payload) return null;
    if ("id" in payload) return normalizeWorkspace(payload);
    if (payload.workspace) return normalizeWorkspace(payload.workspace);
    if (payload.data && !Array.isArray(payload.data)) return normalizeWorkspace(payload.data);
    return null;
}

export async function fetchWorkspaces() {
    const response = await fetch(backendApiUrl("workspaces"), {
        credentials: "include",
    });

    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to fetch workspaces.");
    }

    const payload = (await response.json().catch(() => null)) as WorkspaceResponse | Workspace[] | null;
    return extractWorkspaces(payload);
}

export async function fetchWorkspace(id: string) {
    const response = await fetch(backendApiUrl(`workspaces/${id}`), {
        credentials: "include",
    });

    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to fetch workspace.");
    }

    const payload = (await response.json().catch(() => null)) as WorkspaceResponse | Workspace | null;
    return extractWorkspace(payload);
}

export async function createWorkspace(payload: WorkspacePayload) {
    const response = await fetch(backendApiUrl("workspaces"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to create workspace.");
    }

    const data = (await response.json().catch(() => null)) as WorkspaceResponse | Workspace | null;
    return extractWorkspace(data);
}

export async function updateWorkspace(id: string, payload: Partial<WorkspacePayload>) {
    const response = await fetch(backendApiUrl(`workspaces/${id}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to update workspace.");
    }

    const data = (await response.json().catch(() => null)) as WorkspaceResponse | Workspace | null;
    return extractWorkspace(data);
}

export async function deleteWorkspace(id: string) {
    const response = await fetch(backendApiUrl(`workspaces/${id}`), {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        await parseApiErrorResponse(response, "Failed to delete workspace.");
    }
}

export function accountBelongsToWorkspace(accountId: string, workspace: Workspace | null) {
    if (!workspace) return true;
    if (workspace.isDefault) return true;
    return getStringArray(workspace.socialMediaAccountIds).includes(accountId);
}
