"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
    const { resolvedTheme, setTheme } = useTheme();
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
