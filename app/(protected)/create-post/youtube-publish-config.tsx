"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type YouTubePrivacyStatus = "private" | "unlisted" | "public";
export type YouTubeLicense = "youtube" | "creativeCommon";

export interface YouTubeConfigState {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
    privacyStatus: YouTubePrivacyStatus;
    madeForKids: boolean;
    notifySubscribers: boolean;
    embeddable: boolean;
    license: YouTubeLicense;
}

interface YouTubePublishConfigProps {
    value: YouTubeConfigState;
    onChange: (value: YouTubeConfigState) => void;
    showTitleError?: boolean;
}

const categories = [
    { id: "22", label: "People & Blogs" },
    { id: "24", label: "Entertainment" },
    { id: "27", label: "Education" },
    { id: "28", label: "Science & Technology" },
    { id: "26", label: "Howto & Style" },
    { id: "10", label: "Music" },
    { id: "20", label: "Gaming" },
    { id: "17", label: "Sports" },
    { id: "23", label: "Comedy" },
    { id: "25", label: "News & Politics" },
];

function ToggleSwitch({
    checked,
    onClick,
}: {
    checked: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onClick}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors ${
                checked ? "border-violet-400 bg-violet-600" : "border-white/20 bg-white/10"
            }`}
        >
            <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
}

function parseTags(value: string) {
    return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

export default function YouTubePublishConfig({
    value,
    onChange,
    showTitleError = false,
}: YouTubePublishConfigProps) {
    const updateState = (updates: Partial<YouTubeConfigState>) => {
        onChange({ ...value, ...updates });
    };

    return (
        <div className="mt-4 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-foreground">
                    Video title
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    value={value.title}
                    onChange={(event) => updateState({ title: event.target.value })}
                    maxLength={100}
                    placeholder="My launch video"
                    className="bg-background"
                />
                {showTitleError && !value.title.trim() && (
                    <p className="text-xs text-destructive">Please enter a YouTube video title.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                    value={value.description}
                    onChange={(event) => updateState({ description: event.target.value })}
                    rows={5}
                    placeholder="Full video description here"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Visibility</label>
                    <Select
                        value={value.privacyStatus}
                        onValueChange={(privacyStatus) =>
                            updateState({ privacyStatus: privacyStatus as YouTubePrivacyStatus })
                        }
                    >
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Select
                        value={value.categoryId}
                        onValueChange={(categoryId) => updateState({ categoryId })}
                    >
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <Input
                    value={value.tags.join(", ")}
                    onChange={(event) => updateState({ tags: parseTags(event.target.value) })}
                    placeholder="marketing, launch, tutorial"
                    className="bg-background"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">License</label>
                    <Select
                        value={value.license}
                        onValueChange={(license) => updateState({ license: license as YouTubeLicense })}
                    >
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="youtube">Standard YouTube</SelectItem>
                            <SelectItem value="creativeCommon">Creative Commons</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3 rounded-lg border border-border bg-background/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-foreground">Made for kids</span>
                        <ToggleSwitch
                            checked={value.madeForKids}
                            onClick={() => updateState({ madeForKids: !value.madeForKids })}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-foreground">Notify subscribers</span>
                        <ToggleSwitch
                            checked={value.notifySubscribers}
                            onClick={() => updateState({ notifySubscribers: !value.notifySubscribers })}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-foreground">Allow embedding</span>
                        <ToggleSwitch
                            checked={value.embeddable}
                            onClick={() => updateState({ embeddable: !value.embeddable })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
