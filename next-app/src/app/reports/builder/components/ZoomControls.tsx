"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RotateCcw, Maximize } from "lucide-react";
import { useReportBuilderStore } from "@/store/useReportBuilderStore";
import { cn } from "@/lib/utils";

export function ZoomControls() {
    const zoomLevel = useReportBuilderStore(state => state.zoomLevel);
    const setZoomLevel = useReportBuilderStore(state => state.setZoomLevel);
    const resetZoom = useReportBuilderStore(state => state.resetZoom);

    const handleZoomIn = () => setZoomLevel(zoomLevel + 10);
    const handleZoomOut = () => setZoomLevel(zoomLevel - 10);

    return (
        <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-lg p-1 shadow-xl">
            <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={handleZoomOut}
                title="縮小 (Cmd + 滾輪)"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <div className="px-2 min-w-[3.5rem] text-center">
                <span className="text-xs font-mono text-zinc-300 font-medium">
                    {zoomLevel}%
                </span>
            </div>

            <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={handleZoomIn}
                title="放大 (Cmd + 滾輪)"
            >
                <Plus className="h-4 w-4" />
            </Button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={resetZoom}
                title="重置縮放 (100%)"
            >
                <RotateCcw className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
