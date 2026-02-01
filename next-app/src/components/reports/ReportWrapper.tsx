"use client";

import React from "react";
import { Card } from "@/components/ui/card";
// import { Card } from "@/components/ui/card"; // Card is no longer used
import { cn } from "@/lib/utils";

interface ReportWrapperProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
    className?: string;
}

export function ReportWrapper({ title, description, children, headerAction, className }: ReportWrapperProps) {
    return (
        <div className={cn("bg-zinc-900/50 border border-white/5 rounded-2xl p-4 md:p-6 backdrop-blur-sm", className)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-zinc-400 text-sm mt-1">{description}</p>
                    )}
                </div>
                {headerAction && (
                    <div className="flex-shrink-0 w-full md:w-auto overflow-x-auto">
                        {headerAction}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
