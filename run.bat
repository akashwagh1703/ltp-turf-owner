@echo off
echo ========================================
echo   LTP Turf Owner App - Starting...
echo ========================================
echo.
echo API URL: http://35.222.74.225/api/v1/owner
echo.
echo DEFAULT OTP: 999999
echo.
echo Instructions:
echo 1. Install Expo Go app on your phone
echo 2. Connect phone and PC to SAME WiFi
echo 3. Scan QR code with Expo Go app
echo 4. Login with any owner phone number
echo 5. Use OTP: 999999
echo.
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server...
echo.
call npm start

pause
