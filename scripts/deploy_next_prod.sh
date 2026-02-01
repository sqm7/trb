#!/bin/bash

# Configuration
# Production Repository (kthd)
REMOTE_URL="https://github.com/sqm7/kthd.git"
APP_DIR="next-app"
BUILD_DIR="$APP_DIR/out"

# Set base path for production (Empty for Custom Domain)
export NEXT_PUBLIC_BASE_PATH=""

# Commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
# Use provided argument as commit message or default
if [ -z "$1" ]; then
  COMMIT_MSG="Deploy Next.js version to Production: $TIMESTAMP"
else
  COMMIT_MSG="$1"
fi

echo "========================================"
echo "🚀 Deploying Next.js App to Production (www.sqmtalk.com)"
echo "🕒 Time: $TIMESTAMP"
echo "🔗 Base Path: (Root)"
echo "========================================"

# 1. Build Next.js App
echo "Step 1: Building Next.js application..."
pushd "$APP_DIR" > /dev/null
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting."
    exit 1
fi
popd > /dev/null

# Create .nojekyll to bypass Jekyll processing (required for _next)
touch "$BUILD_DIR/.nojekyll"

# 2. Prepare Deployment Directory
echo "Step 2: Preparing deployment repository..."
TEMP_DEPLOY_DIR="temp_deploy_prod"
rm -rf "$TEMP_DEPLOY_DIR"

echo "Cloning target repository..."
git clone "$REMOTE_URL" "$TEMP_DEPLOY_DIR"

if [ ! -d "$TEMP_DEPLOY_DIR/.git" ]; then
    echo "❌ Clone failed! Aborting."
    exit 1
fi

# 3. Update Content
echo "Step 3: Updating repository content..."
pushd "$TEMP_DEPLOY_DIR" > /dev/null
# Clear existing files (except .git)
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Copy new build files
echo "Copying build files from ../$BUILD_DIR..."
cp -r "../$BUILD_DIR/" .

# Copy CNAME for Custom Domain (Assumes CNAME is in project root)
if [ -f "../CNAME" ]; then
    echo "Copying CNAME..."
    cp "../CNAME" .
else
    echo "⚠️ Warning: CNAME file not found in project root!"
fi

# 4. Commit and Push
echo "Step 4: Committing and Pushing..."
git add .
git commit -m "$COMMIT_MSG"
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
popd > /dev/null

# Cleanup
rm -rf "$TEMP_DEPLOY_DIR"
