"use client";

import React from "react";
import { cn, formatNumber } from "@/lib/utils";

interface StatsBlockProps {
    title: string;
    stats: {
        count: number;
        avgPrice: number;
        weightedAvgPrice?: number;  // Optional weighted average
        minPrice: number;
        q1Price: number;
        medianPrice: number;
        q3Price: number;
        maxPrice: number;
        minPriceProject?: string;
        minPriceUnit?: string;
        minPriceFloor?: string;
        maxPriceProject?: string;
        maxPriceUnit?: string;
        maxPriceFloor?: string;
    } | null;
    noDataMessage?: string;
    className?: string;
    averageType?: 'arithmetic' | 'weighted';
}

export function UnitPriceStatsBlock({
    title,
    stats,
    noDataMessage = "無資料",
    className,
    averageType = 'weighted'
}: StatsBlockProps) {
    if (!stats || stats.count === 0) {
        return (
            <div className={cn("p-6 border border-white/5 rounded-lg bg-zinc-900/30", className)}>
                <h3 className="text-zinc-400 font-medium mb-4">{title}</h3>
                <p className="text-zinc-500 text-center py-4">{noDataMessage}</p>
            </div>
        );
    }

    // Select appropriate average based on type
    const displayAvgPrice = averageType === 'weighted' && stats.weightedAvgPrice
        ? stats.weightedAvgPrice
        : stats.avgPrice;
    const avgTypeLabel = averageType === 'weighted' ? '加權平均單價' : '算術平均單價';

    return (
        <div className={cn("p-6 border border-white/5 rounded-lg bg-zinc-900/30", className)}>
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">樣本數: {stats.count}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Main Stats Table */}
                <div className="space-y-1">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-white/5">
                            <tr className="group">
                                <td className="py-2 text-zinc-400">{avgTypeLabel}</td>
                                <td className="py-2 text-right font-mono text-white group-hover:text-cyan-400 transition-colors">{formatNumber(displayAvgPrice)} 萬/坪</td>
                            </tr>
                            <tr className="group">
                                <td className="py-2 text-zinc-400">最低單價</td>
                                <td className="py-2 text-right font-mono text-zinc-300 group-hover:text-white transition-colors">{formatNumber(stats.minPrice)}</td>
                            </tr>
                            <tr className="group">
                                <td className="py-2 text-zinc-400">1/4分位數</td>
                                <td className="py-2 text-right font-mono text-zinc-300 group-hover:text-white transition-colors">{formatNumber(stats.q1Price)}</td>
                            </tr>
                            <tr className="group">
                                <td className="py-2 text-violet-400 font-medium">中位數單價</td>
                                <td className="py-2 text-right font-mono text-violet-400 font-bold">{formatNumber(stats.medianPrice)}</td>
                            </tr>
                            <tr className="group">
                                <td className="py-2 text-zinc-400">3/4分位數</td>
                                <td className="py-2 text-right font-mono text-zinc-300 group-hover:text-white transition-colors">{formatNumber(stats.q3Price)}</td>
                            </tr>
                            <tr className="group">
                                <td className="py-2 text-zinc-400">最高單價</td>
                                <td className="py-2 text-right font-mono text-zinc-300 group-hover:text-white transition-colors">{formatNumber(stats.maxPrice)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 2. Extreme Values Info */}
                <div className="space-y-4 text-sm">
                    <div className="p-3 bg-zinc-950/50 rounded border border-white/5">
                        <div className="text-cyan-500 font-medium mb-1 text-xs uppercase tracking-wider">最高價建案</div>
                        <div className="text-white font-bold text-lg mb-1">{stats.maxPriceProject || 'N/A'}</div>
                        <div className="flex gap-4 text-zinc-400 text-xs">
                            <span>戶型: {stats.maxPriceUnit || '-'}</span>
                            <span>樓層: {stats.maxPriceFloor || '-'}</span>
                        </div>
                    </div>

                    <div className="p-3 bg-zinc-950/50 rounded border border-white/5">
                        <div className="text-green-500 font-medium mb-1 text-xs uppercase tracking-wider">最低價建案</div>
                        <div className="text-white font-bold text-lg mb-1">{stats.minPriceProject || 'N/A'}</div>
                        <div className="flex gap-4 text-zinc-400 text-xs">
                            <span>戶型: {stats.minPriceUnit || '-'}</span>
                            <span>樓層: {stats.minPriceFloor || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
