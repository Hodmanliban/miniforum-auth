# Security Documentation

## Overview
Security measures implemented in compliance with GDPR Article 32 (Security of processing).

## Encryption

### In Transit (HTTPS/TLS)
**Production:**
- All API requests over HTTPS
- TLS 1.2 or higher
- Certificate validation required

**Development:**
- HTTP allowed for localhost
- HTTPS recommended for testing

**Implementation:**
```javascript
// src/config/config.js
export const SECURE = process.env.NODE_ENV === "production";
```

### At Rest
**Database Encryption:**
- Provider: MongoDB Atlas
- Algorithm: AES-256
- Key Management: MongoDB managed keys
- Region: EU (no cross-border transfer)

**Password Storage:**
- Algorithm: bcrypt
- Salt rounds: 12
- Never stored in plain text
- Never logged or exposed

**Implementation:**
```javascript
// src/models/User.js
userSchema.methods.setPassword = async function(password) {
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
};
```

## Authentication

### JWT Tokens
**Configuration:**
- Algorithm: HS256
- Expiration: 1 hour
- Storage: httpOnly cookie
- Signed with: ACCESS_TOKEN_SECRET (min 32 chars)

**Token Payload:**
```javascript
{
  id: userId,
  iat: issuedAt,
  exp: expiresAt
}
```

**Verification:**
```javascript
// src/middleware/verifyToken.js
jwt.verify(token, ACCESS_TOKEN_SECRET)
```

### Password Security
**Requirements:**
- Minimum length: Enforced by frontend
- bcrypt hashing: 12 rounds
- No password rules in backend (user freedom)

**Validation:**
```javascript
// src/controllers/loginController.js
const isValidPassword = await user.validatePassword(password);
```

**Never Logged:**
- Passwords
- Password hashes
- JWT tokens
- Any sensitive data

## Cookie Security

### Configuration
**Production:**
```javascript
{
  httpOnly: true,    // Prevents XSS access
  secure: true,      // HTTPS only
  sameSite: "Strict", // CSRF protection
  maxAge: 3600000    // 1 hour
}
```

**Development:**
```javascript
{
  httpOnly: true,
  secure: false,     // Allow HTTP for localhost
  sameSite: "Lax",   // Less strict for testing
  maxAge: 3600000
}
```

**Implementation:**
```javascript
// src/config/config.js
export const COOKIE_OPTIONS = {
    httpOnly: HTTP_ONLY,
    secure: SECURE,
    sameSite: SAME_SITE,
    maxAge: 3600000
};
```

### Cookie Attributes Explained

**httpOnly:**
- JavaScript cannot access cookie
- Prevents XSS attacks from stealing tokens
- Cookie only sent in HTTP requests

**secure:**
- Cookie only sent over HTTPS
- Prevents man-in-the-middle attacks
- Disabled in development for localhost testing

**sameSite:**
- Strict: Cookie not sent on cross-site requests
- Prevents CSRF attacks
- Lax in development for easier testing

## Access Control

### Authentication Middleware
**File:** `src/middleware/verifyToken.js`

**Process:**
1. Extract token from cookie
2. Verify JWT signature
3. Check expiration
4. Attach user ID to request
5. Allow access to protected routes

**Usage:**
```javascript
// Protected route
router.get("/profile", verifyToken, profileController);
```

### Authorization Principles
- Users access only own data
- No user ID in URL (use JWT)
- All user data queries filtered by `req.user.id`

**Example:**
```javascript
// src/controllers/profileController.js
const user = await User.findById(req.user.id);
```

### Database Access
- Mongoose ODM (prevents SQL injection)
- Parameterized queries
- No raw query strings
- Minimal permissions on MongoDB user

## CSRF Protection

### Implementation
**File:** `src/middleware/csrfProtection.js`

**How it works:**
1. User requests CSRF token: `GET /api/auth/csrf-token`
2. Backend generates unique token per user
3. Token stored in Map (in-memory)
4. Frontend includes token in requests: `X-CSRF-Token` header
5. Backend verifies token matches stored value

**Protected Methods:**
- POST
- PUT
- DELETE

**Exempt Methods:**
- GET
- HEAD
- OPTIONS

**Usage:**
```javascript
// src/routes/auth.routes.js
router.put("/consents", verifyToken, verifyCSRFToken, updateConsent);
```

**Token Generation:**
```javascript
const token = crypto.randomBytes(32).toString('hex');
```

## XSS Protection

### Implementation
**File:** `src/middleware/xssProtection.js`

**Process:**
1. Sanitize all user input
2. Applied to: body, query, params
3. Library: validator.escape()
4. Converts: `<` to `&lt;`, `>` to `&gt;`, etc.

**Example:**
```javascript
// Input: <script>alert('xss')</script>
// Output: &lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;
```

**Middleware Chain:**
```javascript
// src/server.js
app.use(xssProtection);
app.use("/api/auth", authRoutes);
```

### Additional XSS Protection
- httpOnly cookies (no JS access)
- Content-Security-Policy headers
- X-XSS-Protection header
- No `dangerouslySetInnerHTML` in frontend

## Security Headers

### Helmet.js
**Implementation:**
```javascript
// src/server.js
app.use(helmet());
```

**Headers Added:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)

### CORS Configuration
**Allowed Origin:** CLIENT_URL only
**Credentials:** true (allows cookies)

```javascript
// src/server.js
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));
```

## Database Security

### MongoDB Atlas
**Access Control:**
- IP whitelist (specific IPs only)
- Database user authentication
- Role-based access control (RBAC)
- TLS/SSL encryption

**Network Security:**
- VPC peering (if needed)
- Private endpoints
- Firewall rules

### Query Security
**Mongoose Protection:**
- Prevents NoSQL injection
- Schema validation
- Type casting
- Query parameterization

**Example (Safe):**
```javascript
// Mongoose automatically escapes
const user = await User.findById(userId);
const user = await User.findOne({ email: userEmail });
```

**Example (Unsafe - NOT used):**
```javascript
// NEVER DO THIS
const user = await User.findOne(eval(userInput));
```

## Logging & Monitoring

### What We Log
- Authentication attempts (success/fail)
- Consent changes
- Account deletions
- Data exports
- GDPR support requests
- Breach notifications
- Server errors

### What We DON'T Log
- Passwords
- Password hashes
- JWT tokens
- Full user data
- Sensitive personal information

### Log Storage
- Console output (development)
- Log files (production - recommended)
- Retention: 1095 days (configurable)

**Example:**
```javascript
console.error("Login failed for:", email);
// NOT: console.log("Password:", password)
```

## Vulnerability Management

### Dependency Scanning
**Regular Checks:**
```bash
npm audit
npm audit fix
npm audit fix --force
```

**Schedule:** Weekly

### Updates
- Regular dependency updates
- Security patches applied immediately
- Breaking changes tested before deployment

## Incident Response

### Breach Detection
1. Monitor logs for suspicious activity
2. Alert on failed login attempts
3. Track unusual data access patterns

### Breach Response Process
1. **Contain:** Stop the breach immediately
2. **Log:** `POST /api/auth/breach/report`
3. **Notify Authorities:** Within 72 hours (GDPR Article 33)
4. **Notify Users:** Without undue delay (GDPR Article 34)
5. **Document:** Record in compliance logs

**Implementation:**
```javascript
// src/controllers/breachNotificationController.js
const reportBreach = async (req, res) => {
  // Log breach
  // Generate user notifications
  // Document for authorities
};
```

### Notification Contents (Article 34)
- Nature of the breach
- Data affected
- Likely consequences
- Measures taken to mitigate
- Contact information

## Security Best Practices

### Code Level
- Input validation on all endpoints
- Output encoding (XSS prevention)
- Parameterized queries (SQL/NoSQL injection prevention)
- Error handling (no sensitive data in errors)
- Minimal data exposure

### Configuration
- Environment variables for secrets
- Never commit `.env` to Git
- Different secrets for dev/prod
- Rotate secrets regularly

### Deployment
- HTTPS enforced in production
- Secure cookies enabled
- Strong JWT secret (32+ characters)
- Regular backups
- Disaster recovery plan

## Security Checklist

### Implemented
- [x] bcrypt password hashing (12 rounds)
- [x] JWT authentication (1 hour expiry)
- [x] httpOnly cookies
- [x] Secure cookies (production)
- [x] sameSite cookies (CSRF protection)
- [x] HTTPS ready
- [x] CORS configured (CLIENT_URL only)
- [x] Input validation (all endpoints)
- [x] XSS protection (validator.escape)
- [x] CSRF protection (token-based)
- [x] Error handling (no data leaks)
- [x] MongoDB encryption (AES-256)
- [x] Environment secrets (.env)
- [x] Helmet.js security headers
- [x] Mongoose ODM (injection prevention)

### Recommended
- [ ] Rate limiting (brute force protection)
- [ ] Two-factor authentication (2FA)
- [ ] IP whitelisting (admin endpoints)
- [ ] Security scanning (automated)
- [ ] Penetration testing
- [ ] Web Application Firewall (WAF)
- [ ] DDoS protection
- [ ] Session management (multiple devices)
- [ ] Account lockout (failed login attempts)

## Compliance

This security implementation complies with:
- GDPR Article 32 (Security of processing)
- GDPR Article 25 (Data protection by design)
- OWASP Top 10 (2021)
- NIST Cybersecurity Framework
- ISO 27001 principles

## Security Contact

**Report Security Issues:**
- Email: security@miniforum.se
- Subject: "Security Vulnerability Report"
- Response: Within 24 hours

**Bug Bounty:**
- Not currently available
- Responsible disclosure appreciated

## Last Updated
November 6, 2025

## Version
1.0.0