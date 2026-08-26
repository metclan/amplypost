"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import { CACHE_TTL } from "@/lib/client-data";
import { useCachedResource } from "@/lib/client-cache";
import {
    SELECTED_WORKSPACE_STORAGE_KEY,
    WORKSPACES_CACHE_KEY,
    fetchWorkspaces,
    type Workspace,
} from "@/lib/workspaces";

type WorkspaceContextValue = {
    workspaces: Workspace[];
    selectedWorkspace: Workspace | null;
    selectedWorkspaceId: string | null;
    isLoadingWorkspaces: boolean;
    workspaceError: Error | undefined;
    selectWorkspace: (workspaceId: string | null) => void;
    refreshWorkspaces: () => Promise<Workspace[]>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const storedWorkspaceListeners = new Set<() => void>();

function readStoredWorkspaceId() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY);
}

function subscribeStoredWorkspaceId(listener: () => void) {
    storedWorkspaceListeners.add(listener);

    const handleStorage = (event: StorageEvent) => {
        if (event.key === SELECTED_WORKSPACE_STORAGE_KEY) {
            listener();
        }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
        storedWorkspaceListeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
    };
}

function getServerStoredWorkspaceId() {
    return null;
}

function notifyStoredWorkspaceListeners() {
    storedWorkspaceListeners.forEach((listener) => listener());
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const storedWorkspaceId = useSyncExternalStore(
        subscribeStoredWorkspaceId,
        readStoredWorkspaceId,
        getServerStoredWorkspaceId,
    );
    const {
        data: workspaces = [],
        error: workspaceError,
        isLoading: isLoadingWorkspaces,
        refetch: refreshWorkspaces,
    } = useCachedResource(WORKSPACES_CACHE_KEY, fetchWorkspaces, { ttl: CACHE_TTL });

    const selectedWorkspaceId = useMemo(() => {
        if (workspaces.length === 0) return storedWorkspaceId;
        if (storedWorkspaceId && workspaces.some((workspace) => workspace.id === storedWorkspaceId)) {
            return storedWorkspaceId;
        }

        return (workspaces.find((workspace) => workspace.isDefault) ?? workspaces[0])?.id ?? null;
    }, [storedWorkspaceId, workspaces]);

    const selectedWorkspace = useMemo(
        () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null,
        [selectedWorkspaceId, workspaces],
    );

    const selectWorkspace = useCallback((workspaceId: string | null) => {
        if (workspaceId) {
            window.localStorage.setItem(SELECTED_WORKSPACE_STORAGE_KEY, workspaceId);
        } else {
            window.localStorage.removeItem(SELECTED_WORKSPACE_STORAGE_KEY);
        }

        notifyStoredWorkspaceListeners();
    }, []);

    const value = useMemo(
        () => ({
            workspaces,
            selectedWorkspace,
            selectedWorkspaceId,
            isLoadingWorkspaces,
            workspaceError,
            selectWorkspace,
            refreshWorkspaces,
        }),
        [
            workspaces,
            selectedWorkspace,
            selectedWorkspaceId,
            isLoadingWorkspaces,
            workspaceError,
            selectWorkspace,
            refreshWorkspaces,
        ],
    );

    return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
    const value = useContext(WorkspaceContext);

    if (!value) {
        throw new Error("useWorkspace must be used inside WorkspaceProvider.");
    }

    return value;
}
