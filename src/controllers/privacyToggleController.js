import User from "../models/User.js";

/**
 * Toggle profile privacy
 * PUT /api/auth/profile/privacy
 * Requires authentication
 */
const updatePrivacy = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isPrivate } = req.body;

        // Validera input
        if (typeof isPrivate !== 'boolean') {
            return res.status(400).json({
                message: "isPrivate must be a boolean (true or false)"
            });
        }

        // Uppdatera user
        const user = await User.findByIdAndUpdate(
            userId,
            { isPrivate },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Privacy settings updated successfully",
            isPrivate: user.isPrivate,
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error("Update privacy error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default updatePrivacy;