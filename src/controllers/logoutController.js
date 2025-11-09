const logoutController = (req, res) => {
    try {
        // Rensa cookie
        res.clearCookie("accessToken");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default logoutController;
