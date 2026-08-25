import * as ImageManipulator from 'expo-image-manipulator';

export function isFormData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return true;
  }
  return typeof data.append === 'function';
}

export function stripFormDataContentType(headers) {
  if (!headers) {
    return;
  }
  if (typeof headers.delete === 'function') {
    headers.delete('Content-Type');
    headers.delete('content-type');
    return;
  }
  delete headers['Content-Type'];
  delete headers['content-type'];
}

export async function prepareJpeg(asset) {
  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
  );

  return {
    uri: result.uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  };
}

export const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ['images'],
  quality: 0.8,
  preferredAssetRepresentationMode: 'compatible',
};
