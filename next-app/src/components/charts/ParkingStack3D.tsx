"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Check } from "lucide-react";

interface FloorData {
    floor: string;
    count: number;
    avgPrice: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    minPrice: number;
}

interface ParkingStack3DProps {
    data: FloorData[];
    selectedFloors: string[];
    hoveredFloor: string | null;
    onHover: (floor: string | null) => void;
    onToggle: (floor: string) => void;
    onDetail: (floor: string) => void;
    floorColors: Record<string, string>;
}

export function ParkingStack3D({
    data,
    selectedFloors,
    hoveredFloor,
    onHover,
    onToggle,
    onDetail,
    floorColors
}: ParkingStack3DProps) {

    // Sort data to stack correctly: B1 on top, B5 on bottom
    // Assuming data usually comes in order or we sort manually
    const sortedData = [...data].sort((a, b) => {
        // Custom sort for floors B1...B5
        const getRank = (f: string) => {
            if (f === 'B1') return 1;
            if (f === 'B2') return 2;
            if (f === 'B3') return 3;
            if (f === 'B4') return 4;
            if (f.includes('B5')) return 5;
            return 99;
        };
        return getRank(a.floor) - getRank(b.floor);
    });

    return (
        <div className="w-full h-[400px] flex items-center justify-center relative perspective-container">
            {/* CSS Perspective Container */}
            <div
                className="relative w-64 h-full flex flex-col items-center justify-center preserve-3d"
                style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                }}
            >
                {/* 3D Stack Group */}
                <motion.div
                    className="relative w-full preserve-3d flex flex-col items-center gap-1"
                    initial={{ rotateX: 60, rotateZ: -45 }}
                    animate={{ rotateX: 60, rotateZ: -45 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {sortedData.map((floor, idx) => {
                        const isSelected = selectedFloors.includes(floor.floor);
                        const isHovered = hoveredFloor === floor.floor;
                        const color = floorColors[floor.floor] || '#71717a';

                        // Z-index trick: Lower floors should usually be below, but in this rotated view 
                        // we need to be careful. DOM order (bottom last) draws on top.
                        // B1 top (idx 0), B5 bottom (idx 4). 
                        // In DOM, later elements are "closer" typically. 
                        // Reversed map? No, let's keep simple.

                        return (
                            <Block3D
                                key={floor.floor}
                                data={floor}
                                color={color}
                                isSelected={isSelected}
                                isHovered={isHovered}
                                onHover={() => onHover(floor.floor)}
                                onLeave={() => onHover(null)}
                                onClick={() => onToggle(floor.floor)}
                                onDetail={(e) => {
                                    e.stopPropagation();
                                    onDetail(floor.floor);
                                }}
                            />
                        );
                    })}
                </motion.div>

                {/* Base Plate Shadow */}
                <div
                    className="absolute bottom-10 w-48 h-48 bg-black/40 blur-xl rounded-full"
                    style={{
                        transform: "rotateX(60deg) translateZ(-60px) scale(1.5)",
                        filter: "blur(20px)"
                    }}
                />
            </div>

            <FloatingTooltip data={data} hoveredFloor={hoveredFloor} />
        </div>
    );
}

function Block3D({
    data,
    color,
    isSelected,
    isHovered,
    onHover,
    onLeave,
    onClick,
    onDetail
}: {
    data: FloorData;
    color: string;
    isSelected: boolean;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
    onDetail: (e: React.MouseEvent) => void;
}) {
    // Determine visual states
    const opacity = isSelected ? 1 : 0.4;
    const hoverLift = isHovered ? 20 : 0;

    // Convert hex to rgba for glass effect if needed
    // Simple block construction: Top, Front, Side faces

    return (
        <motion.div
            className="relative w-48 h-12 cursor-pointer preserve-3d group"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            animate={{
                translateZ: hoverLift,
                scale: isHovered ? 1.05 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Top Face (The "Floor") */}
            <div
                className={cn(
                    "absolute top-0 left-0 w-full h-full border border-white/20 transition-all duration-300 flex items-center justify-between px-4",
                    isSelected ? "brightness-110" : "grayscale-[0.5]"
                )}
                style={{
                    backgroundColor: color,
                    // Typically 'top' face in CSS cube would be rotated X 90deg? 
                    // Actually, since we rotated the PARENT container, we can just stack divs flat 
                    // and give them "thickness" via pseudo elements.
                    // But simpler: Just stacking divs in a flex-col in a rotated container works well 
                    // for "isometric layers". 
                    // Let's add thickness manually.
                    fontSize: '10px'
                }}
            >
                <div className="flex items-center gap-2 transform -rotate-45 rotate-x-0" style={{ transform: 'rotate(45deg)' }}>
                    {/* Counter-rotate text to be readable? No, let's keep it stylized */}
                </div>
            </div>

            {/* Thickness (Side Face Pseudo-3D) */}
            <div
                className="absolute top-full left-0 w-full h-4 origin-top brightness-75 border-l border-b border-r border-black/20 transition-all duration-300"
                style={{
                    backgroundColor: color,
                    transform: "rotateX(-90deg)",
                    opacity: opacity
                }}
            />
            <div
                className="absolute top-0 right-0 w-4 h-full origin-right brightness-50 border-t border-r border-b border-black/20 transition-all duration-300"
                style={{
                    backgroundColor: color,
                    transform: "rotateY(-90deg)",
                    opacity: opacity
                }}
            />

            {/* Content Overlay (Floating above the block for readability) */}
            <div
                className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none"
                style={{
                    transform: "translateZ(1px)" // Lift text slightly
                }}
            >
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center bg-black/20 backdrop-blur-sm transition-colors",
                        isSelected ? "border-white text-white" : "border-white/30 text-transparent"
                    )}>
                        <Check size={12} strokeWidth={4} />
                    </span>
                    <span className="font-bold text-white text-lg drop-shadow-md">{data.floor}</span>
                </div>

                <div className="text-right">
                    <div className="font-mono text-white text-sm font-bold drop-shadow-md">{Math.round(data.avgPrice).toLocaleString()} 萬</div>
                    <div className="text-white/80 text-[10px]">{data.count} 位</div>
                </div>
            </div>

            {/* Detail Button (Only visible on hover) */}
            <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
                className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 bg-white text-zinc-900 rounded-full shadow-lg hover:bg-cyan-400 transition-colors pointer-events-auto z-30"
                onClick={onDetail}
                title="查看明細"
            >
                <Search size={14} />
            </motion.button>

        </motion.div>
    );
}


function FloatingTooltip({ data, hoveredFloor }: { data: FloorData[], hoveredFloor: string | null }) {
    if (!hoveredFloor) return null;
    const floor = data.find(f => f.floor === hoveredFloor);
    if (!floor) return null;

    return (
        <motion.div
            className="absolute top-4 right-4 w-48 bg-zinc-900/90 border border-white/10 backdrop-blur-md rounded-lg p-3 shadow-2xl pointer-events-none z-50 text-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
        >
            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
                <span className="font-bold text-cyan-400 text-sm">{floor.floor} 樓層資訊</span>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-zinc-500">平均價格</span>
                    <span className="text-white font-mono">{Math.round(floor.avgPrice).toLocaleString()} 萬</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">中位數</span>
                    <span className="text-zinc-300 font-mono">{Math.round(floor.medianPrice).toLocaleString()} 萬</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">極值</span>
                    <span className="text-zinc-400 font-mono">{Math.round(floor.minPrice).toLocaleString()} - {Math.round(floor.maxPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-white/5">
                    <span className="text-zinc-500">車位數量</span>
                    <span className="text-white font-mono">{floor.count} 個</span>
                </div>
            </div>
        </motion.div>
    );
}
