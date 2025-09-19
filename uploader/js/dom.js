// uploader/js/dom.js

/**
 * 集中管理所有 DOM 元素的引用
 */
export const DOM = {
    // 按鈕
    selectFoldersButton: document.getElementById('selectFoldersButton'),
    startUploadButton: document.getElementById('startUploadButton'),
    testConnectionButton: document.getElementById('testConnectionButton'),
    openBatchEditButton: document.getElementById('openBatchEditButton'), // New
    
    // 輸入框
    supabaseUrlInput: document.getElementById('supabaseUrl'),
    supabaseKeyInput: document.getElementById('supabaseKey'),

    // 顯示區域
    statusContainer: document.getElementById('statusContainer'),
    errorLogContainer: document.getElementById('errorLogContainer'),
    fileActionContainer: document.getElementById('fileActionContainer'), // New
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
    
    // Batch Edit Modal Elements (New)
    batchEditModal: document.getElementById('batch-edit-modal'),
    batchEditModalCloseBtn: document.getElementById('batch-edit-modal-close-btn'),
    batchSearchInput: document.getElementById('batch-search-input'),
    batchResultsCount: document.getElementById('batch-results-count'),
    batchToggleAllBtn: document.getElementById('batch-toggle-all-btn'),
    batchSelectAll: document.getElementById('batch-select-all'),
    batchResultsList: document.getElementById('batch-results-list'),
    batchUpdateField: document.getElementById('batch-update-field'),
    batchUpdateValue: document.getElementById('batch-update-value'),
    batchExecuteUpdateBtn: document.getElementById('batch-execute-update-btn'),
};
