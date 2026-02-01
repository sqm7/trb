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

export interface ProjectRankingItem {
    rank?: number; // Added on frontend usually
    projectName: string;
    county?: string;
    district?: string;
    saleAmountSum: number;
    houseAreaSum: number;
    transactionCount: number;
    marketShare: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    avgParkingPrice: number;
}

export interface AnalysisResponse {
    coreMetrics: CoreMetrics;
    projectRanking: ProjectRankingItem[];
    // Other types can be defined later when implementing corresponding reports
    priceBandAnalysis: any;
    unitPriceAnalysis: any;
    parkingAnalysis: any;
    salesVelocityAnalysis: any;
    priceGridAnalysis: any;
    areaDistributionAnalysis: any;
    transactionDetails: any[];
    message?: string;
}
