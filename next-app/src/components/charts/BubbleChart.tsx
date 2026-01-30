"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TransactionDetail {
    "房屋單價(萬)": number;
    "房屋面積(坪)": number;
    [key: string]: any;
}

interface BubbleChartProps {
    data: TransactionDetail[];
    minPrice: number;
    maxPrice: number;
    interval: number;
    sizeMetric: "count" | "area";
    onMinPriceChange: (val: number) => void;
    onMaxPriceChange: (val: number) => void;
    onIntervalChange: (val: number) => void;
    onSizeMetricChange: (val: "count" | "area") => void;
}

type DisplayMode = "coordinate" | "natural";

// --- Physics Hook for Zero Gravity Mode ---
interface Node {
    id: string;
    value: number;
    radius: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    origIndex: number; // for color mapping
}

const useGravitySimulation = (
    buckets: any[],
    width: number,
    height: number,
    metric: "count" | "area",
    maxValue: number,
    isPlaying: boolean
) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const animationRef = useRef<number | null>(null);
    const dragRef = useRef<{ id: string, startX: number, startY: number, nodeOrigX: number, nodeOrigY: number } | null>(null);
    const mouseRef = useRef<{ x: number, y: number } | null>(null);

    // Initialize Nodes with Phyllotaxis Spiral (Sorted by Size: Small -> Large)
    useEffect(() => {
        if (!buckets.length || !width || !height) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const spacing = 10; // Reduce base spacing

        // 1. Create Nodes (unchanged)
        let initialNodes = buckets.map((b, i) => {
            const value = metric === 'count' ? b.count : b.totalArea;
            // Base radius calculation - Slightly reduce scaling factor for tighter packing if needed, 
            // but for now let's just adjust position
            const radius = maxValue > 0 ? 30 + (value / maxValue) * 80 : 30; // Slightly smaller base/max size
            return {
                id: b.label,
                value,
                radius: radius / 2, // effective visual radius
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                origIndex: i
            };
        });

        // 2. Sort by Value (Smallest First) for Center placement
        initialNodes.sort((a, b) => a.value - b.value);

        // 3. Assign Spiral Positions (Packed Tighter)
        initialNodes = initialNodes.map((node, i) => {
            const angle = i * 2.39996; // 137.5 deg
            // Dist formula: c * sqrt(n)
            // Reduced multiplier substantially to pack them closer
            const dist = spacing * Math.sqrt(i) * 2.5;
            return {
                ...node,
                x: centerX + Math.cos(angle) * dist,
                y: centerY + Math.sin(angle) * dist
            };
        });

        // 4. Pre-warm Physics (Run synchronously to disperse overlaps immediately)
        // This prevents the "exploding" look and starts in a settled state
        const preWarmIterations = 120;
        for (let k = 0; k < preWarmIterations; k++) {
            for (let i = 0; i < initialNodes.length; i++) {
                for (let j = i + 1; j < initialNodes.length; j++) {
                    const n1 = initialNodes[i];
                    const n2 = initialNodes[j];
                    const dx = n2.x - n1.x;
                    const dy = n2.y - n1.y;
                    const distSq = dx * dx + dy * dy;
                    const radSum = n1.radius + n2.radius + 5; // Padding same as main loop

                    if (distSq < radSum * radSum && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const overlap = radSum - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const separation = overlap * 0.5;

                        n1.x -= nx * separation;
                        n1.y -= ny * separation;
                        n2.x += nx * separation;
                        n2.y += ny * separation;
                    }
                }
            }
        }

        setNodes(initialNodes);
    }, [buckets, width, height, metric, maxValue]);

    // Handle Global Mouse Events for Dragging
    useEffect(() => {
        if (!isPlaying) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleGlobalMouseUp = () => {
            dragRef.current = null;
            mouseRef.current = null;
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isPlaying]);

    // Physics Loop
    useEffect(() => {
        if (!isPlaying || nodes.length === 0 || !width) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const strength = 0.05;
        const iterations = 6;

        const tick = () => {
            setNodes(prevNodes => {
                const nextNodes = prevNodes.map(n => ({ ...n }));

                let dragDeltaX = 0;
                let dragDeltaY = 0;
                let targetX = 0;
                let targetY = 0;

                if (dragRef.current && mouseRef.current) {
                    dragDeltaX = mouseRef.current.x - dragRef.current.startX;
                    dragDeltaY = mouseRef.current.y - dragRef.current.startY;
                    targetX = dragRef.current.nodeOrigX + dragDeltaX;
                    targetY = dragRef.current.nodeOrigY + dragDeltaY;
                }

                nextNodes.forEach(node => {
                    const isDragging = dragRef.current?.id === node.id;

                    if (isDragging) {
                        // Dragged node follows mouse perfectly
                        node.x = targetX;
                        node.y = targetY;
                        node.vx = 0;
                        node.vy = 0;
                    } else {
                        // Standard Physics
                        const dx = centerX - node.x;
                        const dy = centerY - node.y;

                        // Centering Force
                        node.vx += dx * strength * 0.05;
                        node.vy += dy * strength * 0.05;

                        // Ambient Turbulence (Floating Effect)
                        // Tuned Down: 0.003 (was 0.02) to prevent "spinning"
                        const randomForce = 0.003;
                        node.vx += (Math.random() - 0.5) * randomForce;
                        node.vy += (Math.random() - 0.5) * randomForce;

                        // Apply Velocity
                        node.x += node.vx;
                        node.y += node.vy;

                        // Damping (Friction)
                        // Increased to 0.94 (was 0.96) to reduce jitter energy
                        node.vx *= 0.94;
                        node.vy *= 0.94;
                    }
                });

                // Resolve Collisions
                for (let k = 0; k < iterations; k++) {
                    for (let i = 0; i < nextNodes.length; i++) {
                        for (let j = i + 1; j < nextNodes.length; j++) {
                            const n1 = nextNodes[i];
                            const n2 = nextNodes[j];

                            const isDragging1 = dragRef.current?.id === n1.id;
                            const isDragging2 = dragRef.current?.id === n2.id;

                            const dx = n2.x - n1.x;
                            const dy = n2.y - n1.y;
                            const distSq = dx * dx + dy * dy;
                            const radSum = n1.radius + n2.radius + 5;

                            if (distSq < radSum * radSum && distSq > 0) {
                                const dist = Math.sqrt(distSq);
                                const overlap = radSum - dist;
                                const nx = dx / dist;
                                const ny = dy / dist;
                                const separation = overlap * 0.5;

                                if (isDragging1) {
                                    // Move only n2
                                    n2.x += nx * overlap;
                                    n2.y += ny * overlap;
                                } else if (isDragging2) {
                                    // Move only n1
                                    n1.x -= nx * overlap;
                                    n1.y -= ny * overlap;
                                } else {
                                    // Move both
                                    n1.x -= nx * separation;
                                    n1.y -= ny * separation;
                                    n2.x += nx * separation;
                                    n2.y += ny * separation;
                                }
                            }
                        }
                    }
                }

                return nextNodes;
            });

            animationRef.current = requestAnimationFrame(tick);
        };

        animationRef.current = requestAnimationFrame(tick);

        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, width, height, nodes.length]);

    const onMouseDown = (e: React.MouseEvent, id: string, nodeX: number, nodeY: number) => {
        e.preventDefault(); // Prevent text selection
        dragRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            nodeOrigX: nodeX,
            nodeOrigY: nodeY
        };
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    return { nodes, onMouseDown, dragId: dragRef.current?.id };
};

// Portal Tooltip Component
const TooltipPortal = ({ children, x, y, visible }: { children: React.ReactNode, x: number, y: number, visible: boolean }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !visible) return null;

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed pointer-events-none z-[9999]"
            style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -100%) translateY(-12px)'
            }}
        >
            {children}
        </div>,
        document.body
    );
};

export function BubbleChart({
    data,
    minPrice,
    maxPrice,
    interval,
    sizeMetric,
    onMinPriceChange,
    onMaxPriceChange,
    onIntervalChange,
    onSizeMetricChange
}: BubbleChartProps) {
    const [displayMode, setDisplayMode] = useState<DisplayMode>("natural");
    const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Measure Container for Physics
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        const updateDim = () => {
            if (containerRef.current) {
                // We use a slight delay or just raw client dimensions
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        updateDim();
        window.addEventListener('resize', updateDim);

        // Safety check to ensure dimension is captured if initial render is 0
        const timer = setTimeout(updateDim, 200);

        return () => {
            window.removeEventListener('resize', updateDim);
            clearTimeout(timer);
        };
    }, []);

    const handleMouseEnter = (e: React.MouseEvent, index: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top
        });
        setHoveredBucket(index);
    };

    const { buckets, validBuckets, maxValue } = useMemo(() => {
        if (!data || data.length === 0) return { buckets: [], validBuckets: [], maxValue: 0 };

        const buckets: any[] = [];
        for (let i = minPrice; i < maxPrice; i += interval) {
            buckets.push({
                min: i,
                max: Math.min(i + interval, maxPrice),
                label: `${i}-${Math.min(i + interval, maxPrice)}`,
                count: 0,
                totalArea: 0,
                avgPrice: 0,
                transactions: []
            });
        }

        data.forEach(tx => {
            const unitPrice = tx["房屋單價(萬)"];
            const area = tx["房屋面積(坪)"] || 0;
            if (typeof unitPrice !== 'number' || unitPrice < minPrice || unitPrice >= maxPrice) return;

            const bucketIndex = Math.floor((unitPrice - minPrice) / interval);
            if (bucketIndex >= 0 && bucketIndex < buckets.length) {
                buckets[bucketIndex].count++;
                buckets[bucketIndex].totalArea += area;
                buckets[bucketIndex].transactions.push(tx);
            }
        });

        const validBuckets = buckets.filter(b => b.count > 0);
        const maxValue = Math.max(...validBuckets.map(b => sizeMetric === 'count' ? b.count : b.totalArea));

        return { buckets, validBuckets, maxValue };
    }, [data, minPrice, maxPrice, interval, sizeMetric]);


    // Run Simulation
    const { nodes, onMouseDown, dragId } = useGravitySimulation(
        validBuckets,
        dimensions.width,
        dimensions.height,
        sizeMetric,
        maxValue,
        displayMode === 'natural'
    );

    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無交易資料可顯示</div>;
    }

    const getBubbleSize = (value: number) => {
        if (maxValue === 0) return 40;
        return 40 + (value / maxValue) * 100;
    };

    const getBubbleStyle = (index: number, total: number) => {
        const progress = index / (total - 1 || 1);
        let background;
        let shadowColor;

        if (progress < 0.33) {
            background = `radial-gradient(circle at 30% 30%, rgb(167, 139, 250), rgb(124, 58, 237))`;
            shadowColor = 'rgba(124, 58, 237, 0.4)';
        } else if (progress < 0.66) {
            background = `radial-gradient(circle at 30% 30%, rgb(34, 211, 238), rgb(8, 145, 178))`;
            shadowColor = 'rgba(8, 145, 178, 0.4)';
        } else {
            background = `radial-gradient(circle at 30% 30%, rgb(52, 211, 153), rgb(5, 150, 105))`;
            shadowColor = 'rgba(5, 150, 105, 0.4)';
        }
        return { background, shadowColor };
    };

    const currentHoveredBucketData = hoveredBucket !== null ? validBuckets[hoveredBucket] : null;

    return (
        <div className="space-y-6">
            {/* Global Tooltip: Only show if NOT dragging */}
            <TooltipPortal x={tooltipPos.x} y={tooltipPos.y} visible={hoveredBucket !== null && !!currentHoveredBucketData && !dragId}>
                {currentHoveredBucketData && (
                    <div className="px-4 py-3 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-400">成交單價</span>
                            <span className="text-sm font-bold text-white">{currentHoveredBucketData.label}</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">成交筆數</span>
                                <span className="font-medium text-violet-300">{currentHoveredBucketData.count} 筆</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">總銷坪數</span>
                                <span className="font-medium text-cyan-300">{Math.round(currentHoveredBucketData.totalArea)} 坪</span>
                            </div>
                        </div>
                        <div className="absolute left-1/2 bottom-0 -mb-1 w-2 h-2 bg-zinc-900/90 border-r border-b border-white/10 rotate-45 -translate-x-1/2"></div>
                    </div>
                )}
            </TooltipPortal>

            {/* Header Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-900/30 border border-white/5 rounded-xl">
                {/* Left: Data Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-xs">單價範圍</span>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                value={minPrice}
                                onChange={e => onMinPriceChange(Number(e.target.value))}
                                className="w-16 h-7 text-xs bg-zinc-950/50 border-white/10 px-2"
                            />
                            <span className="text-zinc-600">-</span>
                            <Input
                                type="number"
                                value={maxPrice}
                                onChange={e => onMaxPriceChange(Number(e.target.value))}
                                className="w-16 h-7 text-xs bg-zinc-950/50 border-white/10 px-2"
                            />
                        </div>
                    </div>

                    {/* Interval */}
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-xs">級距</span>
                        <Input
                            type="number"
                            value={interval}
                            onChange={e => onIntervalChange(Number(e.target.value))}
                            className="w-14 h-7 text-xs bg-zinc-950/50 border-white/10 px-2"
                        />
                    </div>

                    {/* Metric Toggle */}
                    <div className="flex bg-zinc-950/50 rounded-md p-0.5 border border-white/10">
                        <button
                            onClick={() => onSizeMetricChange('count')}
                            className={cn(
                                "px-2.5 py-1 text-[10px] rounded transition-colors",
                                sizeMetric === 'count' ? "bg-violet-500 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            成交筆數
                        </button>
                        <button
                            onClick={() => onSizeMetricChange('area')}
                            className={cn(
                                "px-2.5 py-1 text-[10px] rounded transition-colors",
                                sizeMetric === 'area' ? "bg-violet-500 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            總銷坪數
                        </button>
                    </div>
                </div>

                {/* Right: Mode Toggle */}
                <div className="bg-zinc-950/50 p-1 rounded-lg border border-white/5 flex gap-1">
                    <button
                        onClick={() => setDisplayMode('natural')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300",
                            displayMode === 'natural'
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <span className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className={cn("absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75", displayMode === 'natural' && "animate-ping")}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            無重力模式
                        </span>
                    </button>
                    <button
                        onClick={() => setDisplayMode('coordinate')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300",
                            displayMode === 'coordinate'
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3v18h18" />
                                <path d="M18 17V9" />
                                <path d="M13 17V5" />
                                <path d="M8 17v-3" />
                            </svg>
                            座標模式
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Viz Container */}
            <div
                ref={containerRef}
                className={cn(
                    "relative rounded-3xl overflow-hidden border border-white/5 transition-all duration-500",
                    "bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950",
                    "h-full min-h-[500px]"
                )}
            >
                {/* Background Ambient Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px]"></div>
                </div>

                {/* Content Area */}
                <div className="relative w-full h-full min-h-[300px]">

                    {/* Natural Mode: Physics Simulation */}
                    {displayMode === 'natural' && (
                        <div className="absolute inset-0">
                            {nodes.map((node, i) => {
                                const isHovered = hoveredBucket === node.origIndex;
                                const isDragged = dragId === node.id;
                                const style = getBubbleStyle(node.origIndex, validBuckets.length);
                                const size = node.radius * 2;

                                return (
                                    <div
                                        key={node.id}
                                        className={cn(
                                            "absolute block rounded-full select-none cursor-grab active:cursor-grabbing will-change-transform",
                                            isDragged ? "z-[100] scale-110 shadow-2xl" : "transition-[transform,box-shadow] duration-75 ease-linear"
                                        )}
                                        style={{
                                            width: size,
                                            height: size,
                                            left: 0,
                                            top: 0,
                                            transform: `translate(${node.x - node.radius}px, ${node.y - node.radius}px) scale(${isHovered || isDragged ? 1.1 : 1})`,
                                            background: style.background,
                                            boxShadow: isDragged
                                                ? `0 25px 50px -12px ${style.shadowColor}, inset 0 2px 20px rgba(255,255,255,0.6)`
                                                : isHovered
                                                    ? `0 20px 40px -10px ${style.shadowColor}, inset 0 2px 20px rgba(255,255,255,0.4)`
                                                    : `0 10px 30px -10px ${style.shadowColor}, inset 0 2px 10px rgba(255,255,255,0.2)`,
                                            zIndex: isDragged ? 100 : (isHovered ? 50 : 10)
                                        }}
                                        onMouseEnter={(e) => handleMouseEnter(e, node.origIndex)}
                                        onMouseLeave={() => setHoveredBucket(null)}
                                        onMouseDown={(e) => onMouseDown(e, node.id, node.x, node.y)}
                                    >
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/0 to-white/30 opacity-50 pointer-events-none"></div>
                                        <div className="absolute top-[15%] left-[15%] w-[25%] h-[15%] rounded-[100%] bg-white blur-[2px] opacity-40 transform -rotate-45 pointer-events-none"></div>

                                        {/* Label centered */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                                            <div className={cn(
                                                "font-bold text-white drop-shadow-md leading-none",
                                                size > 80 ? "text-2xl" : size > 60 ? "text-lg" : "text-sm",
                                                "mix-blend-overlay opacity-90"
                                            )}>
                                                {node.value >= 1 ? Math.round(node.value) : node.value.toFixed(1)}
                                            </div>
                                            {size > 80 && (
                                                <div className="text-[10px] text-white/70 mt-1 font-medium tracking-wide">
                                                    {sizeMetric === 'count' ? '筆' : '坪'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-zinc-500 font-medium tracking-widest uppercase opacity-50 pointer-events-none">
                                Zero Gravity • Force Layout • Draggable
                            </div>
                        </div>
                    )}

                    {/* Coordinate Mode: Precise Layout */}
                    {displayMode === 'coordinate' && (
                        <div className="absolute inset-0 py-6 px-4">
                            {/* Y-axis Labels */}
                            <div className="flex flex-col justify-between py-6 pr-2 text-right w-[46px] border-r border-white/5 relative z-10 h-full float-left">
                                {[...Array(6)].map((_, i) => (
                                    <span key={i} className="text-xs font-mono text-zinc-600 block">
                                        {Math.round(maxPrice - ((maxPrice - minPrice) / 5) * i)}
                                    </span>
                                ))}
                            </div>

                            <div className="relative ml-[46px] h-full">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-full h-px border-t border-dashed border-zinc-800"></div>
                                    ))}
                                </div>

                                {/* Plot Area */}
                                <div className="absolute inset-0">
                                    {validBuckets.map((bucket, index) => {
                                        const value = sizeMetric === 'count' ? bucket.count : bucket.totalArea;
                                        const size = getBubbleSize(value);
                                        const midPrice = (bucket.min + bucket.max) / 2;

                                        // Position math
                                        const xPercent = (index / (validBuckets.length - 1 || 1)) * 90 + 5;
                                        const yPercent = 100 - ((midPrice - minPrice) / (maxPrice - minPrice)) * 100;

                                        const isHovered = hoveredBucket === index;
                                        const style = getBubbleStyle(index, validBuckets.length);

                                        return (
                                            <div
                                                key={bucket.label}
                                                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                                                style={{ left: `${xPercent}%`, top: `${yPercent}%`, zIndex: isHovered ? 50 : 20 }}
                                                onMouseEnter={(e) => handleMouseEnter(e, index)}
                                                onMouseLeave={() => setHoveredBucket(null)}
                                            >
                                                <div
                                                    className={cn(
                                                        "relative rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform duration-300",
                                                        isHovered ? "scale-110" : "scale-100"
                                                    )}
                                                    style={{
                                                        width: size,
                                                        height: size,
                                                        background: style.background,
                                                        boxShadow: isHovered
                                                            ? `0 10px 20px -5px ${style.shadowColor}, inset 0 2px 10px rgba(255,255,255,0.3)`
                                                            : `0 5px 15px -5px ${style.shadowColor}, inset 0 2px 5px rgba(255,255,255,0.2)`
                                                    }}
                                                >
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/30 opacity-60"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* X-axis Labels */}
                                <div className="absolute bottom-0 inset-x-0 flex justify-between text-xs text-zinc-600 font-mono translate-y-full pt-2">
                                    <span>Low Price</span>
                                    <span>High Price</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend / Footer */}
            <div className="flex items-center justify-between px-2 text-xs text-zinc-500">
                <div>* Bubble size represents {sizeMetric === 'count' ? 'Transaction Count' : 'Total Area'}</div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span>Mid</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>High</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
