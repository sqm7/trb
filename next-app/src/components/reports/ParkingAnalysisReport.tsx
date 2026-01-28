"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { ParkingRatioChart } from "@/components/charts/ParkingRatioChart";
import { ParkingScatterChart } from "@/components/charts/ParkingScatterChart";
import { cn } from "@/lib/utils";
import { Check, Search, Calendar, HelpCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ExportButton } from "@/components/ui/ExportButton";

interface FloorData {
    floor: string;
    count: number;
    avgPrice: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    minPrice: number;
    rawRecords?: Array<{
        parkingPrice: number;
        parkingArea?: number;
        // Include potential transaction fields that might be preserved in rawRecords
        '建案名稱'?: string;
        '交易年月日'?: number | string;
        '車位總價元'?: number;
        '車位移轉總面積平方公尺'?: number;
        '車位所在樓層'?: string;
        '備註'?: string;
        [key: string]: any;
    }>;
}

function ParkingAreaCharts({ chartData, hasData, summaryStats }: {
    chartData: any[],
    hasData: boolean,
    summaryStats: { count: number, avgArea: number, medianArea: number }
}) {
    const [chartMode, setChartMode] = useState<'scale' | 'value'>('scale');
    const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean, text: string, x: number, y: number } | null>(null);
    const tooltipTimer = React.useRef<NodeJS.Timeout | null>(null);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

    const handleMouseEnter = (e: React.MouseEvent, text: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 10;

        // Clear existing timer
        if (tooltipTimer.current) clearTimeout(tooltipTimer.current);

        // Set new timer for 1 second delay
        tooltipTimer.current = setTimeout(() => {
            setTooltipInfo({ visible: true, text, x, y });
        }, 800); // 0.8s feels like "1 sec" to users usually
    };

    const handleMouseLeave = () => {
        if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
        setTooltipInfo(null);
    };

    if (!hasData) return <p className="text-zinc-500 text-center py-4">無坡道平面車位坪數資料</p>;

    // Prepare data based on mode
    const data = chartMode === 'scale'
        ? chartData.map(d => ({ id: d.id, label: d.id, x: d.count, y: d.avgArea }))
        : chartData.map(d => ({ id: d.id, label: d.id, x: d.avgPrice, y: d.avgArea }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Tooltip Portal */}
            {tooltipInfo && (
                <div
                    className="fixed z-50 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl text-xs text-zinc-300 pointer-events-none transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95"
                    style={{ left: tooltipInfo.x, top: tooltipInfo.y }}
                >
                    {tooltipInfo.text}
                    <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 text-zinc-900 transform rotate-45 -translate-x-1/2 -mb-1"></div>
                </div>
            )}

            {/* Left Column: Summary Statistics & Search */}
            <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-zinc-400 pl-1 border-l-2 border-cyan-500">總體統計數據</h4>
                    <div className="bg-zinc-900/30 rounded-xl border border-white/5 p-4">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="py-3 text-zinc-500">數據範圍</td>
                                    <td className="py-3 text-right font-mono text-white">
                                        <span className="text-cyan-400">{chartData.length}</span> 建案
                                        <span className="mx-1 text-zinc-600">/</span>
                                        <span className="text-zinc-300">{summaryStats.count.toLocaleString()}</span> 車位
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-zinc-500">平均坪數</td>
                                    <td className="py-3 text-right font-mono text-cyan-400 text-lg font-bold">
                                        {summaryStats.avgArea.toFixed(2)} <span className="text-xs font-normal text-zinc-500">坪</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-zinc-500">坪數中位數</td>
                                    <td className="py-3 text-right font-mono text-zinc-300 text-lg font-bold">
                                        {summaryStats.medianArea.toFixed(2)} <span className="text-xs font-normal text-zinc-500">坪</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Project Search */}
                <ProjectSearchMultiselect
                    projects={chartData.map(d => ({ value: d.id, label: d.id }))}
                    className="w-full"
                    onChange={(selected) => setSelectedProjects(selected)}
                    max={6}
                />
            </div>

            {/* Right Column: Chart + Controls */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <h4 className="text-sm font-medium text-zinc-400 pl-1 border-l-2 border-violet-500">分佈散佈圖</h4>
                        <div className="mt-1 text-xs text-zinc-500 font-mono">
                            {chartMode === 'scale' ? (
                                <span><span className="text-cyan-400">X軸</span>: 建案車位總數 <span className="text-zinc-600">|</span> <span className="text-cyan-400">Y軸</span>: 平均車位坪數</span>
                            ) : (
                                <span><span className="text-cyan-400">X軸</span>: 平均車位價格 <span className="text-zinc-600">|</span> <span className="text-cyan-400">Y軸</span>: 平均車位坪數</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="relative group">
                            <button className="p-1.5 text-zinc-500 hover:text-cyan-400 transition-colors">
                                <HelpCircle size={14} />
                            </button>
                            {/* CSS-only Tooltip for simple hover or Javascript based if complex */}
                            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="text-xs text-zinc-300 leading-relaxed">
                                    {chartMode === 'scale'
                                        ? "分析各建案「規劃車位總數」與「平均車位坪數」的關係。可觀察大社區是否傾向規劃較大或較小的車位。"
                                        : "分析各建案「平均車位價格」與「平均車位坪數」的關係。可觀察車位價格是否隨著坪數增加而顯著提升。"}
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-4 bg-white/10 mx-1"></div>

                        <button
                            onClick={() => setChartMode('scale')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200",
                                chartMode === 'scale'
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                    : "bg-zinc-900/50 border-white/10 text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            規模分析
                        </button>
                        <button
                            onClick={() => setChartMode('value')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200",
                                chartMode === 'value'
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                    : "bg-zinc-900/50 border-white/10 text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            價值分析
                        </button>
                    </div>
                </div>

                <ParkingScatterChart
                    data={data}
                    xLabel={chartMode === 'scale' ? "建案車位總數" : "平均車位價格"}
                    yLabel="平均車位坪數"
                    xUnit={chartMode === 'scale' ? "位" : "萬"}
                    yUnit="坪"
                    title={chartMode === 'scale' ? "建案規模 vs 車位坪數分佈" : "車位價值 vs 坪數分佈"}
                    highlightIds={selectedProjects}
                />
            </div>
        </div>
    );
}



import { ProjectSearchMultiselect } from "@/components/ui/ProjectSearchMultiselect";


import { AnalysisData } from "@/lib/types";

interface ParkingAnalysisReportProps {
    data: AnalysisData | null;
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

    // State: Modal for floor details
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDetailFloor, setSelectedDetailFloor] = useState<string | null>(null);
    const [floorDetailData, setFloorDetailData] = useState<any[]>([]);
    const [showAllRampPlane, setShowAllRampPlane] = useState(false);
    const [strictMatchCount, setStrictMatchCount] = useState(0);

    const openFloorDetail = (floor: string) => {
        setSelectedDetailFloor(floor);
        setShowAllRampPlane(false); // Reset view mode

        // Find the specific floor data which contains the trusted rawRecords
        const targetFloorData = rampPlanePriceByFloor?.find(f => f.floor === floor);
        const trustedRecords = targetFloorData?.rawRecords;

        if (trustedRecords && trustedRecords.length > 0) {
            // 1. Use Trusted Data from Backend Aggregation
            // These records are already filtered and assigned to this floor by the backend
            const annotatedData = trustedRecords.map((item: any) => ({
                ...item,
                _isMatch: true // All records in this bucket are matches by definition
            }));

            // Sort by date descending
            annotatedData.sort((a: any, b: any) => {
                const dateA = a['交易年月日'] || 0;
                const dateB = b['交易年月日'] || 0;
                return dateB - dateA; // Descending
            });

            setFloorDetailData(annotatedData);
            setStrictMatchCount(annotatedData.length);
        } else {
            // 2. Fallback to Legacy Flattened Filter (if rawRecords is missing)
            // Filter transaction details
            const details = data?.transactionDetails || [];

            // Match terms
            const matchTerms: string[] = [floor];
            if (floor === 'B1') matchTerms.push('地下一層', 'B1', 'b1');
            if (floor === 'B2') matchTerms.push('地下二層', 'B2', 'b2');
            if (floor === 'B3') matchTerms.push('地下三層', 'B3', 'b3');
            if (floor === 'B4') matchTerms.push('地下四層', 'B4', 'b4');
            if (floor === 'B5_below') matchTerms.push('地下五層', 'B5', 'b5');

            // 1. Get ALL Ramp Plane records first
            const allRampPlane = details.filter((item: any) => {
                const parkingType = item['車位類別'] || '';
                // Match '坡道平面' strictly
                return parkingType.includes('坡道平面');
            });

            // 2. Strict filter from all Ramp Plane records
            const strictMatches = allRampPlane.filter((item: any) => {
                const parkingFloor = item['車位所在樓層'] || '';
                const note = item['備註'] || '';
                return matchTerms.some(term =>
                    (parkingFloor && parkingFloor.includes(term)) ||
                    (note && note.includes(term))
                );
            });

            setStrictMatchCount(strictMatches.length);

            // Prepare display data: attach isMatch flag
            const annotatedData = allRampPlane.map((item: any) => {
                const parkingFloor = item['車位所在樓層'] || '';
                const note = item['備註'] || '';
                const isMatch = matchTerms.some(term =>
                    (parkingFloor && parkingFloor.includes(term)) ||
                    (note && note.includes(term))
                );
                return { ...item, _isMatch: isMatch };
            });

            // Sort: Matches first, then date descending
            annotatedData.sort((a: any, b: any) => {
                if (a._isMatch && !b._isMatch) return -1;
                if (!a._isMatch && b._isMatch) return 1;
                const dateA = a['交易年月日'] || 0;
                const dateB = b['交易年月日'] || 0;
                return dateB - dateA;
            });

            setFloorDetailData(annotatedData);

            // If no strict matches, auto-enable 'show all' so table isn't empty on open
            if (strictMatches.length === 0) {
                setShowAllRampPlane(true);
            }
        }

        setDetailModalOpen(true);
    };

    if (!data?.parkingAnalysis) return null;

    const { parkingRatio, avgPriceByType, rampPlanePriceByFloor } = data.parkingAnalysis;

    const validFloors = ['B1', 'B2', 'B3', 'B4', 'B5_below', 'Unknown'];
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
        'Unknown': '#71717a', // Zinc-500 for neutral/unknown
    };

    // Refactored Parking Area Chart Data Calculation
    const { parkingChartData, parkingChartStats, hasParkingData } = useMemo(() => {
        // 1. Process Data by Project
        const projectStats = new Map<string, { count: number, totalArea: number, totalPrice: number }>();
        let hasData = false;

        filteredFloorData.forEach(floorData => {
            if (floorData.rawRecords) {
                floorData.rawRecords.forEach((record: any) => {
                    const projectName = record['建案名稱'];
                    const area = record.parkingArea || record['車位面積(坪)'] || ((record['車位移轉總面積平方公尺'] || 0) * 0.3025);
                    const price = (record.parkingPrice || (record['車位價格(萬)'] || 0)); // Wan

                    if (projectName && area > 0) {
                        if (!projectStats.has(projectName)) {
                            projectStats.set(projectName, { count: 0, totalArea: 0, totalPrice: 0 });
                        }
                        const stats = projectStats.get(projectName)!;
                        stats.count += 1;
                        stats.totalArea += area;
                        stats.totalPrice += price;
                        hasData = true;
                    }
                });
            }
        });

        // 2. Prepare Chart Data Points
        const chartData = Array.from(projectStats.entries()).map(([name, stats]) => ({
            id: name,
            label: name,
            avgArea: parseFloat((stats.totalArea / stats.count).toFixed(2)),
            count: stats.count,
            avgPrice: parseFloat((stats.totalPrice / stats.count).toFixed(2))
        }));

        // 3. Calculate Global Stats
        let totalCount = 0;
        let allAvgAreas: number[] = [];

        chartData.forEach(d => {
            totalCount += d.count;
            allAvgAreas.push(d.avgArea);
        });

        allAvgAreas.sort((a, b) => a - b);
        const globalAvgArea = allAvgAreas.length > 0 ? allAvgAreas.reduce((a, b) => a + b, 0) / allAvgAreas.length : 0;
        const globalMedianArea = allAvgAreas.length > 0 ? allAvgAreas[Math.floor(allAvgAreas.length / 2)] : 0;

        return {
            parkingChartData: chartData,
            parkingChartStats: {
                count: totalCount,
                avgArea: globalAvgArea,
                medianArea: globalMedianArea
            },
            hasParkingData: hasData
        };
    }, [filteredFloorData]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Parking Ratio */}
                <ReportWrapper
                    title="房車配比分析"
                    description="建案有購置車位的比例"
                    headerAction={
                        <ExportButton
                            data={[
                                { type: '有車位', ...parkingRatio?.withParking },
                                { type: '無車位', ...parkingRatio?.withoutParking },
                                { ratio: parkingRatio?.avgRatio }
                            ]}
                            filename="parking_ratio_data"
                            label="匯出"
                            columns={{ type: '類別', count: '數量', percentage: '百分比', ratio: '比率' }}
                            chartType="parking-pie"
                            snapshotData={[
                                { type: '有車位', ...parkingRatio?.withParking },
                                { type: '無車位', ...parkingRatio?.withoutParking },
                                { ratio: parkingRatio?.avgRatio }
                            ]}
                        />
                    }
                >
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-full md:w-1/2">
                            <ParkingRatioChart data={parkingRatio} />
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col gap-4">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-900/50 text-zinc-500">
                                    <tr><th className="p-2 text-left">類型</th><th className="p-2 text-right">筆數</th><th className="p-2 text-right">佔比</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr>
                                        <td className="p-2 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-indigo-300"></span>
                                            有搭車位
                                        </td>
                                        <td className="p-2 text-right font-mono text-zinc-300">{parkingRatio?.withParking?.count.toLocaleString()}</td>
                                        <td className="p-2 text-right font-mono text-cyan-400">{parkingRatio?.withParking?.percentage.toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                                            無車位
                                        </td>
                                        <td className="p-2 text-right font-mono text-zinc-300">{parkingRatio?.withoutParking?.count.toLocaleString()}</td>
                                        <td className="p-2 text-right font-mono text-zinc-500">{parkingRatio?.withoutParking?.percentage.toFixed(2)}%</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Custom Legend */}
                            <div className="flex gap-6 justify-center md:justify-start px-2 text-sm text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-indigo-300"></span>
                                    <span>有搭車位</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                                    <span>無車位</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ReportWrapper>

                {/* 2. Price By Type */}
                <ReportWrapper
                    title="車位類型均價"
                    description="各類車位成交行情"
                    headerAction={
                        <ExportButton
                            data={avgPriceByType || []}
                            filename="parking_price_by_type"
                            label="匯出"
                            columns={{ type: '車位類型', avgPrice: '平均價格', medianPrice: '中位數', count: '數量' }}
                            chartType="parking-price"
                            snapshotData={avgPriceByType || []}
                        />
                    }
                >
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
            <ReportWrapper
                title="坡道平面車位坪數散佈分析"
                description="建案車位數與坪數分佈"
                className="relative z-20"
                headerAction={
                    <ExportButton
                        data={parkingChartData || []}
                        filename="parking_area_scatter_data"
                        label="匯出"
                        columns={{ id: '建案名稱', label: '標籤', avgArea: '平均坪數', count: '車位數', avgPrice: '平均價格' }}
                        chartType="parking-scatter"
                        snapshotData={parkingChartData || []}
                    />
                }
            >
                <ParkingAreaCharts
                    chartData={parkingChartData}
                    hasData={hasParkingData}
                    summaryStats={parkingChartStats}
                />
            </ReportWrapper>

            {/* 4. Ramp Plane Floor Analysis - Enhanced */}
            <ReportWrapper
                title="坡道平面車位 - 樓層價差分析"
                description="勾選樓層以動態更新統計數據"
                headerAction={
                    <ExportButton
                        data={filteredFloorData || []}
                        filename="parking_floor_analysis"
                        label="匯出"
                        columns={{ floor: '樓層', count: '數量', avgPrice: '平均價格', medianPrice: '中位數', maxPrice: '最高價', minPrice: '最低價', q3Price: '第三四分位數' }}
                        chartType="parking-floor"
                        snapshotData={filteredFloorData || []}
                    />
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 3D Visual Stack */}
                    <div className="flex flex-col gap-2 items-center justify-center p-8 bg-zinc-900/30 rounded-xl relative">
                        {filteredFloorData.map((floor, idx) => {
                            const isSelected = selectedFloors.includes(floor.floor);
                            const isHovered = hoveredFloor === floor.floor;

                            return (
                                <div
                                    key={floor.floor}
                                    onMouseEnter={() => setHoveredFloor(floor.floor)}
                                    onMouseLeave={() => setHoveredFloor(null)}
                                    className={cn(
                                        "w-52 h-14 rounded-lg flex items-center justify-between px-4 shadow-lg transition-all duration-200 cursor-pointer group relative",
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
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openFloorDetail(floor.floor);
                                            }}
                                            className="p-1.5 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors ring-1 ring-white/20"
                                            title={`查看 ${floor.floor} 建案明細`}
                                        >
                                            <Search size={14} />
                                        </button>
                                    </div>
                                    <div className="text-right mt-1">
                                        <div className="font-mono text-white text-sm">{Math.round(floor.avgPrice).toLocaleString()} 萬</div>
                                        <div className="text-white/70 text-xs">{floor.count} 位</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <Modal
                        isOpen={detailModalOpen}
                        onClose={() => setDetailModalOpen(false)}
                        title={`${selectedDetailFloor} 車位交易明細`}
                        maxWidth="max-w-5xl"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setShowAllRampPlane(false)}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-xs transition-colors font-medium flex items-center gap-1.5",
                                        !showAllRampPlane
                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    <Check size={12} />
                                    精確匹配 ({strictMatchCount})
                                </button>
                                <button
                                    onClick={() => setShowAllRampPlane(true)}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-xs transition-colors font-medium",
                                        showAllRampPlane
                                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    未匹配 ({floorDetailData.length - strictMatchCount})
                                </button>
                                <div className="ml-auto">
                                    <ExportButton
                                        data={floorDetailData
                                            .filter(r => showAllRampPlane ? !r._isMatch : r._isMatch)}
                                        filename={`parking_details_${selectedDetailFloor}_${showAllRampPlane ? 'all' : 'match'}`}
                                        label="匯出明細"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[60vh] custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-900/80 text-zinc-400 whitespace-nowrap sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="p-3">建案名稱</th>
                                        <th className="p-3">交易日期</th>
                                        <th className="p-3 text-right">車位總價</th>
                                        <th className="p-3 text-right">車位面積</th>
                                        <th className="p-3">車位樓層</th>
                                        <th className="p-3">備註</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {floorDetailData.length > 0 ? (
                                        floorDetailData
                                            .filter(r => showAllRampPlane ? !r._isMatch : r._isMatch)
                                            .map((record, idx) => (
                                                <tr key={idx} className={cn(
                                                    "hover:bg-zinc-800/50 transition-colors",
                                                    (record._isMatch) ? "bg-cyan-500/5" : "opacity-60"
                                                )}>
                                                    <td className="p-3 font-medium text-white">
                                                        <div>{record['建案名稱']}</div>
                                                        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">#{record.transactionId || record['編號']}</div>
                                                    </td>
                                                    <td className="p-3 text-zinc-400 flex items-center gap-1">
                                                        <Calendar size={12} className="text-zinc-600" />
                                                        {record['交易日']}
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-cyan-400">
                                                        {record['車位總價元'] ? (record['車位總價元'] / 10000).toLocaleString() : '-'} 萬
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-zinc-300">
                                                        {record['車位移轉總面積平方公尺'] ? (record['車位移轉總面積平方公尺'] * 0.3025).toFixed(2) : '-'} 坪
                                                    </td>
                                                    <td className="p-3 text-zinc-300">
                                                        {record['車位所在樓層'] || '-'}
                                                    </td>
                                                    <td className="p-3 text-zinc-500 text-xs max-w-[200px] truncate" title={record['備註']}>
                                                        {record['備註']}
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-zinc-500">
                                                查無相關交易資料。
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </Modal>

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
            </ReportWrapper >

        </div >
    );
}
