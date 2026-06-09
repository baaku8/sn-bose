

import User from "./user.model.js";

// 1. UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        // req.user is populated by your protectRoute middleware
        const userId = req.user._id;

        // Fields we allow the user to update directly in this route
        const allowedUpdates = ['firstName','lastName' , 'bio', 'skills', 'interests', 'college', 'socialLinks', 'isAvailable', 'previousWorks'];
        
        const updates = {};
        // Only extract fields that are present in the request body and are allowed
        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Ensure they actually sent data to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        // Find the user and apply updates, returning the updated document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { returnDocument: 'after' , runValidators: true }
        ).select('-password'); // Never send the password back

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: err.message
        });
    }
};


export const getProfile = async (req, res) => {
    try {
        // Since protectRoute already fetched the user from the DB, we can just return it!
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error fetching profile",
            error: err.message
        });
    }
};

// 3. DELETE PROFILE
export const deleteProfile = async (req, res) => {
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

        res.status(200).json({
            success: true,
            message: "User account deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete account",
            error: err.message
        });
    }
};