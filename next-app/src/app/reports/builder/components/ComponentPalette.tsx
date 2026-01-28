"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp, Grid3X3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartType } from "@/store/useReportBuilderStore";

interface ComponentPaletteProps {
    onAddItem: (type: ChartType) => void;
    hasData: boolean;
}

const CHART_CATEGORIES = [
    {
        id: 'ranking',
        title: '核心指標與排名',
        items: [
            { type: 'ranking-metrics', label: '核心數據指標', icon: <Activity className="h-4 w-4" />, description: '8 項關鍵成交指標卡片' },
            { type: 'ranking-chart', label: '建案排名圖表', icon: <BarChart3 className="h-4 w-4" />, description: '總銷與各項指標排名' },
            { type: 'ranking-table', label: '建案排名列表', icon: <BarChart3 className="h-4 w-4" />, description: '詳細數據列表' },
        ]
    },
    {
        id: 'price-band',
        title: '總價帶分析',
        items: [
            { type: 'price-band-chart', label: '總價帶分佈', icon: <Grid3X3 className="h-4 w-4" />, description: '價格區間箱型圖' },
            { type: 'price-band-table', label: '總價帶詳情', icon: <Grid3X3 className="h-4 w-4" />, description: '各房型衛浴統計' },
            { type: 'price-band-location-chart', label: '區域成交佔比', icon: <PieChart className="h-4 w-4" />, description: '各區房型分佈' },
            { type: 'price-band-location-table', label: '區域房型分佈', icon: <Grid3X3 className="h-4 w-4" />, description: '區域交叉分析表' },
        ]
    },
    {
        id: 'unit-price',
        title: '單價分析',
        items: [
            { type: 'unit-price-stats', label: '各用途單價統計', icon: <Activity className="h-4 w-4" />, description: '住宅/辦公/店面指標卡' },
            { type: 'unit-price-bubble', label: '單價泡泡圖', icon: <Activity className="h-4 w-4" />, description: '成交單價熱度分佈' },
            { type: 'type-comparison-table', label: '產品類型比較', icon: <Grid3X3 className="h-4 w-4" />, description: '住宅/店面/辦公均價' },
        ]
    },
    {
        id: 'heatmap',
        title: '調價熱力圖',
        items: [
            { type: 'heatmap', label: '銷控熱力圖', icon: <Grid3X3 className="h-4 w-4" />, description: '樓層戶別價差分析' },
        ]
    },
    {
        id: 'velocity',
        title: '銷售速度與房型',
        items: [
            { type: 'sales-velocity-chart', label: '銷售速度趨勢', icon: <TrendingUp className="h-4 w-4" />, description: '去化速度與量能' },
            { type: 'sales-velocity-table', label: '銷售速度明細', icon: <Grid3X3 className="h-4 w-4" />, description: '詳細銷售數據' },
        ]
    },
    {
        id: 'parking',
        title: '車位分析',
        items: [
            { type: 'parking-pie', label: '房車配比', icon: <PieChart className="h-4 w-4" />, description: '有/無車位比例' },
            { type: 'parking-price', label: '車位均價', icon: <BarChart3 className="h-4 w-4" />, description: '各類車位行情' },
            { type: 'parking-scatter', label: '車位坪數散佈', icon: <Activity className="h-4 w-4" />, description: '規模與價值分析' },
            { type: 'parking-floor', label: '樓層價差', icon: <TrendingUp className="h-4 w-4" />, description: '地下室樓層價差' },
        ]
    },
    {
        id: 'others',
        title: '其他',
        items: [
            { type: 'data-list', label: '交易明細列表', icon: <BarChart3 className="h-4 w-4" />, description: '原始交易數據' },
        ]
    }
] as const;

export function ComponentPalette({ onAddItem, hasData }: ComponentPaletteProps) {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-3 space-y-6">
                {CHART_CATEGORIES.map((category) => (
                    <div key={category.id} className="space-y-2">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">
                            {category.title}
                        </h3>
                        <div className="space-y-1">
                            {category.items.map((option) => (
                                <button
                                    key={option.type}
                                    onClick={() => onAddItem(option.type as ChartType)}
                                    disabled={!hasData}
                                    className={cn(
                                        "w-full p-2.5 rounded-lg border text-left transition-all group relative overflow-hidden",
                                        hasData
                                            ? "bg-zinc-800/40 border-white/5 hover:bg-zinc-700/60 hover:border-violet-500/30 cursor-pointer"
                                            : "bg-zinc-900/30 border-white/5 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={cn(
                                            "p-1.5 rounded-md transition-colors",
                                            hasData ? "bg-zinc-700/50 group-hover:bg-violet-500/20 text-zinc-400 group-hover:text-violet-300" : "bg-zinc-800 text-zinc-600"
                                        )}>
                                            {option.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                                                {option.label}
                                            </div>
                                            <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400 truncate">
                                                {option.description}
                                            </div>
                                        </div>
                                    </div>
                                    {hasData && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {!hasData && (
                <div className="text-center py-8 text-xs text-zinc-500 px-4">
                    請先從左側載入儀表板數據，才能使用組建功能。
                </div>
            )}
        </div>
    );
}
