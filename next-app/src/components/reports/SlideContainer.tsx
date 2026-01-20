import React from "react";
import { cn } from "@/lib/utils";

interface SlideContainerProps {
    children: React.ReactNode;
    title?: string;
    subTitle?: string;
    pageNumber?: number;
    className?: string;
}

export function SlideContainer({ children, title, subTitle, pageNumber, className }: SlideContainerProps) {
    return (
        <div className={cn(
            "relative w-full aspect-video bg-zinc-950 text-white overflow-hidden shadow-2xl border border-white/10",
            className
        )}>
            {/* Background Elements (Optional watermark or gradient) */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 z-0" />

            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-[80px] rounded-full z-0" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 blur-[100px] rounded-full z-0" />

            {/* Slide Content Wrapper */}
            <div className="relative z-10 flex flex-col h-full p-8 md:p-10 lg:p-12">

                {/* Header */}
                {(title || subTitle) && (
                    <header className="mb-6 border-b border-white/10 pb-4">
                        <div className="flex items-end justify-between">
                            <div>
                                {title && <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">{title}</h2>}
                                {subTitle && <p className="text-zinc-400 mt-1 text-sm font-light tracking-wide">{subTitle}</p>}
                            </div>
                            {/* Logo or Brand Element */}
                            <div className="text-xs font-mono text-violet-500/50">VIBE CODING V3</div>
                        </div>
                    </header>
                )}

                {/* Main Body */}
                <div className="flex-1 overflow-hidden min-h-0">
                    {children}
                </div>

                {/* Footer */}
                <footer className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-600">
                    <div className="flex items-center gap-4">
                        <span>CONFIDENTIAL - INTERNAL USE ONLY</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {pageNumber && (
                            <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                                {String(pageNumber).padStart(2, '0')}
                            </span>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
}
