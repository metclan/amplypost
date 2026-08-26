import type { Metadata } from "next";

import WorkspaceForm from "../workspace-form";

export const metadata: Metadata = {
    title: "Create Workspace | Amplypost",
    description: "Create a workspace in Amplypost.",
};

export default function CreateWorkspacePage() {
    return <WorkspaceForm mode="create" />;
}
