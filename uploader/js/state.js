// uploader/js/state.js

/**
 * 管理應用程式的所有共享狀態
 */
export const state = {
    // Supabase 客戶端實例
    supabase: null,
    
    // 從資料夾選擇器中讀取到的所有有效檔案資訊
    allFiles: [],
    
    // 在處理主表時，紀錄所有被新增或更新的紀錄 '編號'
    // 用於後續處理附表時，判斷哪些附表資料需要被上傳
    processedMainIds: new Set(),
    
    // 上傳過程的統計數據
    summary: { 
        new: 0, 
        updated: 0, 
        identical: 0, 
        subAdded: 0, 
        errors: 0, 
        warnings: 0 
    },
    
    // ▼▼▼ 【新增部分】 ▼▼▼
    // 用來暫存日誌詳細資料的快取
    logDetailsCache: new Map(),
    // 用於為每一筆日誌產生唯一ID的計數器
    logDetailCounter: 0,
    // ▲▲▲ 【新增結束】 ▲▲▲
    
    // 標記當前是否正在上傳中，防止重複觸發
    isUploading: false
};

// 提供一個重設 summary 物件的方法，方便每次開始上傳時呼叫
export function resetSummary() {
    state.summary = { 
        new: 0, 
        updated: 0, 
        identical: 0, 
        subAdded: 0, 
        errors: 0, 
        warnings: 0 
    };
    // ▼▼▼ 【新增部分】每次重置時也清空快取和計數器 ▼▼▼
    state.logDetailsCache.clear();
    state.logDetailCounter = 0;
    // ▲▲▲ 【新增結束】 ▲▲▲
}
