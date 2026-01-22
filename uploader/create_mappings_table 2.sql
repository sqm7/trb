-- 建案名稱對應表
-- 用於儲存批次修改時的 舊名稱 → 新名稱 對應
-- 未來上傳資料時會自動套用這些對應

CREATE TABLE IF NOT EXISTS project_name_mappings (
    id SERIAL PRIMARY KEY,
    old_name TEXT NOT NULL UNIQUE,
    new_name TEXT NOT NULL,
    county_code TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_project_name_mappings_old_name ON project_name_mappings(old_name);

-- 如果表格已存在，使用此指令新增 district 欄位
-- ALTER TABLE project_name_mappings ADD COLUMN IF NOT EXISTS district TEXT;

-- 啟用 RLS (如果需要的話)
-- ALTER TABLE project_name_mappings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE project_name_mappings IS '建案名稱自動替換對應表';
COMMENT ON COLUMN project_name_mappings.old_name IS '原始名稱（含亂碼或錯字）';
COMMENT ON COLUMN project_name_mappings.new_name IS '修正後的名稱';
COMMENT ON COLUMN project_name_mappings.county_code IS '縣市代碼';
COMMENT ON COLUMN project_name_mappings.district IS '行政區';
