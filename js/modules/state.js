// js/modules/state.js

import { dom } from './dom.js';
import { countyCodeMap } from './config.js';

// 使用一個物件來封裝所有狀態，方便管理和傳遞
export const state = {
    currentPage: 1,
    pageSize: 30,
    totalRecords: 0,
    // 多縣市選擇 (新版)
    selectedCounties: [],
    analysisProgress: { current: 0, total: 0, currentCounty: '', isRunning: false },
    selectedDistricts: [],
    selectedProjects: [],
    suggestionDebounceTimer: null,
    analysisDataCache: null,
    currentSort: { key: 'saleAmountSum', order: 'desc' },
    rankingCurrentPage: 1,
    rankingPageSize: 15,
    currentAverageType: 'arithmetic',
    currentVelocityView: 'monthly',
    currentVelocityMetric: 'count',
    selectedVelocityRooms: [],
    selectedPriceBandRoomTypes: [],
    selectedPriceGridProject: null,
    isHeatmapActive: false,
    currentLegendFilter: { type: null, value: null },
    areaHeatmapChart: null,
    lastHeatmapDetails: { // <-- 修改此物件結構
        details: [],
        rawTransactions: [],
        roomType: '',
        areaRange: ''
    },
    currentHeatmapDetailMetric: 'median',
    excludeCommercialInRanking: false, // 核心指標與排名報告中，是否排除商辦店面的開關狀態
};

// 根據當前狀態獲取篩選條件 (單一縣市版本，供內部使用)
export function getFiltersForCounty(countyName) {
    const filters = {};
    if (countyName) filters.countyCode = countyCodeMap[countyName] || '';
    if (state.selectedDistricts.length > 0) filters.districts = state.selectedDistricts;
    if (dom.typeSelect.value) filters.type = dom.typeSelect.value;
    if (dom.dateStartInput.value) filters.dateStart = dom.dateStartInput.value;
    if (dom.dateEndInput.value) filters.dateEnd = dom.dateEndInput.value;
    if (dom.buildingTypeSelect.value) filters.buildingType = dom.buildingTypeSelect.value;
    if (state.selectedProjects.length > 0) filters.projectNames = state.selectedProjects;
    filters.excludeCommercial = state.excludeCommercialInRanking;
    return filters;
}

// 根據當前狀態獲取篩選條件 (使用第一個選中的縣市，向後兼容)
export function getFilters() {
    const firstCounty = state.selectedCounties[0] || '';
    return getFiltersForCounty(firstCounty);
}
