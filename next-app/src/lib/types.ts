export interface CoreMetrics {
    totalSaleAmount: number;
    totalHouseArea: number;
    overallAveragePrice: number;
    transactionCount: number;
    minPrice?: number;
    maxPrice?: number;
    medianPrice?: number;
    q1Price?: number;
    q3Price?: number;
}

export interface ProjectRankingItem {
    projectName: string;
    county: string;
    district: string;
    saleAmountSum: number;
    houseAreaSum: number;
    transactionCount: number;
    marketShare: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    avgParkingPrice: number;
    [key: string]: any;
}

export interface PriceBandItem {
    roomType: string;
    bathrooms: number | null;
    minPrice: number;
    q1Price: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    avgPrice: number;
    count: number;
    projectNames?: string[];
    [key: string]: any;
}

export interface PriceBandAnalysis {
    details: PriceBandItem[];
    locationCrossTable?: Record<string, Record<string, number>>;
    allDistricts?: string[];
    allRoomTypes?: string[];
    transactionDetails?: any[];
}

export interface UnitPriceAnalysis {
    residentialStats?: any;
    officeStats?: any;
    storeStats?: any;
    typeComparison?: any[];
}

export interface SalesVelocityAnalysis {
    overall?: any;
    byRoomType?: any[];
    allRoomTypes?: string[];
    monthly?: Record<string, any>;
    quarterly?: Record<string, any>;
    yearly?: Record<string, any>;
    weekly?: Record<string, any>;
    salesRate?: any;
}

export interface AnalysisData {
    coreMetrics: CoreMetrics;
    projectRanking: ProjectRankingItem[];
    rankingAnalysis: {
        coreMetrics: CoreMetrics;
        projectRanking: ProjectRankingItem[];
    };
    priceBandAnalysis?: PriceBandAnalysis;
    unitPriceAnalysis?: UnitPriceAnalysis;
    salesVelocityAnalysis?: SalesVelocityAnalysis;
    parkingAnalysis?: {
        parkingRatio?: any;
        avgPriceByType?: any[];
        rampPlanePriceByFloor?: any[];
    };
    priceGridAnalysis?: {
        projectNames: string[];
        byProject: Record<string, any>;
    };
    areaDistributionAnalysis?: Record<string, any[]>;
    transactionDetails?: any[];
}

export interface GenerateOptions {
    title?: string;
    counties?: string[];
    districts?: string[];
    dateRange?: string;
    startDate?: string;
    endDate?: string;
}
