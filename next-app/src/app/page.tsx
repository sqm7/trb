"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterBar } from "@/components/features/FilterBar";
import { RankingReport } from "@/components/reports/RankingReport";
import { PriceBandReport } from "@/components/reports/PriceBandReport";
import { SalesVelocityReport } from "@/components/reports/SalesVelocityReport";
import { ParkingAnalysisReport } from "@/components/reports/ParkingAnalysisReport";
import { UnitPriceAnalysisReport } from "@/components/reports/UnitPriceAnalysisReport";
import { HeatmapReport } from "@/components/reports/HeatmapReport";
import { DataListReport } from "@/components/reports/DataListReport";

import { api } from "@/lib/api";
import { useFilterStore } from "@/store/useFilterStore";
import { Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COUNTY_CODE_MAP } from "@/lib/config";
import { getDateRangeDates } from "@/lib/date-utils";

import { aggregateAnalysisData } from "@/lib/aggregator";

export default function DashboardPage() {
  const filters = useFilterStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysisData(null); // Clear previous data

    try {
      // Map county names to codes
      const countyCodes = filters.counties.map(name => COUNTY_CODE_MAP[name] || name);

      if (countyCodes.length === 0) {
        setError("請至少選擇一個縣市");
        setLoading(false);
        return;
      }

      // Date handling
      let { dateRange, startDate, endDate } = filters;

      // Ensure dates are populated if using a preset range but dates are empty
      if (dateRange !== 'custom' && (!startDate || !endDate)) {
        const calculated = getDateRangeDates(dateRange);
        if (calculated.startDate && calculated.endDate) {
          startDate = calculated.startDate;
          endDate = calculated.endDate;
        }
      }

      // Prepare common payload base
      const basePayload = {
        districts: filters.districts,
        transactionType: filters.transactionType,
        type: filters.transactionType,
        projectNames: filters.projectNames,
        buildingType: filters.buildingType,
        excludeCommercial: filters.excludeCommercial,
        floorPremium: filters.floorPremium,
        dateRange,
        dateStart: startDate,
        dateEnd: endDate
      };

      console.log("Analyzing with counties:", countyCodes);

      // Fetch data for all counties in parallel
      const promises = countyCodes.map(countyCode => {
        const payload = { ...basePayload, countyCode, counties: [countyCode] };
        return api.analyzeProjectRanking(payload as any)
          .catch(err => {
            console.error(`Failed to fetch data for ${countyCode}:`, err);
            return null;
          });
      });

      const results = await Promise.all(promises);

      // Aggregate results
      let totalResult: any = null;
      let successCount = 0;

      for (const result of results) {
        if (result) {
          console.log("Merging result for county:", result.projectRanking?.[0]?.county);
          totalResult = aggregateAnalysisData(totalResult, result);
          successCount++;
        }
      }

      console.log("Aggregation complete. Total Transaction Details:", totalResult?.transactionDetails?.length);

      if (successCount === 0) {
        throw new Error("無法取得任何縣市的分析數據");
      } else if (successCount < countyCodes.length) {
        // Partial success
        const failedCount = countyCodes.length - successCount;
        setError(`注意：有 ${failedCount} 個縣市的資料載入失敗，分析結果可能不完整。`);
      }

      setAnalysisData(totalResult);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "無法取得分析數據，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load? Optional.
  useEffect(() => {
    // if (filters.counties.length > 0) handleAnalyze();
  }, []);

  return (
    <AppLayout>
      <section className="mb-6 sticky top-4 z-30">
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
                <TabsTrigger value="velocity">銷售速度與房型</TabsTrigger>
                <TabsTrigger value="parking">車位分析</TabsTrigger>
                <TabsTrigger value="data-list">交易明細列表</TabsTrigger>

              </TabsList>
            </div>

            <TabsContent value="ranking" className="focus-visible:outline-none focus-visible:ring-0">
              <RankingReport data={analysisData} />
            </TabsContent>

            <TabsContent value="price-band" className="focus-visible:outline-none focus-visible:ring-0">
              <PriceBandReport data={{
                ...analysisData.priceBandAnalysis,
                transactionDetails: analysisData.transactionDetails
              }} />
            </TabsContent>

            <TabsContent value="unit-price" className="focus-visible:outline-none focus-visible:ring-0">
              <UnitPriceAnalysisReport data={analysisData} />
            </TabsContent>

            <TabsContent value="heatmap" className="focus-visible:outline-none focus-visible:ring-0">
              <HeatmapReport data={analysisData} />
            </TabsContent>

            <TabsContent value="velocity" className="focus-visible:outline-none focus-visible:ring-0">
              <SalesVelocityReport data={analysisData} />
            </TabsContent>

            <TabsContent value="parking" className="focus-visible:outline-none focus-visible:ring-0">
              <ParkingAnalysisReport data={analysisData} />
            </TabsContent>

            <TabsContent value="data-list" className="focus-visible:outline-none focus-visible:ring-0">
              <DataListReport trigger={analysisData} />
            </TabsContent>
          </Tabs>
        </div>
      )}

    </AppLayout>
  );
}
