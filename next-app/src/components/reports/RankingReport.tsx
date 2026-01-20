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

    // ... (MetricCard component remains same)

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
