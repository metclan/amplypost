"use client";

import { useState } from "react";
import ProtectedSidebar from "../components/protected-sidebar";

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ProtectedSidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
            />

            <div className={isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}>
                <main className="min-h-screen bg-background py-10 transition-[padding] duration-200">
                    <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
