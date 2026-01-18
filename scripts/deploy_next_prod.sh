#!/bin/bash

# Configuration
# This token has write access to your repo.
REMOTE_URL="https://sqmtalk7%40gmail.com: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@github.com/sqm7/kthd.git"
REPO_DIR="temp_deploy_prod"
BUILD_DIR="next-app/out"

# Set base path for production (Empty for Custom Domain)
export NEXT_PUBLIC_BASE_PATH=""

echo "========================================"
echo "🚀 Deploying Next.js App to Production (www.sqmtalk.com)"
echo "🕒 Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🔗 Base Path: (Root)"
echo "========================================"

# 1. Build Next.js App
echo "Step 1: Building Next.js application..."
cd next-app
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting."
    exit 1
fi
cd ..

# 2. Prepare Temp Directory
echo "Step 2: Preparing deployment repository..."
rm -rf $REPO_DIR
git clone $REMOTE_URL $REPO_DIR

# 3. Copy Build Artifacts
echo "Step 3: Copying build artifacts..."
# Remove everything in the repo first (replace old vanilla site)
# But keep .git
find $REPO_DIR -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy new files
cp -R $BUILD_DIR/* $REPO_DIR/
# Copy CNAME for Custom Domain
cp CNAME $REPO_DIR/
# Create .nojekyll to bypass Jekyll processing
touch $REPO_DIR/.nojekyll

# 4. Commit and Push
echo "Step 4: Committing and Pushing..."
cd $REPO_DIR
git add .
git commit -m "Deploy Next.js version to Production: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

if [ $? -eq 0 ]; then
    echo "========================================"
    echo "✅ Successfully deployed to Production!"
    echo "🔗 URL: https://sqm7.github.io/kthd"
    echo "========================================"
else
    echo "========================================"
    echo "❌ Deployment failed."
    echo "========================================"
    exit 1
fi

# Cleanup
cd ..
rm -rf $REPO_DIR
