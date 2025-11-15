# p5.js Web Editor API - Authentication Guide

Complete guide to authenticating with the p5.js Web Editor API.

---

## Overview

The p5.js Web Editor supports two authentication methods:

1. **Session Cookies** - Used by the web interface (always works)
2. **Personal Access Tokens** - API tokens for programmatic access (status uncertain)

---

## Method 1: Session Cookie Authentication

### How It Works

When you log into editor.p5js.org:
1. Browser sends credentials to `/api/login`
2. Server creates session in MongoDB
3. Server sends `connect.sid` cookie to browser
4. All subsequent requests include this cookie
5. Server validates cookie against session store

### Pros
- ✅ Always functional (used by web editor)
- ✅ No additional setup required
- ✅ Works immediately after login
- ✅ Familiar workflow

### Cons
- ⚠️ Cookies expire (typically 24 hours of inactivity)
- ⚠️ Security risk if cookie is leaked
- ⚠️ CORS restrictions from external domains
- ⚠️ Not designed for programmatic access

---

## Extracting Session Cookie

### Using Chrome DevTools

**Step-by-step:**

1. Open https://editor.p5js.org in Chrome

2. Log in to your account

3. Open DevTools:
   - Press `F12`
   - Or Right-click → Inspect
   - Or Menu → More Tools → Developer Tools

4. Go to the **Application** tab (top of DevTools)

5. In the left sidebar:
   - Expand **Cookies**
   - Click **https://editor.p5js.org**

6. Find the cookie named: `connect.sid`

7. Copy its **Value** (will look like):
   ```
   s%3AaBcDeFgHiJkLmNoPqRsTuVwXyZ123456789.abcdefghijklmnopqrstuvwxyz123456789ABCDEFGH
   ```

8. ✅ Use this value in your scripts

### Using Firefox DevTools

1. Open https://editor.p5js.org in Firefox

2. Log in to your account

3. Open DevTools (F12)

4. Go to **Storage** tab

5. Expand **Cookies** → **https://editor.p5js.org**

6. Find `connect.sid`

7. Copy the **Value**

### Using Safari DevTools

1. Enable Developer menu:
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"

2. Open https://editor.p5js.org

3. Log in

4. Develop → Show Web Inspector

5. Storage → Cookies → editor.p5js.org

6. Find and copy `connect.sid` value

### Using Browser Extension

**Option:** Use a cookie manager extension
- Chrome: "EditThisCookie"
- Firefox: "Cookie-Editor"
- Benefits: Easier to copy/export cookies

---

## Using Session Cookies in Code

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const SESSION_COOKIE = 'paste_your_cookie_here';

const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Cookie': `connect.sid=${SESSION_COOKIE}`
  },
  withCredentials: true
});

// Make authenticated request
const response = await client.post('/projects', {
  name: 'My Sketch',
  files: [...]
});
```

### Python

```python
import requests

SESSION_COOKIE = "paste_your_cookie_here"

session = requests.Session()
session.cookies.set('connect.sid', SESSION_COOKIE, domain='editor.p5js.org')

# Make authenticated request
response = session.post('https://editor.p5js.org/api/projects', json={
    'name': 'My Sketch',
    'files': [...]
})
```

### Bash (curl)

```bash
SESSION_COOKIE="paste_your_cookie_here"

curl -X POST https://editor.p5js.org/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=$SESSION_COOKIE" \
  -d '{"name":"My Sketch","files":[...]}'
```

---

## Method 2: Personal Access Token Authentication

### How It Works

Personal Access Tokens (PATs) provide API access without exposing passwords:

1. User generates token in Account Settings
2. Token is hashed and stored in database
3. Client uses HTTP Basic Authentication:
   ```
   Authorization: Basic base64(username:token)
   ```
4. Server validates token against hashed value
5. "Last used" timestamp is updated

### Implementation Details

**From PR #1075 (2019):**
- Uses `passport-http` strategy
- Tokens are hashed server-side before storage
- Test endpoint: `/api/auth/access-check`
- Merged to `feature/public-api` branch
- Production deployment status: **Unknown**

### Pros
- ✅ Designed for programmatic access
- ✅ Can be revoked without changing password
- ✅ Multiple tokens for different apps
- ✅ Token activity tracking
- ✅ Standard HTTP Basic Auth

### Cons
- ⚠️ May not be deployed to production
- ⚠️ No official documentation
- ⚠️ UI for generation may not exist
- ⚠️ Needs testing to confirm availability

---

## Generating Personal Access Token

### Step 1: Check if Feature is Available

1. Log into https://editor.p5js.org

2. Go to your account settings/profile

3. Look for sections like:
   - "API Access"
   - "Personal Access Tokens"
   - "Developer Tokens"
   - "API Keys"

4. If found: ✅ Feature is available!
   If not found: ⚠️ Feature may not be deployed

### Step 2: Generate Token (If Available)

1. Click "Generate New Token" or similar button

2. Give the token a descriptive name:
   ```
   Examples:
   - "Netlify Integration"
   - "Batch Upload Script"
   - "Development Testing"
   ```

3. Copy the token immediately!
   - ⚠️ You may only see it once
   - Store it securely

4. Save the token in a secure location:
   ```bash
   # Use environment variables
   export P5_ACCESS_TOKEN="your_token_here"

   # Or .env file (add to .gitignore!)
   echo "P5_ACCESS_TOKEN=your_token_here" >> .env
   ```

---

## Using Personal Access Tokens in Code

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const USERNAME = 'your_username';
const ACCESS_TOKEN = 'your_token';

// Create Basic Auth header
const auth = Buffer.from(`${USERNAME}:${ACCESS_TOKEN}`).toString('base64');

const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Authorization': `Basic ${auth}`
  }
});

// Make authenticated request
const response = await client.post('/projects', {
  name: 'My Sketch',
  files: [...]
});
```

### Python

```python
import requests
import base64

USERNAME = "your_username"
ACCESS_TOKEN = "your_token"

# Create Basic Auth header
auth_string = f"{USERNAME}:{ACCESS_TOKEN}"
auth_bytes = base64.b64encode(auth_string.encode('utf-8'))
auth_header = f"Basic {auth_bytes.decode('utf-8')}"

response = requests.post(
    'https://editor.p5js.org/api/projects',
    headers={'Authorization': auth_header},
    json={'name': 'My Sketch', 'files': [...]}
)
```

### Bash (curl)

```bash
USERNAME="your_username"
ACCESS_TOKEN="your_token"

# curl handles Basic Auth encoding automatically
curl -X POST https://editor.p5js.org/api/projects \
  -u "$USERNAME:$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Sketch","files":[...]}'
```

---

## Testing Authentication

### Test Session Cookie

```bash
# Quick test with curl
curl -v https://editor.p5js.org/api/projects \
  -H "Cookie: connect.sid=YOUR_COOKIE"

# Expected: 200 OK or list of projects
# If 401: Cookie is invalid or expired
```

### Test Personal Access Token

```bash
# Test the auth check endpoint
curl -v https://editor.p5js.org/api/auth/access-check \
  -u "username:token"

# Expected: 200 OK if working
# If 404: Endpoint doesn't exist
# If 401: Invalid credentials
```

### Automated Test Script

```javascript
async function testAuth() {
  try {
    // Try session cookie
    const sessionResponse = await axios.get('/api/projects', {
      headers: { 'Cookie': `connect.sid=${SESSION_COOKIE}` }
    });
    console.log('✅ Session cookie works!');
    return 'session';
  } catch (e) {
    console.log('❌ Session cookie failed');
  }

  try {
    // Try access token
    const auth = Buffer.from(`${USERNAME}:${ACCESS_TOKEN}`).toString('base64');
    const tokenResponse = await axios.get('/api/auth/access-check', {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    console.log('✅ Access token works!');
    return 'token';
  } catch (e) {
    console.log('❌ Access token failed');
  }

  throw new Error('No valid authentication method found');
}
```

---

## Security Best Practices

### 🔒 Storing Credentials

**Never hardcode in source code:**
```javascript
// ❌ BAD
const SESSION_COOKIE = 's%3AaBcDeFgHiJkLmNoPqRsTuVwXyZ...';

// ✅ GOOD
const SESSION_COOKIE = process.env.P5_SESSION_COOKIE;
```

**Use environment variables:**
```bash
# .env file (add to .gitignore!)
P5_SESSION_COOKIE=your_cookie_here
P5_USERNAME=your_username
P5_ACCESS_TOKEN=your_token_here
```

**Load in application:**
```javascript
// Node.js
require('dotenv').config();
const cookie = process.env.P5_SESSION_COOKIE;

// Python
from os import environ
cookie = environ.get('P5_SESSION_COOKIE')

// Bash
source .env
echo $P5_SESSION_COOKIE
```

### 🔒 Protecting in Git

**Add to .gitignore:**
```bash
cat >> .gitignore << EOF
.env
.env.*
*.cookie
*.token
secrets.json
config/credentials.json
EOF
```

**Check before committing:**
```bash
# Search for potential secrets
git grep -i "connect.sid"
git grep -i "session_cookie"

# Use tools like git-secrets
git secrets --scan
```

### 🔒 Handling Expiration

**Session cookies expire, so handle gracefully:**

```javascript
async function makeAuthenticatedRequest(url, options) {
  try {
    return await axios(url, options);
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('⚠️  Authentication expired!');
      console.log('1. Log into editor.p5js.org');
      console.log('2. Get new session cookie');
      console.log('3. Update .env file');
      process.exit(1);
    }
    throw error;
  }
}
```

### 🔒 Rate Limiting

**Implement exponential backoff:**

```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await axios(url, options);
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`⚠️  Rate limited. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Troubleshooting

### Issue: "Unauthorized" or 401 Error

**Possible causes:**
1. Cookie/token is invalid
2. Cookie/token has expired
3. Wrong format (missing `connect.sid=` prefix for cookies)

**Solutions:**
```bash
# 1. Get fresh cookie
# Log out and log back in to editor.p5js.org

# 2. Verify cookie format
echo "Cookie should look like:"
echo "s%3AaBcDeFgHiJkLmNoPqRsTuVwXyZ.abcdefgh..."

# 3. Test with verbose output
curl -v https://editor.p5js.org/api/projects \
  -H "Cookie: connect.sid=YOUR_COOKIE"
```

### Issue: "Forbidden" or 403 Error

**Possible causes:**
1. Valid auth but no permission
2. CSRF token missing (for some endpoints)

**Solutions:**
```javascript
// Add CSRF token if needed
headers: {
  'Cookie': `connect.sid=${SESSION_COOKIE}`,
  'X-CSRF-Token': csrfToken  // May be required
}
```

### Issue: CORS Error in Browser

**Cause:** Same-origin policy

**Solution:**
```javascript
// ❌ Can't make requests from different domain
// From yoursite.com to editor.p5js.org = CORS error

// ✅ Solution 1: Use backend
// Netlify Function → editor.p5js.org = No CORS issue

// ✅ Solution 2: Run capture tool ON editor.p5js.org
// Browser console on editor.p5js.org = No CORS issue
```

### Issue: Cookie Works in Browser But Not in Script

**Cause:** Missing cookie headers or wrong format

**Debug:**
```javascript
// Log exact request being sent
axios.interceptors.request.use(request => {
  console.log('Request:', request);
  console.log('Headers:', request.headers);
  return request;
});
```

---

## Advanced Techniques

### Refreshing Cookies Automatically

```javascript
class P5APIClient {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.cookie = null;
  }

  async ensureAuthenticated() {
    if (this.cookie && !this.isCookieExpired()) {
      return;
    }

    // Re-authenticate
    const response = await axios.post('https://editor.p5js.org/api/login', {
      email: this.username,
      password: this.password
    });

    // Extract cookie from response
    const setCookie = response.headers['set-cookie'];
    this.cookie = this.parseCookie(setCookie);
  }

  async makeRequest(url, options) {
    await this.ensureAuthenticated();
    return axios(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cookie': `connect.sid=${this.cookie}`
      }
    });
  }
}
```

### Using Browser Cookies Directly (Puppeteer)

```javascript
const puppeteer = require('puppeteer');

async function getCookieViaAutomation(username, password) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Log in
  await page.goto('https://editor.p5js.org/login');
  await page.type('#email', username);
  await page.type('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Extract cookie
  const cookies = await page.cookies();
  const sessionCookie = cookies.find(c => c.name === 'connect.sid');

  await browser.close();
  return sessionCookie.value;
}
```

---

## Summary

### Recommended Approach

For most use cases:
1. ✅ Use **session cookie** method (reliable)
2. ✅ Store in **environment variables**
3. ✅ Implement **error handling** for expiration
4. ✅ Add **rate limiting** protection

For production applications:
1. 🔍 Test if **Personal Access Tokens** are available
2. 🔍 If not, contact Processing Foundation
3. ✅ Consider building **your own backend**
4. ✅ Use p5.js editor for export/import only

---

## Next Steps

1. Extract your session cookie
2. Test with the provided scripts
3. Check for Personal Access Token feature
4. Report findings to the community

---

**Last Updated:** 2025-01-15
