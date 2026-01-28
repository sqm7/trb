"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp, Grid3X3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartType } from "../page";

interface ComponentPaletteProps {
    onAddItem: (type: ChartType) => void;
    hasData: boolean;
}

const CHART_OPTIONS: { type: ChartType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        type: 'ranking-chart',
        label: '建案排名',
        icon: <BarChart3 className="h-5 w-5" />,
        description: '總銷金額排行榜'
    },
    {
        type: 'price-band-chart',
        label: '總價帶分析',
        icon: <Grid3X3 className="h-5 w-5" />,
        description: '價格帶分佈箱型圖'
    },
    {
        type: 'unit-price-bubble',
        label: '單價泡泡圖',
        icon: <Activity className="h-5 w-5" />,
        description: '建案單價分佈視覺化'
    },
    {
        type: 'sales-velocity-chart',
        label: '銷售速度',
        icon: <TrendingUp className="h-5 w-5" />,
        description: '去化速度趨勢圖'
    },
    {
        type: 'parking-pie',
        label: '車位分析',
        icon: <PieChart className="h-5 w-5" />,
        description: '車位類型分佈圓餅圖'
    },
];

export function ComponentPalette({ onAddItem, hasData }: ComponentPaletteProps) {
    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {CHART_OPTIONS.map((option) => (
                <button
                    key={option.type}
                    onClick={() => onAddItem(option.type)}
                    disabled={!hasData}
                    className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all group",
                        hasData
                            ? "bg-zinc-800/50 border-white/5 hover:bg-zinc-700/50 hover:border-violet-500/30 cursor-pointer"
                            : "bg-zinc-900/30 border-white/5 opacity-50 cursor-not-allowed"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            hasData ? "bg-zinc-700 group-hover:bg-violet-500/20 text-zinc-300 group-hover:text-violet-400" : "bg-zinc-800 text-zinc-600"
                        )}>
                            {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                                {option.label}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                                {option.description}
                            </div>
                        </div>
                    </div>
                </button>
            ))}

            {!hasData && (
                <div className="text-center py-4 text-xs text-zinc-500">
                    請先載入儀表板數據
                </div>
            )}
        </div>
    );
}
