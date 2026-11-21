/**
 * Rehablito Academy Mobile - ImageKit CDN Storage Service
 * Provides fast, high-performance direct CDN uploads for:
 * - Patient Doctor Parchi (Prescription photos)
 * - Clinical PDF reports & assessment documents
 * - Photos & child progress media
 */

const BACKEND_URL = 'https://rehablito-courses-production.up.railway.app';
const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_PUBLIC_KEY = 'public_5glnyqfxu...';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function getImageKitAuthParams() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/media/imagekit-auth`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ImageKit auth: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch ImageKit auth params:', err);
    return null;
  }
}

/**
 * Upload a base64 string or dataURL to ImageKit CDN securely
 * @param {string} fileTarget - Base64 or DataURL string
 * @param {string} fileName - Filename
 * @param {string} folder - Destination folder
 */
export const uploadToImageKit = async (
  fileTarget,
  fileName = 'attachment.jpg',
  folder = '/consultations'
) => {
  try {
    if (!fileTarget) {
      throw new Error('No file provided for upload');
    }

    const formData = new FormData();
    const timestamp = Date.now();
    let cleanName = (fileName || 'attachment').replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!cleanName.includes('.')) {
      cleanName = `${cleanName}_${timestamp}.jpg`;
    }

    formData.append('file', fileTarget);
    formData.append('fileName', cleanName);
    formData.append('folder', folder.startsWith('/') ? folder : `/${folder}`);
    formData.append('useUniqueFileName', 'true');

    const authParams = await getImageKitAuthParams();
    if (authParams && authParams.signature) {
      formData.append('publicKey', authParams.publicKey || IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', authParams.signature);
      formData.append('expire', String(authParams.expire));
      formData.append('token', authParams.token);
    }

    const response = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`ImageKit upload response: ${response.status}`, errorText);
      return {
        url: fileTarget.startsWith('data:') ? fileTarget : '',
        fileId: null,
      };
    }

    const data = await response.json();
    return {
      url: data.url,
      fileId: data.fileId || null,
    };
  } catch (err) {
    console.warn('ImageKit upload error fallback to dataUrl:', err);
    return {
      url: typeof fileTarget === 'string' && fileTarget.startsWith('data:') ? fileTarget : '',
      fileId: null,
    };
  }
};
