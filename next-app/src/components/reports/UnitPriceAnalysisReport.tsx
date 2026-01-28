"use client";

import React, { useState } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { Input } from "@/components/ui/input";
import { UnitPriceStatsBlock } from "./UnitPriceStatsBlock";
import { TypeComparisonTable } from "./TypeComparisonTable";
import { cn } from "@/lib/utils";
import { ExportButton } from "@/components/ui/ExportButton";

import { AnalysisData } from "@/lib/types";

interface UnitPriceAnalysisReportProps {
    data: AnalysisData | null;
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
                <ReportWrapper
                    title="建案產品類型單價比較"
                    description="同一建案內不同用途（住宅/店面/事務所）的單價與倍數比較"
                    headerAction={
                        <ExportButton
                            data={typeComparison}
                            filename="type_comparison_data"
                            label="匯出比較表"
                            columns={{ projectName: '建案', residentialAvg: '住宅均價', officeAvg: '辦公均價', storeAvg: '店舖均價', officeRatio: '辦公倍數', storeRatio: '店舖倍數' }}
                        />
                    }
                >
                    <TypeComparisonTable data={typeComparison} />
                </ReportWrapper>
            )}

            {/* 3. Bubble Chart Controls & Chart */}
            {visibleSections.includes('chart') && (
                <div className="space-y-4">
                    {/* Bubble Chart with Integrated Controls */}
                    <ReportWrapper
                        title="單價分佈泡泡圖"
                        description="分析各單價區間的成交熱度與分佈密集區"
                        headerAction={
                            <ExportButton
                                data={transactionDetails}
                                filename="bubble_chart_source_data"
                                label="匯出交易數據"
                                chartType="unit-price-bubble"
                            />
                        }
                    >
                        <BubbleChart
                            data={transactionDetails}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            interval={interval}
                            sizeMetric={sizeMetric}
                            onMinPriceChange={setMinPrice}
                            onMaxPriceChange={setMaxPrice}
                            onIntervalChange={setInterval}
                            onSizeMetricChange={setSizeMetric}
                        />
                    </ReportWrapper>
                </div>
            )}

        </div>
    );
}
