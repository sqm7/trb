#!/bin/bash

# Configuration
# 使用您的 Personal Access Token 進行驗證
# 注意：此 Token 具有您儲存庫的寫入權限，請勿隨意分享此腳本檔給他人
REMOTE_URL="https://github.com/sqm7/trb.git"

# Default commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG=${1:-"Update: $TIMESTAMP"}

echo "========================================"
echo "🚀 開始執行自動部署到 GitHub"
echo "🕒 時間: $TIMESTAMP"
echo "📝 訊息: $COMMIT_MSG"
echo "========================================"

# Add changes
echo "Step 1: 加入檔案 (git add)"
git add .

# Commit
echo "Step 2: 提交變更 (git commit)"
git commit -m "$COMMIT_MSG"

# Push
echo "Step 3: 推送至遠端 (git push)"
git push "$REMOTE_URL" main

if [ $? -eq 0 ]; then
    echo "========================================"
    echo "✅ 部署成功！"
    echo "========================================"
else
    echo "========================================"
    echo "❌ 部署失敗，請檢查網路或錯誤訊息。"
    echo "========================================"
fi
