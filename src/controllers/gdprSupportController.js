const submitGDPRRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestType, message } = req.body;

        const validTypes = [
            "access",
            "rectification",
            "erasure",
            "portability",
            "restriction",
            "objection",
            "consent",
            "other"
        ];

        if (!validTypes.includes(requestType)) {
            return res.status(400).json({
                message: "Invalid request type",
                validTypes: validTypes
            });
        }

        const ticket = {
            ticketId: `GDPR-${Date.now()}`,
            userId: userId,
            requestType: requestType,
            message: message || "",
            status: "pending",
            createdAt: new Date(),
            responseDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        console.log("GDPR SUPPORT REQUEST:", JSON.stringify(ticket, null, 2));

        res.status(200).json({
            message: "Your GDPR request has been received",
            ticket: {
                id: ticket.ticketId,
                type: requestType,
                status: "pending",
                deadline: ticket.responseDeadline
            },
            expectedResponse: "Within 30 days (GDPR Article 12)",
            contact: "privacy@miniforum.se"
        });

    } catch (error) {
        console.error("GDPR support request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ÄNDRA NAMNET HÄR - från getGDPRRequests till getUserRequests
const getUserRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        res.status(200).json({
            message: "Your GDPR requests",
            tickets: [],
            note: "In production, this would show all your support tickets"
        });

    } catch (error) {
        console.error("Get GDPR requests error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ÄNDRA EXPORTEN HÄR
export { submitGDPRRequest, getUserRequests };