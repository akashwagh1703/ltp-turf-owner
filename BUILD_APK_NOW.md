# 🚀 Build APK Now - Quick Start

## Option 1: Automated Build (Easiest)

### Just Double-Click:
```
build-apk.bat
```

This will:
1. ✅ Install EAS CLI
2. ✅ Login to Expo (you'll need to create free account)
3. ✅ Start APK build
4. ✅ Give you download link

---

## Option 2: Manual Commands

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
- If you don't have account: Sign up at https://expo.dev (FREE)
- Enter email and password

### Step 3: Build APK
```bash
eas build -p android --profile preview
```

### Step 4: Wait & Download
- Build takes 5-10 minutes
- You'll get a download link
- APK will be ~50-80 MB

---

## 📱 After Build Completes

### You'll See:
```
✔ Build finished
Download URL: https://expo.dev/artifacts/eas/[unique-id].apk
```

### Download & Install:
1. Click the download link
2. Transfer APK to Android phone
3. Enable "Install from Unknown Sources"
4. Tap APK to install
5. Open app and login!

---

## 🔐 Test Login

- Phone: Any 10-digit number
- OTP: **999999**

---

## ⚡ Quick Commands

```bash
# Check build status
eas build:list

# View build details
eas build:view [build-id]

# Cancel build
eas build:cancel
```

---

## 🆘 Troubleshooting

### "eas command not found"
```bash
npm install -g eas-cli
# Restart terminal
```

### "Not logged in"
```bash
eas login
```

### "Build failed"
Check logs:
```bash
eas build:list
eas build:view [build-id]
```

---

## ✅ What's Configured

- ✅ App name: "LTP Turf Owner"
- ✅ Package: com.ltp.turfowner
- ✅ Version: 1.0.0
- ✅ Build type: APK (preview)
- ✅ Permissions: Internet, Network State
- ✅ Icon & Splash: Configured

---

## 🎯 Ready to Build!

Just run:
```bash
build-apk.bat
```

Or manually:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

**Build time**: 5-10 minutes
**Result**: Downloadable APK file
**Cost**: FREE

---

## 📊 Build Progress

You can track your build at:
https://expo.dev/accounts/[your-username]/projects/ltp-turf-owner/builds

---

## 🎉 That's It!

Your APK will be ready in ~10 minutes. Download and install on any Android device!
