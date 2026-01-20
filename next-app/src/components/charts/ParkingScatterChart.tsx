"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
    id: string;
    label: string; // Project Name
    x: number;
    y: number;
    category?: string; // For coloring (e.g., Price Level)
    details?: any;
}

interface ParkingScatterChartProps {
    data: DataPoint[];
    xLabel: string;
    yLabel: string;
    xUnit?: string;
    yUnit?: string;
    title?: string;
    highlightIds?: string[];
}

export function ParkingScatterChart({ data, xLabel, yLabel, xUnit = "", yUnit = "", title, highlightIds = [] }: ParkingScatterChartProps) {
    const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // 1. Calculate Scales
    const { xMin, xMax, yMin, yMax } = useMemo(() => {
        if (data.length === 0) return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
        const xs = data.map(d => d.x);
        const ys = data.map(d => d.y);

        // Add padding (10%)
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const xPad = (maxX - minX) * 0.1 || 1;
        const yPad = (maxY - minY) * 0.1 || 1;

        return {
            xMin: Math.max(0, minX - xPad),
            xMax: maxX + xPad,
            yMin: Math.max(0, minY - yPad),
            yMax: maxY + yPad
        };
    }, [data]);

    const getPosition = (x: number, y: number) => {
        const xPercent = ((x - xMin) / (xMax - xMin)) * 100;
        const yPercent = 100 - ((y - yMin) / (yMax - yMin)) * 100; // Invert Y for CSS top
        return { left: `${xPercent}%`, top: `${yPercent}%` };
    };

    const handleMouseEnter = (e: React.MouseEvent, point: DataPoint) => {
        setHoveredPoint(point);
    };

    const hasHighlights = highlightIds.length > 0;

    return (
        <div className="w-full h-[400px] relative bg-zinc-900/30 rounded-xl border border-white/5 p-4 select-none">
            {/* Title */}
            {title && <h4 className="absolute top-4 left-4 text-sm font-medium text-zinc-400">{title}</h4>}

            {/* Chart Area */}
            <div className="absolute inset-x-12 inset-y-12">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                        <div key={tick} className="w-full h-px border-t border-dashed border-zinc-500"></div>
                    ))}
                </div>
                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                        <div key={tick} className="h-full w-px border-l border-dashed border-zinc-500"></div>
                    ))}
                </div>

                {/* Data Points */}
                {data.map((point) => {
                    const pos = getPosition(point.x, point.y);
                    const isHovered = hoveredPoint?.id === point.id;
                    const isHighlighted = hasHighlights && highlightIds.includes(point.id);

                    // Determine styling based on state
                    let styles = "bg-cyan-500/60 hover:bg-cyan-400"; // Default
                    let scale = "";
                    let zIndex = "z-10";

                    if (hasHighlights) {
                        if (isHighlighted) {
                            styles = "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]";
                            zIndex = "z-20";
                            scale = "scale-125";
                        } else {
                            styles = "bg-zinc-700/30"; // Muted
                            zIndex = "z-0";
                        }
                    }

                    if (isHovered) {
                        styles = "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] ring-2 ring-white";
                        scale = "scale-150";
                        zIndex = "z-30";
                    }

                    return (
                        <div
                            key={point.id}
                            className={cn(
                                "absolute w-3 h-3 rounded-full cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2",
                                styles,
                                scale
                            )}
                            style={{ left: pos.left, top: pos.top, zIndex }}
                            onMouseEnter={(e) => handleMouseEnter(e, point)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    );
                })}
            </div>

            {/* Axes Labels */}
            {/* Y Axis */}
            <div className="absolute left-0 top-12 bottom-12 w-10 flex flex-col justify-between text-[10px] text-zinc-500 text-right pr-2">
                <span>{Math.round(yMax)}{yUnit}</span>
                <span>{Math.round(yMin)}{yUnit}</span>
            </div>

            {/* X Axis */}
            <div className="absolute left-12 right-12 bottom-4 h-6 flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>{Math.round(xMin)}{xUnit}</span>
                <span>{Math.round(xMax)}{xUnit}</span>
            </div>

            {/* Axes Titles */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-zinc-400 font-bold">{xLabel}</div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-zinc-400 font-bold">{yLabel}</div>

            {/* Tooltip (Floating) */}
            {hoveredPoint && (
                <div className="absolute z-30 pointer-events-none" style={getPosition(hoveredPoint.x, hoveredPoint.y)}>
                    <div className="relative bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950/90 border border-cyan-500/30 rounded-lg p-3 shadow-xl backdrop-blur-md w-48 animate-in zoom-in-95 fade-in duration-200">
                        <div className="text-sm font-bold text-white mb-1">{hoveredPoint.label}</div>
                        <div className="space-y-1 text-xs text-zinc-400">
                            <div className="flex justify-between">
                                <span>{xLabel}:</span>
                                <span className="text-cyan-400 font-mono">{hoveredPoint.x.toLocaleString()} {xUnit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{yLabel}:</span>
                                <span className="text-cyan-400 font-mono">{hoveredPoint.y.toLocaleString()} {yUnit}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
