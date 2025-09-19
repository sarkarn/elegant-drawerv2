#!/bin/bash

# Quick deployment script for Railway
# Usage: ./deploy-railway.sh

set -e

echo "🚀 Railway Deployment Script for Elegant Drawer v2"
echo "================================================="

# Check if required files exist
check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ Error: $1 not found!"
        exit 1
    fi
    echo "✅ $1 found"
}

echo "📋 Checking required files..."
check_file "Dockerfile"
check_file "nginx.conf"
check_file "railway.toml"
check_file ".dockerignore"
check_file "package.json"

# Check if git repo is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    git commit -m "Add Railway deployment configuration - $(date)"
else
    echo "✅ Git repository is clean"
fi

# Test Docker build locally
echo "🐳 Testing Docker build locally..."
if docker build -t elegant-drawer-test . > /dev/null 2>&1; then
    echo "✅ Docker build successful"
    docker rmi elegant-drawer-test > /dev/null 2>&1
else
    echo "❌ Docker build failed. Please check Dockerfile"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Pre-deployment checks complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Create new project from GitHub repo"
echo "3. Configure custom domain: novatra-ai.com"
echo "4. Set up DNS records as described in RAILWAY_DEPLOYMENT.md"
echo ""
echo "📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md"
echo "🎉 Ready for Railway deployment!"