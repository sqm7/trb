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
import { Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COUNTY_CODE_MAP } from "@/lib/config";
import { getDateRangeDates } from "@/lib/date-utils";

import { aggregateAnalysisData } from "@/lib/aggregator";
import { useAnalysisData } from "@/hooks/useAnalysisData";

export default function DashboardPage() {
    const filters = useFilterStore();
    const {
        loading,
        error,
        analysisData,
        handleAnalyze
    } = useAnalysisData();

    // Initial load? Optional.
    useEffect(() => {
        // if (filters.counties.length > 0) handleAnalyze();
    }, []);

    return (
        <AppLayout>
            <section className="mb-6">
                <FilterBar onAnalyze={handleAnalyze} isLoading={loading} />
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
                    <Tabs defaultValue="ranking" className="w-full">
                        <div className="overflow-x-auto pb-2 scrollbar-hide">
                            <TabsList className="bg-zinc-900/50 border border-white/5 p-1 mb-6 inline-flex min-w-max">
                                <TabsTrigger value="ranking">核心指標與排名</TabsTrigger>
                                <TabsTrigger value="price-band">總價帶分析</TabsTrigger>
                                <TabsTrigger value="unit-price">單價分析</TabsTrigger>
                                <TabsTrigger value="heatmap">調價熱力圖</TabsTrigger>
                                <TabsTrigger value="timeline">政策時光機</TabsTrigger>
                                <TabsTrigger value="velocity">銷售速度與房型</TabsTrigger>
                                <TabsTrigger value="parking">車位分析</TabsTrigger>
                                <TabsTrigger value="data-list">交易明細列表</TabsTrigger>

                            </TabsList>
                        </div>

                        <TabsContent value="ranking" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <RankingReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="price-band" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <PriceBandReport data={{
                                    ...analysisData.priceBandAnalysis,
                                    transactionDetails: analysisData.transactionDetails
                                }} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="unit-price" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <UnitPriceAnalysisReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="heatmap" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <HeatmapReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="timeline" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <PolicyTimelineReport data={analysisData.transactionDetails} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="velocity" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <SalesVelocityReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="parking" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <ParkingAnalysisReport data={analysisData} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="data-list" className="focus-visible:outline-none focus-visible:ring-0">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <DataListReport trigger={analysisData} />
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

        </AppLayout>
    );
}
