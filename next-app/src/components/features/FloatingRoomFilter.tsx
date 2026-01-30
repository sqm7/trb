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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed left-20 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1.5 p-1.5 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl"
                >
                    <div className="text-[9px] text-zinc-500 text-center mb-0.5 font-medium writing-mode-vertical">
                        房型篩選
                    </div>
                    {ROOM_TYPE_OPTIONS.map(type => (
                        <button
                            key={type}
                            onClick={() => toggleRoomType(type)}
                            className={cn(
                                "px-2 py-1 text-[10px] font-medium rounded-lg transition-all w-full text-center hover:scale-105 active:scale-95",
                                selectedRoomTypes.includes(type)
                                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                    {selectedRoomTypes.length > 0 && selectedRoomTypes.length < ROOM_TYPE_OPTIONS.length && (
                        <button
                            onClick={() => setSelectedRoomTypes([])}
                            className="mt-1 text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors border-t border-white/5 pt-1"
                        >
                            清除
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
