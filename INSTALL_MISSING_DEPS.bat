@echo off
echo ========================================
echo Installing Missing Dependencies
echo ========================================
echo.
echo Adding @react-native-community/datetimepicker
echo.
npm install @react-native-community/datetimepicker@8.2.0
echo.
echo Starting app...
npx expo start --clear
echo.
pause