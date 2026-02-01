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

import { AnalysisData } from "@/lib/types";
import { useFilterStore, ROOM_TYPE_OPTIONS } from "@/store/useFilterStore";
import { FloatingRoomFilter } from "@/components/features/FloatingRoomFilter";
import { motion, AnimatePresence } from "framer-motion";

interface SalesVelocityReportProps {
    data: AnalysisData | null;
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
    // Common Room Selection (Global)
    const { selectedRoomTypes, setSelectedRoomTypes } = useFilterStore();
    // Rename for local clarity if needed, or just use selectedRoomTypes
    const selectedRooms = selectedRoomTypes;
    const setSelectedRooms = setSelectedRoomTypes;

    if (!data) return null;
    const { salesVelocityAnalysis, areaDistributionAnalysis } = data;

    const toggleRoom = (r: string) => {
        setSelectedRooms(selectedRooms.includes(r) ? selectedRooms.filter(x => x !== r) : [...selectedRooms, r]);
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

    // Ref for the chart container inner div to manually control width during animation
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    // Handle heatmap cell click
    const handleHeatmapClick = (roomType: string, areaRange: string) => {
        // Freeze the chart container width before state update triggers layout animation
        if (chartContainerRef.current) {
            chartContainerRef.current.style.width = `${chartContainerRef.current.offsetWidth}px`;
        }

        // Parse range using regex to handle "< 15", "> 65", "15-20"
        let minA = 0;
        let maxA = Infinity;
        // ... (rest of parsing logic remains same)

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

    // Handle closing detail panel
    const handleCloseDetail = () => {
        // Freeze width for expansion too (though less critical, prevents immediate reflow)
        if (chartContainerRef.current) {
            chartContainerRef.current.style.width = `${chartContainerRef.current.offsetWidth}px`;
        }
        setHeatmapModalMeta(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Room Filter Toolbar */}
            <div id="room-type-filter-anchor" className="p-4 bg-zinc-900/30 border border-white/5 rounded-lg flex flex-wrap gap-2 items-center scroll-mt-24">
                <span className="text-zinc-400 text-sm mr-2">分析房型:</span>
                {ROOM_TYPE_OPTIONS.map(r => (
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
                            data={salesVelocityAnalysis?.[velocityView] as any || []}
                            filename={`sales_velocity_${velocityView}`}
                            label="匯出"
                            chartType="sales-velocity-chart"
                            snapshotData={salesVelocityAnalysis?.[velocityView] || []}
                            columns={{ period: '時間區間', count: '交易筆數', priceSum: '總銷金額', areaSum: '總銷坪數' }}
                        />
                    </div>
                }
            >
                <SalesVelocityChart
                    data={salesVelocityAnalysis?.[velocityView] as any || {}}
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
                        data={salesVelocityAnalysis?.[velocityView] as any}
                        filename={`sales_velocity_table_${velocityView}`}
                        label="匯出"
                        chartType="sales-velocity-table"
                        snapshotData={salesVelocityAnalysis?.[velocityView] || []}
                        columns={{ period: '時間區間', count: '交易筆數', priceSum: '總銷金額', areaSum: '總銷坪數' }}
                    />
                }
            >
                <VelocityTable
                    data={salesVelocityAnalysis?.[velocityView] || []}
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
                            step="0.5"
                            className="w-16 h-8 text-xs bg-zinc-950/50"
                        />
                        <div className="border-l border-white/10 h-4 mx-1" />
                        <ExportButton
                            data={areaDistributionAnalysis ? Object.entries(areaDistributionAnalysis).map(([k, v]) => ({ key: k, value: JSON.stringify(v) })) : []}
                            filename="area_distribution_heatmap"
                            label="匯出"
                            chartType="sales-heatmap"
                            snapshotData={{
                                distribution: areaDistributionAnalysis,
                                selectedRooms,
                                min: minArea,
                                max: maxArea,
                                interval
                            }}
                            columns={{ key: '坪數區間', value: '分佈數據' }}
                        />
                    </div>
                }
            >
                <div className={cn(
                    "flex flex-col lg:flex-row gap-6 relative overflow-hidden items-stretch transition-all duration-300",
                    heatmapModalMeta ? "lg:h-[600px]" : "min-h-[500px]"
                )}>
                    {/* Chart Section - Dynamic Width with Clipping Strategy */}
                    <motion.div
                        layout
                        initial={false}
                        animate={{
                            flex: heatmapModalMeta ? "0 0 60%" : "0 0 100%"
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 35,
                            mass: 1
                        }}
                        onAnimationStart={() => {
                            // No manual resize trigger needed at start, we WANT it to be frozen
                        }}
                        onAnimationComplete={() => {
                            // Unfreeze width and trigger resize to snap to new size
                            if (chartContainerRef.current) {
                                chartContainerRef.current.style.width = '100%';
                                window.dispatchEvent(new Event('resize'));
                            }
                        }}
                        className="min-w-0 overflow-hidden h-full flex flex-col"
                    >
                        <div ref={chartContainerRef} className="w-full h-full flex flex-col">
                            <AreaHeatmapChart
                                data={areaDistributionAnalysis || {}}
                                selectedRooms={selectedRooms}
                                minArea={minArea}
                                maxArea={maxArea}
                                interval={interval}
                                onDataPointClick={handleHeatmapClick}
                                height={heatmapModalMeta ? "100%" : undefined}
                            />
                        </div>
                    </motion.div>

                    {/* Aggregated Heatmap Detail Modal - Side Panel */}
                    <AnimatePresence mode="wait">
                        {heatmapModalMeta && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: "40%" }}
                                exit={{ opacity: 0, x: 50, width: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 35
                                }}
                                className="flex-1 min-w-0 bg-zinc-900/50 border border-white/10 rounded-lg h-full flex flex-col p-4 overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                                    <div>
                                        <h4 className="text-white font-medium flex items-center gap-2 text-lg">
                                            <span className="text-cyan-400">{heatmapModalMeta.roomType}</span>
                                            <span className="text-zinc-500">|</span>
                                            <span>{heatmapModalMeta.areaRange} 坪</span>
                                        </h4>
                                        <p className="text-zinc-400 text-xs mt-1">
                                            共找到 <span className="text-white font-mono">{aggregatedDetails.length}</span> 個建案
                                            <br />
                                            合計 <span className="text-white font-mono">{heatmapModalMeta.totalCount}</span> 筆交易
                                        </p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex gap-1 mr-2">
                                            <ExportButton
                                                data={aggregatedDetails}
                                                filename={`heatmap_aggregated_${heatmapModalMeta.roomType}_${heatmapModalMeta.areaRange}`}
                                                label="統計"
                                                chartType="sales-heatmap-detail"
                                                snapshotData={aggregatedDetails}
                                                className="whitespace-nowrap px-3 py-1 text-xs h-7 min-w-0"
                                            />
                                            <ExportButton
                                                data={aggregatedDetails.flatMap(d => d.transactions)}
                                                filename={`heatmap_details_${heatmapModalMeta.roomType}_${heatmapModalMeta.areaRange}`}
                                                label="明細"
                                                className="whitespace-nowrap px-3 py-1 text-xs h-7 min-w-0"
                                            />
                                        </div>
                                        <div className="w-px h-4 bg-white/10 mx-1" />
                                        <button
                                            onClick={handleCloseDetail}
                                            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6 6 18" />
                                                <path d="m6 6 12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {aggregatedDetails.length > 0 ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                                        <div className="space-y-3">
                                            {aggregatedDetails.map((item, idx) => (
                                                <div key={idx} className="bg-zinc-950/30 rounded border border-white/5 overflow-hidden">
                                                    {/* Card Header */}
                                                    <div
                                                        className={cn(
                                                            "p-3 cursor-pointer transition-colors flex justify-between items-center",
                                                            item.isExpanded ? "bg-zinc-800/80" : "hover:bg-zinc-800/40"
                                                        )}
                                                        onClick={() => toggleProjectExpand(idx)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 transition-transform duration-200",
                                                                item.isExpanded ? "rotate-90 bg-violet-500/20 text-violet-300" : ""
                                                            )}>
                                                                ▶
                                                            </div>
                                                            <span className="font-medium text-sm text-zinc-200">{item.projectName}</span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-white/5">
                                                                {item.count}戶
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs font-mono text-cyan-400">
                                                                {item.unitPriceRange.min === item.unitPriceRange.max
                                                                    ? item.unitPriceRange.min.toFixed(1)
                                                                    : `${item.unitPriceRange.min.toFixed(1)}~${item.unitPriceRange.max.toFixed(1)}`
                                                                } <span className="text-zinc-500 text-[10px]">萬/坪</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card Details (Expanded) */}
                                                    {item.isExpanded && (
                                                        <div className="p-3 bg-black/20 border-t border-white/5">
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-zinc-400">
                                                                <div className="flex justify-between border-b border-white/5 pb-1">
                                                                    <span>總價範圍</span>
                                                                    <span className="font-mono text-zinc-300">
                                                                        {item.priceRange.min === item.priceRange.max
                                                                            ? formatPrice(item.priceRange.min)
                                                                            : `${formatPrice(item.priceRange.min)}~${formatPrice(item.priceRange.max)}`
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between border-b border-white/5 pb-1">
                                                                    <span>總價中位數</span>
                                                                    <span className="font-mono text-violet-300">
                                                                        {formatPrice((item.priceRange as any).median || 0)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="grid grid-cols-5 text-[10px] text-zinc-500 pb-1 border-b border-white/5">
                                                                    <div className="col-span-1">樓層</div>
                                                                    <div className="col-span-1">坪數</div>
                                                                    <div className="col-span-1 text-right">單價</div>
                                                                    <div className="col-span-2 text-right">總價</div>
                                                                </div>
                                                                {item.transactions.slice(0, (item as any).showAll ? undefined : 10).map((tx: any, ti: number) => (
                                                                    <div key={ti} className="grid grid-cols-5 text-xs py-1 hover:bg-white/5 rounded px-1 -mx-1 transition-colors">
                                                                        <div className="col-span-1 text-zinc-300">{tx['樓層'] || tx.floor || '-'}</div>
                                                                        <div className="col-span-1 text-zinc-400">{(tx['房屋面積(坪)'] || tx.houseArea || 0).toFixed(1)}</div>
                                                                        <div className="col-span-1 text-right text-cyan-400">{(tx['房屋單價(萬)'] || tx.unitPrice || 0).toFixed(0)}</div>
                                                                        <div className="col-span-2 text-right text-zinc-300 font-mono">{formatPrice(tx['交易總價(萬)'] || tx.totalPrice || 0)}</div>
                                                                    </div>
                                                                ))}
                                                                {item.transactions.length > 10 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAggregatedDetails(prev => prev.map((p, i) => i === idx ? { ...p, showAll: !(p as any).showAll } : p));
                                                                        }}
                                                                        className="w-full text-center text-[10px] text-zinc-500 hover:text-cyan-400 py-1.5 mt-1 border-t border-white/5 transition-colors"
                                                                    >
                                                                        {(item as any).showAll ? "收合內容" : `還有 ${item.transactions.length - 10} 筆交易...`}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded bg-zinc-900/30">
                                        <p>無詳細資料</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ReportWrapper >


            <FloatingRoomFilter />
        </div >
    );
}
