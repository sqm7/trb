"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Store, Briefcase, Sprout, Users } from "lucide-react";

interface HeatmapGridProps {
    data: any;
    floorPremium?: number;
    showGrid?: boolean;
    showSummary?: boolean;
    showComparison?: boolean;
}

// Helper: Format number
const formatNumber = (num: number, decimals: number = 0) => {
    return num?.toLocaleString(undefined, { maximumFractionDigits: decimals });
};

// Premium Color Mapping
const getHeatmapColor = (premium: number | null, tx: any) => {
    // Special Types Overrides (Match HeatmapReport Legend)
    if (tx.isStorefront) return 'rgba(217, 119, 6, 0.4)'; // Amber-600 low opacity
    if (tx.isOffice) return 'rgba(37, 99, 235, 0.4)'; // Blue-600 low opacity

    if (premium === null) return '#1f2937'; // 灰色
    if (premium < 0) return 'rgba(139, 92, 246, 0.4)'; // Discount: Violet
    if (premium === 0) return '#06b6d4'; // Anchor: Cyan (typically border, but use color to highlight)
    if (premium > 5) return 'rgba(244, 63, 94, 0.5)'; // High: Red
    if (premium > 2) return 'rgba(234, 179, 8, 0.4)'; // Medium: Yellow
    return 'rgba(34, 197, 94, 0.3)'; // Low: Green
};

const getSpecialIcon = (tx: any) => {
    if (tx.isStorefront) return { icon: <Store className="w-3 h-3" />, label: "店舖" };
    if (tx.isOffice) return { icon: <Briefcase className="w-3 h-3" />, label: "辦公" };
    if (tx.remark?.includes("露台")) return { icon: <Sprout className="w-3 h-3" />, label: "露台" };
    if (tx.remark?.includes("親友") || tx.remark?.includes("員工")) return { icon: <Users className="w-3 h-3" />, label: "親友" };
    return null;
};

const PortalTooltip = ({ children, triggerRect, isTopRow }: { children: React.ReactNode, triggerRect: DOMRect | null, isTopRow: boolean }) => {
    if (!triggerRect) return null;

    // Calculate position
    const style: React.CSSProperties = {
        position: 'fixed',
        left: triggerRect.left + triggerRect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 9999, // High z-index
    };

    if (isTopRow) {
        style.top = triggerRect.bottom + 8;
    } else {
        style.bottom = (window.innerHeight - triggerRect.top) + 8;
    }

    return createPortal(
        <div style={style} className="pointer-events-none">
            {children}
        </div>,
        document.body
    );
};

export function PricingHeatmap({
    data,
    floorPremium = 0.3,
    showGrid = true,
    showSummary = true,
    showComparison = true
}: HeatmapGridProps) {
    const { horizontalGrid, sortedFloors, sortedUnits, unitColorMap, summary, horizontalComparison } = data;
    const [hoverData, setHoverData] = useState<{ rect: DOMRect, data: any, isTopRow: boolean } | null>(null);

    const handleMouseEnter = (e: React.MouseEvent, tx: any, isTopRow: boolean) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverData({ rect, data: tx, isTopRow });
    };

    const handleMouseLeave = () => {
        setHoverData(null);
    };

    if (!horizontalGrid || !sortedFloors || !sortedUnits) {
        return <div className="text-zinc-500 text-center p-8">無有效熱力圖資料</div>;
    }

    return (
        <div className="space-y-8 overflow-x-auto relative">
            {/* Tooltip Portal */}
            {hoverData && (
                <PortalTooltip triggerRect={hoverData.rect} isTopRow={hoverData.isTopRow}>
                    <div className="w-48 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                            {hoverData.data.premium === 0 && <div className="text-cyan-400 font-bold mb-1">★ 基準戶</div>}
                            {hoverData.data.premium !== null && (
                                <div className="text-zinc-300">
                                    調價: <span className={cn(
                                        hoverData.data.premium > 0 ? "text-red-400" : hoverData.data.premium < 0 ? "text-violet-400" : "text-zinc-400"
                                    )}>{hoverData.data.premium > 0 ? '+' : ''}{hoverData.data.premium.toFixed(2)}%</span>
                                </div>
                            )}
                            <div className="h-px bg-zinc-700 my-2" />
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-zinc-400">
                                <span>成交總價:</span> <span className="text-white text-right">{formatNumber(hoverData.data.tooltipInfo.totalPrice)}萬</span>
                                <span>房屋總價:</span> <span className="text-white text-right">{formatNumber(hoverData.data.tooltipInfo.housePrice)}萬</span>
                                <span>車位總價:</span> <span className="text-white text-right">{formatNumber(hoverData.data.tooltipInfo.parkingPrice)}萬</span>
                                <span>房屋面積:</span> <span className="text-white text-right">{formatNumber(hoverData.data.tooltipInfo.houseArea, 2)}坪</span>
                            </div>
                        </div>
                    </div>
                </PortalTooltip>
            )}

            {/* 1. Main Heatmap Grid */}
            {showGrid && (
                <div className="min-w-max pb-32">
                    <table className="divide-y divide-zinc-800 border-collapse w-full text-sm">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-dark-card z-20 p-2 text-zinc-400 border-r border-zinc-800">樓層 \ 戶別</th>
                                {sortedUnits.map((unit: string) => (
                                    <th
                                        key={unit}
                                        className="p-2 text-zinc-300 font-medium border-l border-zinc-800/50 bg-zinc-900/50"
                                    >
                                        {unit}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {sortedFloors.map((floor: string, floorIndex: number) => (
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
                                                        const bgColor = getHeatmapColor(tx.premium, tx);
                                                        const special = getSpecialIcon(tx);
                                                        const isAnchor = tx.premium === 0;
                                                        const isTopRow = floorIndex < 3; // First 3 rows go down

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={cn(
                                                                    "p-1.5 rounded text-xs transition-transform hover:scale-105 cursor-default relative group",
                                                                    isAnchor && "ring-1 ring-cyan-500"
                                                                )}
                                                                style={{ backgroundColor: bgColor }}
                                                                onMouseEnter={(e) => handleMouseEnter(e, tx, isTopRow)}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="font-semibold text-white flex items-center gap-1">
                                                                        {special && <span className="text-zinc-200" title={special.label}>{special.icon}</span>}
                                                                        {tx.unitPrice.toFixed(1)}萬
                                                                    </span>
                                                                    {tx.hasParking && (
                                                                        <span className="flex items-center justify-center w-3.5 h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-sm ml-0.5" title="含車位">
                                                                            P
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-zinc-300 mt-0.5 font-mono tracking-tight opacity-90">
                                                                    {tx.transactionDate || '-'}
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
            )}

            {/* 2. Summary Table */}
            {showSummary && summary && (
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
            {showComparison && horizontalComparison && horizontalComparison.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-zinc-200">
                        戶型水平價差與溢價貢獻
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
                                        <td className={cn("px-4 py-3", (item.horizontalPriceDiff || 0) > 0 ? "text-red-400" : "text-zinc-400")}>
                                            {typeof item.horizontalPriceDiff === 'number'
                                                ? `${item.horizontalPriceDiff > 0 ? '+' : ''}${item.horizontalPriceDiff.toFixed(2)} 萬/坪`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3">{item.unitsSold} 戶</td>
                                        <td className={cn("px-4 py-3 font-bold", item.timePremiumContribution > 0 ? "text-red-400" : "text-violet-400")}>
                                            {item.timePremiumContribution > 0 ? '+' : ''}{formatNumber(item.timePremiumContribution)} 萬
                                        </td>
                                        <td className="px-4 py-3">{typeof item.contributionPercentage === 'number' ? item.contributionPercentage.toFixed(2) : '0.00'}%</td>
                                        <td className="px-4 py-3">{formatNumber(item.baselineHousePrice)} 萬</td>
                                        <td className="px-4 py-3">{typeof item.avgPriceAdjustment === 'number' ? item.avgPriceAdjustment.toFixed(2) : '-'} 萬/坪</td>
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
