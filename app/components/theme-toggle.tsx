"use client";

import { Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ThemeToggleProps = {
    showLabel?: boolean;
    variant?: "button" | "segmented";
};

export default function ThemeToggle({ showLabel = true, variant = "button" }: ThemeToggleProps) {
    const { resolvedTheme, setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted && variant !== "segmented") {
        return (
            <Button
                type="button"
                variant="outline"
                size={showLabel ? "default" : "icon"}
                className={showLabel ? "w-full justify-start rounded-xl px-4" : "rounded-lg"}
                aria-label="Toggle theme"
                disabled
            >
                <Sun className="h-4 w-4 opacity-0" />
                {showLabel && <span className="opacity-0">Theme</span>}
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";
    const label = isDark ? "Light mode" : "Dark mode";

    if (variant === "segmented") {
        const activeTheme = mounted ? theme || "system" : "system";
        const displayLabel = mounted && resolvedTheme === "light" ? "Light mode" : "Dark mode";
        const DisplayIcon = mounted && resolvedTheme === "light" ? Sun : Moon;
        const options = [
            { value: "system", label: "Use system theme", icon: SlidersHorizontal },
            { value: "dark", label: "Use dark mode", icon: Moon },
            { value: "light", label: "Use light mode", icon: Sun },
        ];

        return (
            <div
                className={
                    showLabel
                        ? "flex h-12 w-full items-center justify-between gap-3 rounded-2xl px-4"
                        : ""
                }
                suppressHydrationWarning
            >
                {showLabel && (
                    <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                        <DisplayIcon className="h-5 w-5 shrink-0" />
                        <span className="truncate text-sm font-medium">{displayLabel}</span>
                    </div>
                )}
                <div className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full bg-muted p-1 text-muted-foreground">
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isActive = activeTheme === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setTheme(option.value)}
                                aria-label={option.label}
                                title={option.label}
                                aria-pressed={isActive}
                                className={[
                                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition",
                                    isActive
                                        ? "border border-border bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                                ].join(" ")}
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <Button
            type="button"
            variant="outline"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            size={showLabel ? "default" : "icon"}
            className={showLabel ? "w-full justify-start rounded-xl px-4" : "rounded-lg"}
            suppressHydrationWarning
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {showLabel && <span>{label}</span>}
        </Button>
    );
}
