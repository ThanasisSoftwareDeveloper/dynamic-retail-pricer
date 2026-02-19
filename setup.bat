@echo off
title PriceCalc Setup

echo.
echo =====================================================
echo   PriceCalc - Setup
echo =====================================================
echo.

echo Step 1: Checking folder...
if not exist "package.json" (
    echo ERROR: Run this from INSIDE the electron-pricer folder.
    pause
    exit /b 1
)
echo OK - package.json found.
echo.

echo Step 2: Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo OK.
echo.

echo Step 3: Removing old node_modules if exists...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q node_modules
    echo Done.
)
echo.

echo Step 4: Installing packages (2-5 minutes)...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Check internet connection.
    pause
    exit /b 1
)
echo npm install OK.
echo.

echo Step 5: Installing Playwright Chromium browser...
call npx playwright install chromium
if errorlevel 1 (
    echo WARNING: Playwright install failed.
    echo Try manually later: npx playwright install chromium
)
echo.

echo =====================================================
echo   SETUP COMPLETE
echo.
echo   To run:   npm run dev
echo   To build: npm run build:win
echo =====================================================
echo.
pause
