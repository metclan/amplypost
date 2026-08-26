import type { Metadata } from "next";

import WorkspacesManager from "./workspaces-manager";

export const metadata: Metadata = {
    title: "Workspaces | Amplypost",
    description: "Create and manage Amplypost workspaces.",
};

export default function WorkspacesPage() {
    return <WorkspacesManager />;
}
