/**
 * Rehablito Academy - ImageKit CDN Storage Service
 * Provides fast, high-performance direct CDN uploads for:
 * - Patient Doctor Parchi (Prescription photos)
 * - Clinical PDF reports & assessment documents
 * - Audio Voice Guidance & Voice Notes
 */

const IMAGEKIT_UPLOAD_ENDPOINT = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE_KEY =
  import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || "private_b+6zHi1L6gBxZXbQ9Scq+VTdPG0=";
const IMAGEKIT_PUBLIC_KEY =
  import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "public_WLfL24xlJbdNIpk+5F3PgakGSCM=";
const IMAGEKIT_URL_ENDPOINT =
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/5glnyqfxu";

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
