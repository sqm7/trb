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
        <div className="w-full h-[500px] flex items-center justify-center relative perspective-container">
            {/* CSS Perspective Container */}
            <div
                className="relative w-full h-full flex flex-col items-center justify-center preserve-3d"
                style={{
                    perspective: "1200px",
                    transformStyle: "preserve-3d"
                }}
            >
                {/* 3D Stack Group - Isometrically Rotated */}
                <motion.div
                    className="relative preserve-3d flex flex-col items-center"
                    initial={{ rotateX: 55, rotateZ: 45 }}
                    animate={{ rotateX: 55, rotateZ: 45 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {sortedData.map((floor, idx) => {
                        const isSelected = selectedFloors.includes(floor.floor);
                        const isHovered = hoveredFloor === floor.floor;
                        const color = floorColors[floor.floor] || '#71717a';

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
                                index={idx}
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
    index
}: {
    data: FloorData;
    color: string;
    isSelected: boolean;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
    onDetail: (e: React.MouseEvent) => void;
    index: number;
}) {
    // 3D Block Dimensions
    const size = 160;
    const height = 24;

    // Animation states
    const zOffset = isHovered ? 30 : 0;
    const scale = isHovered ? 1.05 : (isSelected ? 1 : 0.95);

    // Glossy Gradient Logic
    // We can simulate a glossy reflection using a linear gradient overlay.
    // Assuming 'color' is hex. Since we can't easily manipulate hex in JS without helper,
    // we'll use a semi-transparent white gradient over the base color.
    const glossyGradient = `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.1) 100%)`;

    return (
        <motion.div
            className="relative preserve-3d cursor-pointer mb-2" // margin-bottom creates gap
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            animate={{
                translateZ: zOffset,
                scale: scale
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
                width: size,
                height: size,
                transformStyle: "preserve-3d",
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
                    boxShadow: isSelected ? `0 0 15px ${color}` : 'none',
                    transform: `translateZ(${height}px)` // Top face sits up
                }}
            >
                {/* Internal sheen or highlight */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* 2. RIGHT FACE (Thickness) */}
            <div
                className="absolute top-0 right-0 origin-right transition-colors duration-300 border border-black/20"
                style={{
                    width: height,
                    height: '100%',
                    backgroundColor: color,
                    filter: 'brightness(0.7)', // Darker side
                    transform: `rotateY(90deg) translateZ(0px)`,
                }}
            />

            {/* 3. FRONT FACE (Thickness) */}
            <div
                className="absolute bottom-0 left-0 origin-bottom transition-colors duration-300 border border-black/20"
                style={{
                    width: '100%',
                    height: height,
                    backgroundColor: color,
                    filter: 'brightness(0.85)', // Slightly darker front
                    transform: `rotateX(90deg) translateZ(0px)`,
                }}
            />

            {/* --- LEADER LINE & LABEL --- */}
            <div
                className="absolute bottom-4 right-4 preserve-3d pointer-events-none"
                style={{
                    transform: "translateZ(24px)" // Lift to top surface level
                }}
            >
                {/* Visual Line: Extends OUT from the corner */}
                <div
                    className="h-px bg-white/60 origin-left shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                    style={{
                        width: 100,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: "rotateZ(-45deg)" // Points "Right" relative to screen
                    }}
                />

                {/* The Label Group */}
                <div
                    className="absolute"
                    style={{
                        transform: "rotateZ(-45deg) translate(100px, 0)" // Move along the line
                    }}
                >
                    {/* Counter-Rotate to Face Camera */}
                    <div
                        className="flex flex-col items-start gap-1 p-2 min-w-[140px] pointer-events-auto"
                        style={{
                            transform: "rotateX(-55deg) translateY(-50%)", // Counter tilt + center vertically relative to line end
                            transformOrigin: "left center"
                        }}
                    >
                        {/* Label Content */}
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider",
                                isSelected ? "text-cyan-400" : "text-zinc-300"
                            )}
                                style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                            >
                                {data.floor}
                            </span>
                            {isSelected && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 rounded-full bg-cyan-500 border border-white flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                >
                                    <Search size={10} className="text-black" strokeWidth={3} />
                                </motion.span>
                            )}
                        </div>

                        {/* Detail Box */}
                        <div
                            className="bg-black/60 backdrop-blur-md rounded border border-white/20 p-2 text-xs shadow-2xl hover:bg-black/80 transition-colors w-32 group-hover/card:border-cyan-500/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDetail(e);
                            }}
                        >
                            <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
                                <span className="text-zinc-400">均價</span>
                                <span className="font-mono text-cyan-300 font-bold">{Math.round(data.avgPrice).toLocaleString()} 萬</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500">車位</span>
                                <span className="font-mono text-white">{data.count}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </motion.div>
    );
}
