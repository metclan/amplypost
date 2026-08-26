"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import ProtectedSidebar from "../components/protected-sidebar";
import { prefetchProtectedData } from "@/lib/client-data";
import { WorkspaceProvider } from "../components/workspace-provider";
import { backendAuthUrl } from "@/util/backend-api";

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
                const response = await fetch(backendAuthUrl("auth/get-session"), {
                    credentials: "include",
                    cache: "no-store",
                });

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                const data = await response.json().catch(() => null);

                if (!data?.user?.id) {
                    router.replace("/login");
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
