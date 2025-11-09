const privacyPolicyController = (req, res) => {
    res.status(200).json({
        message: "Privacy Policy",
        fullPolicy: "/api/auth/privacy-policy-text",
        summary: {
            dataCollected: [
                "Email address",
                "Name",
                "Password (encrypted with bcrypt)",
                "Cookie consents (marketing, analytics)",
                "Consent logs (timestamp, IP, User-Agent)"
            ],
            yourRights: [
                "Right to access (Article 15)",
                "Right to erasure (Article 17)",
                "Right to data portability (Article 20)",
                "Right to withdraw consent (Article 7.3)"
            ],
            contact: "privacy@miniforum.se",
            lastUpdated: "2025-11-06"
        }
    });
};

export default privacyPolicyController;