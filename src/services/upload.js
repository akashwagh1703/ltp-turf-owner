import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

export async function postMultipart(path, formData) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/api/v1/owner${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || 'Upload failed' };
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.error?.message || 'Upload failed');
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
}
