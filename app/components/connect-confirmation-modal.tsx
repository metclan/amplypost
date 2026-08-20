"use client";

import { useEffect } from "react";
import Image from "next/image";

interface ConnectConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
}

export default function ConnectConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Connect Account",
    description = "Are you sure you want to connect this account?",
    confirmText = "Continue",
    cancelText = "Cancel",
    icon = "/facebook-logo.svg",
}: ConnectConfirmationModalProps) {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-200">
                {/* Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Image
                        src={icon}
                        alt="Platform Logo"
                        width={24}
                        height={24}
                        className="h-6 w-6"
                    />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                    {title}
                </h3>

                {/* Description */}
                <div className="text-sm text-muted-foreground text-center mb-6">
                    {description}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-white font-medium transition-colors hover:bg-muted active:bg-muted/80 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-medium transition-colors hover:bg-primary/90 active:bg-primary/90 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
