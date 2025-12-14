@echo off
echo ========================================
echo DEBUG TEST - Basic App Only
echo ========================================
echo.
echo Testing basic React Native functionality...
echo.
npx expo start --clear
echo.
echo If you see green screen with "Debug Mode - Basic App Working"
echo then React Native works and the issue is in navigation/dependencies
echo.
echo If you still get blue screen, the issue is with Expo setup
echo.
pause