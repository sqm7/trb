#!/bin/bash

# Configuration
# Test Repository (trb)
REMOTE_URL="https://sqmtalk7%40gmail.com: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@github.com/sqm7/trb.git"
APP_DIR="next-app"
BUILD_DIR="$APP_DIR/out"

# Commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="Next.js Deploy: $TIMESTAMP"

echo "========================================"
echo "🚀 Deploying Next.js App to Test Repo (trb)"
echo "🕒 Time: $TIMESTAMP"
echo "========================================"

# 1. Build Next.js App
echo "Step 1: Building Next.js application..."
pushd "$APP_DIR" > /dev/null
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi
popd > /dev/null

# Create .nojekyll to allow _next directory on GitHub Pages
touch "$BUILD_DIR/.nojekyll"

# 2. Prepare Deployment Directory
echo "Step 2: Preparing deployment artifacts..."
# We need to deploy the CONTENTS of the 'out' directory to the root of the repo
# To do this cleanly, we can clone the repo to a temp dir, clear it, copy build files, and push.

TEMP_DEPLOY_DIR="temp_deploy_trb"
rm -rf "$TEMP_DEPLOY_DIR"

echo "Cloning target repository..."
git clone "$REMOTE_URL" "$TEMP_DEPLOY_DIR"

# 3. Update Content
echo "Step 3: Updating repository content..."
# Clear existing files in repo (except .git)
cd "$TEMP_DEPLOY_DIR" || exit
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Copy new build files
echo "Copying build files from ../$BUILD_DIR..."
cp -r "../$BUILD_DIR/" .

# 4. Commit and Push
echo "Step 4: Committing and Pushing..."
git add .
git commit -m "$COMMIT_MSG"
git push origin main

if [ $? -eq 0 ]; then
    echo "========================================"
    echo "✅ Successfully deployed to Test Version!"
    echo "🔗 URL: https://sqm7.github.io/trb"
    echo "========================================"
else
    echo "========================================"
    echo "❌ Deployment failed."
    echo "========================================"
fi
