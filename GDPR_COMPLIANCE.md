# GDPR Compliance Documentation

## Overview
This document details how Miniforum Auth Backend complies with GDPR regulations.

## Article 5 - Data Minimization
**Implementation:**
- Only collect necessary data: email, name, password hash, consents
- No excessive data collection
- No tracking without consent

**Data stored:**
```javascript
{
  email: String,
  name: String,
  passwordHash: String,
  consents: {
    marketing: Boolean,
    analytics: Boolean,
    required: Boolean
  },
  consentLogs: Array
}
```

## Article 6 & 7 - Consent Management
**Implementation:**
- Explicit consent for marketing and analytics
- Easy to give consent: `PUT /api/auth/consents`
- Easy to withdraw consent: `PUT /api/auth/consents`
- Consent logs with timestamp, IP, User-Agent

**Endpoints:**
- `GET /api/auth/consents`
- `PUT /api/auth/consents`

**Code:** `src/controllers/consentController.js`

## Article 12 - Transparent Information
**Implementation:**
- Privacy policy endpoint: `GET /api/auth/privacy-policy-text`
- GDPR support request: `POST /api/auth/gdpr-request`
- Response within 30 days
- Contact: privacy@miniforum.se

**Code:** `src/controllers/privacyPolicyTextController.js`, `src/controllers/gdprSupportController.js`

## Article 15 - Right to Access
**Implementation:**
- `GET /api/auth/profile` - View personal data
- `GET /api/auth/consents` - View consents and logs
- JSON format, structured data

**Code:** `src/controllers/profileController.js`

## Article 17 - Right to Erasure
**Implementation:**
- `DELETE /api/auth/account`
- Requires password confirmation
- Permanent deletion
- Clears cookies
- Irreversible

**Code:** `src/controllers/deleteAccountController.js`

## Article 20 - Right to Data Portability
**Implementation:**
- `GET /api/auth/export`
- JSON format (machine-readable)
- Includes all personal data
- Timestamp of export

**Code:** `src/controllers/exportController.js`

## Article 25 - Data Protection by Design
**Security measures:**
- bcrypt password hashing (12 rounds)
- httpOnly cookies (XSS protection)
- Secure cookies (HTTPS in production)
- sameSite: Strict (CSRF protection)
- JWT token authentication

**Code:** `src/middleware/verifyToken.js`, `src/middleware/csrfProtection.js`, `src/middleware/xssProtection.js`

## Article 30 - Record of Processing
**Consent logs:**
```javascript
{
  type: "marketing" | "analytics",
  action: "granted" | "withdrawn",
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

**Code:** `src/models/User.js` (consentLogs)

## Article 32 - Security Measures
**Encryption:**
- In transit: HTTPS/TLS
- At rest: MongoDB AES-256
- Passwords: bcrypt (12 rounds)

**Access controls:**
- JWT authentication
- verifyToken middleware
- Principle of least privilege

**Code:** `src/middleware/verifyToken.js`, `src/config/config.js`

## Article 33 & 34 - Breach Notification
**Implementation:**
- `POST /api/auth/breach/report` - Log breaches
- `GET /api/auth/breach/logs` - View logs
- Notify authorities within 72 hours
- Notify users without undue delay

**Code:** `src/controllers/breachNotificationController.js`

## Data Retention Policy
**User data:**
- Stored until account deletion
- Inactive users anonymized after 1095 days (3 years)

**Deleted users:**
- Permanently removed after 30 days

**Consents:**
- Stored until changed or account deletion
- Logs stored permanently (accountability - Article 5.2)

**Cookies:**
- accessToken: 1 hour expiration
- Deleted on logout

**Code:** `src/services/dataRetentionService.js`

## Third-Party Processors
**MongoDB Atlas:**
- Purpose: Database hosting
- Region: EU
- DPA: Yes, GDPR-compliant
- No data transfer outside EU (Article 44-50)

## Compliance Checklist
### Implemented ✅
- [x] Consent management (Article 7)
- [x] Data access (Article 15)
- [x] Data deletion (Article 17)
- [x] Data portability (Article 20)
- [x] Consent logs (Article 30)
- [x] Security measures (Article 32)
- [x] Privacy policy (Article 12)
- [x] GDPR support (Article 12)
- [x] Breach notification (Article 33, 34)
- [x] Data retention service (Article 5, 17)
- [x] CSRF protection
- [x] XSS protection
- [x] bcrypt password hashing (12 rounds)
- [x] httpOnly cookies
- [x] JWT authentication
- [x] Automated data cleanup
- [x] Consent audit trail

### Recommended Enhancements 📋
- [ ] Rate limiting (DDoS protection)
- [ ] Two-factor authentication
- [ ] Email notifications for consent changes
- [ ] Account activity logs
- [ ] Session management (multiple devices)

## Legal Basis for Processing
| Data | Purpose | Legal Basis | GDPR Article |
|------|---------|-------------|--------------|
| Email, Password | Authentication | Legitimate Interest | Article 6.1.f |
| Name | Personalization | Legitimate Interest | Article 6.1.f |
| Marketing Consent | Marketing emails | Consent | Article 6.1.a |
| Analytics Consent | Usage analytics | Consent | Article 6.1.a |
| Consent Logs | GDPR compliance | Legal Obligation | Article 6.1.c |

## Data Subject Rights Summary
| Right | GDPR Article | Endpoint | Method |
|-------|--------------|----------|--------|
| Access | Article 15 | `/api/auth/profile` | GET |
| Rectification | Article 16 | `/api/auth/consents` | PUT |
| Erasure | Article 17 | `/api/auth/account` | DELETE |
| Portability | Article 20 | `/api/auth/export` | GET |
| Object | Article 21 | `/api/auth/consents` | PUT |
| Restrict | Article 18 | `/api/auth/gdpr-request` | POST |

## Contact Information
**Data Protection Officer:**
- Email: privacy@miniforum.se
- Response time: Within 30 days (Article 12.3)

**Supervisory Authority:**
- Integritetsskyddsmyndigheten (IMY)
- Website: https://www.imy.se/

## Last Updated
November 6, 2025

## Review Schedule
- Quarterly: Technical compliance review
- Annually: Policy updates
- As needed: When GDPR regulations change