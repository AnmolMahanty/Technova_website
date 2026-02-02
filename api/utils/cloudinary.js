import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialize Cloudinary with environment variables
 */
export const initializeCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to file or base64 data
 * @param {string} folder - Cloudinary folder (e.g., 'technova/events')
 * @param {string} resourceType - 'image' | 'video' | 'raw' (for PDFs/PPTs)
 * @returns {Promise<object>} Upload result with secure_url
 */
export const uploadToCloudinary = async (filePath, folder, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' | 'video' | 'raw'
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

export default cloudinary;
