# p5.js Web Editor API - Reference Documentation

Complete API endpoint reference for the p5.js Web Editor.

---

## Base URL

```
https://editor.p5js.org/api
```

All endpoints are prefixed with this base URL.

---

## Authentication

See [AUTHENTICATION.md](AUTHENTICATION.md) for detailed authentication guide.

**Methods:**
- Session Cookie: `Cookie: connect.sid=<cookie-value>`
- Personal Access Token: `Authorization: Basic <base64(username:token)>`

---

## Projects API

### Create Project

Create a new sketch.

```http
POST /api/projects
```

**Authentication:** Required

**Headers:**
```http
Content-Type: application/json
Cookie: connect.sid=<session-cookie>
```

**Request Body:**
```json
{
  "name": "string (optional, defaults to 'untitled')",
  "files": [
    {
      "name": "string (required)",
      "content": "string (required)",
      "fileType": "file" | "folder",
      "children": []  // For folders only
    }
  ]
}
```

**Minimum valid request:**
```json
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
      "content": "<!DOCTYPE html>\n<html>\n  <head>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js\"></script>\n    <script src=\"sketch.js\"></script>\n  </head>\n  <body></body>\n</html>",
      "fileType": "file"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "abc123xyz",
  "name": "My Sketch",
  "slug": "my-sketch",
  "owner": {
    "id": "user_id",
    "username": "username"
  },
  "files": [
    {
      "_id": "file_id_1",
      "name": "sketch.js",
      "content": "...",
      "fileType": "file"
    },
    {
      "_id": "file_id_2",
      "name": "index.html",
      "content": "...",
      "fileType": "file"
    }
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Sketch URLs:**
```
Editor: https://editor.p5js.org/{username}/sketches/{project_id}
Full View: https://editor.p5js.org/{username}/full/{project_id}
Present Mode: https://editor.p5js.org/{username}/present/{project_id}
Embed: https://editor.p5js.org/{username}/embed/{project_id}
```

**Example (curl):**
```bash
curl -X POST https://editor.p5js.org/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_COOKIE" \
  -d '{
    "name": "My Sketch",
    "files": [
      {
        "name": "sketch.js",
        "content": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n}",
        "fileType": "file"
      },
      {
        "name": "index.html",
        "content": "<!DOCTYPE html>\n<html>\n  <head>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js\"></script>\n    <script src=\"sketch.js\"></script>\n  </head>\n  <body></body>\n</html>",
        "fileType": "file"
      }
    ]
  }'
```

---

### Get Project

Retrieve project details by ID.

```http
GET /api/projects/:project_id
```

**Authentication:** Required (for private projects) or Optional (for public projects)

**Parameters:**
- `project_id` (path, required): The project ID

**Response (200 OK):**
```json
{
  "id": "abc123xyz",
  "name": "My Sketch",
  "slug": "my-sketch",
  "owner": {
    "id": "user_id",
    "username": "username"
  },
  "files": [...],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl https://editor.p5js.org/api/projects/abc123xyz \
  -H "Cookie: connect.sid=YOUR_COOKIE"
```

---

### Update Project

Update an existing project.

```http
PUT /api/projects/:project_id
```

**Authentication:** Required

**Parameters:**
- `project_id` (path, required): The project ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "files": [
    {
      "_id": "existing_file_id (optional for existing files)",
      "name": "string",
      "content": "string",
      "fileType": "file" | "folder"
    }
  ]
}
```

**Note:** To update files, include the `_id` field for existing files. To add new files, omit the `_id`.

**Response (200 OK):**
```json
{
  "id": "abc123xyz",
  "name": "Updated Name",
  "files": [...],
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

**Example:**
```bash
curl -X PUT https://editor.p5js.org/api/projects/abc123xyz \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_COOKIE" \
  -d '{
    "name": "Updated Sketch Name",
    "files": [...]
  }'
```

---

### Delete Project

Delete a project.

```http
DELETE /api/projects/:project_id
```

**Authentication:** Required

**Parameters:**
- `project_id` (path, required): The project ID

**Response (204 No Content)**

**Example:**
```bash
curl -X DELETE https://editor.p5js.org/api/projects/abc123xyz \
  -H "Cookie: connect.sid=YOUR_COOKIE"
```

---

### List User's Projects

Get all public projects for a user (PUBLIC ENDPOINT).

```http
GET /api/:username/sketches
```

**Authentication:** Not required

**Parameters:**
- `username` (path, required): The username

**Response (200 OK):**
```json
[
  {
    "id": "project1",
    "name": "Sketch 1",
    "slug": "sketch-1",
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  {
    "id": "project2",
    "name": "Sketch 2",
    "slug": "sketch-2",
    "createdAt": "2025-01-12T15:00:00.000Z",
    "updatedAt": "2025-01-14T09:00:00.000Z"
  }
]
```

**Example:**
```bash
curl https://editor.p5js.org/api/username/sketches
```

---

## Files API

### File Structure

Files in p5.js projects have this structure:

```json
{
  "_id": "unique_file_id",
  "name": "filename.js",
  "content": "file contents as string",
  "fileType": "file" | "folder",
  "url": "/username/sketches/project_id/filename.js",
  "children": []  // For folders only
}
```

### Required Files

Every project must include at minimum:

1. **sketch.js** - Main p5.js code
2. **index.html** - HTML wrapper that loads p5.js and sketch.js

### Common File Types

**JavaScript files:**
```json
{
  "name": "sketch.js",
  "content": "function setup() {...}",
  "fileType": "file"
}
```

**HTML files:**
```json
{
  "name": "index.html",
  "content": "<!DOCTYPE html>...",
  "fileType": "file"
}
```

**CSS files:**
```json
{
  "name": "style.css",
  "content": "body { margin: 0; }",
  "fileType": "file"
}
```

**JSON data files:**
```json
{
  "name": "data.json",
  "content": "{\"key\": \"value\"}",
  "fileType": "file"
}
```

**Folders:**
```json
{
  "name": "lib",
  "fileType": "folder",
  "children": [
    {
      "name": "helper.js",
      "content": "...",
      "fileType": "file"
    }
  ]
}
```

---

## Assets API

*Note: Asset upload endpoints (for images, sounds, fonts) need further research.*

### Hypothetical Asset Upload

```http
POST /api/projects/:project_id/assets
```

**Expected request:**
```http
POST /api/projects/abc123/assets
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="image.png"
Content-Type: image/png

[binary data]
------WebKitFormBoundary--
```

**Expected response:**
```json
{
  "url": "https://s3-url.amazonaws.com/..."
}
```

**Status:** 🔍 Needs testing

---

## Authentication API

### Personal Access Token Check

Test if a Personal Access Token is valid.

```http
GET /api/auth/access-check
```

**Authentication:** Required (Personal Access Token)

**Headers:**
```http
Authorization: Basic <base64(username:token)>
```

**Response (200 OK):**
```json
{
  "message": "Access granted"
}
```

**Example:**
```bash
curl https://editor.p5js.org/api/auth/access-check \
  -u "username:your_token"
```

**Status:** 🔍 Uncertain if deployed to production

---

### Login

*Note: Login endpoint is for web interface. For programmatic access, use session cookies or PATs.*

```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
- Sets `connect.sid` cookie
- Returns user data

---

## Collections API

*Note: Collections API needs further research.*

### Hypothetical Endpoints

```http
GET /api/:username/collections              # List collections
POST /api/collections                       # Create collection
GET /api/collections/:collection_id         # Get collection
PUT /api/collections/:collection_id         # Update collection
DELETE /api/collections/:collection_id      # Delete collection
POST /api/collections/:collection_id/projects/:project_id  # Add project to collection
```

**Status:** 🔍 Needs testing

---

## Error Responses

### 400 Bad Request

**Cause:** Invalid request data

**Response:**
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "files",
      "message": "files is required"
    }
  ]
}
```

---

### 401 Unauthorized

**Cause:** Missing or invalid authentication

**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Solution:** Check your session cookie or access token

---

### 403 Forbidden

**Cause:** Valid authentication but insufficient permissions

**Response:**
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

**Solution:** Ensure you're the owner of the project

---

### 404 Not Found

**Cause:** Resource doesn't exist

**Response:**
```json
{
  "error": "Not Found",
  "message": "Project not found"
}
```

---

### 429 Too Many Requests

**Cause:** Rate limit exceeded

**Response:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```

**Headers:**
```http
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642259460
```

**Solution:** Implement exponential backoff

---

### 500 Internal Server Error

**Cause:** Server-side error

**Response:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Solution:** Report to Processing Foundation

---

## Rate Limiting

### Limits

**Hypothesis:** API likely has rate limits, but exact values are undocumented.

**Expected limits:**
- Requests per minute: ~60-100
- Requests per hour: ~1000-5000
- Burst limit: ~20

**Status:** 🔍 Needs testing

### Best Practices

```javascript
// Implement exponential backoff
async function makeRequestWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
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

## CORS Policy

### Allowed Origins

The API has CORS restrictions:

**Allowed:**
- `https://editor.p5js.org`
- Server-to-server requests (no CORS)

**Blocked:**
- Requests from other domains in browser

### Workaround

Use a backend proxy:

```javascript
// Netlify Function
exports.handler = async (event) => {
  const response = await axios.post(
    'https://editor.p5js.org/api/projects',
    JSON.parse(event.body),
    {
      headers: {
        'Cookie': `connect.sid=${process.env.P5_COOKIE}`
      }
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify(response.data)
  };
};
```

---

## Pagination

*Note: Pagination details need research.*

### Expected Query Parameters

```http
GET /api/:username/sketches?page=1&limit=20
```

**Status:** 🔍 Needs testing

---

## Filtering and Sorting

*Note: Filtering options need research.*

### Expected Query Parameters

```http
GET /api/:username/sketches?sort=updatedAt&order=desc
```

**Status:** 🔍 Needs testing

---

## Request Examples

### Complete Node.js Example

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `connect.sid=${process.env.P5_COOKIE}`
  }
});

// Create project
const project = await client.post('/projects', {
  name: 'My Animated Circle',
  files: [
    {
      name: 'sketch.js',
      content: `
let x = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(x, 200, 50);
  x = (x + 2) % width;
}
      `.trim(),
      fileType: 'file'
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="sketch.js"></script>
  </head>
  <body></body>
</html>`.trim(),
      fileType: 'file'
    }
  ]
});

console.log(`Created: https://editor.p5js.org/${project.data.owner.username}/sketches/${project.data.id}`);

// Update project
await client.put(`/projects/${project.data.id}`, {
  name: 'Updated: My Animated Circle'
});

// Get project
const updated = await client.get(`/projects/${project.data.id}`);
console.log('Updated project:', updated.data);

// Delete project (optional)
// await client.delete(`/projects/${project.data.id}`);
```

---

### Complete Python Example

```python
import requests
import os

session = requests.Session()
session.cookies.set('connect.sid', os.environ['P5_COOKIE'], domain='editor.p5js.org')
session.headers.update({'Content-Type': 'application/json'})

# Create project
response = session.post('https://editor.p5js.org/api/projects', json={
    'name': 'My Python Sketch',
    'files': [
        {
            'name': 'sketch.js',
            'content': '''
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 50);
}
            '''.strip(),
            'fileType': 'file'
        },
        {
            'name': 'index.html',
            'content': '''<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="sketch.js"></script>
  </head>
  <body></body>
</html>'''.strip(),
            'fileType': 'file'
        }
    ]
})

project = response.json()
print(f"Created: https://editor.p5js.org/{project['owner']['username']}/sketches/{project['id']}")
```

---

## Summary Table

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/projects` | POST | ✅ | Create project |
| `/api/projects/:id` | GET | ⚠️ | Get project |
| `/api/projects/:id` | PUT | ✅ | Update project |
| `/api/projects/:id` | DELETE | ✅ | Delete project |
| `/api/:username/sketches` | GET | ❌ | List public projects |
| `/api/auth/access-check` | GET | ✅ | Test PAT auth |

**Legend:**
- ✅ Required
- ⚠️ Required for private projects
- ❌ Not required

---

## Next Research Priorities

- [ ] Map asset upload endpoints
- [ ] Document collections API
- [ ] Test rate limiting
- [ ] Document pagination
- [ ] Test filtering/sorting
- [ ] Map user profile API
- [ ] Document webhook endpoints (if any)

---

**Last Updated:** 2025-01-15
**Status:** Active Research 🔍
