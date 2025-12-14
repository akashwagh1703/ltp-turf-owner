@echo off
echo ========================================
echo Copied Working Config from Player App
echo ========================================
echo.
echo Exact same versions as working player app:
echo - Expo SDK 54 (matches your Expo Go 54)
echo - React Navigation 7
echo - All compatible dependencies
echo.
echo Step 1: Clean install...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.
echo Step 2: Install exact working versions...
npm install
echo.
echo Step 3: Start app...
npx expo start --clear
echo.
echo This should work now - same config as player app!
echo.
pause