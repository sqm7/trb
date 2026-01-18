"use client";

import React, { useState } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { Input } from "@/components/ui/input";
import { UnitPriceStatsBlock } from "./UnitPriceStatsBlock";
import { TypeComparisonTable } from "./TypeComparisonTable";
import { cn } from "@/lib/utils";

interface UnitPriceAnalysisReportProps {
    data: {
        transactionDetails?: any[];
        unitPriceAnalysis?: {
            residentialStats?: any;
            officeStats?: any;
            storeStats?: any;
            typeComparison?: any[];
        };
    } | null;
    visibleSections?: string[];
}

export function UnitPriceAnalysisReport({ data, visibleSections = ['stats', 'comparison', 'chart'] }: UnitPriceAnalysisReportProps) {
    // Local State for Controls
    const [averageType, setAverageType] = useState<'arithmetic' | 'weighted'>('weighted');
    const [minPrice, setMinPrice] = useState(30);
    const [maxPrice, setMaxPrice] = useState(150);
    const [interval, setInterval] = useState(5);
    const [sizeMetric, setSizeMetric] = useState<'count' | 'area'>('count');

    // Extract data from correct paths
    const transactionDetails = data?.transactionDetails || [];
    const unitPriceAnalysis = data?.unitPriceAnalysis;
    const residentialStats = unitPriceAnalysis?.residentialStats;
    const officeStats = unitPriceAnalysis?.officeStats;
    const storeStats = unitPriceAnalysis?.storeStats;
    const typeComparison = unitPriceAnalysis?.typeComparison;

    if (!data || (!transactionDetails.length && !unitPriceAnalysis)) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Stats Blocks Section */}
            {visibleSections.includes('stats') && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-white pl-2 border-l-4 border-violet-500">各用途單價統計</h3>

                        {/* Average Type Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">平均類型:</span>
                            <div className="flex bg-zinc-950/50 rounded-md p-1 border border-white/5">
                                <button
                                    onClick={() => setAverageType('arithmetic')}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded transition-colors",
                                        averageType === 'arithmetic' ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    算術平均
                                </button>
                                <button
                                    onClick={() => setAverageType('weighted')}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded transition-colors",
                                        averageType === 'weighted' ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    加權平均
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <UnitPriceStatsBlock
                            title="住宅建案統計"
                            stats={residentialStats}
                            noDataMessage="無住宅交易數據"
                            className="border-violet-500/20"
                            averageType={averageType}
                        />
                        <UnitPriceStatsBlock
                            title="一般事務所/辦公室統計"
                            stats={officeStats}
                            noDataMessage="無事務所/辦公室交易數據"
                            className="border-cyan-500/20"
                            averageType={averageType}
                        />
                        <UnitPriceStatsBlock
                            title="店舖統計"
                            stats={storeStats}
                            noDataMessage="無店舖交易數據"
                            className="border-amber-500/20 xl:col-span-2"
                            averageType={averageType}
                        />
                    </div>
                </div>
            )}


            {/* 2. Type Comparison Section */}
            {visibleSections.includes('comparison') && typeComparison && typeComparison.length > 0 && (
                <ReportWrapper title="建案產品類型單價比較" description="同一建案內不同用途（住宅/店面/事務所）的單價與倍數比較">
                    <TypeComparisonTable data={typeComparison} />
                </ReportWrapper>
            )}

            {/* 3. Bubble Chart Controls & Chart */}
            {visibleSections.includes('chart') && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white pl-2 border-l-4 border-violet-500">單價分佈分析</h3>

                    {/* Controls Toolbar */}
                    <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-lg flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">單價範圍:</span>
                            <Input
                                type="number"
                                value={minPrice}
                                onChange={e => setMinPrice(Number(e.target.value))}
                                className="w-20 h-8 text-xs bg-zinc-950/50"
                            />
                            <span className="text-zinc-500">-</span>
                            <Input
                                type="number"
                                value={maxPrice}
                                onChange={e => setMaxPrice(Number(e.target.value))}
                                className="w-20 h-8 text-xs bg-zinc-950/50"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">級距:</span>
                            <Input
                                type="number"
                                value={interval}
                                onChange={e => setInterval(Number(e.target.value))}
                                className="w-16 h-8 text-xs bg-zinc-950/50"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">氣泡大小依據:</span>
                            <div className="flex bg-zinc-950/50 rounded-md p-1 border border-white/5">
                                <button
                                    onClick={() => setSizeMetric('count')}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded transition-colors",
                                        sizeMetric === 'count' ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    成交筆數
                                </button>
                                <button
                                    onClick={() => setSizeMetric('area')}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded transition-colors",
                                        sizeMetric === 'area' ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    總銷坪數
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bubble Chart */}
                    <ReportWrapper title="單價分佈泡泡圖" description="分析各單價區間的成交熱度與分佈密集區">
                        <BubbleChart
                            data={transactionDetails}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            interval={interval}
                            sizeMetric={sizeMetric}
                        />
                    </ReportWrapper>
                </div>
            )}

        </div>
    );
}
