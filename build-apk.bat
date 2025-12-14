@echo off
echo ========================================
echo LTP Turf Owner - APK Build Script
echo ========================================
echo.

echo Step 1: Installing EAS CLI...
call npm install -g eas-cli
if %errorlevel% neq 0 (
    echo ERROR: Failed to install EAS CLI
    pause
    exit /b 1
)
echo ✓ EAS CLI installed
echo.

echo Step 2: Logging in to Expo...
echo Please enter your Expo credentials when prompted.
echo If you don't have an account, create one at https://expo.dev
echo.
call eas login
if %errorlevel% neq 0 (
    echo ERROR: Login failed
    pause
    exit /b 1
)
echo ✓ Logged in successfully
echo.

echo Step 3: Starting APK build...
echo This will take 5-10 minutes. You'll get a download link when done.
echo.
call eas build -p android --profile preview
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Your APK will be available at the link shown above.
echo You can also check: https://expo.dev
echo.
pause
