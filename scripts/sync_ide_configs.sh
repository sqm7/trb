#!/bin/bash

# Multi-IDE Sync Script
# Source of Truth: .agent
# Targets: .claude, .cursor, .trae, .windsurf

PROJECT_ROOT="/Users/ktpro/Desktop/vibe01"
SOURCE="$PROJECT_ROOT/.agent"
TARGETS=(".claude" ".cursor" ".trae" ".windsurf")

echo "🔄 Starting Multi-IDE Sync Protocol..."

for TARGET in "${TARGETS[@]}"; do
    TARGET_PATH="$PROJECT_ROOT/$TARGET"
    
    # 確保目標目錄存在
    mkdir -p "$TARGET_PATH/skills"
    mkdir -p "$TARGET_PATH/workflows"
    mkdir -p "$TARGET_PATH/rules"

    echo "📦 Syncing to $TARGET..."
    
    # 同步 Skills
    if [ -d "$SOURCE/skills" ]; then
        cp -r "$SOURCE/skills/"* "$TARGET_PATH/skills/" 2>/dev/null
    fi

    # 同步 Workflows
    if [ -d "$SOURCE/workflows" ]; then
        cp -r "$SOURCE/workflows/"* "$TARGET_PATH/workflows/" 2>/dev/null
    fi

    # 同步 Rules
    if [ -d "$SOURCE/rules" ]; then
        cp -r "$SOURCE/rules/"* "$TARGET_PATH/rules/" 2>/dev/null
    fi
    
    # 特別處理 .cursorrules (如果有)
    if [ -f "$SOURCE/rules/vibe-coding-protocol.md" ]; then
        cp "$SOURCE/rules/vibe-coding-protocol.md" "$PROJECT_ROOT/.cursorrules" 2>/dev/null
    fi

    echo "✅ $TARGET synced."
done

echo "🎉 All AI IDE environments are now synchronized!"
