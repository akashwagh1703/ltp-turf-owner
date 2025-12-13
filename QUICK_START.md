# Quick Start - LTP Turf Owner App

## ✅ Pre-configured
- API URL: `http://35.222.74.225/api/v1/owner`
- Expo SDK: 54.0.0
- React Native: 0.81.5

## 🚀 Run the App (3 Steps)

### Step 1: Install Dependencies
```bash
cd ltp-turf-owner
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Step 3: Open on Your Phone

**Option A: QR Code (Easiest)**
1. Install **Expo Go** from Play Store (Android) or App Store (iOS)
2. Make sure phone and computer are on **SAME WiFi**
3. Open Expo Go app
4. Tap "Scan QR code"
5. Scan the QR code from terminal
6. App will load automatically

**Option B: Tunnel Mode (If different networks)**
```bash
npm start -- --tunnel
```
Then scan QR code (works across different networks, but slower)

## 📱 Test Login

### Default OTP: 999999

For development/testing, use the default OTP:

1. **Phone Number**: Enter any owner's 10-digit phone number
2. **Send OTP**: Click to send OTP
3. **Enter OTP**: Use **999999** (default OTP)
4. **Login**: Access dashboard

### Create Test Owner
If you need a test owner:
1. Go to admin panel: `http://35.222.74.225`
2. Login: admin@letsturf.com / admin123
3. Navigate to Owners → Add Owner
4. Create owner with phone number
5. Use that phone number in app with OTP: 999999

### API Endpoints Used
- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP and login
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /turfs` - Get owner's turfs
- `GET /bookings` - Get bookings
- `GET /payouts` - Get payout information

## 🎯 App Features

### 1. Dashboard
- Total bookings
- Revenue statistics
- Recent bookings
- Quick actions

### 2. Turfs Management
- View all turfs
- Turf details
- Request updates

### 3. Bookings
- View all bookings
- Create offline bookings
- Booking statistics

### 4. Payouts
- View payout history
- Payout details
- Payment status

### 5. Reviews
- View customer reviews
- Rating statistics

## 🔧 Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Start with tunnel (different networks)
npm start -- --tunnel

# Open on Android emulator (if installed)
npm run android

# Open on iOS simulator (Mac only)
npm run ios
```

## 📱 Keyboard Shortcuts (in Terminal)

- `a` - Open on Android emulator
- `i` - Open on iOS simulator
- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle menu
- `j` - Open debugger
- `c` - Clear cache

## 🐛 Troubleshooting

### Issue: "Cannot connect to Metro"
**Solution**: Ensure phone and PC are on same WiFi, or use tunnel mode

### Issue: "Network request failed"
**Solution**: 
1. Check API is running: `http://35.222.74.225/api/v1/owner`
2. Try tunnel mode: `npm start -- --tunnel`

### Issue: "Incompatible Expo Go version"
**Solution**: Update Expo Go app from Play Store/App Store

### Issue: White screen or crash
**Solution**:
```bash
npm start -- --clear
```

### Issue: Module not found
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📂 Project Structure

```
ltp-turf-owner/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── contexts/         # React contexts (Auth)
│   ├── constants/        # Theme, colors
│   └── utils/            # Helper functions
├── assets/               # Images, fonts
├── App.js               # Entry point
└── package.json         # Dependencies
```

## 🔐 Authentication Flow

1. User enters phone number
2. App sends OTP via API
3. User enters OTP
4. API verifies OTP and returns token
5. Token stored in AsyncStorage
6. Token sent with all API requests
7. On 401 error, user logged out

## 🌐 API Configuration

Located in `src/services/api.js`:
```javascript
baseURL: 'http://35.222.74.225/api/v1/owner'
```

All API calls automatically include:
- Authorization header with Bearer token
- Request/response logging
- Error handling
- Auto logout on 401

## 📊 Available Screens

✅ Login Screen
✅ Dashboard Screen
✅ Turfs Screen
✅ Bookings Screen
✅ Payouts Screen
✅ Reviews Screen
✅ Profile Screen
✅ Notifications Screen

## 🎨 UI Components

- Custom Button
- Custom Input
- Custom Card
- Loading indicators
- Error messages
- Success toasts

## 🔄 State Management

Using React Context API:
- **AuthContext**: User authentication state
- AsyncStorage for persistence

## 📝 Next Steps

1. Run the app: `npm start`
2. Test login with OTP
3. Explore dashboard
4. View turfs and bookings
5. Check payouts and reviews

## 💡 Tips

- Keep terminal open to see logs
- Use `console.log` for debugging
- Check network tab in React Native Debugger
- Use Expo Go's shake gesture to open dev menu
- Enable Fast Refresh for instant updates

## 🆘 Need Help?

1. Check terminal for error messages
2. Look at API logs in Laravel
3. Use React Native Debugger
4. Check Expo documentation: https://docs.expo.dev/

## ✨ Ready to Go!

Your app is configured and ready to run. Just execute:
```bash
npm start
```

And scan the QR code with Expo Go! 🎉
