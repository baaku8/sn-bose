import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import APIError from './api-error.js'; // FIXED: Now using same-folder relative import

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer to store the file in memory
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new APIError(400, 'Only image files are allowed!'), false);
    }
  }
});

// 3. Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "avatars") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    // Convert the buffer to a stream and pipe it to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};