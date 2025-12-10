# Run on Android - Fixed Version

## What Changed
Updated to Expo SDK 49 for compatibility with current Expo Go app.

## Steps

### 1. Clean Install
```bash
cd ltp-turf-owner
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Open on Phone
- Install **Expo Go** from Play Store
- Make sure phone and PC are on **same WiFi**
- Open Expo Go app
- Tap "Scan QR code"
- Scan the QR code from terminal

### If Same WiFi Not Working
```bash
npm start -- --tunnel
```

This creates a tunnel connection that works across different networks.

## Verify Installation
After `npm install`, you should see:
- expo ~49.0.0
- react-native 0.72.6
- No compatibility errors

## Test the App
1. Login screen should appear
2. Enter phone number (10 digits)
3. Send OTP button should work
4. After OTP verification, dashboard should load

## Common Issues

### "Incompatible with Expo Go"
✅ Fixed - Now using SDK 49

### "Cannot connect"
- Use tunnel mode: `npm start -- --tunnel`
- Or use phone hotspot

### "White screen"
- Clear cache: `npm start -- --clear`
- Check terminal for errors

### "Module not found"
```bash
npm install
npm start -- --clear
```

## Alternative: Direct APK Install

If Expo Go still doesn't work, build APK:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Download and install the APK directly on your phone.
