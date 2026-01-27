"use client";

import React, { useState } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { SalesVelocityChart } from "@/components/charts/SalesVelocityChart";
import { AreaHeatmapChart } from "@/components/charts/AreaHeatmapChart";
import { VelocityTable } from "@/components/tables/VelocityTable"; // Import the new table component
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getRoomType } from "@/lib/room-utils";
import { ExportButton } from "@/components/ui/ExportButton";

interface SalesVelocityReportProps {
    data: {
        salesVelocityAnalysis: any;
        areaDistributionAnalysis: any;
        transactionDetails?: any[];
    } | null;
}

export function SalesVelocityReport({ data }: SalesVelocityReportProps) {
    // Local State
    const [velocityView, setVelocityView] = useState<'monthly' | 'quarterly' | 'weekly' | 'yearly'>('monthly');
    const [velocityMetric, setVelocityMetric] = useState<'count' | 'priceSum' | 'areaSum'>('count');

    // Heatmap State
    const [minArea, setMinArea] = useState(15);
    const [maxArea, setMaxArea] = useState(65);
    const [interval, setInterval] = useState(5);

    // Aggregated Detail State
    const [aggregatedDetails, setAggregatedDetails] = useState<{
        projectName: string;
        count: number;
        priceRange: { min: number; max: number }; // Total Price
        unitPriceRange: { min: number; max: number }; // Unit Price
        transactions: any[];
        isExpanded: boolean;
    }[]>([]);

    const [heatmapModalMeta, setHeatmapModalMeta] = useState<{
        roomType: string;
        areaRange: string;
        totalCount: number;
    } | null>(null);

    // Common Room Selection
    const defaultRooms = ['2房', '3房'];
    const [selectedRooms, setSelectedRooms] = useState<string[]>(defaultRooms);

    if (!data) return null;
    const { salesVelocityAnalysis, areaDistributionAnalysis } = data;

    const toggleRoom = (r: string) => {
        setSelectedRooms(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    };

    // Helper for formatting
    const formatPrice = (val: number) => {
        return Math.round(val) + "萬";
    };

    // Toggle expand/collapse for a project group
    const toggleProjectExpand = (index: number) => {
        setAggregatedDetails(prev => prev.map((item, i) =>
            i === index ? { ...item, isExpanded: !item.isExpanded } : item
        ));
    };

    // Handle heatmap cell click
    const handleHeatmapClick = (roomType: string, areaRange: string) => {
        // Parse range using regex to handle "< 15", "> 65", "15-20"
        let minA = 0;
        let maxA = Infinity;

        if (areaRange.includes('<')) {
            maxA = parseFloat(areaRange.replace('<', '').trim());
        } else if (areaRange.includes('>')) {
            minA = parseFloat(areaRange.replace('>', '').trim());
        } else if (areaRange.includes('-')) {
            const parts = areaRange.split('-');
            minA = parseFloat(parts[0].trim());
            maxA = parseFloat(parts[1].trim());
        }

        const transactionDetails = data.transactionDetails || [];

        // Import the utility function (we need to import it at file level usually, but for this edit we assume it's imported)
        // Note: I will add the import statement in a separate edit or ensure it's here.
        // Actually, let's use the helper logic here directly or if I can't add import easily.
        // Best practice: Use the imported function.

        const filtered = transactionDetails.filter((tx: any) => {
            // Use our robust room classification logic
            const txRoom = getRoomType(tx);

            // Ensure we use '房屋面積(坪)' for area, handling multiple possible keys
            const txArea = parseFloat(
                tx['房屋面積(坪)'] ||
                tx.houseArea ||
                (tx['建物移轉平方公尺'] ? tx['建物移移轉平方公尺'] * 0.3025 : 0)
            );

            if (!txRoom) return false;

            // Room type match
            const roomMatch = txRoom === roomType;

            // Area match
            const areaMatch = txArea >= minA && txArea < maxA;

            return roomMatch && areaMatch;
        });

        console.log(`[Heatmap Click] Room: ${roomType}, Range: ${minA}-${maxA}, Found: ${filtered.length}`);

        // Aggregate by Project Name
        const groupedByProject: Record<string, any[]> = {};

        filtered.forEach((tx: any) => {
            const projectName = tx['建案名稱'] || tx.projectName || '未知建案';
            if (!groupedByProject[projectName]) {
                groupedByProject[projectName] = [];
            }
            groupedByProject[projectName].push(tx);
        });

        // Calculate Stats for each project
        const aggregated = Object.entries(groupedByProject).map(([projectName, txs]) => {
            const totalPrices = txs.map((t: any) => t['產權總價'] || t['交易總價(萬)'] || t.totalPrice || 0).filter((p: number) => p > 0).sort((a: number, b: number) => a - b);
            const unitPrices = txs.map((t: any) => t['房屋單價'] || t['房屋單價(萬)'] || t.unitPrice || 0).filter((p: number) => p > 0);

            // Calculate Median Total Price
            let medianTotalPrice = 0;
            if (totalPrices.length > 0) {
                const mid = Math.floor(totalPrices.length / 2);
                medianTotalPrice = totalPrices.length % 2 !== 0
                    ? totalPrices[mid]
                    : (totalPrices[mid - 1] + totalPrices[mid]) / 2;
            }

            return {
                projectName,
                count: txs.length,
                priceRange: {
                    min: totalPrices.length > 0 ? totalPrices[0] : 0,
                    max: totalPrices.length > 0 ? totalPrices[totalPrices.length - 1] : 0,
                    median: medianTotalPrice
                },
                unitPriceRange: {
                    min: unitPrices.length > 0 ? Math.min(...unitPrices) : 0,
                    max: unitPrices.length > 0 ? Math.max(...unitPrices) : 0
                },
                transactions: txs.sort((a: any, b: any) => {
                    // Sort by unit price desc by default
                    const pA = a['房屋單價'] || a['房屋單價(萬)'] || a.unitPrice || 0;
                    const pB = b['房屋單價'] || b['房屋單價(萬)'] || b.unitPrice || 0;
                    return pB - pA;
                }),
                isExpanded: false
            };
        });

        // Sort projects by Unit Price High to Low (using max unit price)
        aggregated.sort((a, b) => b.unitPriceRange.max - a.unitPriceRange.max);

        setAggregatedDetails(aggregated);
        setHeatmapModalMeta({
            roomType,
            areaRange,
            totalCount: filtered.length
        });
    };

    const availableRooms = ['套房', '1房', '2房', '3房', '4房', '毛胚', '店舖', '辦公/事務所'];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Room Filter Toolbar */}
            <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-lg flex flex-wrap gap-2 items-center sticky top-0 z-40 backdrop-blur-md">
                <span className="text-zinc-400 text-sm mr-2">分析房型:</span>
                {availableRooms.map(r => (
                    <button
                        key={r}
                        onClick={() => toggleRoom(r)}
                        className={cn(
                            "px-3 py-1 text-xs rounded-full border transition-colors",
                            selectedRooms.includes(r)
                                ? "bg-violet-500/20 border-violet-500 text-violet-200"
                                : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700"
                        )}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* 1. Sales Velocity Chart */}
            <ReportWrapper
                title="房型銷售速度與趨勢分析"
                headerAction={
                    <div className="flex gap-2">
                        <Select value={velocityView} onChange={(e) => setVelocityView(e.target.value as any)} className="w-[100px] h-8 text-xs bg-zinc-950/50">
                            <option value="weekly">每週</option>
                            <option value="monthly">每月</option>
                            <option value="quarterly">每季</option>
                        </Select>
                        <Select value={velocityMetric} onChange={(e) => setVelocityMetric(e.target.value as any)} className="w-[100px] h-8 text-xs bg-zinc-950/50">
                            <option value="count">交易筆數</option>
                            <option value="priceSum">總銷金額</option>
                            <option value="areaSum">總銷坪數</option>
                        </Select>
                        <ExportButton
                            data={salesVelocityAnalysis?.[velocityView]}
                            filename={`sales_velocity_${velocityView}`}
                            label="匯出"
                            columns={{ period: '時間區間', count: '交易筆數', priceSum: '總銷金額', areaSum: '總銷坪數' }}
                        />
                    </div>
                }
            >
                <SalesVelocityChart
                    data={salesVelocityAnalysis?.[velocityView]}
                    selectedRooms={selectedRooms}
                    metric={velocityMetric}
                />
            </ReportWrapper>

            {/* 2. Detailed Data Table (Velocity Table) */}
            <ReportWrapper
                title="銷售速度明細表"
                description="各時間段詳細銷售數據統計"
                headerAction={
                    <ExportButton
                        data={salesVelocityAnalysis?.[velocityView]}
                        filename={`sales_velocity_table_${velocityView}`}
                        label="匯出明細"
                        columns={{ period: '時間區間', count: '交易筆數', priceSum: '總銷金額', areaSum: '總銷坪數' }}
                    />
                }
            >
                <VelocityTable
                    data={salesVelocityAnalysis?.[velocityView]}
                    viewType={velocityView}
                    selectedRooms={selectedRooms}
                />
            </ReportWrapper>


            {/* 3. Area Heatmap */}
            <ReportWrapper
                title="房型面積分佈熱力圖"
                description="分析不同坪數區間的產品供給與去化分佈"
                headerAction={
                    <div className="flex gap-2 items-center text-zinc-400 text-xs">
                        <span>範圍:</span>
                        <Input
                            type="number"
                            value={minArea}
                            onChange={e => setMinArea(Number(e.target.value))}
                            className="w-16 h-8 text-xs bg-zinc-950/50"
                        />
                        <span>-</span>
                        <Input
                            type="number"
                            value={maxArea}
                            onChange={e => setMaxArea(Number(e.target.value))}
                            className="w-16 h-8 text-xs bg-zinc-950/50"
                        />
                        <span className="ml-2">級距:</span>
                        <Input
                            type="number"
                            value={interval}
                            onChange={e => setInterval(Number(e.target.value))}
                            className="w-16 h-8 text-xs bg-zinc-950/50"
                        />
                        <ExportButton
                            data={areaDistributionAnalysis ? Object.entries(areaDistributionAnalysis).map(([k, v]) => ({ key: k, value: JSON.stringify(v) })) : []}
                            filename="area_distribution_heatmap"
                            label="匯出熱力數據"
                            columns={{ key: '坪數區間', value: '分佈數據' }}
                        />
                    </div>
                }
            >
                <AreaHeatmapChart
                    data={areaDistributionAnalysis}
                    selectedRooms={selectedRooms}
                    minArea={minArea}
                    maxArea={maxArea}
                    interval={interval}
                    onDataPointClick={handleHeatmapClick}
                />

                {/* Aggregated Heatmap Detail Modal */}
                {heatmapModalMeta && (
                    <div className="mt-4 p-4 bg-zinc-900/50 border border-white/10 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <span className="text-cyan-400">{heatmapModalMeta.roomType}</span>
                                    <span className="text-zinc-500">|</span>
                                    <span>{heatmapModalMeta.areaRange} 坪</span>
                                </h4>
                                <p className="text-zinc-400 text-xs mt-1">
                                    共找到 {aggregatedDetails.length} 個建案，合計 {heatmapModalMeta.totalCount} 筆交易
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <ExportButton
                                    data={aggregatedDetails.flatMap(d => d.transactions)}
                                    filename={`heatmap_details_${heatmapModalMeta.roomType}_${heatmapModalMeta.areaRange}`}
                                    label="匯出交易明細"
                                />
                                <button
                                    onClick={() => setHeatmapModalMeta(null)}
                                    className="text-zinc-400 hover:text-white text-sm bg-zinc-800/50 px-3 py-1 rounded-full hover:bg-zinc-700 transition-colors"
                                >
                                    ✕ 關閉
                                </button>
                            </div>
                        </div>

                        {aggregatedDetails.length > 0 ? (
                            <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-zinc-800 text-zinc-300 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3 text-left w-[25%]">建案名稱 (戶數)</th>
                                            <th className="p-3 text-center w-[25%]">成交單價範圍 (萬/坪)</th>
                                            <th className="p-3 text-center w-[15%]">總價中位數</th>
                                            <th className="p-3 text-center w-[35%]">成交總價範圍 (萬)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {aggregatedDetails.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                {/* Summary Row */}
                                                <tr
                                                    className={cn(
                                                        "group transition-colors cursor-pointer select-none",
                                                        item.isExpanded ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"
                                                    )}
                                                    onClick={() => toggleProjectExpand(idx)}
                                                >
                                                    <td className="p-3 font-medium text-white flex items-center gap-2">
                                                        <span className={cn("text-zinc-500 transition-transform duration-200", item.isExpanded ? "rotate-90" : "")}>▶</span>
                                                        {item.projectName}
                                                        <span className="px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-300 text-[10px] min-w-[24px] text-center">
                                                            {item.count}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center font-mono text-cyan-400">
                                                        {item.unitPriceRange.min === item.unitPriceRange.max
                                                            ? item.unitPriceRange.min.toFixed(1)
                                                            : `${item.unitPriceRange.min.toFixed(1)} ~ ${item.unitPriceRange.max.toFixed(1)}`
                                                        }
                                                    </td>
                                                    <td className="p-3 text-center font-mono text-violet-400">
                                                        {formatPrice((item.priceRange as any).median || 0)}
                                                    </td>
                                                    <td className="p-3 text-center font-mono text-zinc-300">
                                                        {item.priceRange.min === item.priceRange.max
                                                            ? formatPrice(item.priceRange.min)
                                                            : `${formatPrice(item.priceRange.min)} ~ ${formatPrice(item.priceRange.max)}`
                                                        }
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Row */}
                                                {item.isExpanded && (
                                                    <tr>
                                                        <td colSpan={4} className="p-0 bg-zinc-950/30 inset-shadow">
                                                            <div className="p-2 pl-8 border-l-2 border-zinc-700/50 ml-4 my-1">
                                                                <table className="w-full text-xs bg-transparent opacity-80">
                                                                    <thead className="text-zinc-500 border-b border-white/5">
                                                                        <tr>
                                                                            <th className="py-1 text-left font-normal pl-2">樓層</th>
                                                                            <th className="py-1 text-left font-normal">戶型</th>
                                                                            <th className="py-1 text-right font-normal">坪數</th>
                                                                            <th className="py-1 text-right font-normal">單價</th>
                                                                            <th className="py-1 text-right font-normal pr-2">總價</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {item.transactions.slice(0, (item as any).showAll ? undefined : 10).map((tx: any, ti: number) => (
                                                                            <tr key={ti} className="hover:text-white">
                                                                                <td className="py-1 pl-2">{tx['樓層'] || tx.floor || '-'}</td>
                                                                                <td className="py-1 text-left text-zinc-400">
                                                                                    {tx['戶型'] || '-'}
                                                                                </td>
                                                                                <td className="py-1 text-right font-mono">{(tx['房屋面積(坪)'] || tx.houseArea || 0).toFixed(1)}</td>
                                                                                <td className="py-1 text-right font-mono text-cyan-500">{(tx['房屋單價(萬)'] || tx.unitPrice || 0).toFixed(1)}</td>
                                                                                <td className="py-1 text-right font-mono pr-2">{formatPrice(tx['交易總價(萬)'] || tx.totalPrice || 0)}</td>
                                                                            </tr>
                                                                        ))}
                                                                        {item.transactions.length > 10 && !(item as any).showAll && (
                                                                            <tr>
                                                                                <td colSpan={5} className="py-2 text-center">
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setAggregatedDetails(prev => prev.map((p, i) => i === idx ? { ...p, showAll: true } : p));
                                                                                        }}
                                                                                        className="text-zinc-500 hover:text-zinc-300 italic text-xs hover:underline"
                                                                                    >
                                                                                        ... 還有 {item.transactions.length - 10} 筆 (點擊展開) ...
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {item.transactions.length > 10 && (item as any).showAll && (
                                                                            <tr>
                                                                                <td colSpan={5} className="py-2 text-center">
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setAggregatedDetails(prev => prev.map((p, i) => i === idx ? { ...p, showAll: false } : p));
                                                                                        }}
                                                                                        className="text-zinc-500 hover:text-zinc-300 italic text-xs hover:underline"
                                                                                    >
                                                                                        ... 收合 ...
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-center py-8 bg-zinc-900/30 rounded border border-dashed border-zinc-800">
                                無詳細資料
                            </p>
                        )}
                    </div>
                )}
            </ReportWrapper>


        </div>
    );
}
