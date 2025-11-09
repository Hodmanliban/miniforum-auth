const privacyPolicyTextController = (req, res) => {
    const policy = {
        lastUpdated: "2025-11-06",

        dataCollected: {
            personal: [
                "Email address",
                "Name",
                "Encrypted password (bcrypt, 12 rounds)"
            ],
            consent: [
                "Marketing consent (true/false)",
                "Analytics consent (true/false)"
            ],
            logs: [
                "Consent timestamp",
                "IP address",
                "User-Agent (browser information)"
            ]
        },

        purposes: {
            authentication: {
                data: "Email, password hash",
                purpose: "User authentication and session management",
                legalBasis: "Legitimate Interest (GDPR Article 6.1.f)"
            },
            marketing: {
                data: "Email, name, marketing consent",
                purpose: "Send personalized offers and newsletters",
                legalBasis: "Consent (GDPR Article 6.1.a)"
            },
            analytics: {
                data: "Usage statistics, analytics consent",
                purpose: "Improve website functionality",
                legalBasis: "Consent (GDPR Article 6.1.a)"
            }
        },

        userRights: {
            access: {
                description: "View all your personal data",
                endpoint: "GET /api/auth/profile",
                article: "GDPR Article 15"
            },
            portability: {
                description: "Export all your data in JSON format",
                endpoint: "GET /api/auth/export",
                article: "GDPR Article 20"
            },
            rectification: {
                description: "Update your consents",
                endpoint: "PUT /api/auth/consents",
                article: "GDPR Article 16"
            },
            erasure: {
                description: "Permanently delete your account",
                endpoint: "DELETE /api/auth/account",
                article: "GDPR Article 17"
            },
            withdrawConsent: {
                description: "Withdraw marketing or analytics consent",
                endpoint: "PUT /api/auth/consents",
                article: "GDPR Article 7.3"
            }
        },

        dataStorage: {
            provider: "MongoDB Atlas",
            region: "EU",
            encryption: {
                inTransit: "HTTPS/TLS",
                atRest: "AES-256 encryption"
            },
            backup: "Automated, encrypted backups",
            retention: "Until you delete your account"
        },

        cookies: {
            necessary: {
                name: "accessToken",
                purpose: "Authentication - keeps you logged in",
                duration: "1 hour",
                legalBasis: "Legitimate Interest (GDPR Article 6.1.f)",
                security: {
                    httpOnly: true,
                    secure: "true in production (HTTPS only)",
                    sameSite: "Strict in production (CSRF protection)"
                }
            },
            optional: {
                marketing: "Requires explicit consent",
                analytics: "Requires explicit consent"
            }
        },

        thirdParties: {
            mongoDBAtlas: {
                purpose: "Database hosting",
                region: "EU",
                dataProcessingAgreement: "Yes, GDPR-compliant with Standard Contractual Clauses",
                dataTransfer: "No data transfer outside EU (GDPR Article 46)"
            }
        },

        security: {
            measures: [
                "bcrypt password hashing (12 rounds)",
                "JWT token authentication",
                "httpOnly cookies (XSS protection)",
                "sameSite cookies (CSRF protection)",
                "HTTPS encryption in production",
                "MongoDB access controls",
                "Principle of least privilege"
            ],
            article: "GDPR Article 32"
        },

        dataRetention: {
            userData: "Until account deletion",
            consentLogs: "Permanently (GDPR accountability - Article 5.2)",
            cookies: "1 hour (automatic expiration)",
            inactiveAccounts: "Anonymized after 3 years of inactivity"
        },

        breachNotification: {
            authorities: "Within 72 hours to data protection authority (GDPR Article 33)",
            users: "Without undue delay if breach affects user rights (GDPR Article 34)",
            information: [
                "Nature of the breach",
                "Data affected",
                "Likely consequences",
                "Measures taken"
            ]
        },

        contact: {
            email: "privacy@miniforum.se",
            subject: "GDPR Request",
            responseTime: "Within 30 days (GDPR Article 12)",
            requestTypes: [
                "Data access request",
                "Data deletion request",
                "Data portability request",
                "Consent withdrawal",
                "Privacy questions"
            ]
        },

        updates: {
            notification: "Email notification if policy changes",
            commitment: "Regular compliance reviews and updates (GDPR Article 24)"
        }
    };

    res.status(200).json(policy);
};

export default privacyPolicyTextController;