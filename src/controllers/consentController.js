import User from "../models/User.js";

const updateConsent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { marketing, analytics } = req.body;

        if (typeof marketing !== 'boolean' && typeof analytics !== 'boolean') {
            return res.status(400).json({
                message: "At least one consent (marketing or analytics) must be provided"
            });
        }

        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (typeof marketing === 'boolean') {
            const action = marketing ? 'granted' : 'withdrawn';
            user.consents.marketing = marketing;
            user.consentLogs.push({
                type: 'marketing',
                action: action,
                timestamp: new Date(),
                ipAddress: ipAddress,
                userAgent: userAgent
            });
        }

        if (typeof analytics === 'boolean') {
            const action = analytics ? 'granted' : 'withdrawn';
            user.consents.analytics = analytics;
            user.consentLogs.push({
                type: 'analytics',
                action: action,
                timestamp: new Date(),
                ipAddress: ipAddress,
                userAgent: userAgent
            });
        }

        await user.save();

        res.status(200).json({
            message: "Consents updated successfully",
            consents: user.consents,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Update consent error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getConsents = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            consents: user.consents,
            consentLogs: user.consentLogs.sort((a, b) => b.timestamp - a.timestamp)
        });
    } catch (error) {
        console.error("Get consents error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { updateConsent, getConsents };