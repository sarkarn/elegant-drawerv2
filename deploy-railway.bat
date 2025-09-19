@echo off
REM Quick deployment script for Railway (Windows)
REM Usage: deploy-railway.bat

echo 🚀 Railway Deployment Script for Elegant Drawer v2
echo =================================================

REM Check if required files exist
if not exist "Dockerfile" (
    echo ❌ Error: Dockerfile not found!
    exit /b 1
)
echo ✅ Dockerfile found

if not exist "nginx.conf" (
    echo ❌ Error: nginx.conf not found!
    exit /b 1
)
echo ✅ nginx.conf found

if not exist "railway.toml" (
    echo ❌ Error: railway.toml not found!
    exit /b 1
)
echo ✅ railway.toml found

if not exist ".dockerignore" (
    echo ❌ Error: .dockerignore not found!
    exit /b 1
)
echo ✅ .dockerignore found

if not exist "package.json" (
    echo ❌ Error: package.json not found!
    exit /b 1
)
echo ✅ package.json found

echo 📋 All required files found!

REM Check git status and commit if needed
git status --porcelain > temp_git_status.txt
for /f %%i in ("temp_git_status.txt") do set size=%%~zi
del temp_git_status.txt

if %size% gtr 0 (
    echo 📝 Uncommitted changes found. Committing...
    git add .
    git commit -m "Add Railway deployment configuration - %date% %time%"
) else (
    echo ✅ Git repository is clean
)

REM Test Docker build locally (optional - requires Docker Desktop)
echo 🐳 Testing Docker availability...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is available
    echo 🔨 Testing build locally...
    docker build -t elegant-drawer-test . >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Docker build successful
        docker rmi elegant-drawer-test >nul 2>&1
    ) else (
        echo ❌ Docker build failed. Please check Dockerfile
        exit /b 1
    )
) else (
    echo ⚠️ Docker not available - skipping build test
)

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

echo ✅ Pre-deployment checks complete!
echo.
echo 🌐 Next steps:
echo 1. Go to https://railway.app
echo 2. Create new project from GitHub repo
echo 3. Configure custom domain: novatra-ai.com
echo 4. Set up DNS records as described in RAILWAY_DEPLOYMENT.md
echo.
echo 📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md
echo 🎉 Ready for Railway deployment!

pause