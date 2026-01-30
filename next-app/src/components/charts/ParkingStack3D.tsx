"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

    // Configuration - Tuned for vertical expansion
    const BLOCK_SIZE = 240;
    const BLOCK_THICKNESS = 40;
    // Reduce gap slightly to fit more layers (90 -> 70)
    const BLOCK_GAP = 70;

    // Calculate projected Y position step
    const STEP_Z = BLOCK_THICKNESS + BLOCK_GAP;
    const STEP_Y_PIXELS = STEP_Z * 0.85;

    // Dynamic Scaling: If more than 4 floors, shrink strictly to fit 600px canvas
    // 5 floors * 110 (gap+thick) approx 550px. 6 floors = 660px.
    const scaleFactor = sortedData.length > 4 ? Math.max(0.7, 4 / sortedData.length) : 1;

    return (
        <div className="w-full h-[600px] flex items-start justify-start relative perspective-container overflow-visible pl-12 lg:pl-24 -mt-12">
            {/* 1. The 3D Scene Layer */}
            <div
                className="relative flex items-center justify-center preserve-3d"
                style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    perspective: "3000px",
                    transformStyle: "preserve-3d",
                    zIndex: 10,
                    // Apply dynamic scale to the whole group
                    transform: `scale(${scaleFactor})`
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
                                    data={floor}
                                    color={color}
                                    isSelected={isSelected}
                                    isHovered={isHovered}
                                    active={isSelected}
                                    onHover={() => onHover(floor.floor)}
                                    onLeave={() => onHover(null)}
                                    // Clicking now opens details instead of toggling off
                                    onDetail={() => onDetail(floor.floor)}
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
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-start pl-12 lg:pl-24">
                <div
                    className="relative"
                    style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                >
                    <AnimatePresence>
                        {sortedData.map((floor, idx) => {
                            const isSelected = selectedFloors.includes(floor.floor);
                            const isHovered = hoveredFloor === floor.floor;

                            // 1. Revert: Only show when hovered
                            if (!isSelected || !isHovered) return null;

                            const hoverOffset = -35;
                            const topPos = (idx * STEP_Y_PIXELS) + hoverOffset;

                            return (
                                <motion.div
                                    key={`label-${floor.floor}`}
                                    className="absolute left-full flex items-center"
                                    // 2. Instant appearance, no sliding (x:0), no scaling
                                    initial={{ opacity: 0, x: 0 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 0, transition: { duration: 0 } }}
                                    transition={{ duration: 0 }}
                                    style={{
                                        top: `calc(50% - 40px + ${topPos}px)`,
                                        // 3. Move to right side (75% to clear the diamond shape)
                                        left: '75%',
                                        transition: 'top 0.1s ease-out',
                                        zIndex: 50
                                    }}
                                >
                                    <div className="w-12 h-px bg-white/60 shadow-[0_0_8px_white]" />

                                    <div
                                        className="pl-4 pointer-events-auto cursor-pointer flex items-center gap-3 whitespace-nowrap"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDetail(floor.floor);
                                        }}
                                    >
                                        <span className={cn(
                                            "text-6xl font-black text-white drop-shadow-[0_5px_8px_rgba(0,0,0,0.8)] leading-none",
                                            "font-sans italic tracking-tighter"
                                        )}
                                            style={{ textShadow: '0 0 30px rgba(255,255,255,0.4)' }}
                                        >
                                            {floor.floor}
                                        </span>

                                        <div className="bg-zinc-950/95 border-l-4 border-cyan-500 backdrop-blur-xl px-4 py-2 rounded-r-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 border border-white/10">
                                            <div>
                                                <div className="text-[10px] text-zinc-500 uppercase font-black leading-none mb-1 tracking-widest">均價 (萬)</div>
                                                <div className="text-2xl font-mono font-bold text-cyan-400 leading-none">
                                                    {Math.round(floor.avgPrice).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="h-8 w-px bg-white/10" />
                                            <div>
                                                <div className="text-[10px] text-zinc-500 uppercase font-black leading-none mb-1 tracking-widest">成交量</div>
                                                <div className="text-xl font-mono text-zinc-100 leading-none font-medium">
                                                    {floor.count}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function Block3D({
    data,
    color,
    isSelected,
    isHovered,
    active,
    onHover,
    onLeave,
    onDetail,
    zIndex,
    baseZ,
    thickness
}: {
    data: FloorData;
    color: string;
    isSelected: boolean;
    isHovered: boolean;
    active: boolean;
    onHover: () => void;
    onLeave: () => void;
    onDetail: () => void;
    zIndex: number;
    baseZ: number;
    thickness: number;
}) {
    // Animation states
    const hoverLift = 0; // STABLE: No Z-movement on hover
    const finalZ = baseZ + hoverLift;
    const scale = active ? 1 : 0;

    // Color Logic:
    // Ghost state: zinc-600 with clear face distinction
    const displayColor = isHovered ? color : "#52525b";

    // Ghost Opacity: Fully opaque (1) to look solid, not ghostly transparent
    const opacity = active ? 1 : 0;

    const glossyGradient = isHovered
        ? `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.2) 100%)`
        : `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)`;

    return (
        <motion.div
            className={cn(
                "absolute top-0 left-0 w-full h-full preserve-3d pointer-events-none",
                !active && "pointer-events-none"
            )}
            // onMouseEnter={onHover} // Handled by faces
            // onMouseLeave={onLeave} // Handled by faces
            // onClick={(e) => { // Handled by faces
            //     e.stopPropagation();
            //     onDetail();
            // }}
            // Start at full scale (scale: 1) to avoid "growing paper" look
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                translateZ: finalZ,
                // Scale is 1 if active.
                scale: scale,
                opacity: opacity
            }}
            // FASTER: Snappier spring
            transition={{ type: "spring", stiffness: 600, damping: 15 }}
            style={{
                transformStyle: "preserve-3d",
                zIndex: zIndex
            }}
        >
            {/* 1. TOP FACE */}
            <div
                className="absolute inset-0 rounded-sm overflow-hidden transition-all duration-75 pointer-events-auto cursor-pointer"
                style={{
                    backgroundColor: displayColor,
                    backgroundImage: glossyGradient,
                    // Top face is lighter in ghost mode
                    filter: isHovered ? 'none' : 'brightness(1.1)',
                    boxShadow: isHovered
                        ? `inset 0 0 0 1px rgba(255,255,255,0.4), 0 0 30px -5px ${color}`
                        : `inset 0 0 0 1px rgba(255,255,255,0.1)`,
                }}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                onClick={(e) => {
                    e.stopPropagation();
                    onDetail();
                }}
            >
                {/* Surface Shine Animation */}
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={isHovered ? { x: "200%" } : { x: "-100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                />
            </div>

            {/* 2. RIGHT FACE - Fixed visibility in ghost mode */}
            <div
                className="absolute top-0 origin-top-right transition-all duration-75 pointer-events-auto cursor-pointer"
                style={{
                    right: 0,
                    width: thickness,
                    height: '100%',
                    backgroundColor: displayColor,
                    // Stronger contrast for 3D depth in ghost mode
                    filter: isHovered ? 'brightness(0.6)' : 'brightness(0.5)',
                    left: '100%',
                    transformOrigin: 'left center',
                    transform: 'rotateY(90deg)',
                }}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                onClick={(e) => {
                    e.stopPropagation();
                    onDetail();
                }}
            />

            {/* 3. FRONT FACE - Fixed visibility in ghost mode */}
            <div
                className="absolute left-0 origin-bottom-left transition-all duration-75 pointer-events-auto cursor-pointer"
                style={{
                    bottom: 0,
                    width: '100%',
                    height: thickness,
                    backgroundColor: displayColor,
                    // Darker front face to emphasize depth against light top
                    filter: isHovered ? 'brightness(0.8)' : 'brightness(0.3)',
                    top: '100%',
                    transformOrigin: 'top center',
                    transform: 'rotateX(-90deg)',
                }}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                onClick={(e) => {
                    e.stopPropagation();
                    onDetail();
                }}
            />
        </motion.div>
    );
}
