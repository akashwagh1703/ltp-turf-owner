import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerPushToken() {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') {
      return null;
    }

    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData?.data;
    if (!token) {
      return null;
    }

    await api.post('/fcm/register-token', {
      token,
      device_type: Platform.OS,
    });

    return token;
  } catch (error) {
    console.warn('Push token register skipped:', error?.message || error);
    return null;
  }
}
