"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    // Configuration
    const BLOCK_SIZE = 240;
    const BLOCK_THICKNESS = 20;
    const BLOCK_GAP = 20;

    // Calculate vertical step for 2D projection
    // With rotateX(60deg), the vertical step per unit Z is sin(60) ~ 0.866
    // But we are stacking DOWN in Z (negative Z).
    // Visually, each step down in Z means step DOWN in Y screen.
    const STEP_Z = BLOCK_THICKNESS + BLOCK_GAP;
    // Visually, the gap on screen pixels is approx:
    const STEP_Y_PIXELS = STEP_Z * 0.9; // Tuned for visual match with 3D projection

    return (
        <div className="w-full h-[600px] flex items-center justify-start relative perspective-container overflow-visible pl-12 lg:pl-24">
            {/* 1. The 3D Scene Layer */}
            <div
                className="relative flex items-center justify-center preserve-3d"
                style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    perspective: "3000px",
                    transformStyle: "preserve-3d",
                    zIndex: 10
                }}
            >
                <motion.div
                    className="relative preserve-3d"
                    initial={{ rotateX: 60, rotateZ: 45 }}
                    animate={{ rotateX: 60, rotateZ: 45 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        transformStyle: "preserve-3d",
                        width: "100%",
                        height: "100%"
                    }}
                >
                    <AnimatePresence>
                        {sortedData.map((floor, idx) => {
                            const isSelected = selectedFloors.includes(floor.floor);
                            const isHovered = hoveredFloor === floor.floor;
                            const color = floorColors[floor.floor] || '#71717a';
                            const zPosition = -idx * STEP_Z;

                            return (
                                <Block3D
                                    key={floor.floor}
                                    color={color}
                                    isSelected={isSelected}
                                    isHovered={isHovered}
                                    active={isSelected}
                                    onHover={() => onHover(floor.floor)}
                                    onLeave={() => onHover(null)}
                                    onClick={() => onToggle(floor.floor)}
                                    // Stacking order: Top floor (B1) is last in Z-index logic? 
                                    // Actually in 3D, z-buffer handles it, but for DOM layering...
                                    // B1 is on top physically.
                                    zIndex={sortedData.length - idx}
                                    baseZ={zPosition}
                                    thickness={BLOCK_THICKNESS}
                                />
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* 2. The 2D Label Overlay Layer */}
            {/* Placed as a sibling, absolutely positioned to match the projected 3D coordinates.
                This ensures text is 100% crisp, 2D, and upright. 
            */}
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-start pl-12 lg:pl-24">
                {/* 
                    We need to match the center of the 3D container. 
                    The container is BLOCK_SIZE x BLOCK_SIZE centered in the flex items.
                */}
                <div
                    className="relative"
                    style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                >
                    {sortedData.map((floor, idx) => {
                        const isSelected = selectedFloors.includes(floor.floor);
                        const isHovered = hoveredFloor === floor.floor;

                        if (!isSelected) return null;

                        // Calculate projected Y position
                        // Start at some top offset
                        // Each index adds STEP_Y_PIXELS
                        // B1 (idx 0) is at top.
                        // We also need to account for the "Hover Lift" (40px Z -> approx 35px Y)
                        const hoverOffset = isHovered ? -35 : 0;
                        const topPos = (idx * STEP_Y_PIXELS) + hoverOffset;

                        return (
                            <div
                                key={floor.floor}
                                className="absolute left-full flex items-center"
                                style={{
                                    top: `calc(50% - 40px + ${topPos}px)`, // Start from middle-ish line
                                    left: '80%', // Shift rightwards from center
                                    // Only animate position/opacity
                                    transition: 'top 0.3s ease-out',
                                }}
                            >
                                {/* Leader Line (2D) */}
                                <div className="w-16 h-px bg-white/50 shadow-[0_0_5px_white]" />

                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="pl-4 pointer-events-auto cursor-pointer flex items-center gap-3 whitespace-nowrap"
                                    onMouseEnter={() => onHover(floor.floor)}
                                    onMouseLeave={() => onHover(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDetail(floor.floor);
                                    }}
                                >
                                    <span className={cn(
                                        "text-5xl font-black text-cyan-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-none",
                                        "font-sans" // Ensure clean sans font
                                    )}
                                        style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}
                                    >
                                        {floor.floor}
                                    </span>

                                    <div className="bg-zinc-950/90 border-l-2 border-cyan-500 backdrop-blur-md px-3 py-1.5 rounded-r shadow-2xl flex items-center gap-4 transition-all hover:bg-black hover:scale-105">
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold leading-nonem mb-0.5">均價</div>
                                            <div className="text-xl font-mono font-bold text-cyan-300 leading-none">
                                                {Math.round(floor.avgPrice).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold leading-none mb-0.5">數量</div>
                                            <div className="text-sm font-mono text-zinc-300 leading-none">
                                                {floor.count}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function Block3D({
    color,
    isSelected,
    isHovered,
    active,
    onHover,
    onLeave,
    onClick,
    zIndex,
    baseZ,
    thickness
}: {
    color: string;
    isSelected: boolean;
    isHovered: boolean;
    active: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
    zIndex: number;
    baseZ: number;
    thickness: number;
}) {
    // Animation states
    const hoverLift = isHovered ? 40 : 0;
    const finalZ = baseZ + hoverLift;
    const scale = active ? 1 : 0;
    const opacity = active ? 1 : 0;

    const glossyGradient = `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0) 100%)`;

    return (
        <motion.div
            className={cn(
                "absolute top-0 left-0 w-full h-full preserve-3d cursor-pointer",
                !active && "pointer-events-none"
            )}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                translateZ: finalZ,
                scale: scale,
                opacity: opacity
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
                transformStyle: "preserve-3d",
                zIndex: zIndex
            }}
        >
            {/* 1. TOP FACE - Fold Source */}
            <div
                className="absolute inset-0 rounded-sm"
                style={{
                    backgroundColor: color,
                    backgroundImage: glossyGradient,
                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.2), 0 0 15px -5px ${color}`,
                }}
            >
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* 2. RIGHT FACE - Folded Down */}
            <div
                className="absolute top-0 origin-top-right transition-colors duration-300"
                style={{
                    right: 0,
                    width: thickness,
                    height: '100%',
                    backgroundColor: color,
                    filter: 'brightness(0.6)',
                    left: '100%',
                    transformOrigin: 'left center',
                    transform: 'rotateY(90deg)',
                }}
            />

            {/* 3. FRONT FACE - Folded Down */}
            <div
                className="absolute left-0 origin-bottom-left transition-colors duration-300"
                style={{
                    bottom: 0,
                    width: '100%',
                    height: thickness,
                    backgroundColor: color,
                    filter: 'brightness(0.8)',
                    top: '100%',
                    transformOrigin: 'top center',
                    transform: 'rotateX(-90deg)',
                }}
            />
            {/* Note: Labels removed from here, handled in 2D overlay layer */}
        </motion.div>
    );
}
