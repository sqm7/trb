export const dom = {
    // User Status
    userStatusContainer: document.getElementById('user-status-container'),

    // --- Filters ---
    filterCard: document.getElementById('filter-card'),
    filterForm: document.getElementById('filter-form'),
    
    // County & District
    countySelect: document.getElementById('county'),
    districtContainer: document.getElementById('district-container'),
    districtInputArea: document.getElementById('district-input-area'),
    districtSuggestions: document.getElementById('district-suggestions'),
    clearDistrictsBtn: document.getElementById('clear-districts-btn'),

    // Project Name
    projectNameContainer: document.getElementById('project-name-container'),
    projectNameInput: document.getElementById('project-name-input'),
    projectNameSuggestions: document.getElementById('project-name-suggestions'),
    clearProjectsBtn: document.getElementById('clear-projects-btn'),

    // Other Filters
    typeSelect: document.getElementById('type'),
    buildingTypeSelect: document.getElementById('building-type'),
    dateRangeSelect: document.getElementById('date-range'),
    dateStartInput: document.getElementById('date-start'),
    dateEndInput: document.getElementById('date-end'),
    setTodayBtn: document.getElementById('set-today-btn'),

    // Action Buttons
    analyzeBtn: document.getElementById('analyze-btn'),
    searchBtn: document.getElementById('search-btn'),
    
    // --- Results Area ---
    resultsContainer: document.getElementById('results-container'),
    messageArea: document.getElementById('message-area'),
    tabsContainer: document.getElementById('tabs-container'),

    // --- Tab Contents ---
    rankingReportContent: document.getElementById('ranking-report-content'),
    priceBandReportContent: document.getElementById('price-band-report-content'),
    unitPriceReportContent: document.getElementById('unit-price-report-content'),
    parkingReportContent: document.getElementById('parking-report-content'),
    velocityReportContent: document.getElementById('velocity-report-content'),
    priceGridReportContent: document.getElementById('price-grid-report-content'),
    dataListContent: document.getElementById('data-list-content'),
    
    // --- Ranking Report ---
    excludeCommercialToggle: document.getElementById('exclude-commercial-toggle'),
    metricCardsContainer: document.getElementById('metric-cards-container'),
    rankingChartContainer: document.getElementById('ranking-chart-container'),
    rankingTable: document.getElementById('ranking-table'),

    // --- Price Band Report ---
    priceBandRoomFilterContainer: document.getElementById('price-band-room-filter-container'),
    priceBandChart: document.getElementById('price-band-chart'),
    priceBandTable: document.getElementById('price-band-table'),
    
    // --- Unit Price Report ---
    avgTypeToggle: document.getElementById('avg-type-toggle'),
    residentialStatsTableContainer: document.getElementById('residential-stats-table-container'),
    residentialStatsExtraInfo: document.getElementById('residential-stats-extra-info'),
    officeStatsTableContainer: document.getElementById('office-stats-table-container'),
    officeStatsExtraInfo: document.getElementById('office-stats-extra-info'),
    storeStatsTableContainer: document.getElementById('store-stats-table-container'),
    storeStatsExtraInfo: document.getElementById('store-stats-extra-info'),
    typeComparisonTableContainer: document.getElementById('type-comparison-table-container'),
    averageTypeExplanation: document.getElementById('average-type-explanation'),

    // --- Parking Report ---
    parkingRatioTableContainer: document.getElementById('parking-ratio-table-container'),
    avgPriceByTypeTableContainer: document.getElementById('avg-price-by-type-table-container'),
    rampPlanePriceByFloorTableContainer: document.getElementById('ramp-plane-price-by-floor-table-container'),

    // --- Velocity Report ---
    velocityRoomFilterContainer: document.getElementById('velocity-room-filter-container'),
    velocitySubTabsContainer: document.getElementById('velocity-sub-tabs-container'),
    salesVelocityChart: document.getElementById('sales-velocity-chart'),
    velocityTableContainer: document.getElementById('velocity-table-container'),
    heatmapMinAreaInput: document.getElementById('heatmap-min-area-input'),
    heatmapMaxAreaInput: document.getElementById('heatmap-max-area-input'),
    heatmapIntervalDecrement: document.getElementById('heatmap-interval-decrement'),
    heatmapIntervalInput: document.getElementById('heatmap-interval-input'),
    heatmapIntervalIncrement: document.getElementById('heatmap-interval-increment'),
    areaHeatmapChart: document.getElementById('area-heatmap-chart'),
    heatmapDetailsContainer: document.getElementById('heatmap-details-container'),
    heatmapMetricToggle: document.getElementById('heatmap-metric-toggle'),
    heatmapDetailsControls: document.getElementById('heatmap-details-controls'),
    heatmapDetailsContent: document.getElementById('heatmap-details-content'),
    
    // --- Price Grid Report ---
    priceGridProjectFilterContainer: document.getElementById('price-grid-project-filter-container'),
    floorPremiumInput: document.getElementById('floor-premium-input'),
    analyzeHeatmapBtn: document.getElementById('analyze-heatmap-btn'),
    backToGridBtn: document.getElementById('back-to-grid-btn'),
    heatmapInfoContainer: document.getElementById('heatmap-info-container'),
    heatmapColorLegend: document.getElementById('heatmap-color-legend'),
    heatmapIconLegend: document.getElementById('heatmap-icon-legend'),
    sharePriceGridBtn: document.getElementById('share-price-grid-btn'),
    unitColorLegendContainer: document.getElementById('unit-color-legend-container'),
    horizontalPriceGridContainer: document.getElementById('horizontal-price-grid-container'),
    heatmapSummaryTableContainer: document.getElementById('heatmap-summary-table-container'),
    heatmapHorizontalComparisonTableContainer: document.getElementById('heatmap-horizontal-comparison-table-container'),
    
    // --- Data List ---
    tableContainer: document.getElementById('table-container'),
    resultsTable: document.getElementById('results-table'),
    paginationControls: document.getElementById('pagination-controls'),

    // --- Modals ---
    detailsModal: document.getElementById('details-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalContent: document.getElementById('modal-content'),
    
    shareModal: document.getElementById('share-modal'),
    shareModalTitle: document.getElementById('share-modal-title'),
    shareModalCloseBtn: document.getElementById('share-modal-close-btn'),
    shareModalContent: document.getElementById('share-modal-content'),
    shareUrlInput: document.getElementById('share-url-input'),
    copyShareUrlBtn: document.getElementById('copy-share-url-btn'),
    copyFeedback: document.getElementById('copy-feedback'),
    
    // --- New Building Names Modal ---
    buildingNamesModal: document.getElementById('building-names-modal'),
    buildingNamesModalTitle: document.getElementById('building-names-modal-title'),
    buildingNamesModalCloseBtn: document.getElementById('building-names-modal-close-btn'),
    buildingNamesModalContent: document.getElementById('building-names-modal-content'),
};
