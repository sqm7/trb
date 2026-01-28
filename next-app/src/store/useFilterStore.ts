import { create } from 'zustand';
import { AnalysisData } from '@/lib/types';

interface FilterState {
    counties: string[];
    districts: string[];
    transactionType: string;
    buildingType: string;
    projectNames: string[];
    dateRange: string;
    startDate: string;
    endDate: string;
    excludeCommercial: boolean;
    floorPremium: number;
    activeTab: string;

    setCounties: (counties: string[]) => void;
    setDistricts: (districts: string[]) => void;
    setTransactionType: (type: string) => void;
    setBuildingType: (type: string) => void;
    setProjectNames: (names: string[]) => void;
    setDateRange: (range: string, start?: string, end?: string) => void;
    setCustomDate: (start: string, end: string) => void;
    setExcludeCommercial: (exclude: boolean) => void;
    setFloorPremium: (value: number) => void;
    setActiveTab: (tab: string) => void;

    // UI / Report State
    rankingCurrentPage: number;
    rankingPageSize: number;
    currentSort: { key: string; order: 'asc' | 'desc' };
    currentAverageType: 'arithmetic' | 'weighted';
    velocityView: 'monthly' | 'quarterly';
    velocityMetric: 'count' | 'priceSum' | 'areaSum';

    setRankingCurrentPage: (page: number) => void;
    setRankingPageSize: (size: number) => void;
    setCurrentSort: (sort: { key: string; order: 'asc' | 'desc' }) => void;
    setCurrentAverageType: (type: 'arithmetic' | 'weighted') => void;
    setVelocityView: (view: 'monthly' | 'quarterly') => void;
    setVelocityMetric: (metric: 'count' | 'priceSum' | 'areaSum') => void;

    // Data Persistence
    analysisData: AnalysisData | null;
    setAnalysisData: (data: AnalysisData | null) => void;

    resetFilters: () => void;
}

const DEFAULT_FILTERS = {
    counties: [],
    districts: [],
    transactionType: '預售交易',
    buildingType: '',
    projectNames: [],
    dateRange: '1y',
    startDate: '', // Logic to calculate default date should be in component or helper
    endDate: '',
    excludeCommercial: false,
    floorPremium: 0.3,

    // UI Defaults
    rankingCurrentPage: 1,
    rankingPageSize: 10,
    currentSort: { key: 'saleAmountSum', order: 'desc' } as { key: string; order: 'asc' | 'desc' },
    currentAverageType: 'arithmetic' as 'arithmetic' | 'weighted',
    velocityView: 'monthly' as 'monthly' | 'quarterly',
    velocityMetric: 'count' as 'count' | 'priceSum' | 'areaSum',
    activeTab: 'ranking',

    analysisData: null
};

export const useFilterStore = create<FilterState>((set) => ({
    ...DEFAULT_FILTERS,

    setCounties: (counties) => set({ counties, districts: [] }), // Reset districts when county changes
    setDistricts: (districts) => set({ districts }),
    setTransactionType: (transactionType) => set({ transactionType }),
    setBuildingType: (buildingType) => set({ buildingType }),
    setProjectNames: (projectNames) => set({ projectNames }),

    setDateRange: (dateRange, startDate, endDate) => set((plainState) => {
        // Only update dates if provided, otherwise keep existing or require calc logic
        return { dateRange, startDate: startDate || plainState.startDate, endDate: endDate || plainState.endDate };
    }),

    setCustomDate: (startDate, endDate) => set({ startDate, endDate, dateRange: 'custom' }),
    setExcludeCommercial: (excludeCommercial) => set({ excludeCommercial }),
    setFloorPremium: (floorPremium) => set({ floorPremium }),

    setRankingCurrentPage: (rankingCurrentPage) => set({ rankingCurrentPage }),
    setRankingPageSize: (rankingPageSize) => set({ rankingPageSize }),
    setCurrentSort: (currentSort) => set({ currentSort }),
    setCurrentAverageType: (currentAverageType) => set({ currentAverageType }),
    setVelocityView: (velocityView) => set({ velocityView }),
    setVelocityMetric: (velocityMetric) => set({ velocityMetric }),
    setActiveTab: (activeTab) => set({ activeTab }),

    setAnalysisData: (analysisData) => set({ analysisData }),

    resetFilters: () => set(DEFAULT_FILTERS)
}));
