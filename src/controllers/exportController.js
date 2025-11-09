import User from "../models/User.js";

// Exportera all användardata (GDPR Article 20)
const exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Använd toPublicJSON för att exportera data (utan passwordHash)
        const userData = user.toPublicJSON();

        res.status(200).json({
            message: "User data export",
            data: userData,
            exportedAt: new Date()
        });
    } catch (error) {
        console.error("Export data error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default exportUserData;