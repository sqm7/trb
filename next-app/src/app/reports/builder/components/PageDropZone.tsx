"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface PageDropZoneProps {
    pageIndex: number;
    isActive: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    onFocus?: () => void;
}

export function PageDropZone({ pageIndex, isActive, children, onClick, onFocus }: PageDropZoneProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `page-drop-${pageIndex}`,
        data: {
            pageIndex,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "relative group outline-none transition-transform duration-200",
                isOver && "scale-[1.02]",
                isActive ? "z-10" : "z-0"
            )}
            data-page-drop-zone="true"
            data-page-index={pageIndex}
            tabIndex={0}
            onFocus={onFocus}
            onClick={onClick}
        >
            {/* Drop Indicator Overlay */}
            {isOver && (
                <div className="absolute inset-0 bg-violet-500/10 border-2 border-violet-500/50 rounded-lg z-50 pointer-events-none animate-pulse" />
            )}
            {children}
        </div>
    );
}
