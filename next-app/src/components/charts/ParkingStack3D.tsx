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
                    perspective: "3000px",
                    transformStyle: "preserve-3d"
                }}
            >
                <motion.div
                    className="relative preserve-3d"
                    // Parent Rotation: Tilted 60deg X, Spun 45deg Z
                    initial={{ rotateX: 60, rotateZ: 45 }}
                    animate={{ rotateX: 60, rotateZ: 45 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        transformStyle: "preserve-3d",
                        width: 240,
                        height: 240
                    }}
                >
                    {sortedData.map((floor, idx) => {
                        const isSelected = selectedFloors.includes(floor.floor);
                        const isHovered = hoveredFloor === floor.floor;
                        const color = floorColors[floor.floor] || '#71717a';

                        // Vertical Stacking
                        const blockThickness = 20;
                        const gap = 20;
                        // Stack downwards (negative Z)
                        const zPosition = -idx * (blockThickness + gap);

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
                                onClick={() => onToggle(floor.floor)}
                                onDetail={(e) => {
                                    e.stopPropagation();
                                    onDetail(floor.floor);
                                }}
                                zIndex={sortedData.length - idx}
                                baseZ={zPosition}
                                thickness={blockThickness}
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
    active,
    onHover,
    onLeave,
    onClick,
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
    onClick: () => void;
    onDetail: (e: React.MouseEvent) => void;
    zIndex: number;
    baseZ: number;
    thickness: number;
}) {
    // Animation states
    const hoverLift = isHovered ? 40 : 0;
    const finalZ = baseZ + hoverLift;
    const scale = active ? (isHovered ? 1.05 : 1) : 0;
    const opacity = active ? 1 : 0;

    // Glossy Gradient
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
            {/* 
                GEOMETRY STRATEGY: "Fold Down" from TOP Face
                The main div is the Container.
                The TOP FACE is 'absolute inset-0'.
            */}

            {/* 1. TOP FACE */}
            <div
                className="absolute inset-0 rounded-sm"
                style={{
                    backgroundColor: color,
                    backgroundImage: glossyGradient,
                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.2), 0 0 15px -5px ${color}`,
                    // It sits at Z = thickness/2 relative to the layer center, or just 0 if we consider layer=top.
                    // Let's say zPosition is the TOP surface level.
                    // So faces fold DOWN from here.
                }}
            >
                {/* Surface Shine */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* 2. RIGHT FACE (Folded Down from Right Edge) */}
            <div
                className="absolute top-0 origin-top-right transition-colors duration-300"
                style={{
                    right: 0,
                    width: thickness,     // The 'height' of the block becomes width of this strip
                    height: '100%',
                    backgroundColor: color,
                    filter: 'brightness(0.6)',
                    // Rotate Y 90 deg?
                    // Right Edge axis. simple RotateY(90) folds it BACK. 
                    // We want it DOWN.
                    // Actually, standard Fold:
                    // Attach to Right Edge: left: 100%. Origin: left. RotateY(90).
                    left: '100%',
                    transformOrigin: 'left center',
                    transform: 'rotateY(90deg)',
                    // Wait, RotateY(90) makes it perpendicular to X axis. Good.
                }}
            />

            {/* 3. FRONT FACE (Folded Down from Bottom Edge) */}
            <div
                className="absolute left-0 origin-bottom-left transition-colors duration-300"
                style={{
                    bottom: 0,
                    width: '100%',
                    height: thickness,
                    backgroundColor: color,
                    filter: 'brightness(0.8)',
                    // Attach to Bottom Edge: top: 100%. Origin: top. RotateX(-90).
                    top: '100%',
                    transformOrigin: 'top center',
                    transform: 'rotateX(-90deg)',
                }}
            />

            {/* 
                Visual Debugging Note:
                If Front Face is "detached", it means Top:100% gap.
                We can add -1px margin or overlapping size.
                Let's use 100.5% width on faces to cover corners.
             */}


            {/* --- LABELS --- */}
            {/* Anchor: Top Right Corner of the Block */}
            <div
                className="absolute top-0 right-0 pointer-events-none preserve-3d"
                style={{
                    transform: 'translateZ(0px)' // Already at top level
                }}
            >
                {/* Leader Line */}
                <div
                    className="absolute bg-white/50 h-px origin-center shadow-[0_0_5px_white]"
                    style={{
                        width: 100,
                        top: 0,
                        left: 0,
                        // Line direction. We want it extending visually RIGHT.
                        // Parent RotZ(45). Visual Right is -45 relative to that.
                        transformOrigin: 'left center',
                        transform: 'rotateZ(-45deg)'
                    }}
                />

                {/* Text Container at End of Line */}
                <div
                    className="absolute box-border"
                    style={{
                        transform: 'rotateZ(-45deg) translate(100px, 0)'
                    }}
                >
                    {/* BILLBOARD TRANSFORMATION
                        We need to cancel Parent: RotX(60) RotZ(45).
                        Current chain up to here: RotZ(45) -> (Inside Block) -> RotZ(-45) (Line).
                        So effectively we have cancelled Z. Net Rotation is just RotX(60).
                        To Billboard: RotateX(-60).
                    */}
                    <div
                        className="pointer-events-auto flex items-center gap-3 origin-center pl-2"
                        style={{
                            transform: 'rotateX(-60deg) translateY(-50%)', // Center text vertically on line
                        }}
                    >
                        <span className={cn(
                            "text-5xl font-black text-cyan-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter"
                        )}
                            style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}
                        >
                            {data.floor}
                        </span>

                        {/* Info Card */}
                        <div
                            className="bg-black/80 border border-cyan-500/30 backdrop-blur-md px-3 py-2 rounded flex flex-col min-w-[120px]"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDetail(e);
                            }}
                        >
                            <div className="flex justify-between items-end border-b border-white/10 pb-1 mb-1">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold">AVG</span>
                                <span className="text-lg font-mono font-bold text-cyan-300 leading-none">
                                    {Math.round(data.avgPrice).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">CNT</span>
                                <span className="text-sm font-mono text-white leading-none">
                                    {data.count}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </motion.div>
    );
}
