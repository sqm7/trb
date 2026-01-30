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
                    perspective: "3000px", // Flatter perspective (nearly isometric orthographic)
                    transformStyle: "preserve-3d"
                }}
            >
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

                        // Stack Logic
                        const blockHeight = 24;
                        const gap = 15;
                        const zPosition = -idx * (blockHeight + gap);

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
                                zIndex={sortedData.length - idx}
                                baseZ={zPosition}
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
                zIndex: zIndex
            }}
        >
            {/* 1. TOP FACE (Main Surface) */}
            <div
                className={cn(
                    "absolute inset-0 transition-all duration-300 rounded-sm",
                )}
                style={{
                    backgroundColor: color,
                    backgroundImage: glossyGradient,
                    // Subtle inner shadow instead of border to define edge
                    boxShadow: isSelected
                        ? `0 0 20px -5px ${color}, inset 0 0 0 1px rgba(255,255,255,0.3)`
                        : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                    transform: `translateZ(${height}px)` // Top face sits up
                }}
            >
                {/* Shine highlight */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            </div>

            {/* 2. RIGHT FACE (Side) - Overlapping Dimensions to Fix Seams */}
            <div
                className="absolute top-0 right-0 origin-right transition-colors duration-300"
                style={{
                    width: height,         // Thickness
                    height: '100.5%',      // Slight vertical overlap to fix Z-fighting or subpixel gaps
                    top: '-0.25%',         // Center the overlap
                    backgroundColor: color,
                    filter: 'brightness(0.6)',
                    transform: `rotateY(90deg)`, // Pivot on right edge
                    // Remove border, let the color fill
                }}
            />

            {/* 3. FRONT FACE (Bottom) - Overlapping Dimensions to Fix Seams */}
            <div
                className="absolute bottom-0 left-0 origin-bottom transition-colors duration-300"
                style={{
                    width: '100.5%',       // Slight horizontal overlap
                    height: height,        // Thickness 
                    left: '-0.25%',        // Center the overlap
                    backgroundColor: color,
                    filter: 'brightness(0.8)',
                    transform: `rotateX(90deg)`, // Pivot on bottom edge
                }}
            />

            {/* Corner Filler (Internal Cube to block light leaks at the corner) */}
            <div
                className="absolute bottom-0 right-0 w-1 h-full origin-bottom-right"
                style={{
                    height: height,
                    transform: 'rotateX(90deg) rotateY(90deg)',
                    backgroundColor: color,
                    filter: 'brightness(0.5)'
                }}
            />

            {/* --- LEADER LINE & LABEL --- */}
            {/* Anchor to Top-Right Corner */}
            <div
                className="absolute top-0 right-0 preserve-3d pointer-events-none"
                style={{
                    transform: "translateZ(24px)" // Lift to top surface level
                }}
            >
                {/* Visual Line: Extends OUT from the corner */}
                <div
                    className="h-px bg-white/40 origin-left"
                    style={{
                        width: 130,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: "rotateZ(-45deg)" // Points Visual Right
                    }}
                />

                {/* The Label Group */}
                <div
                    className="absolute"
                    style={{
                        // Move to end of line
                        transform: "rotateZ(-45deg) translate(130px, 0)"
                    }}
                >
                    {/* 
                        TEXT ROTATION FIX:
                        Parent Stack: RotateX(60) -> RotateZ(45)
                        Line Anchor: TranslateZ(24) -> RotateZ(-45) (Cancels parent spin) -> TranslateX(130)
                        Current Local Frame: Effectively RotateX(60) relative to Screen Vertical.
                        To face screen vertical: RotateX(-60).
                    */}
                    <div
                        className="flex flex-col items-start gap-2 p-2 min-w-[180px] pointer-events-auto"
                        style={{
                            transform: "rotateX(-60deg) translateY(-50%)",
                            transformOrigin: "left center"
                        }}
                    >
                        {/* Label Header */}
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "text-4xl font-black tracking-widest leading-none filter drop-shadow-lg",
                                isSelected ? "text-cyan-400" : "text-zinc-500"
                            )}>
                                {data.floor}
                            </span>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                                >
                                    <Search size={14} strokeWidth={3} />
                                </motion.div>
                            )}
                        </div>

                        {/* Detail Box - Floating Glass Card */}
                        <div
                            className="w-full bg-zinc-950/80 backdrop-blur-md rounded-lg border-l-4 border-cyan-500/80 p-3 shadow-2xl transition-all group-hover/card:bg-black group-hover/card:border-cyan-400"
                            style={{
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDetail(e);
                            }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">AVG Price</div>
                                    <div className="font-mono text-cyan-300 font-bold text-xl leading-none tracking-tight">
                                        {Math.round(data.avgPrice).toLocaleString()}
                                        <span className="text-sm ml-1 text-zinc-600 font-normal">萬</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Count</div>
                                    <div className="font-mono text-zinc-300 font-bold text-lg leading-none">{data.count}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </motion.div>
    );
}
