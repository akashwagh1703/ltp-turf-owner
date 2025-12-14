@echo off
echo ========================================
echo Fixing Babel Preset Error
echo ========================================
echo.
echo Added missing babel-preset-expo dependency
echo.
echo Step 1: Clean install...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.
echo Step 2: Install with babel preset...
npm install
echo.
echo Step 3: Start app...
npx expo start --clear
echo.
echo Babel error should be fixed now!
echo.
pause