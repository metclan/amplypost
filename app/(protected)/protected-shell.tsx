"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import ProtectedSidebar from "../components/protected-sidebar";
import { prefetchProtectedData } from "@/lib/client-data";
import { WorkspaceProvider } from "../components/workspace-provider";
import { authFetch } from "@/util/backend-api";

type SessionErrorPayload = {
    code?: string;
    error?: string;
    action?: string;
    email?: string;
};

const SIDEBAR_COLLAPSED_STORAGE_KEY = "amplypost:sidebar-collapsed";
const sidebarCollapseListeners = new Set<() => void>();

function readStoredSidebarCollapsed() {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
}

function subscribeSidebarCollapsed(listener: () => void) {
    sidebarCollapseListeners.add(listener);

    const handleStorage = (event: StorageEvent) => {
        if (event.key === SIDEBAR_COLLAPSED_STORAGE_KEY) {
            listener();
        }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
        sidebarCollapseListeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
    };
}

function getServerSidebarCollapsed() {
    return false;
}

function notifySidebarCollapseListeners() {
    sidebarCollapseListeners.forEach((listener) => listener());
}

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const isSidebarCollapsed = useSyncExternalStore(
        subscribeSidebarCollapsed,
        readStoredSidebarCollapsed,
        getServerSidebarCollapsed,
    );

    useEffect(() => {
        let ignore = false;

        async function checkSession() {
            try {
                const response = await authFetch("auth/get-session", {
                    cache: "no-store",
                });

                const data = (await response.json().catch(() => null)) as (SessionErrorPayload & {
                    user?: {
                        id?: string;
                        email?: string;
                        emailVerified?: boolean;
                    };
                }) | null;

                if (!response.ok) {
                    const code = data?.code || data?.error;

                    if (code === "EMAIL_NOT_VERIFIED" || data?.action === "VERIFY_EMAIL") {
                        const email = typeof data?.email === "string" ? data.email : "";
                        router.replace(email ? `/verify-email?email=${encodeURIComponent(email)}` : "/verify-email");
                        return;
                    }

                    if (code === "ORGANIZATION_REQUIRED") {
                        router.replace("/workspaces/create");
                        return;
                    }

                    if (code === "SESSION_READ_FAILED") {
                        router.replace("/login?message=session_expired");
                        return;
                    }

                    router.replace("/login");
                    return;
                }

                if (!data?.user?.id) {
                    router.replace("/login");
                    return;
                }

                if (data.user.emailVerified === false) {
                    const email = typeof data.user.email === "string" ? data.user.email : "";
                    router.replace(email ? `/verify-email?email=${encodeURIComponent(email)}` : "/verify-email");
                    return;
                }

                if (!ignore) {
                    prefetchProtectedData();
                    setIsCheckingSession(false);
                }
            } catch {
                router.replace("/login");
            }
        }

        void checkSession();

        return () => {
            ignore = true;
        };
    }, [router]);

    const toggleSidebarCollapsed = () => {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(!isSidebarCollapsed));
        notifySidebarCollapseListeners();
    };

    if (isCheckingSession) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <WorkspaceProvider>
            <div className="min-h-screen bg-background text-foreground">
                <ProtectedSidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={toggleSidebarCollapsed}
                />

                <div className={isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}>
                    <main className="min-h-screen bg-background py-10 transition-[padding] duration-200">
                        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                    </main>
                </div>
            </div>
        </WorkspaceProvider>
    );
}
