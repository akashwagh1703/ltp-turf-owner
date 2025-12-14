@echo off
echo ========================================
echo Building LTP Turf Owner APK
echo ========================================
echo.
echo Logged in as: akashwagh
echo.
echo Step 1: Initializing project...
echo Press Y when prompted
echo.
call eas init
echo.
echo Step 2: Building APK...
echo This will take 5-10 minutes
echo.
call eas build -p android --profile preview
echo.
echo ========================================
echo Build Started!
echo ========================================
echo.
echo Check progress at:
echo https://expo.dev/accounts/akashwagh/projects
echo.
echo You'll get a download link when done.
echo.
pause
