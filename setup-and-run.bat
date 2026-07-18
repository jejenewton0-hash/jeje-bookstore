@echo off
echo ============================================
echo  Rwanda Bookstore - Setup Script
echo ============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js is NOT installed.
    echo.
    echo Please download and install Node.js from:
    echo   https://nodejs.org/en/download
    echo.
    echo Choose the LTS version (Windows Installer .msi)
    echo After installing, re-run this script.
    echo.
    pause
    start https://nodejs.org/en/download
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

echo [*] Installing dependencies...
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed!
echo.
echo [*] Starting Rwanda Bookstore...
echo     Open your browser at: http://localhost:3000
echo     Press Ctrl+C to stop the server.
echo.
npm start
