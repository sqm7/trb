"use client";

import React from "react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VelocityTableProps {
    data: any; // Using any for flexibility with complex nested object structure { [time]: { [room]: { count, priceSum, areaSum } } }
    viewType: 'monthly' | 'quarterly' | 'weekly' | 'yearly';
    selectedRooms: string[];
}

export function VelocityTable({ data, viewType, selectedRooms }: VelocityTableProps) {
    if (!data || Object.keys(data).length === 0) {
        return <div className="text-zinc-500 text-center p-8">無銷售速度資料</div>;
    }

    const timeKeys = Object.keys(data).sort().reverse();

    // Helper to format week dates if needed ( simplified version)
    const getWeekLabel = (label: string) => {
        if (viewType === 'weekly' && label.includes('-W')) {
            return label; // Keep simple for now, can implement date range logic if critical
        }
        return label;
    }

    const subHeaders = ['資料筆數', '產權總價', '房屋坪數'];

    return (
        <div className="overflow-x-auto max-h-[600px] border border-white/5 rounded-lg">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-zinc-900 sticky top-0 z-20 shadow-md">
                    <tr>
                        <th rowSpan={2} className="px-4 py-3 sticky left-0 z-30 bg-zinc-900 border-r border-white/10 font-medium text-white min-w-[120px]">
                            時間
                        </th>
                        {selectedRooms.map(room => (
                            <th key={room} colSpan={3} className="px-2 py-2 text-center border-l border-white/5 text-zinc-300 font-medium bg-zinc-900/90">
                                {room}
                            </th>
                        ))}
                        <th colSpan={3} className="px-2 py-2 text-center border-l-2 border-white/10 text-cyan-400 font-bold bg-zinc-900/90">
                            總計
                        </th>
                    </tr>
                    <tr>
                        {selectedRooms.map((room, i) => (
                            <React.Fragment key={room}>
                                <th className={cn("px-2 py-2 text-center text-xs text-zinc-500 font-normal bg-zinc-900/90 border-b border-white/10", i === 0 && "border-l border-white/5")}>筆數</th>
                                <th className="px-2 py-2 text-center text-xs text-zinc-500 font-normal bg-zinc-900/90 border-b border-white/10">總價(萬)</th>
                                <th className="px-2 py-2 text-center text-xs text-zinc-500 font-normal bg-zinc-900/90 border-b border-white/10">坪數</th>
                            </React.Fragment>
                        ))}
                        <th className="px-2 py-2 text-center text-xs text-zinc-400 font-medium bg-zinc-900/90 border-b border-white/10 border-l-2 border-white/10">筆數</th>
                        <th className="px-2 py-2 text-center text-xs text-zinc-400 font-medium bg-zinc-900/90 border-b border-white/10">總價(萬)</th>
                        <th className="px-2 py-2 text-center text-xs text-zinc-400 font-medium bg-zinc-900/90 border-b border-white/10">坪數</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {timeKeys.map((timeKey) => {
                        const periodData = data[timeKey] || {};
                        const rowTotal = { count: 0, priceSum: 0, areaSum: 0 };

                        return (
                            <tr key={timeKey} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-4 py-2 sticky left-0 z-10 bg-zinc-950/90 border-r border-white/10 font-mono text-zinc-400">
                                    {getWeekLabel(timeKey)}
                                </td>
                                {selectedRooms.map((room, i) => {
                                    const stats = periodData[room];
                                    if (stats) {
                                        rowTotal.count += stats.count;
                                        rowTotal.priceSum += stats.priceSum;
                                        rowTotal.areaSum += stats.areaSum;
                                        return (
                                            <React.Fragment key={room}>
                                                <td className={cn("px-2 py-2 text-center text-zinc-300", i === 0 && "border-l border-white/5")}>
                                                    {stats.count > 0 ? stats.count.toLocaleString() : '-'}
                                                </td>
                                                <td className="px-2 py-2 text-center text-zinc-500 font-mono text-xs">
                                                    {stats.count > 0 ? formatNumber(stats.priceSum, 0) : '-'}
                                                </td>
                                                <td className="px-2 py-2 text-center text-zinc-500 font-mono text-xs">
                                                    {stats.count > 0 ? formatNumber(stats.areaSum, 1) : '-'}
                                                </td>
                                            </React.Fragment>
                                        );
                                    } else {
                                        return (
                                            <React.Fragment key={room}>
                                                <td className={cn("px-2 py-2 text-center text-zinc-700", i === 0 && "border-l border-white/5")}>-</td>
                                                <td className="px-2 py-2 text-center text-zinc-700">-</td>
                                                <td className="px-2 py-2 text-center text-zinc-700">-</td>
                                            </React.Fragment>
                                        );
                                    }
                                })}
                                <td className="px-2 py-2 text-center font-bold text-cyan-400 border-l-2 border-white/10">
                                    {rowTotal.count.toLocaleString()}
                                </td>
                                <td className="px-2 py-2 text-center font-bold text-zinc-300 font-mono text-xs">
                                    {formatNumber(rowTotal.priceSum, 0)}
                                </td>
                                <td className="px-2 py-2 text-center font-bold text-zinc-300 font-mono text-xs">
                                    {formatNumber(rowTotal.areaSum, 1)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
