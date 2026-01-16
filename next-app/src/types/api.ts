import { AnalysisResponse as DomainAnalysisResponse } from './domain';

export type AnalysisResponse = DomainAnalysisResponse;

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface FilterParams {
    countyCode?: string;
    districts?: string[];
    type?: string;
    dateStart?: string;
    dateEnd?: string;
    projectNames?: string[];
    buildingType?: string;
    excludeCommercial?: boolean;
    floorPremium?: number;
    [key: string]: any;
}

export interface ProjectNameInfo {
    name: string;
    district?: string;
    county?: string;
}

export interface DataQueryResponse {
    data: any[];
    count: number;
}
