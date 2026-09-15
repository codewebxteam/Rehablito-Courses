/**
 * Rehablito Academy - ImageKit CDN Storage Service
 * Provides fast, high-performance direct CDN uploads for:
 * - Patient Doctor Parchi (Prescription photos)
 * - Clinical PDF reports & assessment documents
 * - Audio Voice Guidance & Voice Notes
 */

const IMAGEKIT_UPLOAD_ENDPOINT = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE_KEY = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || "";
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "";
const IMAGEKIT_URL_ENDPOINT =
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/5glnyqfxu";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // Max 5MB limit

/**
 * Upload a File, Blob, or base64 string directly to ImageKit CDN
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
      // Base64 dataUrl string
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

    // Standard ImageKit Basic Auth header using Private Key
    const authHeader = "Basic " + btoa(`${IMAGEKIT_PRIVATE_KEY}:`);

    const response = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
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
    console.error("ImageKit upload exception:", error);
    throw error;
  }
};

/**
 * Permanently delete a single file from ImageKit by fileId
 * @param {string} fileId - The ImageKit file ID
 * @returns {Promise<boolean>}
 */
export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return false;
  try {
    const authHeader = "Basic " + btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });
    if (!response.ok && response.status !== 404) {
      console.warn(`ImageKit delete failed for file ${fileId}: HTTP ${response.status}`);
      return false;
    }
    console.log(`Successfully deleted file from ImageKit: ${fileId}`);
    return true;
  } catch (err) {
    console.error(`Exception deleting file from ImageKit (${fileId}):`, err);
    return false;
  }
};

/**
 * Permanently delete multiple files from ImageKit by their fileIds
 * @param {string[]} fileIds - Array of ImageKit file IDs
 * @returns {Promise<{ deleted: number, total: number }>}
 */
export const deleteMultipleFromImageKit = async (fileIds = []) => {
  const validIds = fileIds.filter(Boolean);
  if (!validIds.length) return { deleted: 0, total: 0 };

  try {
    // ImageKit Bulk Delete API: POST /v1/files/batch/deleteByFileIds
    const authHeader = "Basic " + btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
    const response = await fetch("https://api.imagekit.io/v1/files/batch/deleteByFileIds", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileIds: validIds }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`ImageKit bulk delete success:`, result);
      return { deleted: (result.successfullyDeletedFileIds || []).length, total: validIds.length };
    }

    // Fallback: Delete individually if bulk endpoint fails
    let deletedCount = 0;
    await Promise.all(
      validIds.map(async (id) => {
        const ok = await deleteFromImageKit(id);
        if (ok) deletedCount++;
      })
    );
    return { deleted: deletedCount, total: validIds.length };
  } catch (err) {
    console.error("ImageKit batch delete error, falling back to individual deletion:", err);
    let deletedCount = 0;
    await Promise.all(
      validIds.map(async (id) => {
        const ok = await deleteFromImageKit(id);
        if (ok) deletedCount++;
      })
    );
    return { deleted: deletedCount, total: validIds.length };
  }
};

