#!/bin/bash

# ========================================
# Supabase 資料庫結構備份腳本
# ========================================

# 設定
PROJECT_REF="zxbmbbfrzbtuueysicoc"
BACKUP_DIR="supabase_schema_sqm"
DATE=$(date '+%Y-%m-%d')
TIMESTAMP=$(date '+%Y-%m-%d_%H%M%S')
FILENAME="schema_${TIMESTAMP}.sql"

echo "========================================"
echo "🗄️  Supabase 資料庫結構備份"
echo "🕒 時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 確保備份目錄存在
mkdir -p "${BACKUP_DIR}/${DATE}"

# 確保已連結專案
echo "Step 1: 確認專案連結..."
if ! supabase link --project-ref "$PROJECT_REF" 2>/dev/null; then
    echo "⚠️  請先執行 supabase login 登入"
    exit 1
fi

# 導出 schema
echo "Step 2: 導出資料庫結構..."
OUTPUT_PATH="${BACKUP_DIR}/${DATE}/${FILENAME}"

if supabase db dump -f "$OUTPUT_PATH" --linked; then
    echo "========================================"
    echo "✅ 備份成功！"
    echo "📁 檔案: $OUTPUT_PATH"
    echo "📊 大小: $(du -h "$OUTPUT_PATH" | cut -f1)"
    echo "========================================"
    
    # 顯示今日備份數量
    COUNT=$(ls -1 "${BACKUP_DIR}/${DATE}/" 2>/dev/null | wc -l | tr -d ' ')
    echo "📅 今日備份數量: $COUNT"
else
    echo "========================================"
    echo "❌ 備份失敗，請檢查錯誤訊息。"
    echo "========================================"
    exit 1
fi
