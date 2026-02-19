@echo off
title PriceCalc Diagnostics

echo.
echo ==========================================
echo   PriceCalc - Diagnostics
echo ==========================================
echo.

echo --- CURRENT FOLDER ---
echo %CD%
echo.

echo --- NODE.JS ---
where node
if errorlevel 1 (
    echo NOT FOUND - Install from https://nodejs.org
) else (
    node --version
    echo OK
)
echo.

echo --- NPM ---
where npm
if errorlevel 1 (
    echo NOT FOUND
) else (
    npm --version
    echo OK
)
echo.

echo --- PROJECT FILES ---
if exist "package.json" (
    echo package.json        FOUND
) else (
    echo package.json        MISSING  ^<^<^< PROBLEM
)
if exist "vite.config.js" (
    echo vite.config.js      FOUND
) else (
    echo vite.config.js      MISSING  ^<^<^< PROBLEM
)
if exist "index.html" (
    echo index.html          FOUND
) else (
    echo index.html          MISSING  ^<^<^< PROBLEM
)
if exist "src\main\index.js" (
    echo src\main\index.js   FOUND
) else (
    echo src\main\index.js   MISSING  ^<^<^< PROBLEM
)
if exist "node_modules" (
    echo node_modules        FOUND - npm install already done
) else (
    echo node_modules        NOT YET - need to run npm install
)
echo.

echo --- INTERNET ---
ping -n 1 8.8.8.8 >nul 2>&1
if errorlevel 1 (
    echo Internet            NO CONNECTION
) else (
    echo Internet            OK
)
echo.

echo ==========================================
echo  If NODE.JS shows NOT FOUND:
echo  Go to https://nodejs.org, download LTS,
echo  install it, RESTART PC, then run again.
echo.
echo  If files show MISSING:
echo  You are running this from the wrong folder.
echo  Open the electron-pricer folder first,
echo  then double-click setup.bat from inside it.
echo ==========================================
echo.
pause
