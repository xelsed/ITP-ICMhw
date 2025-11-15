# p5.js Web Editor API - Reverse Engineering Research Findings

## Executive Summary

The p5.js Web Editor has a semi-documented internal API with **two authentication methods**:
1. **Session Cookies** (currently used by the web interface)
2. **Personal Access Tokens** (implemented in 2019, status uncertain)

This document provides comprehensive findings for programmatic sketch upload.

---

## 1. Authentication Methods Discovered

### Method 1: Session Cookie Authentication (WORKING)

**How it works:**
- User logs into editor.p5js.org via browser
- Server creates session, returns `connect.sid` cookie
- All API requests include this cookie
- Session stored in MongoDB, expires after inactivity

**Pros:**
- Currently functional
- No additional setup required
- Works immediately after login

**Cons:**
- Cookie expires (typically 24 hours of inactivity)
- Security risk storing user sessions
- Violates same-origin policy from external domains
- Not intended for programmatic access

**Example cookie format:**
```
connect.sid=s%3AaBcDeFgHiJkLmNoPqRsTuVwXyZ.1234567890abcdef
```

### Method 2: Personal Access Token Authentication (IMPLEMENTED BUT UNCERTAIN)

**How it works:**
- User generates token in Account Settings
- Token stored hashed in database
- Uses HTTP Basic Authentication
- Format: `username:token` in base64

**Authentication header:**
```
Authorization: Basic dXNlcm5hbWU6dG9rZW4=
```

Or with curl:
```bash
curl -u username:token https://editor.p5js.org/api/...
```

**Implementation details from PR #1075:**
- Endpoint to generate tokens: `/api/tokens` (likely)
- Test endpoint: `/api/auth/access-check`
- Tokens hashed server-side before storage
- "Last used" timestamp tracked
- Uses `passport-http` strategy

**Status:** Implemented and merged to `feature/public-api` branch in 2019. Unknown if deployed to production.

**Action item:** Test if `/api/tokens` endpoint exists in production.

---

## 2. API Endpoints Discovered

### Base URL
```
https://editor.p5js.org/api
```

### Project Management Endpoints

#### Create New Project
```http
POST /api/projects
Content-Type: application/json
Cookie: connect.sid=... OR Authorization: Basic ...

{
  "name": "My Sketch",
  "files": [
    {
      "name": "sketch.js",
      "content": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n}",
      "fileType": "file"
    },
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>\n<html>\n  <head>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js\"></script>\n    <script src=\"sketch.js\"></script>\n  </head>\n  <body>\n  </body>\n</html>",
      "fileType": "file"
    }
  ]
}
```

**Response:**
```json
{
  "id": "aBcDeFgHiJ",
  "name": "My Sketch",
  "owner": {
    "id": "user123",
    "username": "myusername"
  },
  "files": [...],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Sketch URL format:**
```
https://editor.p5js.org/{username}/sketches/{project_id}
```

#### Get Project
```http
GET /api/projects/:project_id
Cookie: connect.sid=... OR Authorization: Basic ...
```

#### Update Project
```http
PUT /api/projects/:project_id
Content-Type: application/json
Cookie: connect.sid=... OR Authorization: Basic ...

{
  "name": "Updated Sketch Name",
  "files": [...]
}
```

#### Delete Project
```http
DELETE /api/projects/:project_id
Cookie: connect.sid=... OR Authorization: Basic ...
```

#### List User's Projects
```http
GET /api/:username/sketches
```
**Note:** This endpoint is PUBLIC and doesn't require authentication.

---

## 3. Project File Structure

Every p5.js project must include these files:

### Minimum Required Files

**1. sketch.js** (main code file)
```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

**2. index.html** (HTML wrapper)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sketch</title>
    <style>
      body {
        padding: 0;
        margin: 0;
      }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="sketch.js"></script>
  </head>
  <body>
  </body>
</html>
```

### Optional Files

**3. style.css**
```css
html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
```

**File object structure:**
```json
{
  "name": "filename.js",
  "content": "file contents as string",
  "fileType": "file"
}
```

**Folder structure:**
```json
{
  "name": "foldername",
  "fileType": "folder",
  "children": [
    {
      "name": "file.js",
      "content": "...",
      "fileType": "file"
    }
  ]
}
```

---

## 4. Authentication Testing Endpoints

### Check if Personal Access Tokens work

```bash
# Test endpoint (if it exists)
curl https://editor.p5js.org/api/auth/access-check \
  -u username:token
```

### Generate Personal Access Token

**Hypothesis:** Should be at `/api/tokens` or accessible via Account Settings UI.

**To test:**
1. Log into editor.p5js.org
2. Go to account settings
3. Look for "API Tokens" or "Personal Access Tokens"
4. Generate token
5. Test with API requests

---

## 5. Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Cause:** Missing or invalid authentication

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```
**Cause:** Valid auth but no permission for resource

### 404 Not Found
```json
{
  "error": "Project not found"
}
```

### 500 Internal Server Error
**Cause:** Server-side error (report as bug)

---

## 6. CORS and Domain Restrictions

The p5.js editor API has CORS restrictions:

**What works:**
- Requests from editor.p5js.org domain
- curl/Postman with credentials
- Browser extensions running on editor.p5js.org

**What doesn't work:**
- Direct fetch from external websites (Netlify, etc.)
- Browser requests from different origins

**Solution for external apps:**
- Use a backend proxy (Netlify Function)
- Backend makes requests to p5.js API
- No CORS issues on server-to-server

---

## 7. Rate Limiting

**Unknown:** No documented rate limits found.

**Hypothesis:** Likely rate-limited to prevent abuse.

**Best practice:**
- Implement exponential backoff
- Cache responses where possible
- Respect HTTP 429 (Too Many Requests) responses

---

## 8. Technology Stack

From repository analysis:

**Backend:**
- Node.js + Express.js
- MongoDB (user data, sessions, projects)
- AWS S3 (asset storage for images, sounds, etc.)
- Passport.js (authentication strategies)
  - Local strategy (username/password)
  - GitHub OAuth
  - Google OAuth
  - HTTP Basic (for tokens)

**Session Management:**
- express-session middleware
- connect-mongo (MongoDB session store)
- Cookie name: `connect.sid`

---

## 9. Reverse Engineering Methodology

### Step 1: Capture Real Traffic

**Using Chrome DevTools:**
1. Open editor.p5js.org
2. Open DevTools (F12) → Network tab
3. Filter: Fetch/XHR
4. Perform action (create sketch, save, etc.)
5. Inspect request/response

**What to capture:**
- Request URL
- Request Method (GET, POST, PUT, DELETE)
- Request Headers (especially Cookie or Authorization)
- Request Body (JSON payload)
- Response Body
- Response Headers

### Step 2: Reproduce with curl

```bash
# Copy request as curl from DevTools
Right-click request → Copy → Copy as cURL
```

### Step 3: Test in isolation

Create minimal test script to verify endpoint works

### Step 4: Document findings

Add to this document for future reference

---

## 10. Legal and Ethical Considerations

### Is this allowed?

**Gray area:**
- API is not officially documented for public use
- Personal Access Token feature suggests programmatic access was intended
- No Terms of Service explicitly forbid API access
- Common practice in web development education

**Best practices:**
- Don't abuse the API (rate limiting)
- Don't scrape user data without permission
- Don't use for commercial purposes without permission
- Consider contributing to official API documentation

**Recommended:**
1. Contact Processing Foundation: hello@processingfoundation.org
2. Ask about official API access
3. Contribute to Issue #541 and PR #1075
4. Help document the API officially

---

## 11. Implementation Recommendations

### For Learning/Education (like ITP homework)
✅ **Recommended approach:**
- Use session cookie method
- Create sketches programmatically
- Document findings as part of learning
- Share with community

### For Production Apps (like Netlify project)
⚠️ **Not recommended without official API:**
- Personal Access Tokens status uncertain
- No SLA or stability guarantees
- API may change without notice
- Could violate ToS

✅ **Recommended alternatives:**
1. **Own backend:** Store sketches in your database
2. **Export functionality:** Let users download/copy to editor
3. **Contact Processing Foundation:** Request official API access

---

## 12. Next Steps for Research

### Immediate Tests Needed

1. **Test Personal Access Token generation:**
   - [ ] Log into editor.p5js.org
   - [ ] Check Account Settings for token generation
   - [ ] Document UI location if found
   - [ ] Test token with API requests

2. **Test token endpoint:**
   ```bash
   curl https://editor.p5js.org/api/auth/access-check \
     -u username:token \
     -v
   ```

3. **Test project creation with token:**
   ```bash
   curl -X POST https://editor.p5js.org/api/projects \
     -u username:token \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","files":[...]}'
   ```

4. **Document all response formats**

### Long-term Research

1. Map all API endpoints systematically
2. Test file upload (images, sounds)
3. Test collections/folders API
4. Document asset management (S3)
5. Create comprehensive API documentation
6. Contribute to p5.js project

---

## 13. Resources

### Official Resources
- **GitHub Repository:** https://github.com/processing/p5.js-web-editor
- **API Auth Issue #541:** https://github.com/processing/p5.js-web-editor/issues/541
- **Personal Access Tokens PR #1075:** https://github.com/processing/p5.js-web-editor/pull/1075
- **Processing Foundation Contact:** hello@processingfoundation.org
- **Discord:** https://discord.gg/processingfoundation

### Community Resources
- **Processing Forum:** https://discourse.processing.org/
- **p5.js Forum:** https://discourse.processing.org/c/p5js

### Related Tools
- **p5mirrorLib:** https://github.com/molab-itp/p5mirror (download only)

---

## 14. Changelog

- **2025-01-15:** Initial research compilation
- Personal Access Token feature discovered (PR #1075, 2019)
- Session cookie authentication documented
- Basic API endpoints mapped
- Testing methodology established

---

## Contributors

Add your name if you contribute findings!

- [Your name here]

---

**Status:** Active research - findings subject to change as testing progresses.

**Last Updated:** 2025-01-15
