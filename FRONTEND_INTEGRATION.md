# Frontend Integration Guide

## Overview
This guide explains how to integrate the Miniforum Auth Backend with your frontend application.

## Prerequisites
- Frontend running on http://localhost:5173 (or update CLIENT_URL in backend .env)
- Node.js and npm installed
- Modern browser (supports fetch/axios, cookies)

## Installation

### Install axios
```bash
npm install axios
```

## API Client Setup

### Create API Client
**File:** `src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4100/api/auth',
  withCredentials: true, // CRITICAL: Enables cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// CSRF Token Interceptor
let csrfToken = null;

api.interceptors.request.use(async (config) => {
  // Get CSRF token for non-GET requests
  if (!['GET', 'HEAD', 'OPTIONS'].includes(config.method.toUpperCase())) {
    if (!csrfToken) {
      try {
        const response = await axios.get('http://localhost:4100/api/auth/csrf-token', {
          withCredentials: true
        });
        csrfToken = response.data.csrfToken;
      } catch (error) {
        console.error('CSRF token fetch failed:', error);
        throw error;
      }
    }
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Clear CSRF token on 403 (invalid token)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      csrfToken = null; // Force refresh on next request
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Authentication

### Register User
```javascript
// src/services/authService.js
import api from './api';

export const register = async (email, password, name) => {
  try {
    const response = await api.post('/register', {
      email,
      password,
      name,
      consents: {
        marketing: false,
        analytics: false
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Login
```javascript
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', {
      email,
      password
    });
    // Cookie automatically set by backend
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Get Profile
```javascript
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Logout
```javascript
export const logout = async () => {
  try {
    const response = await api.post('/logout');
    // Cookie cleared by backend
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## GDPR Features

### Get Consents
```javascript
export const getConsents = async () => {
  try {
    const response = await api.get('/consents');
    return response.data; // { consents, consentLogs }
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Update Consents
```javascript
export const updateConsents = async (marketing, analytics) => {
  try {
    const response = await api.put('/consents', {
      marketing,
      analytics
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Export User Data
```javascript
export const exportUserData = async () => {
  try {
    const response = await api.get('/export');
    
    // Download as JSON file
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-data-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Delete Account
```javascript
export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/account', {
      data: { password }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## Cookie Banner Component

### React Example
```jsx
// src/components/CookieBanner.jsx
import { useState, useEffect } from 'react';
import { getConsents, updateConsents } from '../services/authService';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consents, setConsents] = useState({
    marketing: false,
    analytics: false
  });

  useEffect(() => {
    checkConsents();
  }, []);

  const checkConsents = async () => {
    try {
      const data = await getConsents();
      // Show banner if user hasn't made a choice yet
      if (!data.consents.marketing && !data.consents.analytics) {
        setShowBanner(true);
      }
    } catch (error) {
      // User not logged in or error, show banner
      setShowBanner(true);
    }
  };

  const handleAcceptAll = async () => {
    try {
      await updateConsents(true, true);
      setShowBanner(false);
    } catch (error) {
      console.error('Error accepting cookies:', error);
    }
  };

  const handleRejectAll = async () => {
    try {
      await updateConsents(false, false);
      setShowBanner(false);
    } catch (error) {
      console.error('Error rejecting cookies:', error);
    }
  };

  const handleCustomize = async () => {
    try {
      await updateConsents(consents.marketing, consents.analytics);
      setShowBanner(false);
    } catch (error) {
      console.error('Error updating consents:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <h3>Cookie Settings</h3>
        <p>We use cookies to improve your experience.</p>

        <div style={styles.options}>
          <label>
            <input
              type="checkbox"
              checked={consents.marketing}
              onChange={(e) => setConsents({
                ...consents,
                marketing: e.target.checked
              })}
            />
            Marketing Cookies
          </label>

          <label>
            <input
              type="checkbox"
              checked={consents.analytics}
              onChange={(e) => setConsents({
                ...consents,
                analytics: e.target.checked
              })}
            />
            Analytics Cookies
          </label>
        </div>

        <div style={styles.actions}>
          <button onClick={handleRejectAll}>Reject All</button>
          <button onClick={handleCustomize}>Save Preferences</button>
          <button onClick={handleAcceptAll}>Accept All</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    borderTop: '2px solid #ddd',
    padding: '20px',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 9999
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  options: {
    margin: '15px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  }
};

export default CookieBanner;
```

## Privacy Settings Page

### React Example
```jsx
// src/pages/PrivacySettings.jsx
import { useState, useEffect } from 'react';
import { 
  getConsents, 
  updateConsents, 
  exportUserData, 
  deleteAccount 
} from '../services/authService';

const PrivacySettings = () => {
  const [consents, setConsents] = useState({
    marketing: false,
    analytics: false
  });
  const [consentLogs, setConsentLogs] = useState([]);
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      const data = await getConsents();
      setConsents(data.consents);
      setConsentLogs(data.consentLogs);
    } catch (error) {
      console.error('Error loading consents:', error);
    }
  };

  const handleUpdateConsents = async () => {
    try {
      await updateConsents(consents.marketing, consents.analytics);
      alert('Consents updated successfully');
      loadConsents();
    } catch (error) {
      alert('Failed to update consents');
    }
  };

  const handleExportData = async () => {
    try {
      await exportUserData();
      alert('Data exported successfully');
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action is irreversible!')) {
      return;
    }

    try {
      await deleteAccount(password);
      alert('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      alert('Failed to delete account. Check your password.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Privacy Settings</h1>

      <section style={{ marginBottom: '30px' }}>
        <h2>Cookie Consents</h2>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={consents.marketing}
            onChange={(e) => setConsents({
              ...consents,
              marketing: e.target.checked
            })}
          />
          Marketing Cookies
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={consents.analytics}
            onChange={(e) => setConsents({
              ...consents,
              analytics: e.target.checked
            })}
          />
          Analytics Cookies
        </label>
        <button onClick={handleUpdateConsents}>Save Preferences</button>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Consent History</h2>
        <ul>
          {consentLogs.map((log, index) => (
            <li key={index}>
              {log.type} - {log.action} at {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Your Data (GDPR Article 20)</h2>
        <button onClick={handleExportData}>Download My Data (JSON)</button>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Delete Account (GDPR Article 17)</h2>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button 
          onClick={handleDeleteAccount}
          style={{ background: 'red', color: 'white' }}
        >
          Delete Account Permanently
        </button>
      </section>
    </div>
  );
};

export default PrivacySettings;
```

## Security Best Practices

### 1. Always use withCredentials
```javascript
// CORRECT
axios.create({
  withCredentials: true
});

// WRONG - Cookies won't be sent
axios.create({
  withCredentials: false
});
```

### 2. Never store JWT in localStorage
```javascript
// BAD - Vulnerable to XSS
localStorage.setItem('token', token);

// GOOD - httpOnly cookie (backend handles this)
// Frontend doesn't need to handle tokens at all
```

### 3. Validate input before sending
```javascript
// Always validate
const email = userInput.trim().toLowerCase();
if (!email.includes('@')) {
  return 'Invalid email';
}
```

### 4. Handle errors gracefully
```javascript
try {
  await api.post('/login', credentials);
} catch (error) {
  if (error.response?.status === 401) {
    alert('Invalid credentials');
  } else if (error.response?.status === 403) {
    alert('CSRF token invalid, please refresh');
  } else {
    alert('Server error, please try again');
  }
}
```

## Troubleshooting

### CORS Issues
**Problem:** `Access-Control-Allow-Origin` error

**Solutions:**
1. Check CLIENT_URL in backend .env matches your frontend URL
2. Ensure `withCredentials: true` in axios config
3. Backend must have `credentials: true` in CORS config
4. No trailing slash in URLs

### CSRF Token Issues
**Problem:** 403 CSRF token invalid

**Solutions:**
1. Get new CSRF token: `GET /api/auth/csrf-token`
2. Include token in header: `X-CSRF-Token`
3. Ensure cookies are enabled in browser
4. Check interceptor is working

### Cookie Not Sent
**Problem:** Backend says "No token provided"

**Solutions:**
1. Use `withCredentials: true` in axios
2. Check cookie in browser DevTools (Application tab)
3. Ensure same domain (localhost:5173 and localhost:4100)
4. Check cookie is not expired (1 hour)

### Login Not Persisting
**Problem:** User logged out on page refresh

**Check:**
1. Cookie is httpOnly (should be)
2. Cookie has correct expiration (1 hour)
3. Browser allows cookies
4. Not in incognito mode

## Production Checklist

Before deploying to production:

- [ ] Update CLIENT_URL to production domain (e.g., https://miniforum.com)
- [ ] Set NODE_ENV=production in backend
- [ ] Use HTTPS (secure cookies)
- [ ] Different ACCESS_TOKEN_SECRET than development
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Test CSRF protection
- [ ] Test XSS protection
- [ ] Test cookie banner
- [ ] Test all GDPR features (export, delete)
- [ ] Update privacy policy URLs
- [ ] Test on multiple browsers

## API Endpoints Reference

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/profile - Get user profile

### GDPR
- GET /api/auth/consents - Get consents and logs
- PUT /api/auth/consents - Update consents (requires CSRF token)
- GET /api/auth/export - Export all user data
- DELETE /api/auth/account - Delete account (requires CSRF token and password)

### Privacy
- GET /api/auth/privacy-policy - Privacy policy summary
- GET /api/auth/privacy-policy-text - Full privacy policy

### CSRF
- GET /api/auth/csrf-token - Get CSRF token

### Support
- POST /api/auth/gdpr-request - Submit GDPR support request (requires CSRF token)
- GET /api/auth/gdpr-requests - Get user's support tickets

## Contact

**Integration Support:**
- Email: dev@miniforum.se
- Documentation: See README.md

## Last Updated
November 6, 2025

## Version
1.0.0