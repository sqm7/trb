"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { ParkingRatioChart } from "@/components/charts/ParkingRatioChart";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface FloorData {
    floor: string;
    count: number;
    avgPrice: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    minPrice: number;
    rawRecords?: Array<{ parkingPrice: number; parkingArea?: number }>;
}

interface ParkingAnalysisReportProps {
    data: {
        parkingAnalysis: {
            parkingRatio: any;
            avgPriceByType: any[];
            rampPlanePriceByFloor: FloorData[];
        }
    } | null;
}

// Calculate statistics from selected floors
function calculateFloorStats(floors: FloorData[], selectedFloors: string[]): { avgPrice: number; medianPrice: number; q3Price: number; count: number } {
    const allPrices: number[] = [];
    floors.forEach(f => {
        if (selectedFloors.includes(f.floor) && f.rawRecords) {
            f.rawRecords.forEach(r => {
                if (typeof r.parkingPrice === 'number' && !isNaN(r.parkingPrice)) {
                    allPrices.push(r.parkingPrice);
                }
            });
        }
    });

    if (allPrices.length === 0) {
        return { avgPrice: 0, medianPrice: 0, q3Price: 0, count: 0 };
    }

    allPrices.sort((a, b) => a - b);
    const sum = allPrices.reduce((acc, p) => acc + p, 0);
    const avgPrice = sum / allPrices.length;

    const medianPrice = allPrices[Math.floor(allPrices.length / 2)];
    const q3Index = Math.floor(allPrices.length * 0.75);
    const q3Price = allPrices[q3Index] || medianPrice;

    return { avgPrice, medianPrice, q3Price, count: allPrices.length };
}

export function ParkingAnalysisReport({ data }: ParkingAnalysisReportProps) {
    // State: selected floors for dynamic stats
    const [selectedFloors, setSelectedFloors] = useState<string[]>(['B1', 'B2', 'B3', 'B4']);
    // State: hovered floor for 3D interaction
    const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

    if (!data?.parkingAnalysis) return null;

    const { parkingRatio, avgPriceByType, rampPlanePriceByFloor } = data.parkingAnalysis;

    const validFloors = ['B1', 'B2', 'B3', 'B4', 'B5_below'];
    const filteredFloorData = rampPlanePriceByFloor?.filter(f => validFloors.includes(f.floor) && f.count > 0) || [];

    // Compute dynamic stats based on selected floors
    const dynamicStats = useMemo(() => {
        return calculateFloorStats(filteredFloorData, selectedFloors);
    }, [filteredFloorData, selectedFloors]);

    const toggleFloor = useCallback((floor: string) => {
        setSelectedFloors(prev =>
            prev.includes(floor)
                ? prev.filter(f => f !== floor)
                : [...prev, floor]
        );
    }, []);

    const toggleAll = useCallback(() => {
        if (selectedFloors.length === validFloors.length) {
            setSelectedFloors([]);
        } else {
            setSelectedFloors([...validFloors]);
        }
    }, [selectedFloors.length]);

    const floorColors: Record<string, string> = {
        'B1': '#06b6d4',
        'B2': '#3b82f6',
        'B3': '#6366f1',
        'B4': '#8b5cf6',
        'B5_below': '#a855f7',
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Parking Ratio */}
                <ReportWrapper title="房車配比分析" description="建案有購置車位的比例">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-1/2">
                            <ParkingRatioChart data={parkingRatio} />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-900/50 text-zinc-500">
                                    <tr><th className="p-2 text-left">類型</th><th className="p-2 text-right">筆數</th><th className="p-2 text-right">佔比</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr>
                                        <td className="p-2">有搭車位</td>
                                        <td className="p-2 text-right font-mono text-zinc-300">{parkingRatio?.withParking?.count.toLocaleString()}</td>
                                        <td className="p-2 text-right font-mono text-cyan-400">{parkingRatio?.withParking?.percentage.toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2">無車位</td>
                                        <td className="p-2 text-right font-mono text-zinc-300">{parkingRatio?.withoutParking?.count.toLocaleString()}</td>
                                        <td className="p-2 text-right font-mono text-zinc-500">{parkingRatio?.withoutParking?.percentage.toFixed(2)}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ReportWrapper>

                {/* 2. Price By Type */}
                <ReportWrapper title="車位類型均價" description="各類車位成交行情">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-900/50 text-zinc-500">
                            <tr>
                                <th className="p-2 text-left">類型</th>
                                <th className="p-2 text-right">均價(萬)</th>
                                <th className="p-2 text-right">中位數</th>
                                <th className="p-2 text-right">總數</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {avgPriceByType?.map((item: any) => (
                                <tr key={item.type} className="hover:bg-zinc-800/50">
                                    <td className="p-2 font-medium">{item.type}</td>
                                    <td className="p-2 text-right font-mono text-cyan-400">{Math.round(item.avgPrice).toLocaleString()}</td>
                                    <td className="p-2 text-right font-mono text-zinc-300">{Math.round(item.medianPrice).toLocaleString()}</td>
                                    <td className="p-2 text-right font-mono text-zinc-500">{item.count.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ReportWrapper>
            </div>

            {/* 3. Ramp Plane Area Stats */}
            <ReportWrapper title="坡道平面車位坪數統計" description="坡道平面車位的面積分佈">
                {(() => {
                    // Calculate area stats from rampPlanePriceByFloor
                    let allAreas: number[] = [];
                    filteredFloorData.forEach(floorData => {
                        if (floorData.rawRecords) {
                            floorData.rawRecords.forEach((record: any) => {
                                const area = record.parkingArea || record['車位面積(坪)'];
                                if (typeof area === 'number' && area > 0) {
                                    allAreas.push(area);
                                }
                            });
                        }
                    });

                    if (allAreas.length > 0) {
                        allAreas.sort((a, b) => a - b);
                        const avgArea = allAreas.reduce((sum, a) => sum + a, 0) / allAreas.length;
                        const medianArea = allAreas[Math.floor(allAreas.length / 2)];

                        return (
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-900/50 text-zinc-500">
                                    <tr>
                                        <th className="p-2 text-left">統計項目</th>
                                        <th className="p-2 text-right">數值</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="hover:bg-zinc-800/50">
                                        <td className="p-2">統計車位數</td>
                                        <td className="p-2 text-right font-mono text-zinc-300">{allAreas.length.toLocaleString()} 位</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-800/50">
                                        <td className="p-2">平均坪數</td>
                                        <td className="p-2 text-right font-mono text-cyan-400">{avgArea.toFixed(2)} 坪</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-800/50">
                                        <td className="p-2">坪數中位數</td>
                                        <td className="p-2 text-right font-mono text-zinc-300">{medianArea.toFixed(2)} 坪</td>
                                    </tr>
                                </tbody>
                            </table>
                        );
                    } else {
                        return <p className="text-zinc-500 text-center py-4">無坡道平面車位坪數資料</p>;
                    }
                })()}
            </ReportWrapper>

            {/* 4. Ramp Plane Floor Analysis - Enhanced */}
            <ReportWrapper title="坡道平面車位 - 樓層價差分析" description="勾選樓層以動態更新統計數據">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 3D Visual Stack */}
                    <div className="flex flex-col-reverse gap-2 items-center justify-center p-8 bg-zinc-900/30 rounded-xl relative">
                        {filteredFloorData.map((floor, idx) => {
                            const isSelected = selectedFloors.includes(floor.floor);
                            const isHovered = hoveredFloor === floor.floor;

                            return (
                                <div
                                    key={floor.floor}
                                    onMouseEnter={() => setHoveredFloor(floor.floor)}
                                    onMouseLeave={() => setHoveredFloor(null)}
                                    className={cn(
                                        "w-52 h-14 rounded-lg flex items-center justify-between px-4 shadow-lg transition-all duration-200 cursor-pointer",
                                        isHovered && "ring-2 ring-white scale-105",
                                        !isSelected && "opacity-30"
                                    )}
                                    style={{
                                        backgroundColor: floorColors[floor.floor] || '#4b5563',
                                    }}
                                    onClick={() => toggleFloor(floor.floor)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                                            isSelected ? "bg-white border-white" : "border-white/50"
                                        )}>
                                            {isSelected && <Check size={14} className="text-zinc-900" />}
                                        </span>
                                        <span className="font-bold text-white">{floor.floor}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-white text-sm">{Math.round(floor.avgPrice).toLocaleString()} 萬</div>
                                        <div className="text-white/70 text-xs">{floor.count} 位</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Table + Dynamic Stats */}
                    <div className="space-y-4">
                        {/* Dynamic Stats Summary */}
                        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-lg">
                            <h4 className="text-sm font-medium text-cyan-400 mb-3">已選樓層統計</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-zinc-500">車位數</div>
                                    <div className="text-lg font-bold text-white">{dynamicStats.count.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-zinc-500">平均單價</div>
                                    <div className="text-lg font-bold text-cyan-400">{Math.round(dynamicStats.avgPrice).toLocaleString()} 萬</div>
                                </div>
                                <div>
                                    <div className="text-xs text-zinc-500">中位數</div>
                                    <div className="text-lg font-bold text-zinc-300">{Math.round(dynamicStats.medianPrice).toLocaleString()} 萬</div>
                                </div>
                                <div>
                                    <div className="text-xs text-zinc-500">3/4位數</div>
                                    <div className="text-lg font-bold text-zinc-300">{Math.round(dynamicStats.q3Price).toLocaleString()} 萬</div>
                                </div>
                            </div>
                        </div>

                        {/* Floor Table with Checkboxes */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-900/50 text-zinc-500">
                                    <tr>
                                        <th className="p-2 text-left">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFloors.length === validFloors.length}
                                                    onChange={toggleAll}
                                                    className="form-checkbox rounded bg-zinc-800 border-zinc-600 text-cyan-500"
                                                />
                                                <span>全選</span>
                                            </label>
                                        </th>
                                        <th className="p-2 text-left">樓層</th>
                                        <th className="p-2 text-right">均價(萬)</th>
                                        <th className="p-2 text-right">中位數</th>
                                        <th className="p-2 text-right">最高</th>
                                        <th className="p-2 text-right">最低</th>
                                        <th className="p-2 text-right">車位數</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredFloorData.map((floor) => {
                                        const isSelected = selectedFloors.includes(floor.floor);
                                        const isHovered = hoveredFloor === floor.floor;

                                        return (
                                            <tr
                                                key={floor.floor}
                                                onMouseEnter={() => setHoveredFloor(floor.floor)}
                                                onMouseLeave={() => setHoveredFloor(null)}
                                                className={cn(
                                                    "transition-colors cursor-pointer",
                                                    isHovered ? "bg-zinc-800" : "hover:bg-zinc-800/50",
                                                    !isSelected && "opacity-50"
                                                )}
                                                onClick={() => toggleFloor(floor.floor)}
                                            >
                                                <td className="p-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleFloor(floor.floor)}
                                                        className="form-checkbox rounded bg-zinc-800 border-zinc-600 text-cyan-500"
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td className="p-2 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: floorColors[floor.floor] }}
                                                        />
                                                        {floor.floor}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-right font-mono text-cyan-400">{Math.round(floor.avgPrice).toLocaleString()}</td>
                                                <td className="p-2 text-right font-mono text-zinc-300">{Math.round(floor.medianPrice).toLocaleString()}</td>
                                                <td className="p-2 text-right font-mono text-zinc-500">{Math.round(floor.maxPrice).toLocaleString()}</td>
                                                <td className="p-2 text-right font-mono text-zinc-500">{Math.round(floor.minPrice).toLocaleString()}</td>
                                                <td className="p-2 text-right font-mono text-zinc-500">{floor.count.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ReportWrapper>

        </div>
    );
}
