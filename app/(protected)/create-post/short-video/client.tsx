"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DateTimePicker } from "@/components/ui/date-and-time-picker";
import { Button } from "@/components/ui/button";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import MediaAccounts from "../media-accounts";
import TikTokPublishConfig, { TikTokConfigState } from "../tiktok-publish-config";
import YouTubePublishConfig, { YouTubeConfigState } from "../youtube-publish-config";
import { renameFileWithTimestamp } from "@/util/sanitizeUrl";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    Hash,
    MoreVertical,
    Smile,
    Sparkles,
    Type,
    Zap,
} from "lucide-react";
import HashtagDialog from "../hashtag-dialog";
import PostSuccessDialog from "../post-success-dialog";
import { generateAICaption } from "@/lib/generate-ai-caption";
import Link from "next/link";
import { fetchConnectedAccounts, type ConnectedAccount } from "../accounts";

type MediaKind = "image" | "video";
type StoryPublishMode = "feed" | "feed_and_story" | "story_only";

interface MediaFileItem {
    id: number;
    file: File;
    type: MediaKind;
    dimensions?: {
        width: number;
        height: number;
    };
}

interface MediaPreviewItem {
    id: number;
    url: string;
    type: MediaKind;
}

interface UploadedMediaItem {
    key: string;
    mediaUrl: string;
    mediaType: MediaKind;
    dimensions?: {
        width: number;
        height: number;
    };
}

function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const video = document.createElement("video");

        video.preload = "metadata";
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({
                width: video.videoWidth,
                height: video.videoHeight,
            });
        };
        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to read video metadata"));
        };
        video.src = objectUrl;
    });
}

function getDefaultTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const dateAsUtc = Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
        Number(values.hour),
        Number(values.minute),
        Number(values.second)
    );

    return dateAsUtc - date.getTime();
}

function getScheduledDateInTimezone(date: Date, time: string, timeZone: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const dateTimeAsUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0));
    const offset = getTimeZoneOffsetMs(dateTimeAsUtc, timeZone);
    const scheduledDate = new Date(dateTimeAsUtc.getTime() - offset);
    const adjustedOffset = getTimeZoneOffsetMs(scheduledDate, timeZone);

    return new Date(dateTimeAsUtc.getTime() - adjustedOffset);
}

function ToggleSwitch({
    checked,
    disabled,
    onClick,
    title,
}: {
    checked: boolean;
    disabled?: boolean;
    onClick: () => void;
    title?: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            title={title}
            onClick={onClick}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors ${
                checked
                    ? "border-violet-400 bg-violet-600"
                    : "border-white/20 bg-white/10"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-violet-400/70"}`}
        >
            <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
}

export default function ShortVideoClient() {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [caption, setCaption] = useState("");
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [tikTokConfigs, setTikTokConfigs] = useState<Record<string, TikTokConfigState>>({});
    const [youTubeConfigs, setYouTubeConfigs] = useState<Record<string, YouTubeConfigState>>({});

    const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreviewItem[]>([]);
    const [uploadedMedia, setUploadedMedia] = useState<Map<number, UploadedMediaItem>>(new Map());
    const [uploadProgressMap, setUploadProgressMap] = useState<Map<number, number>>(new Map());
    const [uploadingIds, setUploadingIds] = useState<Set<number>>(new Set());
    const [mediaPendingRemoval, setMediaPendingRemoval] = useState<MediaPreviewItem | null>(null);
    const [isDeletingMedia, setIsDeletingMedia] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [storyPublishMode, setStoryPublishMode] = useState<StoryPublishMode>("feed");
    const [useSameCaption, setUseSameCaption] = useState(true);
    const [accountCaptions, setAccountCaptions] = useState<Record<string, string>>({});
    const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
    const [scheduledDateTime, setScheduledDateTime] = useState<Date | undefined>(undefined);
    const [scheduledTime, setScheduledTime] = useState('');
    const [scheduledTimezone, setScheduledTimezone] = useState(getDefaultTimezone);
    const [showTikTokModal, setShowTikTokModal] = useState(false);
    const [showTikTokValidationErrors, setShowTikTokValidationErrors] = useState(false);
    const [showYouTubeValidationErrors, setShowYouTubeValidationErrors] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    // Hashtag state
    const [showHashtagModal, setShowHashtagModal] = useState(false);
    const [activeHashtagTarget, setActiveHashtagTarget] = useState<string | null>(null);
    const [activeHashtagPlatformId, setActiveHashtagPlatformId] = useState<string | undefined>(undefined);
    const [activeEmojiTarget, setActiveEmojiTarget] = useState<string | null>(null);
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
    const [captionGenerationError, setCaptionGenerationError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaIdCounterRef = useRef(0);
    const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
    const previewUrlsRef = useRef<string[]>([]);
    const isUploadingMedia = uploadingIds.size > 0;

    const fetchAccounts = useCallback(async () => {
        try {
            setIsLoadingAccounts(true);
            setAccounts(await fetchConnectedAccounts());
        } catch (error) {
            console.error("Failed to fetch connected accounts:", error);
        } finally {
            setIsLoadingAccounts(false);
        }
    }, []);

    // Fetch connected accounts
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        previewUrlsRef.current = mediaPreviews.map((preview) => preview.url);
    }, [mediaPreviews]);

    // Cleanup media previews and pending browser uploads when component unmounts.
    useEffect(() => {
        const abortControllers = abortControllersRef.current;
        return () => {
            previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            abortControllers.forEach((controller) => controller.abort());
            abortControllers.clear();
        };
    }, []);

    // Set default date/time to 30 minutes from now when Schedule is selected
    useEffect(() => {
        if (scheduleOption === 'later' && !scheduledDateTime) {
            const now = new Date();
            const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
            setScheduledDateTime(thirtyMinutesLater);
            const hours = thirtyMinutesLater.getHours().toString().padStart(2, '0');
            const minutes = thirtyMinutesLater.getMinutes().toString().padStart(2, '0');
            setScheduledTime(`${hours}:${minutes}`);
        }
    }, [scheduleOption, scheduledDateTime]);

    const appendHashtag = (value: string, tagString: string) => {
        const trimmed = value.trim();
        return trimmed ? `${trimmed}\n${tagString}` : tagString;
    };

    const handleHashtagSelect = (tagString: string, target: string | null = activeHashtagTarget) => {
        if (target && target !== "shared") {
            setAccountCaptions((prev) => ({
                ...prev,
                [target]: appendHashtag(prev[target] ?? "", tagString),
            }));
        } else {
            setCaption((prev) => appendHashtag(prev, tagString));
        }
        setActiveHashtagTarget(null);
    };

    const appendEmoji = (value: string, emoji: string) => `${value}${emoji}`;

    const handleEmojiSelect = (emojiData: EmojiClickData, target: string | null = activeEmojiTarget) => {
        if (target && target !== "shared") {
            setAccountCaptions((prev) => ({
                ...prev,
                [target]: appendEmoji(prev[target] ?? "", emojiData.emoji),
            }));
        } else {
            setCaption((prev) => appendEmoji(prev, emojiData.emoji));
        }
        setCaptionGenerationError(null);
        setActiveEmojiTarget(null);
    };

    const selectedAccountObjects = accounts.filter((account) => selectedAccounts.includes(account.id));
    const getPlatformId = (provider: string) => provider.trim().toLowerCase();
    const selectedVideoCount = mediaFiles.filter((media) => media.type === "video").length;
    const selectedImageCount = mediaFiles.filter((media) => media.type === "image").length;
    const hasMultipleVideos = selectedVideoCount > 1;
    const hasImages = selectedImageCount > 0;
    const hasSelectedMedia = mediaFiles.length > 0;
    const isInvalidForYouTube = hasSelectedMedia && (hasImages || selectedVideoCount !== 1);
    const isDisabledForMultipleVideos = (provider: string) =>
        hasMultipleVideos && ["facebook", "tiktok", "linkedin"].includes(provider.toLowerCase());
    const isDisabledForYouTube = (provider: string) =>
        provider.toLowerCase() === "youtube" && isInvalidForYouTube;
    const isAccountDisabledByMedia = (provider: string) =>
        isDisabledForMultipleVideos(provider) || isDisabledForYouTube(provider);
    const disabledAccountIds = accounts
        .filter((account) => isAccountDisabledByMedia(account.provider))
        .map((account) => account.id);
    const getHashtagPlatformForTarget = (target: string) => {
        if (target === "shared") {
            const selectedPlatforms = new Set(selectedAccountObjects.map((account) => getPlatformId(account.provider)));
            return selectedPlatforms.size === 1 ? Array.from(selectedPlatforms)[0] : undefined;
        }

        const account = selectedAccountObjects.find((value) => value.id === target);
        return account ? getPlatformId(account.provider) : undefined;
    };
    const storyEligibleSelectedAccounts = selectedAccountObjects.filter((account) =>
        ["instagram", "facebook"].includes(account.provider.toLowerCase())
    );
    const canPostAsStory = storyEligibleSelectedAccounts.length > 0;
    const selectedAccountsAreStoryOnlyEligible =
        selectedAccountObjects.length > 0 &&
        selectedAccountObjects.every((account) => ["instagram", "facebook"].includes(account.provider.toLowerCase()));
    const postAsStory = storyPublishMode !== "feed";
    const storyOnly = storyPublishMode === "story_only";
    const showCaptionSection = true;
    const canEditCaption = selectedAccounts.length > 0;
    const canUseDifferentCaptions = selectedAccounts.length > 1;
    const accountsStep = 2;
    const scheduleStep = 4;

    useEffect(() => {
        if (!canPostAsStory && storyPublishMode !== "feed") {
            setStoryPublishMode("feed");
            return;
        }

        if (storyPublishMode === "story_only" && !selectedAccountsAreStoryOnlyEligible) {
            setStoryPublishMode("feed");
        }
    }, [canPostAsStory, selectedAccountsAreStoryOnlyEligible, storyPublishMode]);

    useEffect(() => {
        if (!hasMultipleVideos && !isInvalidForYouTube) return;

        setSelectedAccounts((prev) =>
            prev.filter((accountId) => {
                const account = accounts.find((value) => value.id === accountId);
                return account ? !isAccountDisabledByMedia(account.provider) : true;
            })
        );
    }, [accounts, hasMultipleVideos, isInvalidForYouTube]);

    useEffect(() => {
        if (!canUseDifferentCaptions && !useSameCaption) {
            setUseSameCaption(true);
        }
    }, [canUseDifferentCaptions, useSameCaption]);

    const openHashtagModal = (target: string) => {
        setActiveHashtagTarget(target);
        setActiveHashtagPlatformId(getHashtagPlatformForTarget(target));
        setShowHashtagModal(true);
    };

    const renderHashtagPicker = (target: string, disabled = false) => {
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={() => openHashtagModal(target)}
                className="cursor-pointer rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Add hashtag"
            >
                <Hash className="h-4 w-4" />
            </button>
        );
    };

    const renderEmojiPicker = (target: string, disabled = false) => {
        const isOpen = activeEmojiTarget === target;

        return (
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setActiveEmojiTarget((value) => value === target ? null : target)}
                    className="cursor-pointer rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Insert emoji"
                >
                    <Smile className="h-4 w-4" />
                </button>
                {isOpen && (
                    <div className="absolute bottom-full left-0 z-30 mb-2 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                        <EmojiPicker
                            onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, target)}
                            theme={Theme.AUTO}
                            width={320}
                            height={380}
                            lazyLoadEmojis
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}
            </div>
        );
    };

    const handleGenerateCaption = async () => {
        if (!caption.trim()) {
            setCaptionGenerationError("Caption can't be empty");
            return;
        }

        setIsGeneratingCaption(true);
        setCaptionGenerationError(null);

        try {
            const generatedCaption = await generateAICaption({
                prompt: caption.trim(),
                postType: "short-video",
            });

            setCaption(generatedCaption);
        } catch (error) {
            setCaptionGenerationError(
                error instanceof Error ? error.message : "Failed to generate caption."
            );
        } finally {
            setIsGeneratingCaption(false);
        }
    };

    const getDefaultTikTokConfig = (): TikTokConfigState => ({
        privacy: undefined,
        allowComments: true,
        allowDuet: true,
        allowStitch: true,
        isAIGC: false,
        brandContentToggle: false,
        isYourBrand: false,
        isBrandedContent: false,
        autoAddMusic: false,
        draftPost: false,
        agreedToTerms: false,
    });

    const getCaptionForAccount = (accountId: string) =>
        useSameCaption ? caption.trim() : getAccountCaption(accountId).trim();

    const getDefaultYouTubeConfig = (accountId: string): YouTubeConfigState => {
        const accountCaption = getCaptionForAccount(accountId);
        const firstLine = accountCaption.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";

        return {
            title: firstLine,
            description: accountCaption,
            tags: [],
            categoryId: "22",
            privacyStatus: "private",
            madeForKids: false,
            notifySubscribers: false,
            embeddable: true,
            license: "youtube",
        };
    };

    const getDefaultBlueskyConfig = () => {
        const videoDimensions = mediaFiles.find((media) => media.type === "video")?.dimensions;

        return {
            langs: ["en"],
            videoAlt: "",
            aspectRatio: {
                width: videoDimensions?.width ?? 16,
                height: videoDimensions?.height ?? 9,
            },
        };
    };

    // Toggle account selection
    const toggleAccount = (accountId: string) => {
        const account = accounts.find((value) => value.id === accountId);
        if (account && isAccountDisabledByMedia(account.provider)) {
            return;
        }

        setSelectedAccounts((prev) =>
            prev.includes(accountId)
                ? prev.filter((id) => id !== accountId)
                : [...prev, accountId]
        );
    };

    // Select all accounts
    const handleSelectAll = (accountIds: string[]) => {
        setSelectedAccounts(
            accountIds.filter((accountId) => {
                const account = accounts.find((value) => value.id === accountId);
                return account ? !isAccountDisabledByMedia(account.provider) : true;
            })
        );
    };

    // Deselect all accounts
    const handleDeselectAll = () => {
        setSelectedAccounts([]);
    };

    const handleAccountCaptionChange = (accountId: string, value: string) => {
        setAccountCaptions((prev) => ({
            ...prev,
            [accountId]: value,
        }));
    };

    const getAccountCaption = (accountId: string) => accountCaptions[accountId] ?? "";

    const uploadSingleFile = async (media: MediaFileItem) => {
        const abortController = new AbortController();
        abortControllersRef.current.set(media.id, abortController);

        setUploadingIds((prev) => new Set(prev).add(media.id));
        setUploadError(null);

        try {
            const fileName = renameFileWithTimestamp(media.file);
            const response = await fetch('/api/uploads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: fileName, contentType: media.file.type }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to get upload URL');
            }

            const result = await response.json();
            const { publicUrl, uploadUrl, key } = result;

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentageComplete = Math.round((event.loaded / event.total) * 100);
                        setUploadProgressMap((prev) => {
                            const next = new Map(prev);
                            next.set(media.id, percentageComplete);
                            return next;
                        });
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error('Upload failed with status ' + xhr.status));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload network error'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload cancelled'));
                });

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', media.file.type);

                abortController.signal.addEventListener('abort', () => {
                    xhr.abort();
                });

                xhr.send(media.file);
            });

            setUploadedMedia((prev) => {
                const next = new Map(prev);
                next.set(media.id, {
                    key,
                    mediaUrl: publicUrl,
                    mediaType: media.type,
                    dimensions: media.dimensions,
                });
                return next;
            });
        } catch (error) {
            if (error instanceof Error && (error.message === 'Upload cancelled' || error.name === 'AbortError')) {
                return;
            }

            console.error('Upload error:', error);
            setUploadError('Failed to upload media. Please try again.');
        } finally {
            setUploadingIds((prev) => {
                const next = new Set(prev);
                next.delete(media.id);
                return next;
            });
            setUploadProgressMap((prev) => {
                const next = new Map(prev);
                next.delete(media.id);
                return next;
            });
            abortControllersRef.current.delete(media.id);
        }
    };

    // Handle file selection - images and videos, one or many.
    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        const maxSize = 500 * 1024 * 1024; // 500MB
        const newMediaFiles: MediaFileItem[] = [];
        const newMediaPreviews: MediaPreviewItem[] = [];

        const fileItems = await Promise.all(Array.from(files).map(async (file) => {
            const isImage = validImageTypes.includes(file.type);
            const isVideo = validVideoTypes.includes(file.type);

            if (!isImage && !isVideo) {
                alert(`${file.name}: Please upload a valid image or video file.`);
                return null;
            }

            if (file.size > maxSize) {
                alert(`${file.name}: File size must be less than 500MB`);
                return null;
            }

            const id = mediaIdCounterRef.current++;
            const type: MediaKind = isImage ? 'image' : 'video';
            const dimensions = type === "video" ? await getVideoDimensions(file).catch(() => undefined) : undefined;

            return { id, file, type, dimensions };
        }));

        fileItems.forEach((item) => {
            if (!item) return;

            newMediaFiles.push(item);
            newMediaPreviews.push({ id: item.id, url: URL.createObjectURL(item.file), type: item.type });
        });

        if (newMediaFiles.length === 0) {
            return;
        }

        setMediaFiles((prev) => [...prev, ...newMediaFiles]);
        setMediaPreviews((prev) => [...prev, ...newMediaPreviews]);
        setUploadError(null);
        newMediaFiles.forEach((media) => {
            void uploadSingleFile(media);
        });
    };

    // Handle file input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        handleFileChange(files);
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        handleFileChange(files);
    };

    // Handle click on upload area
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const removeMediaLocally = (id: number) => {
        const controller = abortControllersRef.current.get(id);
        controller?.abort();
        abortControllersRef.current.delete(id);

        const preview = mediaPreviews.find((value) => value.id === id);
        if (preview) {
            URL.revokeObjectURL(preview.url);
        }

        setMediaFiles((prev) => prev.filter((value) => value.id !== id));
        setMediaPreviews((prev) => prev.filter((value) => value.id !== id));
        setUploadedMedia((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
        setUploadingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setUploadProgressMap((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove media
    const handleRemoveMedia = (preview: MediaPreviewItem) => {
        setMediaPendingRemoval(preview);
    };

    const confirmRemoveMedia = async () => {
        if (!mediaPendingRemoval) return;

        setIsDeletingMedia(true);
        try {
            const uploaded = uploadedMedia.get(mediaPendingRemoval.id);

            if (uploaded) {
                const response = await fetch('/api/uploads', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: uploaded.key,
                        mediaUrl: uploaded.mediaUrl,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => null) as { message?: string } | null;
                    throw new Error(error?.message || 'Failed to remove media from storage.');
                }
            }

            removeMediaLocally(mediaPendingRemoval.id);
            setMediaPendingRemoval(null);
        } catch (error) {
            console.error('Delete media error:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to remove media. Please try again.');
        } finally {
            setIsDeletingMedia(false);
        }
    };

    const handleClearMedia = () => {
        abortControllersRef.current.forEach((controller) => controller.abort());
        abortControllersRef.current.clear();
        mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        setMediaFiles([]);
        setMediaPreviews([]);
        setUploadedMedia(new Map());
        setUploadingIds(new Set());
        setUploadProgressMap(new Map());
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resetComposerForm = () => {
        setCaption('');
        setAccountCaptions({});
        setUseSameCaption(true);
        setStoryPublishMode('feed');
        setSelectedAccounts([]);
        setTikTokConfigs({});
        setYouTubeConfigs({});
        setShowTikTokValidationErrors(false);
        setShowYouTubeValidationErrors(false);
        handleClearMedia();
        setScheduleOption('now');
        setScheduledDateTime(undefined);
        setScheduledTime('');
        setScheduledTimezone(getDefaultTimezone());
    };

    // Handle publish
    const handlePublish = async () => {
        // Validation
        if (mediaFiles.length === 0) {
            setPublishError('Please upload at least one image or video first');
            return;
        }

        if (selectedAccounts.length === 0) {
            setPublishError('Please select at least one account');
            return;
        }

        if (uploadedMedia.size !== mediaFiles.length || uploadingIds.size > 0) {
            setPublishError('Please wait for all media to finish uploading');
            return;
        }

        const selectedTikTokAccounts = accounts.filter(
            acc => selectedAccounts.includes(acc.id) && acc.provider === 'tiktok'
        );
        const selectedYouTubeAccounts = accounts.filter(
            acc => selectedAccounts.includes(acc.id) && acc.provider === 'youtube'
        );
        if (selectedTikTokAccounts.length > 0 || selectedYouTubeAccounts.length > 0) {
            setTikTokConfigs((prev) => {
                const next = { ...prev };
                for (const account of selectedTikTokAccounts) {
                    if (!next[account.id]) {
                        next[account.id] = getDefaultTikTokConfig();
                    }
                }
                return next;
            });
            setYouTubeConfigs((prev) => {
                const next = { ...prev };
                for (const account of selectedYouTubeAccounts) {
                    if (!next[account.id]) {
                        next[account.id] = getDefaultYouTubeConfig(account.id);
                    }
                }
                return next;
            });
            setShowTikTokValidationErrors(false);
            setShowYouTubeValidationErrors(false);
            setShowTikTokModal(true);
            return;
        }

        // Proceed with publishing for non-TikTok accounts
        await publishPost();
    };

    // Actual publish function
    const publishPost = async () => {
        // Validate TikTok Configs if TikTok accounts are selected
        const selectedTikTokAccounts = accounts.filter(
            acc => selectedAccounts.includes(acc.id) && acc.provider === 'tiktok'
        );
        const selectedYouTubeAccounts = accounts.filter(
            acc => selectedAccounts.includes(acc.id) && acc.provider === 'youtube'
        );

        if (selectedTikTokAccounts.length > 0) {
            setShowTikTokValidationErrors(true);
        }
        if (selectedYouTubeAccounts.length > 0) {
            setShowYouTubeValidationErrors(true);
        }

        for (const account of selectedTikTokAccounts) {
            const config = tikTokConfigs[account.id] ?? getDefaultTikTokConfig();

            if (!config.privacy) {
                setPublishError(null);
                return;
            }

            if (config.brandContentToggle) {
                if (!config.isYourBrand && !config.isBrandedContent) {
                    setPublishError(`Please select content disclosure options for TikTok account: ${account.account_name}`);
                    return;
                }
            }

            // Check if user has agreed to terms and conditions
            if (!config.agreedToTerms) {
                setPublishError(`Please agree to TikTok's terms and conditions for account: ${account.account_name}`);
                return;
            }
        }

        for (const account of selectedYouTubeAccounts) {
            const config = youTubeConfigs[account.id] ?? getDefaultYouTubeConfig(account.id);

            if (!config.title.trim()) {
                setPublishError(`Please enter a YouTube video title for account: ${account.account_name}`);
                return;
            }
        }

        setIsPublishing(true);
        setPublishError(null);
        setUploadError(null);
        setShowTikTokValidationErrors(false);
        setShowYouTubeValidationErrors(false);
        setShowTikTokModal(false);

        try {
            // Get selected account details
            const selectedAccountsData = accounts
                .filter(account => selectedAccounts.includes(account.id))
                .map(account => ({
                    provider: account.provider,
                    account_id: account.account_id,
                    id: account.id,
                    caption: getCaptionForAccount(account.id),
                    tiktokConfig: account.provider === 'tiktok' ? (tikTokConfigs[account.id] ?? getDefaultTikTokConfig()) : undefined,
                    platformConfig:
                        account.provider === 'youtube'
                            ? (youTubeConfigs[account.id] ?? getDefaultYouTubeConfig(account.id))
                            : account.provider === 'bluesky'
                                ? getDefaultBlueskyConfig()
                                : undefined,
                }));

            // Handle scheduling
            let scheduledPublishDate: string | undefined;
            let scheduledTimezoneValue: string | undefined;

            if (scheduleOption === 'later') {
                if (!scheduledDateTime || !scheduledTime || !scheduledTimezone) {
                    setPublishError('Please select a date, time, and timezone to schedule the post');
                    setIsPublishing(false);
                    return;
                }

                const date = getScheduledDateInTimezone(scheduledDateTime, scheduledTime, scheduledTimezone);

                // Ensure the scheduled time is in the future
                if (date <= new Date()) {
                    setPublishError('Scheduled time must be in the future');
                    setIsPublishing(false);
                    return;
                }

                scheduledPublishDate = date.toISOString();
                scheduledTimezoneValue = scheduledTimezone;
            }

            const payload = {
                selectedAccounts: selectedAccountsData,
                media: mediaFiles
                    .map((media) => uploadedMedia.get(media.id))
                    .filter((media): media is UploadedMediaItem => Boolean(media))
                    .map(({ mediaUrl, mediaType }) => ({
                        mediaUrl,
                        mediaType,
                })),
                postAsStory,
                storyOnly,
                scheduledPublishDate,
                scheduledTimezone: scheduledTimezoneValue,
            };

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null) as { error?: string; message?: string } | null;
                throw new Error(error?.error || error?.message || 'Failed to publish');
            }

            await response.json().catch(() => null);
            resetComposerForm();
            setShowSuccessDialog(true);
        } catch (error) {
            console.error('Publish error:', error);
            setPublishError(error instanceof Error ? error.message : 'Failed to publish post');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-border bg-background p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Upload images or videos, customize your content and schedule it.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                            1
                        </span>
                        <div>
                            <h2 className="text-xl font-semibold">Upload Media</h2>
                            <p className="text-sm text-muted-foreground">Upload one or more images or videos.</p>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                        onChange={handleInputChange}
                        multiple
                        className="hidden"
                    />

                    <div
                        onClick={handleUploadClick}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`rounded-xl border border-dashed p-8 text-center transition-all cursor-pointer ${
                            isDragging
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-border bg-card hover:bg-muted/40"
                        }`}
                    >
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-base text-foreground">Drag & drop media here</p>
                        <p className="mt-1 text-sm text-muted-foreground">or</p>
                        <Button
                            type="button"
                            className="mt-3 cursor-pointer bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
                        >
                            Upload Media
                        </Button>
                        <p className="mt-4 text-xs text-muted-foreground">JPEG, PNG, GIF, WebP, MP4, MOV, AVI or WebM • Max 500MB each</p>
                    </div>

                    {mediaPreviews.length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-foreground">{mediaPreviews.length} selected</p>
                                <button
                                    type="button"
                                    onClick={handleClearMedia}
                                    disabled={isPublishing}
                                    className="cursor-pointer rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {mediaPreviews.map((preview) => {
                                    const isItemUploading = uploadingIds.has(preview.id);
                                    const progress = uploadProgressMap.get(preview.id) ?? 0;
                                    const isUploaded = uploadedMedia.has(preview.id);

                                    return (
                                        <div key={preview.id} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                                            {preview.type === 'image' ? (
                                                <img src={preview.url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <video src={preview.url} controls className="h-full w-full object-contain">
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedia(preview)}
                                                disabled={isPublishing || isDeletingMedia}
                                                className="absolute right-2 top-2 cursor-pointer rounded-md bg-red-600 p-1.5 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>

                                            {(isItemUploading || isUploaded) && (
                                                <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                                                    {isItemUploading
                                                        ? `Uploading${progress ? ` ${progress}%` : "..."}`
                                                        : "Uploaded"}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {uploadError && (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                            <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3">
                                <p className="text-xs font-medium text-red-300">{uploadError}</p>
                            </div>
                        </div>
                    )}
                                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                                {accountsStep}
                            </span>
                            <h2 className="text-xl font-semibold">Select Accounts</h2>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                            <MediaAccounts
                                accounts={accounts}
                                isLoadingAccounts={isLoadingAccounts}
                                selectedAccounts={selectedAccounts}
                                onToggleAccount={toggleAccount}
                                onSelectAll={handleSelectAll}
                                onDeselectAll={handleDeselectAll}
                                onRetryFetchAccounts={fetchAccounts}
                                showPlatformLogoOnly
                                maxVisibleAccounts={4}
                                disabledAccountIds={disabledAccountIds}
                                getDisabledReason={(account) => {
                                    if (isDisabledForYouTube(account.provider)) {
                                        return "YouTube requires exactly one video and does not support images.";
                                    }

                                    if (isDisabledForMultipleVideos(account.provider)) {
                                        return "Multiple videos are not supported for Facebook, TikTok, or LinkedIn.";
                                    }

                                    return undefined;
                                }}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-base font-semibold">Post destination</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {canPostAsStory
                                        ? `Stories available for ${storyEligibleSelectedAccounts.map((account) => account.account_name).join(", ")}.`
                                        : "Select an Instagram or Facebook account to enable story posting."}
                                </p>
                            </div>
                            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
                                {[
                                    {
                                        id: "feed" as StoryPublishMode,
                                        label: "Feed only",
                                        disabled: false,
                                        title: undefined,
                                    },
                                    {
                                        id: "feed_and_story" as StoryPublishMode,
                                        label: "Feed + Story",
                                        disabled: !canPostAsStory,
                                        title: !canPostAsStory ? "Select an Instagram or Facebook account to enable story posting." : undefined,
                                    },
                                    {
                                        id: "story_only" as StoryPublishMode,
                                        label: "Story only",
                                        disabled: !selectedAccountsAreStoryOnlyEligible,
                                        title: !selectedAccountsAreStoryOnlyEligible
                                            ? "Story only is available when all selected accounts are Instagram or Facebook."
                                            : undefined,
                                    },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        disabled={option.disabled}
                                        title={option.title}
                                        onClick={() => setStoryPublishMode(option.id)}
                                        className={`min-h-10 cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                            storyPublishMode === option.id
                                                ? "border-violet-400 bg-violet-600 text-white"
                                                : "border-border bg-background text-foreground hover:bg-muted"
                                        } disabled:cursor-not-allowed disabled:opacity-45`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {showCaptionSection && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                                        3
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-semibold">Caption</h2>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedAccounts.length === 0
                                                ? "Select accounts to customize caption settings"
                                                : selectedAccounts.length === 1
                                                ? "Writing for 1 selected account"
                                                : `Writing for ${selectedAccounts.length} selected accounts`}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleGenerateCaption}
                                    disabled={isGeneratingCaption || !useSameCaption || !canEditCaption}
                                    className="cursor-pointer border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                                >
                                    {isGeneratingCaption ? (
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border border-violet-200 border-t-transparent" />
                                    ) : (
                                        <Sparkles className="mr-2 h-4 w-4" />
                                    )}
                                    {isGeneratingCaption ? "Generating..." : "AI Generate"}
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Caption mode</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {canUseDifferentCaptions
                                            ? "Use one caption, or customize captions per account."
                                            : "Select at least two accounts to write different captions."}
                                    </p>
                                </div>
                                <div
                                    className={`inline-flex rounded-lg border border-border bg-muted/50 p-1 ${
                                        !canUseDifferentCaptions ? "opacity-50" : ""
                                    }`}
                                >
                                    <button
                                        type="button"
                                        disabled={!canUseDifferentCaptions}
                                        onClick={() => setUseSameCaption(true)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                                            useSameCaption
                                                ? "bg-violet-600 text-white"
                                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                                        }`}
                                    >
                                        Same caption
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canUseDifferentCaptions}
                                        onClick={() => setUseSameCaption(false)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                                            !useSameCaption
                                                ? "bg-violet-600 text-white"
                                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                                        }`}
                                    >
                                        Different captions
                                    </button>
                                </div>
                            </div>

                            {useSameCaption ? (
                                <div className="rounded-xl border border-border bg-card shadow-sm">
                                    <textarea
                                        value={caption}
                                        onChange={(e) => {
                                            setCaption(e.target.value);
                                            setCaptionGenerationError(null);
                                        }}
                                        disabled={!canEditCaption}
                                        placeholder={canEditCaption ? "Write one caption for all selected accounts..." : "Select an account to write a caption..."}
                                        className="min-h-[170px] w-full resize-none rounded-t-xl border-0 bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-55"
                                        maxLength={2200}
                                    />
                                    <div className="flex items-center justify-between border-t border-border px-3 py-2 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            {renderEmojiPicker("shared", !canEditCaption)}
                                            {renderHashtagPicker("shared", !canEditCaption)}
                                            <button
                                                type="button"
                                                disabled={!canEditCaption}
                                                className="cursor-pointer rounded-md p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Text tools"
                                            >
                                                <Type className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs">{caption.length} / 2200</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedAccountObjects.map((account) => {
                                        const accountCaption = getAccountCaption(account.id);

                                        return (
                                            <div key={account.id} className="rounded-xl border border-border bg-card shadow-sm">
                                                <div className="border-b border-border px-4 py-3">
                                                    <p className="text-sm font-semibold text-foreground">{account.account_name}</p>
                                                    <p className="text-xs text-muted-foreground">{account.provider}</p>
                                                </div>
                                                <textarea
                                                    value={accountCaption}
                                                    onChange={(e) => {
                                                        handleAccountCaptionChange(account.id, e.target.value);
                                                        setCaptionGenerationError(null);
                                                    }}
                                                    placeholder={`Write a caption for ${account.account_name}...`}
                                                    className="min-h-[130px] w-full resize-none border-0 bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                                    maxLength={2200}
                                                />
                                                <div className="flex items-center justify-between border-t border-border px-3 py-2 text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        {renderEmojiPicker(account.id)}
                                                        {renderHashtagPicker(account.id)}
                                                        <button
                                                            type="button"
                                                            className="cursor-pointer rounded-md p-2 hover:bg-muted"
                                                            aria-label="Text tools"
                                                        >
                                                            <Type className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs">{accountCaption.length} / 2200</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {captionGenerationError && (
                                <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3">
                                    <p className="text-xs font-medium text-red-300">{captionGenerationError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                                {scheduleStep}
                            </span>
                            <h2 className="text-xl font-semibold">Schedule</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                onClick={() => setScheduleOption("now")}
                                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                                    scheduleOption === "now"
                                        ? "border-violet-500 bg-violet-500/10 shadow-[0_0_0_1px_rgba(139,92,246,0.35)]"
                                        : "border-border bg-card hover:bg-muted/40"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold">Publish Now</p>
                                            <p className="text-sm text-muted-foreground">Your post will go live immediately.</p>
                                        </div>
                                    </div>
                                    <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${scheduleOption === "now" ? "border-violet-300 bg-violet-500 text-white" : "border-border bg-transparent"}`}>
                                        {scheduleOption === "now" && <Check className="h-3.5 w-3.5" />}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => setScheduleOption("later")}
                                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                                    scheduleOption === "later"
                                        ? "border-violet-500 bg-violet-500/10 shadow-[0_0_0_1px_rgba(139,92,246,0.35)]"
                                        : "border-border bg-card hover:bg-muted/40"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold">Schedule for Later</p>
                                            <p className="text-sm text-muted-foreground">Choose a date and time to publish.</p>
                                        </div>
                                    </div>
                                    <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${scheduleOption === "later" ? "border-violet-300 bg-violet-500 text-white" : "border-border bg-transparent"}`}>
                                        {scheduleOption === "later" && <Check className="h-3.5 w-3.5" />}
                                    </span>
                                </div>
                            </button>
                        </div>
                        {scheduleOption === "later" && (
                            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <DateTimePicker
                                    date={scheduledDateTime}
                                    setDate={setScheduledDateTime}
                                    time={scheduledTime}
                                    setTime={setScheduledTime}
                                    timezone={scheduledTimezone}
                                    setTimezone={setScheduledTimezone}
                                />
                            </div>
                        )}
                    </div>

                    {publishError && (
                        <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3">
                            <p className="text-xs font-medium text-red-300">{publishError}</p>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <div />
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || isUploadingMedia || mediaFiles.length === 0 || selectedAccounts.length === 0}
                                className="cursor-pointer rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPublishing
                                    ? scheduleOption === "later"
                                        ? "Scheduling..."
                                        : "Publishing..."
                                    : scheduleOption === "later"
                                      ? "Schedule Post"
                                      : "Publish Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Configuration Modal */}
            {showTikTokModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl m-4">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">Publishing Options</h2>
                            <button
                                onClick={() => {
                                    setShowTikTokValidationErrors(false);
                                    setShowYouTubeValidationErrors(false);
                                    setShowTikTokModal(false);
                                }}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-6">
                            {accounts
                                .filter(acc => selectedAccounts.includes(acc.id) && acc.provider === 'tiktok')
                                .map(account => {
                                    const config = tikTokConfigs[account.id] || getDefaultTikTokConfig();

                                    return (
                                        <div key={account.id} className="space-y-4">
                                            <div className="flex items-center gap-3 pb-3 border-b border-border">
                                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                                    <img
                                                        src={account.profile_picture}
                                                        alt={account.account_name}
                                                        referrerPolicy="no-referrer"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{account.account_name}</p>
                                                    {account.account_username && (
                                                        <p className="text-xs text-muted-foreground">@{account.account_username}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <TikTokPublishConfig
                                                accountId={account.id}
                                                mediaType={mediaFiles.some((media) => media.type === 'video') ? 'video' : 'image'}
                                                value={config}
                                                onChange={(newConfig) => {
                                                    setTikTokConfigs(prev => ({
                                                        ...prev,
                                                        [account.id]: newConfig
                                                    }));
                                                }}
                                                showPrivacyError={showTikTokValidationErrors}
                                            />
                                        </div>
                                    );
                                })}
                            {accounts
                                .filter(acc => selectedAccounts.includes(acc.id) && acc.provider === 'youtube')
                                .map(account => {
                                    const config = youTubeConfigs[account.id] || getDefaultYouTubeConfig(account.id);

                                    return (
                                        <div key={account.id} className="space-y-4">
                                            <div className="flex items-center gap-3 pb-3 border-b border-border">
                                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                                    <img
                                                        src={account.profile_picture}
                                                        alt={account.account_name}
                                                        referrerPolicy="no-referrer"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{account.account_name}</p>
                                                    {account.account_username && (
                                                        <p className="text-xs text-muted-foreground">@{account.account_username}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <YouTubePublishConfig
                                                value={config}
                                                onChange={(newConfig) => {
                                                    setYouTubeConfigs(prev => ({
                                                        ...prev,
                                                        [account.id]: newConfig
                                                    }));
                                                }}
                                                showTitleError={showYouTubeValidationErrors}
                                            />
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowTikTokValidationErrors(false);
                                    setShowYouTubeValidationErrors(false);
                                    setShowTikTokModal(false);
                                }}
                                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={publishPost}
                                disabled={
                                    isPublishing ||
                                    isUploadingMedia ||
                                    accounts
                                        .filter(acc => selectedAccounts.includes(acc.id) && acc.provider === 'tiktok')
                                        .some(acc => {
                                            const config = tikTokConfigs[acc.id];
                                            return !config?.agreedToTerms;
                                        }) ||
                                    accounts
                                        .filter(acc => selectedAccounts.includes(acc.id) && acc.provider === 'youtube')
                                        .some(acc => {
                                            const config = youTubeConfigs[acc.id] ?? getDefaultYouTubeConfig(acc.id);
                                            return !config.title.trim();
                                        })
                                }
                                className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPublishing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        <span>Publish Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <HashtagDialog
                isOpen={showHashtagModal}
                onClose={() => {
                    setShowHashtagModal(false);
                    setActiveHashtagTarget(null);
                }}
                onHashtagsChange={() => undefined}
                onSelectHashtag={(value) => handleHashtagSelect(value)}
                defaultPlatformId={activeHashtagPlatformId}
            />

            {mediaPendingRemoval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
                        <h2 className="text-lg font-semibold text-foreground">Remove media?</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This will remove the media from this post and delete the uploaded file from storage.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setMediaPendingRemoval(null)}
                                disabled={isDeletingMedia}
                                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmRemoveMedia}
                                disabled={isDeletingMedia}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeletingMedia ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PostSuccessDialog
                isOpen={showSuccessDialog}
                onCreateAnother={() => setShowSuccessDialog(false)}
            />
        </div>
    );
}
