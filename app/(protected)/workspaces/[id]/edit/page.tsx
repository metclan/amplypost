import type { Metadata } from "next";

import WorkspaceForm from "../../workspace-form";

export const metadata: Metadata = {
    title: "Edit Workspace | Amplypost",
    description: "Edit a workspace in Amplypost.",
};

type EditWorkspacePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditWorkspacePage({ params }: EditWorkspacePageProps) {
    const { id } = await params;

    return <WorkspaceForm mode="edit" workspaceId={id} />;
}
