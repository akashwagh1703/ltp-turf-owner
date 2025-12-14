@echo off
echo ========================================
echo Fixing Dependencies and Building APK
echo ========================================
echo.

echo Step 1: Cleaning old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✓ Cleaned
echo.

echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 3: Building APK...
echo This will take 5-10 minutes
echo.
call eas build -p android --profile preview --clear-cache
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    echo.
    echo Checking build logs...
    call eas build:list
    pause
    exit /b 1
)
echo.

echo ========================================
echo Build Started Successfully!
echo ========================================
echo.
echo Check progress at:
echo https://expo.dev/accounts/akashwagh/projects/ltp-turf-owner/builds
echo.
echo You'll get a download link when done.
echo.
pause
