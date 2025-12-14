@echo off
echo ========================================
echo MINIMAL TEST - Expo Default Setup
echo ========================================
echo.
echo Testing with absolute minimal configuration...
echo.
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.
npm install
echo.
npx expo start --clear
echo.
echo If this still shows blue screen:
echo 1. Try different phone/device
echo 2. Try expo start --web (browser)
echo 3. Check Expo Go app permissions
echo.
pause