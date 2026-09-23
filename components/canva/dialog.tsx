"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvaIcon } from "./connection";
export function CanvaDialog({ onClose, children }: { onClose: () => void; children: ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current!;
        const bodyOverflow = document.body.style.overflow;
        const rootOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        dialog.showModal();
        return () => {
            dialog.close();
            document.body.style.overflow = bodyOverflow;
            document.documentElement.style.overflow = rootOverflow;
        };
    }, []);
    return <dialog ref={ref} aria-labelledby="canva-picker-title" onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto h-[90dvh] max-h-[900px] w-[min(1040px,95vw)] max-w-none overflow-hidden rounded-3xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed dark:[&_button]:text-white">
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3"><CanvaIcon /><div><h2 id="canva-picker-title" className="text-lg font-semibold tracking-tight sm:text-xl">Choose from Canva</h2><p className="text-sm text-muted-foreground">Bring your designs into your post.</p></div></div>
                <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="Close Canva picker" onClick={onClose}><X className="size-5" /></Button>
            </header>
            {children}
        </div>
    </dialog>;
}
