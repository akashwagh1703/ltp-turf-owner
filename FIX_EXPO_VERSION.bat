@echo off
echo ========================================
echo Fixing Expo Version Compatibility
echo ========================================
echo.
echo Your Expo Go: v54
echo Required: Expo SDK 52 (compatible with Go 54)
echo.
echo Step 1: Clean install...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.
echo Step 2: Install Expo SDK 52...
npm install --legacy-peer-deps
echo.
echo Step 3: Test basic app...
npx expo start --clear
echo.
echo Should now work with Expo Go 54!
echo.
pause