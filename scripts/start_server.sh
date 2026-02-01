#!/bin/bash
# 啟動本地開發伺服器
# 這是為了繞過瀏覽器的 CORS 限制 (ES Modules 無法直接在 file:// 協議下運作)

PORT=8080

echo "🚀 正在啟動本地伺服器..."
echo "👉 請在瀏覽器開啟: http://localhost:$PORT"
echo "💡 按下 Ctrl+C 可停止伺服器"

# 檢查是否安裝 python3
if command -v python3 &>/dev/null; then
    python3 -m http.server $PORT
# 檢查是否安裝 python
elif command -v python &>/dev/null; then
    python -m http.server $PORT
else
    echo "❌ 錯誤: 未找到 Python。請安裝 Python 或使用其他靜態伺服器 (如 node http-server)。"
    exit 1
fi
