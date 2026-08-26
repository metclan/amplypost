"use client";

import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { backendApiUrl } from "@/util/backend-api";

export type TikTokPrivacy = 'FOLLOWER_OF_CREATOR' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';

// Tooltip Component
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg whitespace-nowrap shadow-lg">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export interface TikTokConfigState {
    privacy?: TikTokPrivacy;
    allowComments: boolean;
    allowDuet: boolean;
    allowStitch: boolean;
    isAIGC: boolean;
    brandContentToggle: boolean;
    isYourBrand: boolean;
    isBrandedContent: boolean;
    title?: string;
    autoAddMusic: boolean;
    draftPost: boolean;
    agreedToTerms: boolean;
}

interface TikTokPublishConfigProps {
    accountId: string;
    mediaType: 'image' | 'video';
    value: TikTokConfigState;
    onChange: (value: TikTokConfigState) => void;
    showPrivacyError?: boolean;
}

export default function TikTokPublishConfig({
    accountId,
    mediaType,
    value,
    onChange,
    showPrivacyError = false
}: TikTokPublishConfigProps) {
    const [fetchedConfig, setFetchedConfig] = useState<{
        privacy_level_options?: string[];
        comment_disabled?: boolean;
        duet_disabled?: boolean;
        stitch_disabled?: boolean;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!accountId) return;
            setIsLoading(true);
            try {
                const res = await fetch(backendApiUrl(`tiktok/${accountId}`));
                if (res.ok) {
                    const data = await res.json();
                    setFetchedConfig(data);
                }
            } catch (error) {
                console.error("Failed to fetch TikTok config:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, [accountId]);

    useEffect(() => {
        if (!fetchedConfig) return;

        const enforcedUpdates: Partial<TikTokConfigState> = {};

        if (fetchedConfig.comment_disabled && value.allowComments) {
            enforcedUpdates.allowComments = false;
        }
        if (fetchedConfig.duet_disabled && value.allowDuet) {
            enforcedUpdates.allowDuet = false;
        }
        if (fetchedConfig.stitch_disabled && value.allowStitch) {
            enforcedUpdates.allowStitch = false;
        }

        if (Object.keys(enforcedUpdates).length > 0) {
            onChange({ ...value, ...enforcedUpdates });
        }
    }, [fetchedConfig, onChange, value]);

    // Helper to update partial state
    const updateState = (updates: Partial<TikTokConfigState>) => {
        const newState = { ...value, ...updates };

        // Privacy Management Implementation:
        // If checking 'isBrandedContent', auto-switch from private to public
        if (updates.isBrandedContent === true) {
            if (newState.privacy === 'SELF_ONLY') {
                newState.privacy = 'FOLLOWER_OF_CREATOR';
            }
        }

        onChange(newState);
    };

    const isBrandedContentActive = value.isBrandedContent;
    // Map privacy options from API to display names
    const getPrivacyLabel = (option: string): string => {
        switch (option) {
            case 'PUBLIC_TO_EVERYONE':
                return 'Follower of Creator';
            case 'MUTUAL_FOLLOW_FRIENDS':
                return 'Mutual Follow Friends';
            case 'SELF_ONLY':
                return 'Self Only';
            default:
                return option;
        }
    };

    // Get available privacy options from API or use defaults, filtering out PUBLIC_TO_EVERYONE
    const rawPrivacyOptions = fetchedConfig?.privacy_level_options || [
        'PUBLIC_TO_EVERYONE',
        'MUTUAL_FOLLOW_FRIENDS',
        'SELF_ONLY'
    ];

    // Filter to only include the three allowed options
    const availablePrivacyOptions = rawPrivacyOptions.filter(
        (option): option is TikTokPrivacy =>
            option === 'PUBLIC_TO_EVERYONE' ||
            option === 'MUTUAL_FOLLOW_FRIENDS' ||
            option === 'SELF_ONLY'
    );

    // Determine the agreement text based on commercial content selection
    const getAgreementText = () => {
        const hasBrandedContent = value.isBrandedContent;

        if (hasBrandedContent) {
            return (
                <>
                    By posting, you agree to TikTok's{' '}
                    <a
                        href="https://www.tiktok.com/legal/page/global/bc-policy/en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-destructive hover:underline"
                    >
                        Branded Content Policy
                    </a>
                    {' '}and{' '}
                    <a
                        href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-destructive hover:underline"
                    >
                        Music Usage Confirmation
                    </a>
                    .
                </>
            );
        }

        // Default - no branded content
        return (
            <>
                By posting, you agree to TikTok's{' '}
                <a
                    href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-destructive hover:underline"
                >
                    Music Usage Confirmation
                </a>
                .
            </>
        );
    };

    // Get commercial content warning label
    const getCommercialContentLabel = () => {
        if (value.isYourBrand && !value.isBrandedContent) {
            return `Your ${mediaType === 'image' ? 'photo' : 'video'} will be labeled as 'Promotional content'. This cannot be changed once your video is posted.`;
        } else if (value.isBrandedContent) {
            return `Your ${mediaType === 'image' ? 'photo' : 'video'} will be labeled as 'Paid partnership'. This cannot be changed once your video is posted.`;
        }
        return null;
    };

    return (
        <div className="mt-4 space-y-4 p-4 rounded-xl bg-muted/30 border border-border">
            {/* Privacy Level */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Privacy Level
                    <span className="text-destructive">*</span>
                </label>
                <Select
                    value={value.privacy || ""}
                    onValueChange={(val) => updateState({ privacy: val as TikTokPrivacy })}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select privacy level..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availablePrivacyOptions.map((option) => (
                            <SelectItem
                                key={option}
                                value={option}
                                disabled={option === 'SELF_ONLY' && isBrandedContentActive}
                            >
                                {getPrivacyLabel(option)}
                                {option === 'SELF_ONLY' && isBrandedContentActive && ' (Not available for Branded Content)'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {value.privacy === 'SELF_ONLY' && isBrandedContentActive && (
                    <p className="text-xs text-amber-500">
                        Branded content visibility cannot be set to private.
                    </p>
                )}
                {showPrivacyError && !value.privacy && (
                    <p className="text-xs text-destructive">
                        Please select a privacy level to continue.
                    </p>
                )}
            </div>

            {/* Additional Settings */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Additional Settings</h3>

                <div className="space-y-3">
                    {/* Allow Duet - Only for videos */}
                    {mediaType === 'video' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground">Allow Duet</span>
                                <Tooltip text="Allow others to create duets with your video">
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>
                            <button
                                type="button"
                                onClick={() => updateState({ allowDuet: !value.allowDuet })}
                                disabled={fetchedConfig?.duet_disabled}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${value.allowDuet ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.allowDuet ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    )}

                    {/* Allow Comments */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">Allow Comments</span>
                            <Tooltip text="Allow others to comment on your post">
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateState({ allowComments: !value.allowComments })}
                            disabled={fetchedConfig?.comment_disabled}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${value.allowComments ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.allowComments ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Allow Stitch - Only for videos */}
                    {mediaType === 'video' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground">Allow Stitch</span>
                                <Tooltip text="Allow others to stitch your video">
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>
                            <button
                                type="button"
                                onClick={() => updateState({ allowStitch: !value.allowStitch })}
                                disabled={fetchedConfig?.stitch_disabled}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${value.allowStitch ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.allowStitch ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    )}

                    {/* Auto Add Music */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">Auto Add Music</span>
                            <Tooltip text="Automatically add music to your post">
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateState({ autoAddMusic: !value.autoAddMusic })}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value.autoAddMusic ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.autoAddMusic ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Draft Post */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">Draft Post</span>
                            <Tooltip text="Send this post as a draft to your phone (it will appear in your inbox)">
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateState({ draftPost: !value.draftPost })}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value.draftPost ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.draftPost ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {fetchedConfig && (fetchedConfig.comment_disabled || fetchedConfig.duet_disabled || fetchedConfig.stitch_disabled) && (
                    <p className="text-xs text-amber-500">
                        Some interaction settings are disabled by your TikTok account privacy settings.
                    </p>
                )}
            </div>

            {/* AI Generated Content */}
            <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-sm font-semibold text-foreground">AI Generated Content</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">This content is AI-generated</span>
                        <Tooltip text="Turn on if your video or image was created or significantly edited using AI">
                            <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateState({ isAIGC: !value.isAIGC })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value.isAIGC ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.isAIGC ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Commercial Content Disclosure */}
            <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-foreground">Commercial Content</div>
                        <div className="text-xs text-muted-foreground">
                            Does this content promote yourself, a brand, product or service?
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const newToggle = !value.brandContentToggle;
                            updateState({
                                brandContentToggle: newToggle,
                                // Reset sub-options if toggled off
                                ...(newToggle ? {} : { isYourBrand: false, isBrandedContent: false })
                            });
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value.brandContentToggle ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value.brandContentToggle ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {value.brandContentToggle && (
                    <div className="space-y-3 pl-2 border-l-2 border-border animate-in fade-in slide-in-from-top-2">
                        {/* Your Brand */}
                        <div className="space-y-1">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value.isYourBrand}
                                    onChange={(e) => {
                                        updateState({
                                            isYourBrand: e.target.checked
                                        });
                                    }}
                                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-foreground">Your brand</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        You are promoting yourself or your own business. This content will be classified as Brand Organic.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Branded Content */}
                        <div className="space-y-1">
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={value.isBrandedContent}
                                    disabled={value.privacy === 'SELF_ONLY'}
                                    onChange={(e) => {
                                        updateState({
                                            isBrandedContent: e.target.checked
                                        });
                                    }}
                                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex-1">
                                    <span className={`text-sm font-medium text-foreground ${value.privacy === 'SELF_ONLY' ? 'opacity-50' : ''}`}>
                                        Branded content
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        You are promoting another brand or a third party. This content will be classified as Branded Content.
                                    </p>
                                    {value.privacy === 'SELF_ONLY' && (
                                        <p className="text-xs text-destructive mt-1">
                                            Branded content visibility cannot be set to private.
                                        </p>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Commercial Content Warning Label */}
                        {getCommercialContentLabel() && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs text-amber-700">
                                    {getCommercialContentLabel()}
                                </p>
                            </div>
                        )}

                        {/* Notification when toggle is on but no option selected */}
                        {!value.isYourBrand && !value.isBrandedContent && (
                            <p className="text-xs text-amber-500 italic">
                                You need to indicate if your content promotes yourself, a third party, or both.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2 border-t border-border">
                <label className="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value.agreedToTerms}
                        onChange={(e) => updateState({ agreedToTerms: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="text-xs text-muted-foreground">
                        {getAgreementText()}
                    </div>
                </label>
            </div>
        </div>
    );
}
