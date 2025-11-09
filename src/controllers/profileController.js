import User from "../models/User.js";

const profileController = async (req, res) => {
    try {
        // req.user kommer från verifyToken middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: user.toPublicJSON() });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default profileController;
