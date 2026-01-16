"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface HeatmapGridProps {
    data: any;
    floorPremium?: number;
}

// Helper: Format number
const formatNumber = (num: number, decimals: number = 0) => {
    return num?.toLocaleString(undefined, { maximumFractionDigits: decimals });
};

// Premium Color Mapping
const getHeatmapColor = (premium: number | null) => {
    if (premium === null) return '#1f2937'; // 灰色
    if (premium < 0) return 'rgba(139, 92, 246, 0.4)'; // Discount: Violet
    if (premium === 0) return '#06b6d4'; // Anchor: Cyan (Border usually, but color here) - logic adjusted
    if (premium > 5) return 'rgba(244, 63, 94, 0.5)'; // High: Red
    if (premium > 2) return 'rgba(234, 179, 8, 0.4)'; // Medium: Yellow
    return 'rgba(34, 197, 94, 0.3)'; // Low: Green
};

const getSpecialIcon = (tx: any) => {
    if (tx.isStorefront) return { icon: <i className="fas fa-store" />, label: "店舖" };
    if (tx.isOffice) return { icon: <i className="fas fa-briefcase" />, label: "辦公" };
    if (tx.remark?.includes("露台")) return { icon: <i className="fas fa-seedling" />, label: "露台" };
    if (tx.remark?.includes("親友") || tx.remark?.includes("員工")) return { icon: <i className="fas fa-users" />, label: "親友" };
    return null;
};

export function PricingHeatmap({ data, floorPremium = 0.3 }: HeatmapGridProps) {
    const { horizontalGrid, sortedFloors, sortedUnits, unitColorMap, summary, horizontalComparison } = data;

    if (!horizontalGrid || !sortedFloors || !sortedUnits) {
        return <div className="text-zinc-500 text-center p-8">無有效熱力圖資料</div>;
    }

    return (
        <div className="space-y-8 overflow-x-auto">
            {/* 1. Main Heatmap Grid */}
            <div className="min-w-max">
                <table className="divide-y divide-zinc-800 border-collapse w-full text-sm">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-dark-card z-20 p-2 text-zinc-400 border-r border-zinc-800">樓層 \ 戶別</th>
                            {sortedUnits.map((unit: string) => (
                                <th
                                    key={unit}
                                    className="p-2 text-white font-medium border-l border-zinc-800/50"
                                    style={{ backgroundColor: `${unitColorMap[unit] || '#4b5563'}80` }}
                                >
                                    {unit}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {sortedFloors.map((floor: string) => (
                            <tr key={floor} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="sticky left-0 bg-dark-card z-10 p-2 font-bold text-zinc-300 border-r border-zinc-800 text-center">
                                    {floor}
                                </td>
                                {sortedUnits.map((unit: string) => {
                                    const cellData = horizontalGrid[floor]?.[unit];

                                    if (!cellData || cellData.length === 0) {
                                        return (
                                            <td key={`${floor}-${unit}`} className="p-2 border-l border-zinc-800/50 bg-zinc-900/20 text-center text-zinc-600">
                                                -
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={`${floor}-${unit}`} className="p-1 border-l border-zinc-800/50 align-top">
                                            <div className="flex flex-col gap-1">
                                                {cellData.map((tx: any, idx: number) => {
                                                    const bgColor = getHeatmapColor(tx.premium);
                                                    const special = getSpecialIcon(tx);
                                                    const isAnchor = tx.premium === 0;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "p-1.5 rounded text-xs transition-transform hover:scale-105 cursor-default relative group",
                                                                isAnchor && "ring-1 ring-cyan-500"
                                                            )}
                                                            style={{ backgroundColor: bgColor }}
                                                        >
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="font-semibold text-white">
                                                                    {special && <span className="mr-1 text-zinc-200" title={special.label}>{special.icon}</span>}
                                                                    {tx.unitPrice.toFixed(1)}萬
                                                                </span>
                                                                {tx.hasParking && <span className="text-[10px] bg-zinc-900/40 px-1 rounded text-zinc-300" title="含車位">P</span>}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-300/80 mt-0.5">
                                                                {tx.transactionDate}
                                                            </div>

                                                            {/* Custom Tooltip */}
                                                            <div className="absolute z-50 hidden group-hover:block w-48 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl -translate-y-full -translate-x-1/2 left-1/2 top-[-8px]">
                                                                <div className="space-y-1">
                                                                    {isAnchor && <div className="text-cyan-400 font-bold mb-1">★ 基準戶</div>}
                                                                    {tx.premium !== null && (
                                                                        <div className="text-zinc-300">
                                                                            調價: <span className={cn(
                                                                                tx.premium > 0 ? "text-red-400" : tx.premium < 0 ? "text-violet-400" : "text-zinc-400"
                                                                            )}>{tx.premium > 0 ? '+' : ''}{tx.premium.toFixed(2)}%</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="h-px bg-zinc-700 my-2" />
                                                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-zinc-400">
                                                                        <span>成交總價:</span> <span className="text-white text-right">{formatNumber(tx.tooltipInfo.totalPrice)}萬</span>
                                                                        <span>房屋總價:</span> <span className="text-white text-right">{formatNumber(tx.tooltipInfo.housePrice)}萬</span>
                                                                        <span>車位總價:</span> <span className="text-white text-right">{formatNumber(tx.tooltipInfo.parkingPrice)}萬</span>
                                                                        <span>房屋坪數:</span> <span className="text-white text-right">{formatNumber(tx.tooltipInfo.houseArea, 2)}坪</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 2. Summary Table */}
            {summary && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-zinc-200">調價幅度統計摘要 (排除店舖/辦公室)</h3>
                    <div className="overflow-x-auto rounded-lg border border-zinc-800">
                        <table className="w-full text-sm text-left text-zinc-300">
                            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-3">基準房屋總價</th>
                                    <th className="px-6 py-3">調價幅度總額</th>
                                    <th className="px-6 py-3">總溢價率</th>
                                    <th className="px-6 py-3">已售房屋坪數</th>
                                    <th className="px-6 py-3">平均單價調價</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-zinc-900/20 border-b border-zinc-800">
                                    <td className="px-6 py-4">{formatNumber(summary.totalBaselineHousePrice)} 萬</td>
                                    <td className={cn("px-6 py-4 font-bold", summary.totalPricePremiumValue > 0 ? "text-red-400" : "text-violet-400")}>
                                        {summary.totalPricePremiumValue > 0 ? '+' : ''}{formatNumber(summary.totalPricePremiumValue)} 萬
                                    </td>
                                    <td className="px-6 py-4">
                                        {((summary.totalPricePremiumValue / summary.totalBaselineHousePrice) * 100).toFixed(2)} %
                                    </td>
                                    <td className="px-6 py-4">{formatNumber(summary.totalSoldArea)} 坪</td>
                                    <td className={cn("px-6 py-4", summary.totalPricePremiumValue > 0 ? "text-red-400" : "text-violet-400")}>
                                        {(summary.totalPricePremiumValue / summary.totalSoldArea).toFixed(2)} 萬/坪
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. Horizontal Comparison Table */}
            {horizontalComparison && horizontalComparison.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-zinc-200">
                        戶型水平價差與溢價貢獻 (基準樓層: F{data.refFloorForComparison || 'N/A'})
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-zinc-800">
                        <table className="w-full text-sm text-left text-zinc-300">
                            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50">
                                <tr>
                                    <th className="px-4 py-3">戶型</th>
                                    <th className="px-4 py-3">基準戶 (樓/價)</th>
                                    <th className="px-4 py-3">水平價差(萬/坪)</th>
                                    <th className="px-4 py-3">去化戶數</th>
                                    <th className="px-4 py-3">溢價貢獻</th>
                                    <th className="px-4 py-3">貢獻佔比</th>
                                    <th className="px-4 py-3">基準房屋總價</th>
                                    <th className="px-4 py-3">平均單價調價</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horizontalComparison.map((item: any, idx: number) => (
                                    <tr key={idx} className="bg-zinc-900/20 border-b border-zinc-800 hover:bg-zinc-800/20">
                                        <td className="px-4 py-3 font-medium text-white">{item.unitType}</td>
                                        <td className="px-4 py-3">{item.anchorInfo}</td>
                                        <td className={cn("px-4 py-3", item.horizontalPriceDiff > 0 ? "text-red-400" : "text-zinc-400")}>
                                            {item.horizontalPriceDiff > 0 ? '+' : ''}{item.horizontalPriceDiff.toFixed(2)} 萬/坪
                                        </td>
                                        <td className="px-4 py-3">{item.unitsSold} 戶</td>
                                        <td className={cn("px-4 py-3 font-bold", item.timePremiumContribution > 0 ? "text-red-400" : "text-violet-400")}>
                                            {item.timePremiumContribution > 0 ? '+' : ''}{formatNumber(item.timePremiumContribution)} 萬
                                        </td>
                                        <td className="px-4 py-3">{item.contributionPercentage}%</td>
                                        <td className="px-4 py-3">{formatNumber(item.baselineHousePrice)} 萬</td>
                                        <td className="px-4 py-3">{item.avgPriceAdjustment} 萬/坪</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
