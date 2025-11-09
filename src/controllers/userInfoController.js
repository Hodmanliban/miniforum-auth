import User from "../models/User.js";

/**
 * Get public user info by userId
 * GET /api/auth/users/:userId
 */
const getUserInfo = async (req, res) => {
    try {
        const { userId } = req.params;

        // Hitta user (utan lösenord)
        const user = await User.findById(userId).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Om profilen är privat, returnera endast grundläggande info
        if (user.isPrivate) {
            return res.status(200).json({
                id: user._id,
                name: user.name,
                isPrivate: true,
                message: "This profile is private"
            });
        }

        // Returnera full public info
        res.status(200).json({
            id: user._id,
            email: user.email,
            name: user.name,
            bio: user.bio,
            profilePicture: user.profilePicture,
            isPrivate: user.isPrivate,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error("Get user info error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default getUserInfo;