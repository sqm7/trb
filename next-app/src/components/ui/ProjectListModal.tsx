"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    projects: string[];
}

export function ProjectListModal({ isOpen, onClose, title, projects }: ProjectListModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    // Close modal on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                    {projects.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4">無建案資料</p>
                    ) : (
                        <ul className="space-y-2">
                            {projects.map((project, idx) => (
                                <li
                                    key={idx}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-zinc-200 text-sm",
                                        "bg-zinc-800/50 hover:bg-zinc-800 transition-colors",
                                        "border border-white/5"
                                    )}
                                >
                                    {project}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-zinc-500">共 {projects.length} 個建案</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
}
