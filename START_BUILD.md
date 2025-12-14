# 🚀 Start APK Build - Step by Step

## ✅ You're Ready!

- ✅ EAS CLI installed (v16.28.0)
- ✅ Logged in as: **akashwagh**
- ✅ Project configured
- ✅ Build files ready

---

## 🎯 Build APK Now (3 Commands)

Open Command Prompt or PowerShell in the `ltp-turf-owner` folder and run:

### Step 1: Initialize Project
```bash
eas init
```
- Press **Y** when asked to create project
- This creates a unique project ID

### Step 2: Build APK
```bash
eas build -p android --profile preview
```
- Build starts on Expo servers
- Takes 5-10 minutes
- You'll get a download link

### Step 3: Download
- Click the download URL shown in terminal
- Or visit: https://expo.dev/accounts/akashwagh/projects/ltp-turf-owner/builds
- Download APK file

---

## 📋 Complete Commands

```bash
cd "d:\Akash Wagh\LTP-Code-git-clone\ltp-turf-owner"
eas init
eas build -p android --profile preview
```

---

## 📱 What You'll Get

### Build Output:
```
✔ Build finished
Download URL: https://expo.dev/artifacts/eas/xxxxx.apk
```

### APK Details:
- **Name**: ltp-turf-owner.apk
- **Size**: ~50-80 MB
- **Package**: com.ltp.turfowner
- **Version**: 1.0.0

---

## 🔄 Build Progress

### During Build:
```
⠋ Waiting for build to complete...
```

### Track Online:
https://expo.dev/accounts/akashwagh/projects

### Check Status:
```bash
eas build:list
```

---

## 📥 After Build

### 1. Download APK
Click the download link or get from Expo dashboard

### 2. Transfer to Phone
- USB cable
- Email
- Google Drive
- Direct download on phone

### 3. Install
- Enable "Install from Unknown Sources" in Settings
- Tap APK file
- Install

### 4. Test
- Open app
- Enter phone number (10 digits)
- Use OTP: **999999**
- Login successful!

---

## 🎨 Build Profiles

### Preview (APK for testing)
```bash
eas build -p android --profile preview
```
- Builds APK file
- For testing/distribution
- ~10 minutes

### Production (AAB for Play Store)
```bash
eas build -p android --profile production
```
- Builds App Bundle
- For Google Play Store
- ~15 minutes

---

## 🆘 If Build Fails

### Check Logs
```bash
eas build:list
eas build:view [build-id]
```

### Common Issues

**Issue**: "Project not found"
```bash
eas init
```

**Issue**: "Not logged in"
```bash
eas login
```

**Issue**: "Build failed"
- Check app.json syntax
- Check package.json dependencies
- View build logs online

---

## ⚡ Quick Reference

```bash
# Initialize project
eas init

# Build APK
eas build -p android --profile preview

# Check builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel build
eas build:cancel

# Check login
eas whoami
```

---

## 🎯 Ready to Build!

### Open Terminal Here:
1. Right-click in `ltp-turf-owner` folder
2. Select "Open in Terminal" or "Open PowerShell here"

### Run Commands:
```bash
eas init
eas build -p android --profile preview
```

### Wait 10 Minutes:
- Build happens on Expo servers
- You'll get download link
- APK ready to install!

---

## 📊 Your Build Info

- **Account**: akashwagh
- **Project**: ltp-turf-owner
- **Package**: com.ltp.turfowner
- **Version**: 1.0.0
- **Build Type**: APK (preview)

---

## 🎉 That's It!

Just run these 2 commands:
```bash
eas init
eas build -p android --profile preview
```

Your APK will be ready in ~10 minutes! 🚀
