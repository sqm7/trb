"use client";

import React, { useState } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { SalesVelocityChart } from "@/components/charts/SalesVelocityChart";
import { AreaHeatmapChart } from "@/components/charts/AreaHeatmapChart";
import { VelocityTable } from "@/components/tables/VelocityTable"; // Import the new table component
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

    // Heatmap detail modal state
    const [heatmapDetail, setHeatmapDetail] = useState<{
        roomType: string;
        areaRange: string;
        transactions: any[];
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

        const filtered = transactionDetails.filter((tx: any) => {
            // Support both data structures (API raw keys vs normalized keys)
            const txRoom = tx['房型'] || tx.roomType || tx['戶型']; // Some data uses 戶型
            // Ensure we use '房屋面積(坪)' for area
            const txArea = parseFloat(tx['房屋面積(坪)'] || tx.houseArea || (tx['建物移轉平方公尺'] ? tx['建物移轉平方公尺'] * 0.3025 : 0));

            if (!txRoom) return false;

            // Loose matching for room type
            const roomMatch = txRoom === roomType;
            const areaMatch = txArea >= minA && txArea < maxA;

            return roomMatch && areaMatch;
        });
        setHeatmapDetail({ roomType, areaRange, transactions: filtered });
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
                action={
                    <div className="flex gap-2">
                        <Select value={velocityView} onChange={(e) => setVelocityView(e.target.value as any)} className="w-[100px] h-8 text-xs bg-zinc-950/50">
                            <option value="weekly">每週</option>
                            <option value="monthly">每月</option>
                            <option value="quarterly">每季</option>
                            <option value="yearly">每年</option>
                        </Select>
                        <Select value={velocityMetric} onChange={(e) => setVelocityMetric(e.target.value as any)} className="w-[100px] h-8 text-xs bg-zinc-950/50">
                            <option value="count">交易筆數</option>
                            <option value="priceSum">總銷金額</option>
                            <option value="areaSum">總銷坪數</option>
                        </Select>
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
                action={
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

                {/* Heatmap Detail Modal */}
                {heatmapDetail && (
                    <div className="mt-4 p-4 bg-zinc-900/50 border border-white/10 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-white font-medium">
                                {heatmapDetail.roomType} - {heatmapDetail.areaRange} 坪
                                <span className="text-zinc-400 text-sm ml-2">(共 {heatmapDetail.transactions.length} 筆)</span>
                            </h4>
                            <button
                                onClick={() => setHeatmapDetail(null)}
                                className="text-zinc-400 hover:text-white text-sm"
                            >
                                ✕ 關閉
                            </button>
                        </div>
                        {heatmapDetail.transactions.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-zinc-800 text-zinc-400 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">建案</th>
                                            <th className="p-2 text-right">坪數</th>
                                            <th className="p-2 text-right">單價</th>
                                            <th className="p-2 text-right">總價</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {heatmapDetail.transactions.slice(0, 50).map((tx: any, i: number) => (
                                            <tr key={i} className="hover:bg-zinc-800/50">
                                                <td className="p-2">{tx.建案名稱 || tx.projectName || '-'}</td>
                                                <td className="p-2 text-right font-mono">{(tx.房屋面積 || tx['房屋面積(坪)'] || tx.houseArea || 0).toFixed(1)}</td>
                                                <td className="p-2 text-right font-mono text-cyan-400">{(tx.房屋單價 || tx['房屋單價(萬)'] || tx.unitPrice || 0).toFixed(1)}</td>
                                                <td className="p-2 text-right font-mono">{formatPrice(tx.產權總價 || tx['交易總價(萬)'] || tx.totalPrice || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-center py-4">無詳細資料</p>
                        )}
                    </div>
                )}
            </ReportWrapper>

        </div>
    );
}
