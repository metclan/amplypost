"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ImageIcon, RefreshCw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { invalidateAccountData } from "@/lib/client-data";
import { config } from "@/util/config";
import { connectPinterest } from "@/util/social-connect";

type ConnectionState = "loading" | "select-board" | "success" | "error";

type PinterestAccount = {
    id: string;
    accountName?: string | null;
    accountUsername?: string | null;
    profilePicture?: string | null;
    platformConfig?: PinterestPlatformConfig | null;
};

type PinterestBoard = {
    id: string;
    name: string;
    privacy?: string;
    pinCount?: number;
    imageCoverUrl?: string;
    thumbnailUrls?: string[];
    ownerUsername?: string;
};

type PinterestPlatformConfig = {
    boardId?: string;
    boardName?: string;
    boardImageCoverUrl?: string;
    boardThumbnailUrls?: string[];
    boardIds?: string[];
    boards?: PinterestBoard[];
};

type StatusPanelProps = {
    state: Exclude<ConnectionState, "loading" | "select-board">;
    title: string;
    message: string;
    details?: string;
};

const pinterestConnectUrl = `${config.backendUrl}accounts/pinterest/connect`;
const pinterestSelectBoardUrl = `${config.backendUrl}accounts/pinterest/select-board`;

function getSavedPinterestBoards(account: PinterestAccount) {
    const config = account.platformConfig;

    if (!config) return [];

    if (Array.isArray(config.boards) && config.boards.length > 0) {
        return config.boards;
    }

    if (!config.boardId || !config.boardName) {
        return [];
    }

    return [
        {
            id: config.boardId,
            name: config.boardName,
            imageCoverUrl: config.boardImageCoverUrl,
            thumbnailUrls: config.boardThumbnailUrls ?? [],
        },
    ];
}

function getInitialBoardIds(account: PinterestAccount, boards: PinterestBoard[]) {
    const config = account.platformConfig;

    if (Array.isArray(config?.boardIds) && config.boardIds.length > 0) {
        return config.boardIds.filter((boardId) =>
            boards.some((board) => board.id === boardId),
        );
    }

    if (config?.boardId && boards.some((board) => board.id === config.boardId)) {
        return [config.boardId];
    }

    return boards[0]?.id ? [boards[0].id] : [];
}

function PageHeader() {
    return (
        <div className="border-b border-border pb-5">
            <div className="flex items-center gap-3">
                <Image
                    src="/pinterest-logo.svg"
                    alt="Pinterest"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Link Pinterest
                </h1>
            </div>
        </div>
    );
}

function StatusPanel({ state, title, message, details }: StatusPanelProps) {
    const isSuccess = state === "success";
    const Icon = isSuccess ? CheckCircle2 : XCircle;

    return (
        <div className="space-y-6">
            <PageHeader />

            <div
                className={[
                    "rounded-2xl border p-8",
                    isSuccess
                        ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                        : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
                ].join(" ")}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                            isSuccess
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                        ].join(" ")}
                    >
                        <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                        <p className="text-muted-foreground">{message}</p>

                        {details && (
                            <div className="mt-3 break-words rounded-md bg-background/70 p-3 font-mono text-sm text-muted-foreground">
                                {details}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Button asChild className={isSuccess ? "bg-green-600 text-white hover:bg-green-700" : undefined}>
                        <Link href="/connected-accounts">Back to Connected Accounts</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function BoardSelectionPanel({
    account,
    boards,
    selectedBoardIds,
    isSubmitting,
    submitError,
    message,
    onToggleBoard,
    onSubmit,
}: {
    account: PinterestAccount;
    boards: PinterestBoard[];
    selectedBoardIds: string[];
    isSubmitting: boolean;
    submitError?: string;
    message: string;
    onToggleBoard: (boardId: string) => void;
    onSubmit: () => void;
}) {
    const selectedBoards = boards.filter((board) => selectedBoardIds.includes(board.id));
    const accountName = account.accountName || account.accountUsername || "Pinterest account";

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader />

            <div className="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-900/50 dark:bg-green-950/20">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">Pinterest Connected</h2>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                </div>
            </div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200" />

                <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                                <Image
                                    src="/pinterest-logo.svg"
                                    alt=""
                                    width={22}
                                    height={22}
                                    className="h-5.5 w-5.5"
                                />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold text-foreground">Finish Pinterest Setup</h2>
                                <p className="truncate text-sm text-muted-foreground">
                                    Select one or more boards for {accountName}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-y-auto px-5 py-5 sm:px-6">
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-background p-4">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                {account.profilePicture ? (
                                    <Image
                                        src={account.profilePicture}
                                        alt=""
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Image
                                            src="/pinterest-logo.svg"
                                            alt=""
                                            width={22}
                                            height={22}
                                            className="h-5.5 w-5.5"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">{accountName}</p>
                                {account.accountUsername && (
                                    <p className="truncate text-sm text-muted-foreground">@{account.accountUsername}</p>
                                )}
                            </div>
                        </div>

                        {boards.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {boards.map((board) => {
                                    const isSelected = selectedBoardIds.includes(board.id);
                                    const pinLabel = typeof board.pinCount === "number"
                                        ? `${board.pinCount} pin${board.pinCount === 1 ? "" : "s"}`
                                        : "Board";

                                    return (
                                        <button
                                            key={board.id}
                                            type="button"
                                            onClick={() => onToggleBoard(board.id)}
                                            className={[
                                                "group overflow-hidden rounded-xl border bg-background text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md",
                                                isSelected
                                                    ? "border-red-500 ring-2 ring-red-200 dark:ring-red-900/70"
                                                    : "border-border",
                                            ].join(" ")}
                                        >
                                            <div className="relative aspect-[16/9] bg-muted">
                                                {board.imageCoverUrl ? (
                                                    <Image
                                                        src={board.imageCoverUrl}
                                                        alt=""
                                                        fill
                                                        sizes="(min-width: 640px) 320px, 100vw"
                                                        className="object-cover transition duration-200 group-hover:scale-[1.03]"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8" />
                                                    </div>
                                                )}

                                                <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm">
                                                    {isSelected ? (
                                                        <CheckCircle2 className="h-5 w-5 text-red-600" />
                                                    ) : (
                                                        <span className="h-3 w-3 rounded-full border border-current" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3 p-4">
                                                <div>
                                                    <p className="break-words text-base font-semibold text-foreground">{board.name}</p>
                                                    {board.ownerUsername && (
                                                        <p className="mt-1 truncate text-sm text-muted-foreground">@{board.ownerUsername}</p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                        {pinLabel}
                                                    </span>
                                                    {board.privacy && (
                                                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                            {board.privacy.toLowerCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-6 text-center">
                                <ImageIcon className="mx-auto h-8 w-8 text-amber-300" />
                                <h3 className="mt-3 text-base font-semibold text-foreground">No Pinterest boards found</h3>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                    Pinterest connected {accountName}, but the backend did not return any boards to select. Create a board in Pinterest or reconnect after Pinterest returns boards.
                                </p>
                            </div>
                        )}

                        {submitError && (
                            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                                {submitError}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-border bg-background/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <Button asChild variant="outline">
                            <Link href="/connected-accounts">Back</Link>
                        </Button>
                        {boards.length === 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={connectPinterest}
                                className="border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reconnect Pinterest
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={selectedBoards.length === 0 || isSubmitting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : `Save ${selectedBoards.length === 1 ? "Board" : "Boards"}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConnectPinterest() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const oauthState = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const [state, setState] = useState<ConnectionState>("loading");
    const [message, setMessage] = useState("Connecting your Pinterest account...");
    const [details, setDetails] = useState<string | undefined>();
    const [account, setAccount] = useState<PinterestAccount | null>(null);
    const [boards, setBoards] = useState<PinterestBoard[]>([]);
    const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
    const [isSelectingBoard, setIsSelectingBoard] = useState(false);
    const [boardSelectionError, setBoardSelectionError] = useState<string | undefined>();
    const processedRef = useRef(false);

    function toggleSelectedBoard(boardId: string) {
        setSelectedBoardIds((currentBoardIds) =>
            currentBoardIds.includes(boardId)
                ? currentBoardIds.filter((currentBoardId) => currentBoardId !== boardId)
                : [...currentBoardIds, boardId],
        );
    }

    async function selectPinterestBoard() {
        if (!account || selectedBoardIds.length === 0) return;

        setIsSelectingBoard(true);
        setBoardSelectionError(undefined);

        try {
            const response = await fetch(pinterestSelectBoardUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    accountId: account.id,
                    boardId: selectedBoardIds[0],
                    boardIds: selectedBoardIds,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to save Pinterest board.",
                );
            }

            const selectedBoard = boards.find((board) => board.id === selectedBoardIds[0]);

            invalidateAccountData();
            setBoards([]);
            setAccount(null);
            setState("success");
            setMessage(
                selectedBoardIds.length > 1
                    ? `Pinterest account connected. Pins will publish to ${selectedBoardIds.length} boards.`
                    : selectedBoard
                        ? `Pinterest account connected. Pins will publish to "${selectedBoard.name}".`
                        : data?.message || "Pinterest board selected successfully.",
            );
        } catch (err) {
            console.error("Error selecting Pinterest board:", err);
            setBoardSelectionError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsSelectingBoard(false);
        }
    }

    useEffect(() => {
        async function connectPinterest() {
            if (processedRef.current) return;
            processedRef.current = true;

            if (!code || !oauthState) {
                setState("error");
                setMessage("Missing authorization code or state from Pinterest.");
                return;
            }

            const storedState = sessionStorage.getItem("pinterest_oauth_state");

            if (!storedState) {
                setState("error");
                setMessage("Missing saved Pinterest authorization session. Please try connecting again.");
                return;
            }

            if (oauthState !== storedState) {
                setState("error");
                setMessage("The Pinterest authorization state did not match. Please try connecting again.");
                return;
            }

            try {
                const response = await fetch(pinterestConnectUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ code }),
                });

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data?.error ||
                        "Failed to connect Pinterest account.",
                    );
                }

                sessionStorage.removeItem("pinterest_oauth_state");

                const nextAccount = data?.data?.account as PinterestAccount | undefined;
                const returnedBoards = Array.isArray(data?.data?.boards)
                    ? data.data.boards as PinterestBoard[]
                    : [];
                const nextBoards = nextAccount
                    ? returnedBoards.length > 0
                        ? returnedBoards
                        : getSavedPinterestBoards(nextAccount)
                    : [];

                if (nextAccount) {
                    setAccount(nextAccount);
                    setBoards(nextBoards);
                    setSelectedBoardIds(getInitialBoardIds(nextAccount, nextBoards));
                    setState("select-board");
                    setMessage(data?.message || "Select a board to complete setup.");
                    return;
                }

                invalidateAccountData();
                setState("success");
                setMessage(data?.message || "Your Pinterest account has been connected.");
            } catch (err) {
                console.error("Error during Pinterest authorization:", err);
                setState("error");
                setMessage("We could not connect your Pinterest account.");
                setDetails(err instanceof Error ? err.message : "An unexpected error occurred.");
            }
        }

        if (error) return;

        const connectTimer = window.setTimeout(() => {
            void connectPinterest();
        }, 100);

        return () => {
            window.clearTimeout(connectTimer);
        };
    }, [code, error, oauthState]);

    if (error) {
        const isUserCancelled =
            error === "access_denied" ||
            errorDescription?.toLowerCase().includes("access denied");

        return (
            <StatusPanel
                state="error"
                title={isUserCancelled ? "Connection Cancelled" : "Connection Error"}
                message={
                    isUserCancelled
                        ? "You cancelled the Pinterest connection request. You can try again whenever you are ready."
                        : errorDescription || "Pinterest returned an error before the account could be connected."
                }
            />
        );
    }

    if (state === "select-board" && account) {
        return (
            <BoardSelectionPanel
                account={account}
                boards={boards}
                selectedBoardIds={selectedBoardIds}
                isSubmitting={isSelectingBoard}
                submitError={boardSelectionError}
                message={message}
                onToggleBoard={toggleSelectedBoard}
                onSubmit={selectPinterestBoard}
            />
        );
    }

    if (state === "loading") {
        return (
            <div className="space-y-6">
                <PageHeader />

                <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-2xl border border-border bg-card p-8">
                    <Spinner />
                    <p className="text-lg text-muted-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground/80">Please do not close this window.</p>
                </div>
            </div>
        );
    }

    if (state === "error") {
        return (
            <StatusPanel
                state="error"
                title="Connection Failed"
                message={message}
                details={details}
            />
        );
    }

    return (
        <StatusPanel
            state="success"
            title="Pinterest Connected"
            message={message}
        />
    );
}
