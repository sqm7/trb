"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { useReportBuilderStore } from "@/store/useReportBuilderStore";

interface SortablePageTabProps {
    id: string;
    name: string;
    index: number;
    isActive: boolean;
    canDelete: boolean;
    onClick: () => void;
    onDelete: () => void;
}

export function SortablePageTab({
    id,
    name,
    index,
    isActive,
    canDelete,
    onClick,
    onDelete,
}: SortablePageTabProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    // Make the tab a drop target for items
    const { isOver, setNodeRef: setDropRef } = useDroppable({
        id: `page-drop-${index}`,
        data: { type: 'page-tab', pageIndex: index },
    });

    const hoveredPageIndex = useReportBuilderStore(state => state.hoveredPageIndex);
    const isHoveredGlobally = hoveredPageIndex === index;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                setDropRef(node);
            }}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "px-3 h-8 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap group cursor-grab active:cursor-grabbing select-none border border-transparent shadow-sm",
                isActive
                    ? "bg-violet-600 text-white border-violet-400/30 shadow-violet-500/20"
                    : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-zinc-100 hover:border-white/10",
                isDragging && "opacity-50 shadow-2xl z-50 scale-105",
                (isOver || isHoveredGlobally) && !isActive && "ring-2 ring-violet-500 bg-violet-600 text-white shadow-lg scale-110 z-50 origin-bottom"
            )}
            onClick={(e) => {
                // Prevent switching page if we were just dragging
                if (!isDragging) {
                    onClick();
                }
            }}
            data-page-drop-target="true"
            data-page-index={index}
        >
            <GripVertical className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />

            <span className="truncate max-w-[100px]">{name}</span>

            {canDelete && (
                <button
                    onPointerDown={(e) => {
                        e.stopPropagation(); // Prevent drag from starting when clicking X
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className={cn(
                        "ml-auto p-1 rounded-md hover:bg-red-500/30 text-zinc-500 hover:text-red-400 transition-all focus:outline-none",
                        isActive ? "opacity-70" : "opacity-0 group-hover:opacity-100"
                    )}
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
