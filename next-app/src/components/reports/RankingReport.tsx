"use client";

import React, { useState, useMemo } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { RankingChart } from "@/components/charts/RankingChart";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

    if (!data) return null;

    const { coreMetrics, projectRanking } = data;

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
        setSortConfig(current => ({
            key,
            order: current.key === key && current.order === 'desc' ? 'asc' : 'desc'
        }));
    };

    const MetricCard = ({ title, value, unit }: { title: string, value: string, unit: string }) => (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="text-zinc-400 text-sm mb-1">{title}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-xs text-zinc-500">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Core Metrics */}
            {visibleSections.includes('metrics') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        title="市場去化總銷售金額"
                        value={coreMetrics.totalSaleAmount.toLocaleString()}
                        unit="萬"
                    />
                    <MetricCard
                        title="總銷去化房屋坪數"
                        value={coreMetrics.totalHouseArea.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        unit="坪"
                    />
                    <MetricCard
                        title="總平均單價"
                        value={coreMetrics.overallAveragePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        unit="萬/坪"
                    />
                    <MetricCard
                        title="總交易筆數"
                        value={coreMetrics.transactionCount.toLocaleString()}
                        unit="筆"
                    />
                </div>
            )}


            {/* 2. Chart */}
            {visibleSections.includes('chart') && (
                <ReportWrapper title="建案分析圖表" description="根據排序指標顯示前30名建案">
                    <RankingChart data={sortedData} sortKey={sortConfig.key} />
                </ReportWrapper>
            )}


            {/* 3. Table */}
            {visibleSections.includes('table') && (
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
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="leading-tight">{head.label}</span>
                                                {sortConfig.key === head.key ? (
                                                    sortConfig.order === 'desc' ? <ArrowDown size={12} className="text-violet-500" /> : <ArrowUp size={12} className="text-violet-500" />
                                                ) : (
                                                    <ArrowUpDown size={12} className="opacity-30" />
                                                )}
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
            )}


        </div>
    );
}
