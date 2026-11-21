/**
 * Rehablito Academy - ImageKit CDN Storage Service
 * Provides fast, high-performance direct CDN uploads for:
 * - Patient Doctor Parchi (Prescription photos)
 * - Clinical PDF reports & assessment documents
 * - Audio Voice Guidance & Voice Notes
 *
 * NOTE: Private keys are NEVER used in frontend code.
 * Uploads use backend-generated authentication signatures (token, expire, signature).
 * File deletions are routed through the secure backend server (/api/media/delete-imagekit).
 */

import { BACKEND_URL as RAZORPAY_BACKEND_URL } from "../utils/razorpay";

const BACKEND_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  RAZORPAY_BACKEND_URL ||
  "https://rehablito-courses-production.up.railway.app";

const IMAGEKIT_UPLOAD_ENDPOINT = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "";
const IMAGEKIT_URL_ENDPOINT =
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/5glnyqfxu";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // Max 5MB limit

/**
 * Fetch client upload authentication parameters from backend
 */
async function getImageKitAuthParams() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/media/imagekit-auth`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ImageKit auth: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Upload a File, Blob, or base64 string directly to ImageKit CDN securely
 * @param {File|Blob|string} fileTarget - The file, blob, or base64 string
 * @param {string} fileName - The desired or original filename
 * @param {string} folder - ImageKit folder destination (e.g., "/consultations")
 * @returns {Promise<{ success: boolean, url: string, fileId: string, name: string, size: number, fileType: string }>}
 */
export const uploadToImageKit = async (
  fileTarget,
  fileName = "attachment",
  folder = "/consultations"
) => {
  try {
    if (!fileTarget) {
      throw new Error("No file or blob provided for ImageKit upload");
    }

    // Strict 5MB limit check
    const targetSize = fileTarget.size || fileTarget.blob?.size || 0;
    if (targetSize > MAX_FILE_SIZE) {
      throw new Error(`File size (${(targetSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum 5MB limit.`);
    }

    const formData = new FormData();

    // Sanitize and ensure unique filename
    const timestamp = Date.now();
    let cleanName = (fileName || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!cleanName.includes(".")) {
      cleanName = `${cleanName}_${timestamp}`;
    } else {
      const parts = cleanName.split(".");
      const ext = parts.pop();
      cleanName = `${parts.join("_")}_${timestamp}.${ext}`;
    }

    // Determine payload format
    if (typeof fileTarget === "string" && fileTarget.startsWith("data:")) {
      formData.append("file", fileTarget);
    } else if (fileTarget instanceof File || fileTarget instanceof Blob) {
      formData.append("file", fileTarget, cleanName);
    } else if (fileTarget.blob) {
      formData.append("file", fileTarget.blob, cleanName);
    } else {
      formData.append("file", fileTarget);
    }

    formData.append("fileName", cleanName);
    formData.append("folder", folder.startsWith("/") ? folder : `/${folder}`);
    formData.append("useUniqueFileName", "true");

    // Secure ImageKit Client-Side Auth parameters from Backend
    const authParams = await getImageKitAuthParams();
    if (authParams && authParams.signature) {
      formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire);
      formData.append("token", authParams.token);
    }

    const response = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ImageKit upload failed with HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      fileId: data.fileId,
      name: data.name,
      size: data.size,
      fileType: data.fileType,
      thumbnailUrl: data.thumbnailUrl || data.url,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Permanently delete a single file from ImageKit via secure backend proxy
 * @param {string} fileId - The ImageKit file ID
 * @returns {Promise<boolean>}
 */
export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return false;
  try {
    const response = await fetch(`${BACKEND_URL}/api/media/delete-imagekit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });
    return response.ok;
  } catch (err) {
    return false;
  }
};

/**
 * Permanently delete multiple files from ImageKit via secure backend proxy
 * @param {string[]} fileIds - Array of ImageKit file IDs
 * @returns {Promise<{ deleted: number, total: number }>}
 */
export const deleteMultipleFromImageKit = async (fileIds = []) => {
  const validIds = fileIds.filter(Boolean);
  if (!validIds.length) return { deleted: 0, total: 0 };

  try {
    const response = await fetch(`${BACKEND_URL}/api/media/delete-imagekit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileIds: validIds }),
    });

    if (response.ok) {
      const result = await response.json();
      return { deleted: result.deletedCount || validIds.length, total: validIds.length };
    }
    return { deleted: 0, total: validIds.length };
  } catch (err) {
    return { deleted: 0, total: validIds.length };
  }
};


