
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useFilterStore } from "@/store/useFilterStore";
import { COUNTY_CODE_MAP } from "@/lib/config";
import { getDateRangeDates } from "@/lib/date-utils";
import { aggregateAnalysisData } from "@/lib/aggregator";
import { AnalysisData } from "@/lib/types";

export function useAnalysisData() {
    const filters = useFilterStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        setLoading(true);
        setError(null);
        filters.setAnalysisData(null); // Clear global store

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

            console.log("[useAnalysisData] Analyzing with counties:", countyCodes);

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
                // Validate result has expected structure (at least projectRanking/coreMetrics)
                if (result && result.projectRanking && result.coreMetrics) {
                    console.log("Merging result for county:", result.projectRanking?.[0]?.county);
                    totalResult = aggregateAnalysisData(totalResult, result);
                    successCount++;
                }
            }

            console.log("Aggregation complete. Total Transaction Details:", totalResult?.transactionDetails?.length);

            if (successCount === 0) {
                if (filters.projectNames.length > 0) {
                    throw new Error("這段時間 這個建案查詢不到資料");
                }
                throw new Error("無法取得任何縣市的分析數據");
            } else if (successCount < countyCodes.length) {
                // Partial success
                const failedCount = countyCodes.length - successCount;
                setError(`注意：有 ${failedCount} 個縣市的資料載入失敗，分析結果可能不完整。`);
            }

            // Persistence
            filters.setAnalysisData(totalResult);
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError(err.message || "無法取得分析數據，請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    return {
        loading,
        error,
        analysisData: filters.analysisData,
        handleAnalyze,
        setError,
        setLoading,
        setAnalysisData: filters.setAnalysisData
    };
}
