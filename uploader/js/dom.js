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

    // 批次修改功能相關元素
    updateCountySelect: document.getElementById('updateCountySelect'),
    updateTransactionType: document.getElementById('updateTransactionType'),
    updateSearchField: document.getElementById('updateSearchField'),
    updateSearchKeyword: document.getElementById('updateSearchKeyword'),
    searchForUpdateButton: document.getElementById('searchForUpdateButton'),

    // 互動視窗 (Modal)
    batchUpdateModal: document.getElementById('batchUpdateModal'),
    batchUpdateModalCloseBtn: document.getElementById('batchUpdateModalCloseBtn'),
    searchResultCount: document.getElementById('searchResultCount'),
    selectAllCheckbox: document.getElementById('selectAllCheckbox'),
    searchResultsContainer: document.getElementById('searchResultsContainer'),
    
    // Modal 內的篩選元件
    modalSearchCriteriaDisplay: document.getElementById('modalSearchCriteriaDisplay'),
    modalFilterInput: document.getElementById('modalFilterInput'),
    modalFilterButton: document.getElementById('modalFilterButton'),
    
    // 更新執行區塊
    updateFieldSelect: document.getElementById('updateFieldSelect'),
    updateValueInput: document.getElementById('updateValueInput'),
    executeBatchUpdateButton: document.getElementById('executeBatchUpdateButton'),

    // ▼▼▼ 【這就是修改處】 ▼▼▼
    // 上傳詳情 Modal
    showUploadDetailsButton: document.getElementById('showUploadDetailsButton'),
    uploadDetailsModal: document.getElementById('uploadDetailsModal'),
    uploadDetailsModalCloseBtn: document.getElementById('uploadDetailsModalCloseBtn'),
    uploadDetailsTabs: document.getElementById('uploadDetailsTabs'),
    uploadDetailsContent: document.getElementById('uploadDetailsContent'),
    // ▲▲▲ 【修改結束】 ▲▲▲
};
