"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Edit2, Loader2 } from "lucide-react";
import {
    createHashtagGroup,
    deleteHashtagGroup,
    fetchHashtagGroups,
    type Hashtag,
    updateHashtagGroup,
} from "./hashtags";

function useDebouncedValue<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => window.clearTimeout(timeoutId);
    }, [delay, value]);

    return debouncedValue;
}

const HASHTAG_PLATFORM_OPTIONS = [
    { id: "", label: "Any platform" },
    { id: "instagram", label: "Instagram" },
    { id: "facebook", label: "Facebook" },
    { id: "tiktok", label: "TikTok" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "youtube", label: "YouTube" },
    { id: "bluesky", label: "Bluesky" },
    { id: "x", label: "X" },
];

interface HashtagDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onHashtagsChange: () => void;
    onSelectHashtag?: (hashtag: string) => void;
    defaultPlatformId?: string;
}

export default function HashtagDialog({
    isOpen,
    onClose,
    onHashtagsChange,
    onSelectHashtag,
    defaultPlatformId,
}: HashtagDialogProps) {
    const [hashtags, setHashtags] = useState<Hashtag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 350);
    const [selectedPlatformFilter, setSelectedPlatformFilter] = useState("");
    const [activeTab, setActiveTab] = useState<"select" | "create">("select");

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formHashtags, setFormHashtags] = useState("");
    const [formPlatformId, setFormPlatformId] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab("select");
            setSearchQuery("");
            setSelectedPlatformFilter("");
            setFormPlatformId(defaultPlatformId || "");
        }
    }, [defaultPlatformId, isOpen]);

    useEffect(() => {
        if (!isOpen || activeTab !== "select") {
            return;
        }

        let isCurrent = true;

        const loadHashtags = async () => {
            setIsLoading(true);
            try {
                const results = await fetchHashtagGroups({
                    platformId: selectedPlatformFilter || undefined,
                    search: debouncedSearchQuery,
                });

                if (isCurrent) {
                    setHashtags(results);
                }
            } catch (error) {
                if (isCurrent) {
                    console.error("Failed to fetch hashtags:", error);
                    setHashtags([]);
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };

        loadHashtags();

        return () => {
            isCurrent = false;
        };
    }, [activeTab, debouncedSearchQuery, isOpen, selectedPlatformFilter]);

    const fetchHashtags = async () => {
        setIsLoading(true);
        try {
            setHashtags(await fetchHashtagGroups({
                platformId: selectedPlatformFilter || undefined,
                search: debouncedSearchQuery,
            }));
        } catch (error) {
            console.error("Failed to fetch hashtags:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formTitle.trim() || !formHashtags.trim()) return;

        const input = {
            title: formTitle.trim(),
            hashtag: formHashtags.trim(),
            platformId: formPlatformId.trim() || null,
        };

        setIsSaving(true);
        try {
            if (editingId) {
                await updateHashtagGroup(editingId, input);
                setEditingId(null);
            } else {
                await createHashtagGroup(input);
            }
            resetForm();
            setActiveTab("select");
            await fetchHashtags();
            onHashtagsChange();
        } catch (error) {
            console.error("Failed to save hashtag group:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this hashtag group?")) return;

        try {
            await deleteHashtagGroup(id);
            setHashtags(prev => prev.filter(h => h.id !== id));
            onHashtagsChange();
        } catch (error) {
            console.error("Failed to delete hashtag group:", error);
        }
    };

    const startEdit = (hashtag: Hashtag) => {
        setEditingId(hashtag.id);
        setFormTitle(hashtag.title);
        setFormHashtags(hashtag.hashtag);
        setFormPlatformId(hashtag.platformId || defaultPlatformId || "");
        setActiveTab("create");
    };

    const resetForm = () => {
        setFormTitle("");
        setFormHashtags("");
        setFormPlatformId(defaultPlatformId || "");
        setEditingId(null);
    };

    const handleSelect = (hashtag: string) => {
        onSelectHashtag?.(hashtag);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card flex h-[calc(100vh-2rem)] max-h-[720px] w-full max-w-xl flex-col rounded-2xl border border-border shadow-2xl sm:h-[660px]">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-foreground">Hashtags</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-6">
                    <div className="grid shrink-0 grid-cols-2 gap-2 rounded-xl border border-border bg-muted/20 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setActiveTab("select");
                            }}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === "select" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            Select
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setActiveTab("create");
                            }}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === "create" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            Create
                        </button>
                    </div>

                    {activeTab === "select" && (
                        <div className="flex min-h-0 flex-1 flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Search hashtags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <div className="flex flex-wrap gap-2">
                                {HASHTAG_PLATFORM_OPTIONS.map((platform) => (
                                    <button
                                        key={platform.id || "all"}
                                        type="button"
                                        onClick={() => setSelectedPlatformFilter(platform.id)}
                                        className={`rounded-full border px-3 py-1 text-xs font-medium text-white transition-colors ${
                                            selectedPlatformFilter === platform.id
                                                ? "border-primary bg-primary"
                                                : "border-border bg-muted/20 hover:bg-muted"
                                        }`}
                                    >
                                        {platform.id ? platform.label : "All"}
                                    </button>
                                ))}
                            </div>

                            {isLoading ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-white/70" />
                                </div>
                            ) : hashtags.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                                    No hashtags found.
                                </div>
                            ) : (
                                <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                                    {hashtags.map(item => (
                                        <div
                                            key={item.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleSelect(item.hashtag)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    handleSelect(item.hashtag);
                                                }
                                            }}
                                            className={`bg-card border border-border rounded-lg px-3 py-2.5 text-left group transition-all hover:border-primary/60 hover:bg-primary/5 ${
                                                editingId === item.id ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-medium text-foreground">{item.title}</h4>
                                                    {item.platformId && (
                                                        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-primary">{item.platformId}</p>
                                                    )}
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">{item.hashtag}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            startEdit(item);
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDelete(item.id);
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form (Add/Edit) */}
                    {activeTab === "create" && (
                        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">
                                        {editingId ? "Edit Hashtag Group" : "New Hashtag Group"}
                                    </h3>
                                    {!isSaving && (
                                        <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground">
                                            Cancel
                                        </button>
                                    )}
                                </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                                    <input
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="e.g., Summer Vibes"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Platform (optional)</label>
                                    <select
                                        value={formPlatformId}
                                        onChange={(e) => setFormPlatformId(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {HASHTAG_PLATFORM_OPTIONS.map((platform) => (
                                            <option key={platform.id} value={platform.id}>
                                                {platform.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Hashtags</label>
                                    <textarea
                                        value={formHashtags}
                                        onChange={(e) => setFormHashtags(e.target.value)}
                                        placeholder="#summer #fun #sun"
                                        rows={3}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !formTitle.trim() || !formHashtags.trim()}
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Save
                                </button>
                            </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
