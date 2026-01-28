"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CanvasProps {
    width: number;
    height: number;
    children: React.ReactNode;
    onClickBackground?: () => void;
}

export function Canvas({ width, height, children, onClickBackground }: CanvasProps) {
    // Scale factor for display (to fit in viewport while maintaining aspect)
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const availableWidth = parent.clientWidth - 64; // padding
                    const availableHeight = parent.clientHeight - 64;
                    const scaleX = availableWidth / width;
                    const scaleY = availableHeight / height;
                    setScale(Math.min(scaleX, scaleY, 1)); // Never scale up
                }
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [width, height]);

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
                className={cn(
                    "absolute origin-top-left bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden",
                    "transition-transform duration-200"
                )}
                style={{
                    width,
                    height,
                    transform: `scale(${scale})`,
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClickBackground?.();
                    }
                }}
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

                {/* Canvas Info Badge */}
                <div className="absolute bottom-2 right-2 text-[10px] text-zinc-600 font-mono bg-zinc-950/80 px-2 py-1 rounded">
                    {width} × {height}
                </div>
            </div>
        </div>
    );
}
