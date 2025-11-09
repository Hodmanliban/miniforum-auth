import User from "../models/User.js";
import validator from "validator";

/**
 * Update user profile (name, bio, profilePicture)
 * PUT /api/auth/profile
 * Requires authentication
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, profilePicture } = req.body;

        // Validering
        const updates = {};

        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ message: "Name cannot be empty" });
            }
            if (name.length > 50) {
                return res.status(400).json({ message: "Name must be 50 characters or less" });
            }
            updates.name = validator.escape(name.trim());
        }

        if (bio !== undefined) {
            if (bio.length > 150) {
                return res.status(400).json({ message: "Bio must be 150 characters or less" });
            }
            updates.bio = validator.escape(bio.trim());
        }

        if (profilePicture !== undefined) {
            // Validera URL (optional)
            if (profilePicture && !validator.isURL(profilePicture)) {
                return res.status(400).json({ message: "Invalid profile picture URL" });
            }
            updates.profilePicture = profilePicture;
        }

        // Uppdatera user
        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default updateProfile;