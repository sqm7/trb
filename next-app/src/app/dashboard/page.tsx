"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterBar } from "@/components/features/FilterBar";
import { RankingReport } from "@/components/reports/RankingReport";
import { PriceBandReport } from "@/components/reports/PriceBandReport";
import { SalesVelocityReport } from "@/components/reports/SalesVelocityReport";
import { ParkingAnalysisReport } from "@/components/reports/ParkingAnalysisReport";
import { UnitPriceAnalysisReport } from "@/components/reports/UnitPriceAnalysisReport";
import { HeatmapReport } from "@/components/reports/HeatmapReport";
import { DataListReport } from "@/components/reports/DataListReport";
import PolicyTimelineReport from "@/components/reports/PolicyTimelineReport";

import { api } from "@/lib/api";
import { useFilterStore } from "@/store/useFilterStore";
import { Loader2, AlertCircle, RotateCcw, Search, LineChart, FileDown, Filter, X, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DISTRICT_DATA, COUNTY_CODE_MAP } from "@/lib/config";
import { getDateRangeDates } from "@/lib/date-utils";

import { aggregateAnalysisData } from "@/lib/aggregator";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { SnapshotShareModal } from "@/components/features/SnapshotShareModal";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const filters = useFilterStore();
    const {
        loading,
        error,
        analysisData,
        handleAnalyze
    } = useAnalysisData();

    // Mapping for labels
    const getTabLabel = (val: string) => {
        const tab = [
            { value: 'ranking', label: '核心指標與排名' },
            { value: 'price-band', label: '總價帶分析' },
            { value: 'unit-price', label: '單價分析' },
            { value: 'heatmap', label: '調價熱力圖' },
            { value: 'timeline', label: '政策時光機' },
            { value: 'velocity', label: '銷售速度與房型' },
            { value: 'parking', label: '車位分析' },
            { value: 'data-list', label: '交易明細列表' },
        ].find(t => t.value === val);
        return tab?.label || '';
    };

    // Initial load? Optional.
    useEffect(() => {
        // if (filters.counties.length > 0) handleAnalyze();
    }, []);

    const renderShareHeader = () => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-violet-500 rounded-full" />
                    {getTabLabel(filters.activeTab)}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                    針對目前篩選條件下的市場數據深度分析
                </p>
            </div>
            <SnapshotShareModal
                analysisData={analysisData}
                trigger={
                    <Button className="bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 gap-2 shrink-0">
                        <Share2 className="w-4 h-4" />
                        分享報表
                    </Button>
                }
            />
        </div>
    );

    return (
        <AppLayout>
            <section className="mb-6 relative z-50">
                <FilterBar onAnalyze={handleAnalyze} isLoading={loading} analysisData={analysisData} />
            </section>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
                    <p className="text-zinc-400">正在分析數據，請稍候...</p>
                </div>
            )}

            {!loading && !analysisData && !error && (
                <div className="flex flex-col items-center justify-center py-20 glass-panel border-dashed border-2 border-zinc-800 rounded-xl">
                    <div className="text-zinc-500 mb-2">尚未進行分析</div>
                    <p className="text-zinc-600 text-sm">請選擇篩選條件並點擊「開始分析」</p>
                </div>
            )}

            {!loading && analysisData && (
                <div className="space-y-8 pb-20">
                    {/* Reports Tabs */}
                    <Tabs value={filters.activeTab} onValueChange={filters.setActiveTab} className="w-full">
                        <div className="overflow-x-auto pb-2 mask-fade-right pr-8">
                            <TabsList className="bg-zinc-900/50 border border-white/5 p-1 mb-6 inline-flex min-w-max">
                                <TabsTrigger value="ranking" className="whitespace-nowrap">核心指標與排名</TabsTrigger>
                                <TabsTrigger value="price-band" className="whitespace-nowrap">總價帶分析</TabsTrigger>
                                <TabsTrigger value="unit-price" className="whitespace-nowrap">單價分析</TabsTrigger>
                                <TabsTrigger value="heatmap" className="whitespace-nowrap">調價熱力圖</TabsTrigger>
                                <TabsTrigger value="timeline" className="whitespace-nowrap">政策時光機</TabsTrigger>
                                <TabsTrigger value="velocity" className="whitespace-nowrap">銷售速度與房型</TabsTrigger>
                                <TabsTrigger value="parking" className="whitespace-nowrap">車位分析</TabsTrigger>
                                <TabsTrigger value="data-list" className="whitespace-nowrap">交易明細列表</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="ranking" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <RankingReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="price-band" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <PriceBandReport data={analysisData.priceBandAnalysis ? {
                                    ...analysisData.priceBandAnalysis,
                                    transactionDetails: analysisData.transactionDetails
                                } : null} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="unit-price" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <UnitPriceAnalysisReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="heatmap" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <HeatmapReport data={analysisData.priceGridAnalysis ? analysisData : null} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="timeline" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <PolicyTimelineReport data={analysisData.transactionDetails as any} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="velocity" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <SalesVelocityReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="parking" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <ParkingAnalysisReport data={analysisData.parkingAnalysis?.parkingRatio ? analysisData : null} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="data-list" className="focus-visible:outline-none focus-visible:ring-0">
                            {renderShareHeader()}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <DataListReport trigger={analysisData.transactionDetails?.length ? analysisData : null} />
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </AppLayout>
    );
}
