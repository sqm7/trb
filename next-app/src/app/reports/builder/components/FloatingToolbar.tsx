"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Crop, Move3D, Maximize2, Trash2, MousePointer2 } from "lucide-react";
import { useReportBuilderStore, ScaleMode } from "@/store/useReportBuilderStore";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingToolbarProps {
    selectedIds: string[];
    onScaleModeChange: (mode: ScaleMode) => void;
    onDelete: () => void;
}

export function FloatingToolbar({ selectedIds, onScaleModeChange, onDelete }: FloatingToolbarProps) {
    const pages = useReportBuilderStore(state => state.pages);
    const currentPageIndex = useReportBuilderStore(state => state.currentPageIndex);

    if (selectedIds.length === 0) return null;

    // Get the scale mode of the first selected item (or default to 'select')
    const firstSelectedItem = pages[currentPageIndex]?.items.find(item => item.id === selectedIds[0]);
    const currentMode: ScaleMode = firstSelectedItem?.scaleMode || 'select';

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl flex items-center gap-2 ring-1 ring-black/50">
                <div className="text-[10px] text-zinc-500 font-medium px-3 border-r border-white/10 select-none">
                    {selectedIds.length} 選取
                </div>

                <TooltipProvider delayDuration={0}>
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onScaleModeChange('select')}
                                    className={cn(
                                        "h-8 px-3 rounded-full transition-all duration-200",
                                        currentMode === 'select'
                                            ? "bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/50"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <MousePointer2 className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-medium">選取</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-zinc-900 border-white/10">僅選取不進行編輯</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-4 bg-white/10 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onScaleModeChange('crop')}
                                    className={cn(
                                        "h-8 px-3 rounded-full transition-all duration-200",
                                        currentMode === 'crop'
                                            ? "bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 ring-1 ring-violet-500/50"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Crop className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-medium">剪裁</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-zinc-900 border-white/10">內容溢出時自動裁剪</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onScaleModeChange('pan')}
                                    className={cn(
                                        "h-8 px-3 rounded-full transition-all duration-200",
                                        currentMode === 'pan'
                                            ? "bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 ring-1 ring-cyan-500/50"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Move3D className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-medium">平移</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-zinc-900 border-white/10">拖動內容以調整位置</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onScaleModeChange('fit')}
                                    className={cn(
                                        "h-8 px-3 rounded-full transition-all duration-200",
                                        currentMode === 'fit'
                                            ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 ring-1 ring-emerald-500/50"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-medium">縮放</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-zinc-900 border-white/10">自動縮放以填滿容器</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-4 bg-white/10 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onDelete}
                                    className="h-8 px-3 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-zinc-900 border-white/10 text-red-400">刪除選中元件</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
}
