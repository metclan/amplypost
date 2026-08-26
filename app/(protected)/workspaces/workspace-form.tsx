"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    ArrowLeft,
    Check,
    Loader2,
    Plus,
    Search,
    UserPlus,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ACCOUNTS_CACHE_KEY,
    CACHE_TTL,
    fetchAccounts,
    getPlatformLogo,
    type ConnectedAccount,
} from "@/lib/client-data";
import { useCachedResource } from "@/lib/client-cache";
import {
    createWorkspace,
    fetchWorkspace,
    updateWorkspace,
    type Workspace,
    type WorkspacePayload,
} from "@/lib/workspaces";
import {
    fetchOrganizationUsers,
    ORGANIZATION_USERS_CACHE_KEY,
    type OrganizationUser,
} from "@/lib/organization-users";
import { useWorkspace } from "@/app/components/workspace-provider";

type WorkspaceFormProps = {
    mode: "create" | "edit";
    workspaceId?: string;
};

function getProviderColor(provider: string) {
    const colors: Record<string, string> = {
        facebook: "from-blue-500 to-blue-700",
        instagram: "from-yellow-400 via-pink-500 to-purple-600",
        linkedin: "from-sky-500 to-blue-700",
        tiktok: "from-cyan-400 to-pink-500",
        youtube: "from-red-500 to-red-700",
        x: "from-zinc-500 to-zinc-900",
        twitter: "from-zinc-500 to-zinc-900",
        threads: "from-zinc-500 to-zinc-900",
        pinterest: "from-red-500 to-red-700",
        bluesky: "from-sky-400 to-blue-600",
    };

    return colors[provider.toLowerCase()] || "from-violet-500 to-slate-700";
}

function getProviderLabel(provider: string) {
    if (provider.toLowerCase() === "x") return "X";
    return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function accountMatchesSearch(account: ConnectedAccount, query: string) {
    if (!query) return true;
    const normalizedQuery = query.toLowerCase();
    return [
        account.account_name,
        account.account_username,
        account.account_id,
        account.provider,
    ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
}

function userMatchesSearch(user: OrganizationUser, query: string) {
    if (!query) return true;
    const normalizedQuery = query.toLowerCase();
    return [user.name, user.email, user.timezone, user.id]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
}

function getUserInitials(user: OrganizationUser) {
    const source = user.name || user.email || user.id;
    return source
        .split(/\s|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export default function WorkspaceForm({ mode, workspaceId }: WorkspaceFormProps) {
    const router = useRouter();
    const {
        workspaces,
        selectWorkspace,
        refreshWorkspaces,
    } = useWorkspace();
    const { data: accounts = [], isLoading: isLoadingAccounts, error: accountsError } = useCachedResource(
        ACCOUNTS_CACHE_KEY,
        fetchAccounts,
        { ttl: CACHE_TTL },
    );
    const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useCachedResource(
        ORGANIZATION_USERS_CACHE_KEY,
        fetchOrganizationUsers,
        { ttl: CACHE_TTL },
    );
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(mode === "edit");
    const [workspaceError, setWorkspaceError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [accountSearch, setAccountSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (mode !== "edit" || !workspaceId) return;

        const cachedWorkspace = workspaces.find((item) => item.id === workspaceId);
        if (cachedWorkspace) {
            setWorkspace(cachedWorkspace);
            setIsLoadingWorkspace(false);
            return;
        }

        let isCurrent = true;
        setIsLoadingWorkspace(true);
        fetchWorkspace(workspaceId)
            .then((fetchedWorkspace) => {
                if (isCurrent) {
                    setWorkspace(fetchedWorkspace);
                    setWorkspaceError(fetchedWorkspace ? null : "Workspace not found.");
                }
            })
            .catch((error) => {
                if (isCurrent) {
                    setWorkspaceError(error instanceof Error ? error.message : "Failed to load workspace.");
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsLoadingWorkspace(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [mode, workspaceId, workspaces]);

    useEffect(() => {
        if (mode !== "edit" || !workspace) return;

        setName(workspace.name);
        setSelectedUserIds(workspace.userIds ?? []);
        setSelectedAccountIds(workspace.socialMediaAccountIds ?? []);
    }, [mode, workspace]);

    const filteredAccounts = useMemo(
        () => accounts.filter((account) => accountMatchesSearch(account, accountSearch.trim())),
        [accountSearch, accounts],
    );

    const activeUsers = useMemo(
        () => users.filter((user) => user.isActive),
        [users],
    );

    const filteredUsers = useMemo(
        () => activeUsers.filter((user) => userMatchesSearch(user, userSearch.trim())),
        [activeUsers, userSearch],
    );

    const isEdit = mode === "edit";
    const isDefaultWorkspace = Boolean(workspace?.isDefault);
    const title = isEdit ? "Edit workspace" : "Create workspace";

    const toggleAccount = (accountId: string) => {
        setSelectedAccountIds((currentIds) =>
            currentIds.includes(accountId)
                ? currentIds.filter((currentId) => currentId !== accountId)
                : [...currentIds, accountId],
        );
    };

    const toggleUser = (userId: string) => {
        setSelectedUserIds((currentIds) =>
            currentIds.includes(userId)
                ? currentIds.filter((currentId) => currentId !== userId)
                : [...currentIds, userId],
        );
    };

    const selectAllVisibleAccounts = () => {
        setSelectedAccountIds((currentIds) => {
            const nextIds = new Set(currentIds);
            filteredAccounts.forEach((account) => nextIds.add(account.id));
            return Array.from(nextIds);
        });
    };

    const clearVisibleAccounts = () => {
        const visibleIds = new Set(filteredAccounts.map((account) => account.id));
        setSelectedAccountIds((currentIds) => currentIds.filter((accountId) => !visibleIds.has(accountId)));
    };

    const selectAllVisibleUsers = () => {
        setSelectedUserIds((currentIds) => {
            const nextIds = new Set(currentIds);
            filteredUsers.forEach((user) => nextIds.add(user.id));
            return Array.from(nextIds);
        });
    };

    const clearVisibleUsers = () => {
        const visibleIds = new Set(filteredUsers.map((user) => user.id));
        setSelectedUserIds((currentIds) => currentIds.filter((userId) => !visibleIds.has(userId)));
    };

    const buildPayload = (): WorkspacePayload | null => {
        const workspaceName = name.trim();
        if (!workspaceName) {
            toast.error("Enter a workspace name.");
            return null;
        }

        if (selectedAccountIds.length === 0) {
            toast.error("Select at least one social media account.");
            return null;
        }

        return {
            name: workspaceName,
            socialMediaAccountIds: selectedAccountIds,
            ...(isEdit || selectedUserIds.length > 0 ? { userIds: selectedUserIds } : {}),
        };
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload = buildPayload();
        if (!payload) return;

        setIsSaving(true);
        try {
            if (isEdit && workspaceId) {
                await updateWorkspace(workspaceId, payload);
                toast.success("Workspace updated.");
            } else {
                const createdWorkspace = await createWorkspace(payload);
                if (createdWorkspace) {
                    selectWorkspace(createdWorkspace.id);
                }
                toast.success("Workspace created.");
            }

            await refreshWorkspaces();
            router.push("/workspaces");
        } catch (error) {
            console.error("Failed to save workspace:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save workspace.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingWorkspace) {
        return (
            <div className="flex min-h-[55vh] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading workspace...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-foreground">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
                <div>
                    <Link
                        href="/workspaces"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to workspaces
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        Choose the connected accounts and optional teammates that belong in this workspace.
                    </p>
                </div>
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 cursor-pointer bg-violet-600 px-5 text-white hover:bg-violet-500"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : isEdit ? (
                        "Save changes"
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            Create workspace
                        </>
                    )}
                </Button>
            </div>

            {(workspaceError || accountsError || usersError) && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">
                    {workspaceError || accountsError?.message || usersError?.message}
                </div>
            )}

            {isDefaultWorkspace && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                    <p className="font-semibold">Default workspace</p>
                    <p className="mt-1 text-muted-foreground">
                        This workspace can be renamed and has access to every active connected account in the organization.
                    </p>
                </div>
            )}

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="max-w-2xl space-y-2">
                            <Label htmlFor="workspace-name">Workspace name</Label>
                            <Input
                                id="workspace-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Marketing"
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Workspace accounts</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Select at least one account available when this workspace is active.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={selectAllVisibleAccounts} className="cursor-pointer">
                                    Select visible
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={clearVisibleAccounts} className="cursor-pointer">
                                    Clear visible
                                </Button>
                            </div>
                        </div>

                        <div className="relative mt-4 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={accountSearch}
                                onChange={(event) => setAccountSearch(event.target.value)}
                                placeholder="Search accounts"
                                className="h-11 pl-9"
                            />
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-2">
                            {isLoadingAccounts ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-24 animate-pulse rounded-lg border border-border bg-muted/40" />
                                ))
                            ) : filteredAccounts.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground lg:col-span-2">
                                    No connected accounts match your search.
                                </div>
                            ) : (
                                filteredAccounts.map((account) => {
                                    const isSelected = selectedAccountIds.includes(account.id);
                                    const accountPrimaryText = account.account_username
                                        ? `@${account.account_username}`
                                        : account.account_name;

                                    return (
                                        <div
                                            key={account.id}
                                            className={[
                                                "w-full rounded-lg border transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border bg-background hover:border-primary/50",
                                            ].join(" ")}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleAccount(account.id)}
                                                className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
                                            >
                                                <span
                                                    className={[
                                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                                                        isSelected ? "border-primary bg-primary" : "border-muted-foreground",
                                                    ].join(" ")}
                                                >
                                                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                                </span>

                                                <span className="relative shrink-0">
                                                    <span className={`block h-10 w-10 rounded-full bg-gradient-to-br ${getProviderColor(account.provider)} p-0.5`}>
                                                        <span className="block h-full w-full rounded-full bg-card p-0.5">
                                                            <Image
                                                                src={account.profile_picture}
                                                                alt={account.account_name}
                                                                unoptimized
                                                                referrerPolicy="no-referrer"
                                                                width={40}
                                                                height={40}
                                                                className="h-full w-full rounded-full object-cover"
                                                            />
                                                        </span>
                                                    </span>
                                                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md border border-border bg-card">
                                                        <Image
                                                            src={getPlatformLogo(account.provider)}
                                                            alt={account.provider}
                                                            width={14}
                                                            height={14}
                                                            className="h-3.5 w-3.5 object-contain"
                                                        />
                                                    </span>
                                                </span>

                                                <span className="min-w-0 flex-1">
                                                    <span className="mb-0.5 flex items-center gap-1.5">
                                                        <Image
                                                            src={getPlatformLogo(account.provider)}
                                                            alt={account.provider}
                                                            width={14}
                                                            height={14}
                                                            className="h-3.5 w-3.5 object-contain"
                                                        />
                                                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                                                            {getProviderLabel(account.provider)}
                                                        </span>
                                                    </span>
                                                    <span className="block truncate text-sm font-semibold text-foreground">
                                                        {account.account_name}
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        {accountPrimaryText}
                                                    </span>
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Workspace users</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add teammates who should be associated with this workspace. This is optional.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={selectAllVisibleUsers} className="cursor-pointer">
                                    Select visible
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={clearVisibleUsers} className="cursor-pointer">
                                    Clear visible
                                </Button>
                            </div>
                        </div>

                        <div className="relative mt-4 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={userSearch}
                                onChange={(event) => setUserSearch(event.target.value)}
                                placeholder="Search users"
                                className="h-11 pl-9"
                            />
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-2">
                            {isLoadingUsers ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-20 animate-pulse rounded-lg border border-border bg-muted/40" />
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground lg:col-span-2">
                                    No organization users match your search.
                                </div>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedUserIds.includes(user.id);

                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => toggleUser(user.id)}
                                            className={[
                                                "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border bg-background hover:border-primary/50",
                                            ].join(" ")}
                                        >
                                            <span
                                                className={[
                                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                                                    isSelected ? "border-primary bg-primary" : "border-muted-foreground",
                                                ].join(" ")}
                                            >
                                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </span>
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name}
                                                        unoptimized
                                                        referrerPolicy="no-referrer"
                                                        width={40}
                                                        height={40}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    getUserInitials(user)
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-semibold text-foreground">
                                                    {user.name}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {user.email ?? user.timezone ?? user.id}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <p className="text-sm font-medium text-foreground">Selected accounts</p>
                        <p className="mt-2 text-4xl font-semibold text-foreground">{selectedAccountIds.length}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            These accounts appear in Create Post when this workspace is active.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            {selectedUserIds.length} selected user{selectedUserIds.length === 1 ? "" : "s"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Users are optional. The backend keeps the creator in the workspace automatically.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                            <UserPlus className="h-4 w-4 text-primary" />
                            Organization users
                        </p>
                        <p className="mt-2 text-4xl font-semibold text-foreground">{activeUsers.length}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Pulled from the current organization through the users endpoint.
                        </p>
                    </div>
                </aside>
            </section>
        </form>
    );
}
