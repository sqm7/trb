"use client";

import React, { useState, useMemo } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { RankingChart } from "@/components/charts/RankingChart";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, BarChart3, LayoutGrid, Sparkles } from "lucide-react";

interface ProjectRankingItem {
    projectName: string;
    county: string;
    district: string;
    saleAmountSum: number;
    houseAreaSum: number;
    transactionCount: number;
    marketShare: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    avgParkingPrice: number;
    [key: string]: any;
}

interface CoreMetrics {
    totalSaleAmount: number;
    totalHouseArea: number;
    overallAveragePrice: number;
    transactionCount: number;
}

interface RankingReportProps {
    data: {
        coreMetrics: CoreMetrics;
        projectRanking: ProjectRankingItem[];
    } | null;
    visibleSections?: string[];
}

export function RankingReport({ data, visibleSections = ['metrics', 'chart', 'table'] }: RankingReportProps) {
    const {
        rankingCurrentPage,
        rankingPageSize,
        setRankingCurrentPage,
        setRankingPageSize
    } = useFilterStore(); // Assuming these are in store, or we manage locally? 
    // Legacy managed in state.js. Let's use local state for pagination/sorting to keep component clean or use store if global.
    // Implementation Plan: "Connect to Zustand store". The legacy `state.rankingCurrentPage` was global. 
    // For now, let's use local state for sort, and maybe local for pagination unless other components need it.
    // But wait, "Analysis" button triggers data fetch and resets pages.
    // Let's stick to local state for now for simplicity, can lift up if needed.

    const [localPage, setLocalPage] = useState(1); // Use local for now
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'saleAmountSum', order: 'desc' });
    const [chartLimit, setChartLimit] = useState(30);
    const [chartType, setChartType] = useState<'auto' | 'bar' | 'treemap'>('auto');

    if (!data) return null;

    const { coreMetrics, projectRanking } = data;

    // Derived Metrics for Cards
    const derivedMetrics = useMemo(() => {
        if (!projectRanking || projectRanking.length === 0) return { min: 0, max: 0, median: 0, parking: 0 };
        const min = Math.min(...projectRanking.map(p => p.minPrice).filter(v => v > 0));
        const max = Math.max(...projectRanking.map(p => p.maxPrice));
        // Simple average of medians for summary card (or calculate true median if possible, but this suffices for "Indicator")
        const medians = projectRanking.map(p => p.medianPrice).filter(v => v > 0);
        const avgMedian = medians.length > 0 ? medians.reduce((a, b) => a + b, 0) / medians.length : 0;

        const parkings = projectRanking.map(p => p.avgParkingPrice).filter(v => v > 0);
        const avgParking = parkings.length > 0 ? parkings.reduce((a, b) => a + b, 0) / parkings.length : 0;

        return { min, max, median: avgMedian, parking: avgParking };
    }, [projectRanking]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!projectRanking) return [];
        return [...projectRanking].sort((a, b) => {
            const valA = a[sortConfig.key] || 0;
            const valB = b[sortConfig.key] || 0;
            return sortConfig.order === 'desc' ? valB - valA : valA - valB;
        });
    }, [projectRanking, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const pagedData = sortedData.slice((localPage - 1) * pageSize, localPage * pageSize);

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            order: 'desc' // Always default to desc for metrics to show top ranking
        });
    };

    const MetricCard = ({ title, value, unit, sortKey }: { title: string, value: string, unit: string, sortKey?: string }) => (
        <div
            onClick={() => sortKey && handleSort(sortKey)}
            className={`bg-zinc-800/50 rounded-lg p-4 border border-white/5 flex flex-col items-center justify-center text-center transition-all duration-300 ${sortKey ? 'cursor-pointer hover:bg-zinc-800 hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] group' : ''}`}
        >
            <div className={`text-zinc-400 text-sm mb-1 ${sortKey ? 'group-hover:text-violet-300' : ''}`}>{title}</div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold text-white ${sortKey ? 'group-hover:text-white' : ''}`}>{value}</span>
                <span className="text-xs text-zinc-500">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Core Metrics */}
            {visibleSections.includes('metrics') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <MetricCard
                        title="市場去化總銷售金額"
                        value={coreMetrics.totalSaleAmount.toLocaleString()}
                        unit="萬"
                        sortKey="saleAmountSum"
                    />
                    <MetricCard
                        title="總銷去化房屋坪數"
                        value={coreMetrics.totalHouseArea.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        unit="坪"
                        sortKey="houseAreaSum"
                    />
                    <MetricCard
                        title="總平均單價"
                        value={coreMetrics.overallAveragePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        unit="萬/坪"
                        sortKey="averagePrice"
                    />
                    <MetricCard
                        title="總交易筆數"
                        value={coreMetrics.transactionCount.toLocaleString()}
                        unit="筆"
                        sortKey="transactionCount"
                    />

                    {/* Row 2: Price Indicators */}
                    <MetricCard
                        title="最低成交單價 (Min)"
                        value={derivedMetrics.min.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        unit="萬/坪"
                        sortKey="minPrice"
                    />
                    <MetricCard
                        title="最高成交單價 (Max)"
                        value={derivedMetrics.max.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        unit="萬/坪"
                        sortKey="maxPrice"
                    />
                    <MetricCard
                        title="平均中位數單價"
                        value={derivedMetrics.median.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        unit="萬/坪"
                        sortKey="medianPrice"
                    />
                    <MetricCard
                        title="平均車位價格"
                        value={derivedMetrics.parking.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        unit="萬"
                        sortKey="avgParkingPrice"
                    />
                </div>
            )}


            {/* 2. Chart */}
            {visibleSections.includes('chart') && (
                <div className="space-y-4">
                    {/* Explicit Metric Selection Buttons */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[
                            { key: 'saleAmountSum', label: '交易總價(萬)' },
                            { key: 'houseAreaSum', label: '房屋面積(坪)' },
                            { key: 'transactionCount', label: '資料筆數' },
                            { key: 'marketShare', label: '市場佔比(%)' },
                            { key: 'averagePrice', label: '平均單價' },
                            { key: 'minPrice', label: '最低單價' },
                            { key: 'maxPrice', label: '最高單價' },
                            { key: 'medianPrice', label: '中位數單價' },
                            { key: 'avgParkingPrice', label: '車位均價' },
                        ].map(metric => (
                            <button
                                key={metric.key}
                                onClick={() => handleSort(metric.key)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-300 ${sortConfig.key === metric.key
                                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                    : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/10'
                                    }`}
                            >
                                {metric.label}
                            </button>
                        ))}
                    </div>

                    <ReportWrapper
                        title="建案分析圖表"
                        description="根據排序指標顯示建案排名"
                        headerAction={
                            <div className="flex items-center gap-3">
                                {/* Chart Type Toggle */}
                                <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setChartType('auto')}
                                        className={`p-1.5 rounded-md transition-all ${chartType === 'auto'
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        title="自動選擇 (Auto)"
                                    >
                                        <Sparkles size={14} />
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`p-1.5 rounded-md transition-all ${chartType === 'bar'
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        title="長條圖 (Bar)"
                                    >
                                        <BarChart3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setChartType('treemap')}
                                        className={`p-1.5 rounded-md transition-all ${chartType === 'treemap'
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        title="矩形樹圖 (Treemap)"
                                    >
                                        <LayoutGrid size={14} />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-6 bg-white/10" />

                                {/* Limit Toggle */}
                                <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-white/5">
                                    {[10, 30, 50, 100].map(limit => (
                                        <button
                                            key={limit}
                                            onClick={() => setChartLimit(limit)}
                                            className={`px-3 py-1 text-xs rounded-md transition-all ${chartLimit === limit
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            Top {limit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        }
                    >
                        <RankingChart data={sortedData} sortKey={sortConfig.key} limit={chartLimit} chartType={chartType} />
                    </ReportWrapper>
                </div>
            )
            }


            {/* 3. Table */}
            {
                visibleSections.includes('table') && (
                    <ReportWrapper title="區域建案排行列表" description="點擊表頭可進行排序">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 cursor-default">排名</th>
                                        <th className="px-4 py-3 cursor-default">建案名稱</th>
                                        {[
                                            { key: 'saleAmountSum', label: <>交易<br />總價(萬)</> },
                                            { key: 'houseAreaSum', label: <>房屋<br />面積(坪)</> },
                                            { key: 'transactionCount', label: <>資料<br />筆數</> },
                                            { key: 'marketShare', label: <>市場<br />佔比(%)</> },
                                            { key: 'averagePrice', label: <>平均<br />單價</> },
                                            { key: 'minPrice', label: <>最低<br />單價</> },
                                            { key: 'maxPrice', label: <>最高<br />單價</> },
                                            { key: 'medianPrice', label: <>中位數<br />單價</> },
                                            { key: 'avgParkingPrice', label: <>車位<br />均價</> },
                                        ].map(head => (
                                            <th
                                                key={head.key}
                                                className="px-3 py-3 cursor-pointer hover:text-white transition-colors text-center whitespace-nowrap"
                                                onClick={() => handleSort(head.key)}
                                            >
                                                <div className="flex items-center justify-center gap-1.5 group/header">
                                                    <span className="leading-tight">{head.label}</span>
                                                    <div className="flex flex-col opacity-50 group-hover/header:opacity-100 transition-opacity">
                                                        {sortConfig.key === head.key ? (
                                                            sortConfig.order === 'desc' ? <ArrowDown size={14} className="text-violet-500" /> : <ArrowUp size={14} className="text-violet-500" />
                                                        ) : (
                                                            <ArrowUpDown size={14} className="text-zinc-600 group-hover/header:text-zinc-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pagedData.map((proj, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-4 py-3 text-zinc-500 font-mono">{(localPage - 1) * pageSize + idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{proj.projectName}</span>
                                                    <div className="flex gap-1 mt-1">
                                                        {proj.county && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">{proj.county}</span>}
                                                        {proj.district && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">{proj.district}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-zinc-300">{proj.saleAmountSum.toLocaleString()}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-300">{proj.houseAreaSum.toLocaleString()}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-300">{proj.transactionCount.toLocaleString()}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-300">{proj.marketShare.toFixed(2)}%</td>
                                            <td className="px-4 py-3 font-mono text-cyan-400">{proj.averagePrice.toFixed(1)}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-500">{proj.minPrice.toFixed(1)}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-500">{proj.maxPrice.toFixed(1)}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-400">{proj.medianPrice.toFixed(1)}</td>
                                            <td className="px-4 py-3 font-mono text-zinc-400">{proj.avgParkingPrice > 0 ? proj.avgParkingPrice.toLocaleString() : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-zinc-900/80 font-bold border-t-2 border-zinc-700">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-3 text-center text-zinc-300">總計</td>
                                        <td className="px-4 py-3 text-zinc-300">{coreMetrics.totalSaleAmount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-zinc-300">{coreMetrics.totalHouseArea.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-zinc-300">{coreMetrics.transactionCount.toLocaleString()}</td>
                                        <td colSpan={6}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                            <div className="text-sm text-zinc-500">
                                顯示 {(localPage - 1) * pageSize + 1} 到 {Math.min(localPage * pageSize, sortedData.length)} 筆，共 {sortedData.length} 筆
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLocalPage(p => Math.max(1, p - 1))}
                                    disabled={localPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <span className="text-sm text-zinc-300">Page {localPage} of {totalPages}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLocalPage(p => Math.min(totalPages, p + 1))}
                                    disabled={localPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </ReportWrapper>
                )
            }


        </div >
    );
}
