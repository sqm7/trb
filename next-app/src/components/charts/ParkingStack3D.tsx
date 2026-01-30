"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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

    // Sort: B1 top, B5 bottom.
    const sortedData = [...data].sort((a, b) => {
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
        <div className="w-full h-[600px] flex items-center justify-center relative perspective-container overflow-visible">
            {/* CSS Perspective Container */}
            <div
                className="relative w-full h-full flex items-center justify-center preserve-3d"
                style={{
                    perspective: "2000px", // Flatter perspective for isometric look
                    transformStyle: "preserve-3d"
                }}
            >
                {/* 
                    Iso Group 
                    Standard Isometric Projection usually involves rotating the world 45deg (spin) and then tilting X 60deg (or 54.7deg).
                    To stack visually "up", we use negative Translate Z in the transformed space, or just stacked Y offsets.
                    Let's use absolute positioning for precise overlap control.
                */}
                <motion.div
                    className="relative preserve-3d"
                    initial={{ rotateX: 60, rotateZ: 45 }}
                    animate={{ rotateX: 60, rotateZ: 45 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        transformStyle: "preserve-3d",
                        width: 200,
                        height: 200
                    }}
                >
                    {sortedData.map((floor, idx) => {
                        const isSelected = selectedFloors.includes(floor.floor);
                        const isHovered = hoveredFloor === floor.floor;
                        const color = floorColors[floor.floor] || '#71717a';

                        // Stack Calculation
                        // In this rotation, "up" (Z) is visually "Up-Left" diagonal?
                        // No, rotateX(60) tilts the ground plane.
                        // We want to stack them physically on top of each other in the Z axis (height).
                        // Let's use translateZ to stack them. Each block is 'height' units tall.
                        // We want gaps between them.
                        const blockHeight = 24;
                        const gap = 15; // Gap between blocks
                        const zPosition = -idx * (blockHeight + gap); // Stack downwards or upwards? 
                        // B1 is top. B2 is below.
                        // So B1 should be at Z = Highest.
                        // B2 at Z = Lower.
                        // Let's make B1 at 0, B2 at -50, etc.

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
                                zIndex={sortedData.length - idx} // Higher floors render on top in DOM if needed, but preserve-3d handles visual
                                baseZ={-idx * (blockHeight + gap)} // Real 3D stacking
                            />
                        );
                    })}
                </motion.div>
            </div>
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
    onDetail,
    zIndex,
    baseZ
}: {
    data: FloorData;
    color: string;
    isSelected: boolean;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
    onDetail: (e: React.MouseEvent) => void;
    zIndex: number;
    baseZ: number;
}) {
    // 3D Block Dimensions
    const size = 180;
    const height = 24;

    // Animation states
    // When hovered, lift the block UP (positive Z)
    const hoverLift = isHovered ? 40 : 0;
    const finalZ = baseZ + hoverLift;
    const scale = isHovered ? 1.05 : (isSelected ? 1 : 1);

    // Glossy Gradient
    const glossyGradient = `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0) 100%)`;

    return (
        <motion.div
            className="absolute top-0 left-0 preserve-3d cursor-pointer"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            animate={{
                translateZ: finalZ,
                scale: scale
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
                width: size,
                height: size,
                transformStyle: "preserve-3d",
                zIndex: zIndex // Help react reconcile, though 3d controls visibility
            }}
        >
            {/* 1. TOP FACE (Main Surface) */}
            <div
                className={cn(
                    "absolute inset-0 border border-white/20 transition-all duration-300 rounded-sm",
                    isSelected ? "brightness-110" : "grayscale-[0.3]"
                )}
                style={{
                    backgroundColor: color,
                    backgroundImage: glossyGradient,
                    boxShadow: isSelected ? `0 0 20px -5px ${color}` : 'none',
                    transform: `translateZ(${height}px)`
                }}
            >
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            </div>

            {/* 2. SIDE FACE 1 (Right) */}
            <div
                className="absolute top-0 right-0 origin-right transition-colors duration-300 border border-black/20"
                style={{
                    width: height,
                    height: '100%',
                    backgroundColor: color,
                    filter: 'brightness(0.6)',
                    transform: `rotateY(90deg) translateZ(0px)`,
                }}
            />

            {/* 3. SIDE FACE 2 (Bottom/Front) */}
            <div
                className="absolute bottom-0 left-0 origin-bottom transition-colors duration-300 border border-black/20"
                style={{
                    width: '100%',
                    height: height,
                    backgroundColor: color,
                    filter: 'brightness(0.8)',
                    transform: `rotateX(90deg) translateZ(0px)`,
                }}
            />

            {/* --- LEADER LINE & LABEL --- */}
            {/* Anchor to Top-Right Corner */}
            <div
                className="absolute top-0 right-0 preserve-3d pointer-events-none"
                style={{
                    transform: "translateZ(24px) translate(2px, -2px)"
                }}
            >
                {/* Visual Line */}
                <div
                    className="h-px bg-white/60 origin-left shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                    style={{
                        width: 120, // Longer line
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: "rotateZ(-45deg)"
                    }}
                />

                {/* The Label Group */}
                <div
                    className="absolute"
                    style={{
                        transform: "rotateZ(-45deg) translate(120px, 0)"
                    }}
                >
                    {/* Counter-Rotate */}
                    <div
                        className="flex flex-col items-start gap-1 p-2 min-w-[140px] pointer-events-auto"
                        style={{
                            transform: "rotateX(-60deg) translateY(-50%)",
                            transformOrigin: "left center"
                        }}
                    >
                        {/* Label Content */}
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-3xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-widest",
                                isSelected ? "text-cyan-400" : "text-zinc-300"
                            )}
                                style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                            >
                                {data.floor}
                            </span>
                            {isSelected && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 rounded-full bg-cyan-500 border border-white flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,1)]"
                                >
                                    <Search size={12} className="text-black" strokeWidth={3} />
                                </motion.span>
                            )}
                        </div>

                        {/* Detail Box */}
                        <div
                            className="bg-zinc-900/90 backdrop-blur-xl rounded-lg border border-white/20 p-3 text-xs shadow-2xl hover:bg-black transition-colors min-w-[140px] group-hover/card:border-cyan-500/50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDetail(e);
                            }}
                        >
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                                <span className="text-zinc-400 font-medium text-[10px] uppercase tracking-wider">AVG PRICE</span>
                                <span className="font-mono text-cyan-300 font-bold text-base">{Math.round(data.avgPrice).toLocaleString()} <span className="text-[10px] text-zinc-500">萬</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">COUNT</span>
                                <span className="font-mono text-white text-sm">{data.count}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </motion.div>
    );
}
