
export interface FilterState {
    countyCode?: string;
    districts?: string[];
    type?: string;
    dateStart?: string;
    dateEnd?: string;
    buildingType?: string;
    projectNames?: string[];
    excludeCommercial?: boolean;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    totalRecords: number;
}

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
}

export interface CoreMetrics {
    totalSaleAmount: number;
    totalHouseArea: number;
    overallAveragePrice: number;
    transactionCount: number;
    medianPrice: number;
    q1Price: number;
    q3Price: number;
    minPrice: number;
    maxPrice: number;
}

export interface AnalysisResult {
    coreMetrics: CoreMetrics;
    projectRanking: any[]; // TODO: Define Project Ranking Interface
    priceBandAnalysis: any;
    unitPriceAnalysis: any;
    parkingAnalysis: any;
    salesVelocityAnalysis: any;
    priceGridAnalysis: any;
    areaDistributionAnalysis: any;
    transactionDetails?: any[];
}
