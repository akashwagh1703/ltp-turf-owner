@echo off
echo ========================================
echo LTP Turf Owner - Fixed Version
echo ========================================
echo.
echo Step 1: Cleaning previous installation...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.
echo Step 2: Installing compatible dependencies...
npm install --legacy-peer-deps
echo.
echo Step 3: Starting development server...
npx expo start --clear
echo.
echo Instructions:
echo 1. Install Expo Go app on your phone
echo 2. Scan QR code with Expo Go
echo 3. App should load with full navigation
echo.
echo Login: Any 10-digit phone + OTP: 999999
echo.
pause