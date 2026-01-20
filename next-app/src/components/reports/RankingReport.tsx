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
    pptMode?: boolean;
    pptPage?: number;
    pptItemsPerPage?: number;
}

export function RankingReport({
    data,
    visibleSections = ['metrics', 'chart', 'table'],
    pptMode = false,
    pptPage = 1,
    pptItemsPerPage = 8
}: RankingReportProps) {
    const {
        rankingCurrentPage,
        rankingPageSize,
        setRankingCurrentPage,
        setRankingPageSize
    } = useFilterStore();

    const [localPage, setLocalPage] = useState(1);
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

    // Pagination Logic Switch
    const effectivePage = pptMode ? pptPage : localPage;
    const effectivePageSize = pptMode ? pptItemsPerPage : pageSize;

    const totalPages = Math.ceil(sortedData.length / effectivePageSize);
    const pagedData = sortedData.slice((effectivePage - 1) * effectivePageSize, effectivePage * effectivePageSize);

    const handleSort = (key: string) => {
        if (pptMode) return; // Disable sorting in PPT mode
        setSortConfig({
            key,
            order: 'desc'
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

    // PPT Layout Renderer
    if (pptMode) {
        // 1. Metrics Slide Layout
        if (visibleSections.includes('metrics')) {
            return (
                <div className="grid grid-cols-2 gap-8 h-full place-content-center p-8">
                    <div className="space-y-8">
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="text-zinc-400 text-lg mb-2">市場去化總銷售金額</div>
                            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-white font-mono">
                                {coreMetrics.totalSaleAmount.toLocaleString()}<span className="text-2xl text-zinc-500 ml-2">萬</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="text-zinc-400 text-lg mb-2">總銷去化房屋坪數</div>
                            <div className="text-5xl font-bold text-white font-mono">
                                {coreMetrics.totalHouseArea.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-2xl text-zinc-500 ml-2">坪</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="text-zinc-400 text-lg mb-2">總平均單價</div>
                            <div className="text-5xl font-bold text-cyan-400 font-mono">
                                {coreMetrics.overallAveragePrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-2xl text-zinc-500 ml-2">萬/坪</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="text-zinc-400 text-lg mb-2">總交易筆數</div>
                            <div className="text-5xl font-bold text-white font-mono">
                                {coreMetrics.transactionCount.toLocaleString()}<span className="text-2xl text-zinc-500 ml-2">筆</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // 2. Chart Slide Layout
        if (visibleSections.includes('chart')) {
            return (
                <div className="h-full flex flex-col p-4">
                    <RankingChart data={sortedData} sortKey={sortConfig.key} limit={chartLimit} chartType={chartType} />
                </div>
            )
        }

        // 3. Table Slide Layout (Scale-to-Fit - ALL DATA on ONE slide)
        if (visibleSections.includes('table')) {
            // Dynamic scaling: the more rows, the smaller the scale
            const rowCount = sortedData.length;
            const BASE_ROWS = 10;
            const scaleFactor = rowCount <= BASE_ROWS ? 1 : Math.max(0.4, BASE_ROWS / rowCount);

            return (
                <div
                    className="h-full w-full overflow-hidden flex items-start justify-center"
                    style={{
                        transform: `scale(${scaleFactor})`,
                        transformOrigin: 'top center',
                    }}
                >
                    <table className="w-full text-left border-collapse">
                        <thead className="border-b-2 border-white/20 text-zinc-400 uppercase text-sm font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-center w-[8%]">排名</th>
                                <th className="px-6 py-4 w-[25%]">建案名稱</th>
                                <th className="px-6 py-4 text-right">總價(萬)</th>
                                <th className="px-6 py-4 text-right">單價(萬/坪)</th>
                                <th className="px-6 py-4 text-right">坪數(坪)</th>
                                <th className="px-6 py-4 text-center">筆數</th>
                                <th className="px-6 py-4 text-right">佔比</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-zinc-100">
                            {sortedData.map((proj, idx) => (
                                <tr key={idx} className="border-b border-white/5">
                                    <td className="px-3 py-1.5 text-center font-mono text-zinc-500">{idx + 1}</td>
                                    <td className="px-3 py-1.5 font-medium">
                                        <span className="text-white">{proj.projectName}</span>
                                        {proj.district && <span className="text-[10px] text-zinc-500 ml-2">{proj.district}</span>}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono">{proj.saleAmountSum.toLocaleString()}</td>
                                    <td className="px-3 py-1.5 text-right font-mono text-cyan-300">{proj.averagePrice.toFixed(1)}</td>
                                    <td className="px-3 py-1.5 text-right font-mono text-zinc-400">{proj.houseAreaSum.toLocaleString()}</td>
                                    <td className="px-3 py-1.5 text-center font-mono text-zinc-400">{proj.transactionCount}</td>
                                    <td className="px-3 py-1.5 text-right font-mono text-zinc-500">{proj.marketShare.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return null;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ... (Metrics Render - unchanged) ... */}

            {/* ... (Chart Render - unchanged) ... */}

            {/* 3. Table */}
            {
                visibleSections.includes('table') && (
                    <ReportWrapper title={pptMode ? `區域建案排行列表 (${effectivePage}/${totalPages})` : "區域建案排行列表"} description={pptMode ? "" : "點擊表頭可進行排序"}>
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
                                                className="px-3 py-3 text-center whitespace-nowrap"
                                                onClick={() => handleSort(head.key)}
                                            >
                                                <div className="flex items-center justify-center gap-1.5 group/header">
                                                    <span className="leading-tight">{head.label}</span>
                                                    {!pptMode && (
                                                        <div className="flex flex-col opacity-50 group-hover/header:opacity-100 transition-opacity">
                                                            {sortConfig.key === head.key ? (
                                                                sortConfig.order === 'desc' ? <ArrowDown size={14} className="text-violet-500" /> : <ArrowUp size={14} className="text-violet-500" />
                                                            ) : (
                                                                <ArrowUpDown size={14} className="text-zinc-600 group-hover/header:text-zinc-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pagedData.map((proj, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-4 py-3 text-zinc-500 font-mono">{(effectivePage - 1) * effectivePageSize + idx + 1}</td>
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
                                {/* Remove footer in PPT mode if it takes too much space, or keep it only on last page? Keep for now. */}
                                {!pptMode && (
                                    <tfoot className="bg-zinc-900/80 font-bold border-t-2 border-zinc-700">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-center text-zinc-300">總計</td>
                                            <td className="px-4 py-3 text-zinc-300">{coreMetrics.totalSaleAmount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-zinc-300">{coreMetrics.totalHouseArea.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-zinc-300">{coreMetrics.transactionCount.toLocaleString()}</td>
                                            <td colSpan={6}></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Pagination - Hide in PPT Mode */}
                        {!pptMode && (
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
                        )}
                    </ReportWrapper>
                )
            }
        </div>
    );
}
