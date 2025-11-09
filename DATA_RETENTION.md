# Data Retention Policy

## Purpose
Defines how long we retain user data in compliance with GDPR Article 5 (data minimization) and Article 17 (right to erasure).

## User Account Data

### Active Accounts
**Retention:** Indefinite (until user deletes account)
**Deletion Method:** User-initiated via `DELETE /api/auth/account`
**Requires:** Password confirmation

### Data Stored
- Email address
- Name
- Password hash (bcrypt, 12 rounds)
- Consent preferences
- Consent logs
- Account creation date
- Last login date

## Consent Data

### Current Consents
**Retention:** Until user changes or deletes account
**Update:** `PUT /api/auth/consents`
**Types:** Marketing, Analytics

### Consent Logs
**Retention:** Permanent (GDPR accountability requirement - Article 5.2)
**Purpose:** Prove consent was given/withdrawn
**Deletion:** Only when account is permanently deleted
**Legal Basis:** GDPR Article 6.1.c (Legal obligation)

**Log Contents:**
```javascript
{
  type: "marketing" | "analytics",
  action: "granted" | "withdrawn",
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

## Authentication Cookies

### accessToken Cookie
**Retention:** 1 hour (automatic expiration)
**Storage:** httpOnly, secure (production), sameSite: Strict
**Deletion Triggers:**
- Automatic expiration after 1 hour
- User logout (`POST /api/auth/logout`)
- Account deletion
- Browser closure (session cookie)

## Inactive Accounts

### Current Policy
**No automatic deletion** - Users must explicitly delete accounts

### Automated Cleanup (Implemented)
**Service:** Data Retention Service (runs daily at 2:00 AM)

**Inactive User Definition:**
- No login for 1095 days (3 years)
- Account not marked as deleted

**Action Taken:**
- User data anonymized:
  ```javascript
  {
    email: "anonymized_[userId]@deleted.local",
    name: "Anonymized User",
    passwordHash: "ANONYMIZED",
    deleted: true,
    deletedAt: Date
  }
  ```
- Consent logs preserved (GDPR accountability)

**Configuration:**
```env
RETENTION_INACTIVE_USERS_DAYS=1095
```

### Deleted Accounts
**Grace Period:** 30 days
- Account marked as `deleted: true`
- Data still in database
- Cannot login

**Permanent Deletion:** After 30 days
- All user data removed from database
- Irreversible
- Consent logs deleted

**Configuration:**
```env
RETENTION_DELETED_USERS_DAYS=30
```

## Backup Data

### MongoDB Atlas Backups
**Provider:** MongoDB Atlas
**Retention:** 7 days (automated)
**Encryption:** AES-256
**Deletion:** Automatic expiration
**Region:** EU (no cross-border transfer)

## Data Minimization Principles

### What We Collect
- Email (authentication)
- Name (personalization)
- Password hash (security)
- Consents (GDPR compliance)
- Consent logs (accountability)
- Last login (retention policy)

### What We DON'T Collect
- Location data
- Device fingerprints (except User-Agent)
- Browsing history
- Third-party data
- Payment information
- IP addresses (except in consent logs)
- Session history

## Retention Periods Summary

| Data Type | Retention Period | Legal Basis | GDPR Article |
|-----------|------------------|-------------|--------------|
| Active user data | Until deletion | Legitimate interest | Article 6.1.f |
| Inactive users | 1095 days then anonymize | Data minimization | Article 5.1.c |
| Deleted accounts | 30 days then permanent deletion | Right to erasure | Article 17 |
| Consent logs | Until account deletion | Legal obligation | Article 6.1.c |
| Cookies | 1 hour | Legitimate interest | Article 6.1.f |
| Backups | 7 days (automatic) | Security | Article 32 |

## Technical Implementation

### Automated Service
**File:** `src/services/dataRetentionService.js`
**Schedule:** Daily at 2:00 AM (cron job)
**Actions:**
1. Find inactive users (no login > 1095 days)
2. Anonymize inactive users
3. Find deleted users (deleted > 30 days ago)
4. Permanently delete old deleted users
5. Log all actions for audit trail

### Manual Triggers
**Endpoints:**
- `GET /api/auth/admin/retention/status` - View current status
- `POST /api/auth/admin/retention/cleanup` - Manual cleanup
- `GET /api/auth/admin/retention/report` - Detailed report
- `GET /api/auth/admin/retention/logs` - Audit logs

### Configuration
**Environment Variables (.env):**
```env
RETENTION_INACTIVE_USERS_DAYS=1095
RETENTION_DELETED_USERS_DAYS=30
RETENTION_CONSENT_DAYS=2555
RETENTION_SECURITY_DAYS=1095
```

## Audit Trail

### Service Logs
**Stored:** In-memory (last 1000 entries)
**Contents:**
- Cleanup timestamp
- Users anonymized count
- Users permanently deleted count
- Errors encountered

**Access:** `GET /api/auth/admin/retention/logs`

## Review Schedule

### Regular Reviews
- **Quarterly:** Technical compliance review
- **Annually:** Policy updates and legal review
- **Ad-hoc:** When GDPR regulations change

### Next Review
Scheduled: February 2026

## User Rights

### Request Data Deletion
**Method:** `DELETE /api/auth/account`
**Timeline:**
- Immediate: Account marked as deleted
- 30 days: Permanent deletion
- Cannot be reversed after 30 days

### Request Data Export
**Method:** `GET /api/auth/export`
**Format:** JSON (machine-readable)
**Contents:** All personal data including consent logs

## Contact

### Data Retention Questions
**Email:** privacy@miniforum.se
**Response Time:** Within 30 days (GDPR Article 12)
**Subject:** "Data Retention Request"

## Compliance

This policy ensures compliance with:
- GDPR Article 5.1.e (Storage limitation)
- GDPR Article 17 (Right to erasure)
- GDPR Article 25 (Data protection by design)
- GDPR Article 30 (Records of processing activities)

## Last Updated
November 6, 2025

## Version
1.0.0