"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReportWrapperProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function ReportWrapper({ title, description, children, action, className }: ReportWrapperProps) {
    return (
        <Card className={cn("bg-zinc-900/50 border-white/5 overflow-hidden", className)}>
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
                    {description && <p className="text-sm text-zinc-400">{description}</p>}
                </div>
                {action && <div className="flex items-center gap-2">{action}</div>}
            </div>
            <div className="p-6">
                {children}
            </div>
        </Card>
    );
}
