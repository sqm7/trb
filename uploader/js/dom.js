// uploader/js/dom.js

/**
 * 集中管理所有 DOM 元素的引用
 */
export const DOM = {
    // 按鈕
    selectFoldersButton: document.getElementById('selectFoldersButton'),
    startUploadButton: document.getElementById('startUploadButton'),
    testConnectionButton: document.getElementById('testConnectionButton'),
    
    // 輸入框
    supabaseUrlInput: document.getElementById('supabaseUrl'),
    supabaseKeyInput: document.getElementById('supabaseKey'),

    // 顯示區域
    statusContainer: document.getElementById('statusContainer'),
    errorLogContainer: document.getElementById('errorLogContainer'),
    fileListContainer: document.getElementById('fileListContainer'),
    fileList: document.getElementById('fileList'),
    
    // 進度顯示
    progressCircle: document.getElementById('progressCircle'),
    progressPercent: document.getElementById('progressPercent'),
    progressStatus: document.getElementById('progressStatus'),
    currentFileName: document.getElementById('currentFileName'),
    
    // 連線與時間狀態
    connectionStatus: document.getElementById('connectionStatus'),
    connectionText: document.getElementById('connectionText'),
    currentTime: document.getElementById('currentTime'),

    // ▼▼▼【新增】批次修改工具的元素 ▼▼▼
    modifier: {
        countySelect: document.getElementById('modifier-county'),
        typeSelect: document.getElementById('modifier-type'),
        searchBySelect: document.getElementById('modifier-search-by'),
        keywordInput: document.getElementById('modifier-keyword'),
        searchBtn: document.getElementById('modifier-search-btn'),
        resultsContainer: document.getElementById('modifier-results-container'),
        resultsCount: document.getElementById('modifier-results-count'),
        tableWrapper: document.getElementById('modifier-table-wrapper'),
        tableBody: document.getElementById('modifier-results-table-body'),
        selectAllCheckbox: document.getElementById('modifier-select-all'),
        actionPanel: document.getElementById('modifier-action-panel'),
        fieldSelect: document.getElementById('modifier-field-select'),
        newValueInput: document.getElementById('modifier-new-value'),
        updateBtn: document.getElementById('modifier-update-btn'),
    }
};
