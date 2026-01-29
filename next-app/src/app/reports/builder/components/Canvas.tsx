"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { CanvasItem, useReportBuilderStore } from "@/store/useReportBuilderStore";

interface CanvasProps {
    width: number;
    height: number;
    children: React.ReactNode;
    items: CanvasItem[];
    onClickBackground?: () => void;
    onMarqueeSelect?: (ids: string[], isAdditive: boolean) => void;
}

interface MarqueeState {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isShiftPressed: boolean;
}

function getIntersectingItems(marquee: MarqueeState, items: CanvasItem[]): string[] {
    const minX = Math.min(marquee.startX, marquee.endX);
    const maxX = Math.max(marquee.startX, marquee.endX);
    const minY = Math.min(marquee.startY, marquee.endY);
    const maxY = Math.max(marquee.startY, marquee.endY);

    return items
        .filter(item => {
            const itemRight = item.x + item.width;
            const itemBottom = item.y + item.height;
            // Check if rectangles intersect
            return !(item.x > maxX || itemRight < minX || item.y > maxY || itemBottom < minY);
        })
        .map(item => item.id);
}

export function Canvas({ width, height, children, items, onClickBackground, onMarqueeSelect }: CanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const zoomLevel = useReportBuilderStore(state => state.zoomLevel);
    const setZoomLevel = useReportBuilderStore(state => state.setZoomLevel);
    const [isMarqueeActive, setIsMarqueeActive] = useState(false);
    const [marquee, setMarquee] = useState<MarqueeState | null>(null);

    const scale = zoomLevel / 100;

    // Auto-fit on initial load or ratio change
    React.useEffect(() => {
        const fitToScreen = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const availableWidth = parent.clientWidth - 100;
                    const availableHeight = parent.clientHeight - 100;
                    const scaleX = availableWidth / width;
                    const scaleY = availableHeight / height;
                    const newScale = Math.min(scaleX, scaleY);
                    setZoomLevel(Math.floor(newScale * 100));
                }
            }
        };

        fitToScreen();
    }, [width, height, setZoomLevel]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5;
            setZoomLevel(zoomLevel + delta);
        }
    }, [zoomLevel, setZoomLevel]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Only start marquee if clicking on canvas background or content container (not on chart items)
        const target = e.target as HTMLElement;
        const canvasContent = canvasRef.current?.querySelector('.report-canvas-content');

        // Allow marquee to start if clicking on:
        // 1. The canvas container itself (e.currentTarget)
        // 2. The report-canvas-content div
        // 3. The grid pattern overlay
        // But NOT on draggable chart items (which have react-rnd classes)
        const isClickOnItem = target.closest('.react-draggable') || target.closest('[data-chart-item]');
        const isClickOnCanvasBackground =
            e.target === e.currentTarget ||
            target === canvasContent ||
            target.classList.contains('report-canvas-content') ||
            target.style.backgroundImage?.includes('linear-gradient'); // grid pattern

        if (isClickOnItem) return;
        if (!isClickOnCanvasBackground && !target.closest('.report-canvas-content')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setIsMarqueeActive(true);
        setMarquee({ startX: x, startY: y, endX: x, endY: y, isShiftPressed: e.shiftKey });
    }, [scale]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isMarqueeActive || !marquee) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(width, (e.clientX - rect.left) / scale));
        const y = Math.max(0, Math.min(height, (e.clientY - rect.top) / scale));

        setMarquee(prev => prev ? { ...prev, endX: x, endY: y, isShiftPressed: e.shiftKey } : null);
    }, [isMarqueeActive, marquee, scale, width, height]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (isMarqueeActive && marquee) {
            const selectedIds = getIntersectingItems(marquee, items);
            // If no items selected and just clicked (very small marquee), treat as background click
            const marqueeWidth = Math.abs(marquee.endX - marquee.startX);
            const marqueeHeight = Math.abs(marquee.endY - marquee.startY);
            if (marqueeWidth < 5 && marqueeHeight < 5) {
                onClickBackground?.();
            } else if (selectedIds.length > 0) {
                onMarqueeSelect?.(selectedIds, e.shiftKey || marquee.isShiftPressed);
            } else {
                onClickBackground?.();
            }
        }
        setIsMarqueeActive(false);
        setMarquee(null);
    }, [isMarqueeActive, marquee, items, onClickBackground, onMarqueeSelect]);

    // Calculate marquee box style
    const marqueeStyle = marquee ? {
        left: Math.min(marquee.startX, marquee.endX),
        top: Math.min(marquee.startY, marquee.endY),
        width: Math.abs(marquee.endX - marquee.startX),
        height: Math.abs(marquee.endY - marquee.startY),
    } : null;

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{
                width: width * scale,
                height: height * scale,
            }}
        >
            {/* Scaled Canvas */}
            <div
                ref={canvasRef}
                className={cn(
                    "absolute origin-top-left bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden",
                    "transition-transform duration-200",
                    isMarqueeActive && "cursor-crosshair"
                )}
                style={{
                    width,
                    height,
                    transform: `scale(${scale})`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Content */}
                <div className="relative w-full h-full report-canvas-content">
                    {children}
                </div>

                {/* Marquee Selection Box */}
                {isMarqueeActive && marqueeStyle && (
                    <div
                        className="absolute border-2 border-violet-500 bg-violet-500/20 pointer-events-none z-50"
                        style={marqueeStyle}
                    />
                )}

                {/* Canvas Info Badge */}
                <div className="absolute bottom-2 right-2 text-[10px] text-zinc-600 font-mono bg-zinc-950/80 px-2 py-1 rounded">
                    {width} × {height}
                </div>
            </div>
        </div>
    );
}
