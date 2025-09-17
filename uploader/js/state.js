// uploader/js/state.js

/**
 * 管理應用程式的所有共享狀態
 */
export const state = {
    // Supabase 客戶端實例
    supabase: null,
    
    // --- 批次上傳工具狀態 ---
    allFiles: [],
    processedMainIds: new Set(),
    summary: { 
        new: 0, 
        updated: 0, 
        identical: 0, 
        subAdded: 0, 
        errors: 0, 
        warnings: 0 
    },
    isUploading: false,

    // ▼▼▼【新增】批次修改工具狀態 ▼▼▼
    modifier: {
        // 存放從資料庫查詢到的結果
        searchResults: [],
        // 存放使用者勾選的紀錄 ID
        selectedIds: new Set(),
    }
};

/**
 * 重設上傳工具的統計數據
 */
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

/**
 * 重設批次修改工具的狀態
 */
export function resetModifierState() {
    state.modifier.searchResults = [];
    state.modifier.selectedIds.clear();
}
