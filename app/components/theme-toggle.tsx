"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
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
