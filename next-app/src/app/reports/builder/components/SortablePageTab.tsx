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
            className={cn(
                "px-2 h-7 rounded text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap group cursor-pointer select-none",
                isActive
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                isDragging && "opacity-50 shadow-lg",
                (isOver || isHoveredGlobally) && !isActive && "ring-2 ring-violet-500 bg-violet-600 text-white shadow-lg scale-110 z-50 origin-bottom"
            )}
            onClick={onClick}
            data-page-drop-target="true"
            data-page-index={index}
        >
            {/* Drag Handle */}
            <span
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 hover:bg-white/10 rounded"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-3 w-3 text-zinc-500" />
            </span>

            {name}

            {canDelete && (
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className={cn(
                        "ml-1 p-0.5 rounded hover:bg-red-500/30 cursor-pointer transition-colors",
                        isActive ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-70"
                    )}
                >
                    <X className="h-3 w-3" />
                </span>
            )}
        </div>
    );
}
