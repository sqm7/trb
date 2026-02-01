"use client";

import React, { useEffect, useState } from "react";
import { useFilterStore, ROOM_TYPE_OPTIONS } from "@/store/useFilterStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingRoomFilter() {
    const { selectedRoomTypes, setSelectedRoomTypes } = useFilterStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const anchor = document.getElementById("room-type-filter-anchor");
            if (!anchor) return;

            const rect = anchor.getBoundingClientRect();
            // Show if the bottom of the anchor is above the viewport (scrolled past)
            // rect.bottom < 0 implies it's fully scrolled out the top
            // Or maybe just rect.top < 80 (considering header)

            // User said: "當蓋過 房型篩選器時" -> When it's covered/gone.
            // Let's use rect.bottom < 100 which allows for some header offset
            setIsVisible(rect.bottom < 80);
        };

        window.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleRoomType = (type: string) => {
        setSelectedRoomTypes(
            selectedRoomTypes.includes(type)
                ? selectedRoomTypes.filter(t => t !== type)
                : [...selectedRoomTypes, type]
        );
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "fixed z-[90] flex gap-1.5 p-1.5 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl",
                        // Mobile: Horizontal bottom center
                        "flex-row bottom-8 left-1/2 -translate-x-1/2 items-center max-w-[90vw]",
                        // Desktop: Vertical left side
                        "md:flex-col md:left-20 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:translate-x-0 md:items-stretch md:max-w-none"
                    )}
                >
                    <div className={cn(
                        "text-[9px] text-zinc-500 font-medium overflow-hidden",
                        "md:writing-mode-vertical md:text-center md:mb-0.5",
                        "whitespace-nowrap px-1" // Mobile style
                    )}>
                        房型
                    </div>
                    <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible max-w-full md:max-w-none pb-2 md:pb-0 scrollbar-thumb-zinc-600 pr-8 md:pr-0">
                        {ROOM_TYPE_OPTIONS.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleRoomType(type)}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-medium rounded-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap",
                                    selectedRoomTypes.includes(type)
                                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                        : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    {selectedRoomTypes.length > 0 && selectedRoomTypes.length < ROOM_TYPE_OPTIONS.length && (
                        <button
                            onClick={() => setSelectedRoomTypes([])}
                            className={cn(
                                "text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap px-1",
                                "md:mt-1 md:border-t md:border-white/5 md:pt-1 md:text-center md:px-0",
                                "border-l border-white/5 pl-1 md:border-l-0 md:pl-0" // Mobile separator
                            )}
                        >
                            清除
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
