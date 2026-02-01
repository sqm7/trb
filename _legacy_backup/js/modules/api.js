// js/modules/api.js

import { supabase, API_ENDPOINTS, SUPABASE_ANON_KEY } from './config.js';

// 內部輔助函數：獲取請求標頭
// 【暫時修改】後端已改用 Service Role Key，前端不再需要傳遞認證 Token
// 但仍需 apikey 和 Authorization header 以通過 Supabase 網關
async function getAuthHeaders() {
    // 嘗試獲取 session，如果有的話就附加 Token（向後相容）
    const { data: { session } } = await supabase.auth.getSession();

    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,  // 必須：通過 Supabase 網關
        // 【關鍵修正】即使未登入也需要 Authorization header 來通過 Supabase Edge Function 網關
        'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
    };

    return headers;
}

// 導出(export)的函式，供 app.js 使用

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // 暫時取消強制登入，允許未登入使用者瀏覽
        console.log('使用者未登入，但允許繼續瀏覽');
        // window.location.href = 'login.html';
    }
}

{/* */ }
export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('登出失敗:', error);
        throw error;
    }
}
{/* */ }


export async function fetchData(filters, pagination) {
    const headers = await getAuthHeaders();
    if (!headers) throw new Error("認證失敗");

    const response = await fetch(API_ENDPOINTS.QUERY_DATA, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ filters, pagination })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: '無法解析伺服器回應' }));
        throw new Error(err.error);
    }
    return response.json();
}

export async function analyzeData(filters) {
    const headers = await getAuthHeaders();
    if (!headers) throw new Error("認證失敗");

    const response = await fetch(API_ENDPOINTS.RANKING_ANALYSIS, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ filters })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `分析請求失敗: ${response.status}` }));
        throw new Error(err.error);
    }
    return response.json();
}

export async function fetchSubData(id, type, county) {
    if (!id || !type || !county || county === 'undefined') {
        throw new Error(`前端參數不足，無法查詢附表。(縣市代碼: ${county})`);
    }
    const headers = await getAuthHeaders();
    if (!headers) throw new Error("認證失敗，請重新登入。");

    const response = await fetch(API_ENDPOINTS.SUB_DATA, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ id, type, county })
    });

    if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ error: '無法從伺服器獲取附表資料' }));
        throw new Error(errorResult.error);
    }
    return response.json();
}

export async function fetchProjectNameSuggestions(countyCode, query, districts) {
    const headers = await getAuthHeaders();
    if (!headers) throw new Error("認證標頭獲取失敗");

    // 恢復 detailed: true 以啟用行政區顯示功能
    const payload = { countyCode, query, districts, detailed: true };
    const response = await fetch(API_ENDPOINTS.PROJECT_NAMES, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`伺服器錯誤: ${response.status}`);
    return response.json();
}


export async function generateShareLink(payload) {
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error(`認證刷新失敗: ${refreshError.message}`);
    if (!session) throw new Error('認證刷新後無法取得 Session，請重新登入');

    const headers = await getAuthHeaders();
    if (!headers) throw new Error("認證失敗，無法取得認證標頭");

    const response = await fetch(API_ENDPOINTS.GENERATE_SHARE_LINK, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: '產生分享連結失敗，伺服器未提供詳細資訊' }));
        throw new Error(err.error);
    }
    return response.json();
}