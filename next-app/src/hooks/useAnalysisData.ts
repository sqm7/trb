import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { aggregateAnalysisData } from '@/lib/aggregator';
import { AnalysisResult, FilterState } from '@/types';
import { COUNTY_CODE_MAP } from '@/lib/constants';
import { useMemo } from 'react';

export function useMultiCityAnalysis(counties: string[], baseFilters: FilterState): {
    data: AnalysisResult | null;
    isLoading: boolean;
    isError: boolean;
    errors: unknown[];
} {
    // 1. Create query objects for each county
    const queries = counties.map(countyName => {
        const countyCode = COUNTY_CODE_MAP[countyName];
        return {
            queryKey: ['analysis', countyCode, baseFilters],
            queryFn: async () => {
                const filters = { ...baseFilters, countyCode };
                // Handle district filtering logic here if needed (e.g., filtering districts relevant to this county)
                return api.analyzeData(filters);
            },
            enabled: !!countyCode && counties.length > 0,
            staleTime: 5 * 60 * 1000, // 5 minutes
        };
    });

    // 2. Execute parallel queries
    const results = useQueries({ queries });

    // 3. Aggregate results
    const aggregatedData = useMemo(() => {
        let total: AnalysisResult | null = null;
        let isLoading = false;
        let isError = false;

        results.forEach(result => {
            if (result.isLoading) isLoading = true;
            if (result.isError) isError = true;
            if (result.data) {
                total = aggregateAnalysisData(total, result.data);
            }
        });

        return {
            data: total,
            isLoading,
            isError,
            errors: results.filter(r => r.isError).map(r => r.error)
        };
    }, [results]);

    return aggregatedData;
}

export function useProjectSuggestions(counties: string[], query: string) {
    return useQuery({
        queryKey: ['suggestions', counties, query],
        queryFn: async () => {
            // Parallel fetch logic similar to analysis if needed, or just fetch all
            const promises = counties.map(c => {
                const code = COUNTY_CODE_MAP[c];
                return api.fetchProjectNameSuggestions(code, query);
            });
            const results = await Promise.all(promises);
            return results.flat();
        },
        enabled: counties.length > 0 && query.length > 0,
        staleTime: 60 * 1000,
    });
}
