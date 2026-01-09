import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

/**
 * 創建並返回一個配置好的 Supabase 客戶端實例
 * 
 * 【暫時修改】目前使用 Service Role Key 繞過認證，允許未登入使用者存取資料
 * 日後需要恢復認證時，請將 SUPABASE_SERVICE_ROLE_KEY 改回使用 req.headers.get('Authorization')
 * 
 * @param req 請求對象，用於獲取授權標頭（目前未使用）
 * @returns 配置好的 Supabase 客戶端實例
 */
export function createSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  // 【暫時修改】使用 Service Role Key 取代用戶 Token，繞過 RLS
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  // 創建並返回 Supabase 客戶端（使用 Service Role 權限）
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      global: {
        headers: {
          ...corsHeaders
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
