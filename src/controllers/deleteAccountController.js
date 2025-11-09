import User from "../models/User.js";

const deleteAccountController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Verifiera lösenord
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // NYTT: Radera all forum-data från domain backend
        const domainUrl = process.env.DOMAIN_BACKEND_URL || "http://localhost:4200";
        try {
            const response = await fetch(`${domainUrl}/api/gdpr/users/${userId}/data`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${req.cookies.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error("Failed to delete domain data:", await response.text());
                // Fortsätt ändå - auth data raderas
            }
        } catch (error) {
            console.error("Error calling domain backend:", error);
            // Fortsätt ändå - auth data raderas
        }

        // Radera användare från auth-databasen
        await User.findByIdAndDelete(userId);

        // Rensa cookie
        res.clearCookie("accessToken");

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default deleteAccountController;