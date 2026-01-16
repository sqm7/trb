// 檔案路徑: supabase/functions/generate-share-link/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// 產生一個安全的隨機權杖
function generateSecureToken() {
  const buffer = new Uint8Array(16); // 16 bytes = 128 bits of randomness
  crypto.getRandomValues(buffer);
  // 轉換為 32 個字元的十六進位字串
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // 處理 CORS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. 身份驗證：確保只有已登入的使用者才能建立分享連結
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: authError } = await userSupabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Authentication Error:', authError?.message || 'No user found.');
      return new Response(JSON.stringify({ error: '無效的認證或未登入' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. 取得前端傳來的參數 (包含新增的 view_mode 和 view_options)
    const { report_type, filters, date_config, view_mode, view_options } = await req.json();
    
    // 【除錯日誌 1】: 印出從前端收到的完整 filters 物件
    console.log('generate-share-link: Received filters from frontend:', JSON.stringify(filters, null, 2));

    if (!date_config || !filters) {
        throw new Error("請求缺少必要的 'filters' 或 'date_config' 參數。");
    }

    // 3. 產生分享權杖
    const token = generateSecureToken();

    // 4. 存入資料庫
    // 注意：這裡我們需要使用 service_role key 來繞過 RLS，因為這是在伺服器端代表使用者寫入
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: insertError } = await supabaseAdmin
      .from('shared_reports')
      .insert({
        token: token,
        report_type: report_type,
        filters: filters,
        date_config: date_config,
        created_by: user.id,
        view_mode: view_mode, // 新增：儲存視圖模式 ('standard' 或 'heatmap')
        view_options: view_options // 新增：儲存視圖相關選項 (如 floorPremium)
      });

    if (insertError) {
      console.error('Database Insert Error:', insertError);
      throw new Error(`無法將分享紀錄存入資料庫: ${insertError.message}`);
    }

    // 5. 回傳指向前端報告檢視頁面的公開連結
    // 使用您在 GitHub Pages 上託管的 report-viewer.html 的網址
    const viewerBaseUrl = 'https://sqm7.github.io/kthd/report-viewer.html'; 
    const publicUrl = `${viewerBaseUrl}?token=${token}`; // 使用查詢參數 ?token= 傳遞權杖

    return new Response(JSON.stringify({ publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Function Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})