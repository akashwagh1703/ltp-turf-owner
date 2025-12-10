# LTP Turf Owner App

React Native mobile app for turf owners to manage their turfs, bookings, and payouts.

## Features

- **OTP Authentication** - Secure phone-based login
- **Dashboard** - Overview of turfs, bookings, revenue, and pending payouts
- **Turf Management** - View all turfs with status and details
- **Bookings** - View all bookings with filters, create offline bookings
- **Payouts** - Track earnings and payout history
- **Professional UI** - Clean, modern design with reusable components

## Tech Stack

- React Native (Expo)
- React Navigation
- Axios for API calls
- AsyncStorage for local data
- Context API for state management

## Setup

```bash
cd ltp-turf-owner
npm install
npm start
```

## API Integration

All APIs are integrated with backend at `http://115.124.98.61:8000/api/v1/owner`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens
├── navigation/     # Navigation setup
├── services/       # API services
├── contexts/       # React contexts
├── constants/      # Theme and constants
└── utils/          # Utility functions
```
