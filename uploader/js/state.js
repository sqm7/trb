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
}
