# Setup Guide - LTP Turf Owner App

## Prerequisites

1. **Install Node.js** (v16 or higher)
   - Download from: https://nodejs.org/

2. **Install Expo Go App on Android Phone**
   - Open Google Play Store
   - Search "Expo Go"
   - Install the app

## Steps to Run

### Step 1: Install Dependencies
```bash
cd ltp-turf-owner
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Connect Your Phone

**Option A: Scan QR Code (Recommended)**
1. Make sure your phone and computer are on the SAME WiFi network
2. Open Expo Go app on your phone
3. Tap "Scan QR code"
4. Scan the QR code shown in terminal/browser
5. App will load on your phone

**Option B: Manual Connection**
1. In terminal, press `s` to switch to Expo Go
2. Note the URL shown (like: exp://192.168.x.x:8081)
3. Open Expo Go app
4. Tap "Enter URL manually"
5. Type the URL and press "Connect"

## Troubleshooting

### Issue: Cannot connect to Metro bundler
**Solution**: Make sure phone and computer are on same WiFi network

### Issue: Network error
**Solution**: 
1. Stop the server (Ctrl+C)
2. Run: `npm start -- --tunnel`
3. This creates a tunnel connection (slower but works across networks)

### Issue: App crashes on startup
**Solution**:
1. Clear Expo Go cache: Settings > Clear cache in Expo Go app
2. Restart: `npm start -- --clear`

### Issue: White screen
**Solution**: Check terminal for errors, usually missing dependencies

## Alternative: Build APK

To create an installable APK:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

This will create an APK file you can download and install directly on your phone.

## Quick Commands

- `npm start` - Start development server
- `npm start -- --clear` - Start with cache cleared
- `npm start -- --tunnel` - Start with tunnel (for different networks)
- Press `a` in terminal - Open on Android emulator (if installed)
- Press `r` in terminal - Reload app
- Press `m` in terminal - Toggle menu

## Support

If still facing issues:
1. Check your firewall settings
2. Try using mobile hotspot from phone
3. Use tunnel mode: `npm start -- --tunnel`
