@echo off
title GBPS Global Scanner
color 0A

echo.
echo ========================================
echo    GBPS Global Barcode Scanner
echo ========================================
echo.
echo 🌐 Global Scanner Mode
echo 📋 Scanner will detect barcodes from anywhere on the computer
echo 🎯 No need to focus any window - just scan barcodes
echo 🔊 Audio feedback enabled for successful/failed scans
echo.
echo Make sure your barcode scanner is connected!
echo.
echo Press Ctrl+C to stop the scanner
echo.

cd /d "%~dp0"

echo Starting global scanner software...
echo.

node scanner-software.js

pause
