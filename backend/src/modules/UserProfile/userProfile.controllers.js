import User from "./user.models.js";
import APIError from "../../common/utils/api-error.js";
import APIResponse from "../../common/utils/api-response.js";
import { uploadToCloudinary } from '../../common/utils/upload.middleware.js';

// 1. UPDATE PROFILE
export const updateProfile = async (req, res, next) => {
    try {
        // req.user is populated by your protectRoute middleware
        const userId = req.user._id;

        // Fields we allow the user to update directly in this route
        const allowedUpdates = ['firstName','lastName' , 'bio', 'avatar','skills', 'interests', 'college', 'socialLinks', 'isAvailable', 'previousWorks'];
        
        const updates = {};
        // Only extract fields that are present in the request body and are allowed
        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Ensure they actually sent data to update
        if (Object.keys(updates).length === 0) {
            throw APIError.badRequest("No valid fields provided for update");
        }

        // Find the user and apply updates, returning the updated document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { returnDocument: 'after' , runValidators: true }
        ).select('-password'); // Never send the password back

        return APIResponse.ok(res, "Profile updated successfully", {
            user: updatedUser
        });

    } catch (err) {
        next(err);
    }
};


export const getProfile = async (req, res, next) => {
    try {
        // Since protectRoute already fetched the user from the DB, we can just return it!
        return APIResponse.ok(res, "Profile fetched successfully", {
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};

// 3. DELETE PROFILE
export const deleteProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        await User.findByIdAndDelete(userId);

        // Clear the token cookie so they are logged out upon deletion
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });

        return APIResponse.ok(res, "User account deleted successfully");
    } catch (err) {
        next(err);
    }
};

export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) throw APIError.badRequest("No image file provided");
        
        console.log("File received by multer:", req.file.originalname, "Size:", req.file.size); // Debug log 1
        
        const result = await uploadToCloudinary(req.file.buffer, "syncup_avatars");
        
        console.log("Cloudinary Success URL:", result.secure_url); // Debug log 2

        return APIResponse.ok(res, "Avatar uploaded successfully", {
            avatarUrl: result.secure_url
        });
    } catch (err) {
        console.error("Cloudinary Upload Error Details:", err);
        
        // TEMPORARY FIX: Send the actual error message to the frontend so you can see it!
        next(APIError.internalServiceError(`Cloudinary Error: ${err.message || "Unknown error"}`));
    }
};

export const getPublicProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userProfile = await User.findById(id).select('-password');
        
        if (!userProfile) {
            throw APIError.notFound("User not found");
        }

        return APIResponse.ok(res, "Public profile fetched successfully", {
            user: userProfile
        });
    } catch (err) {
        if (err.name === "CastError") {
            return next(APIError.badRequest("Invalid User ID format"));
        }
        next(err);
    }
};