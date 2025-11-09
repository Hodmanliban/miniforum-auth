import User from "../models/User.js";

const reportBreach = async (req, res) => {
    try {
        const {
            breachType,
            affectedUserIds,
            description,
            dataAffected,
            mitigationSteps
        } = req.body;

        if (!breachType || !affectedUserIds || !description) {
            return res.status(400).json({
                message: "Missing required fields: breachType, affectedUserIds, description"
            });
        }

        const breachLog = {
            type: breachType,
            timestamp: new Date(),
            affectedUsers: affectedUserIds.length,
            description: description,
            dataAffected: dataAffected || "Unknown",
            mitigationSteps: mitigationSteps || "Under investigation",
            reportedToAuthority: false,
            usersNotified: false
        };

        console.error("BREACH DETECTED:", JSON.stringify(breachLog, null, 2));

        const affectedUsers = await User.find({
            _id: { $in: affectedUserIds }
        }).select('email name');

        const notifications = affectedUsers.map(user => ({
            email: user.email,
            name: user.name,
            subject: "Important: Data Breach Notification",
            body: `
Dear ${user.name},

We are writing to inform you of a data security incident that may affect your personal information.

WHAT HAPPENED:
${description}

DATA AFFECTED:
${dataAffected || "We are still investigating which data was affected"}

WHAT WE ARE DOING:
${mitigationSteps || "We are investigating the incident and taking steps to secure your data"}

WHAT YOU SHOULD DO:
- Change your password immediately
- Monitor your account for suspicious activity
- Contact us if you notice anything unusual

We take your privacy seriously and apologize for this incident.

Contact us: privacy@miniforum.se

Sincerely,
Miniforum Team

This notification is required by GDPR Article 34.
      `
        }));

        console.log("USERS TO NOTIFY:", notifications.length);

        res.status(200).json({
            message: "Breach logged successfully",
            breach: {
                id: Date.now(),
                affectedUsers: affectedUsers.length,
                timestamp: breachLog.timestamp,
                notificationsSent: notifications.length
            },
            nextSteps: [
                "Report to data protection authority within 72 hours (GDPR Article 33)",
                "Notify affected users without undue delay (GDPR Article 34)",
                "Document breach in compliance records (GDPR Article 33.5)"
            ]
        });

    } catch (error) {
        console.error("Breach notification error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getBreachLogs = async (req, res) => {
    try {
        res.status(200).json({
            message: "Breach logs endpoint",
            note: "In production, this would return all breach logs for compliance documentation (GDPR Article 33.5)"
        });

    } catch (error) {
        console.error("Get breach logs error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { reportBreach, getBreachLogs };