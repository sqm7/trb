import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFilterStore } from "@/store/useFilterStore";
import { cn } from "@/lib/utils";

interface ReportFilterPortalProps {
    children: React.ReactNode;
    stickyContainerClassName?: string;
}

export function ReportFilterPortal({ children, stickyContainerClassName }: ReportFilterPortalProps) {
    const isCompact = useFilterStore((state) => state.isFilterBarCompact);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. If compact mode is active, portal the children to the toolbar
    if (mounted && isCompact) {
        const portalTarget = document.getElementById("compact-filter-portal");
        if (portalTarget) {
            return createPortal(
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    {children}
                </div>,
                portalTarget
            );
        }
    }

    // 2. Otherwise, render normally in the sticky container
    return (
        <div className={cn(
            "sticky top-[64px] z-30 transition-all duration-300",
            stickyContainerClassName
        )}>
            {children}
        </div>
    );
}
