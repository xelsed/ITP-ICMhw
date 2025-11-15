# p5.js Web Editor API - Reverse Engineering Project

Complete toolkit for understanding and testing the p5.js Web Editor API.

## 🎯 Project Overview

This project provides comprehensive tools and documentation for reverse-engineering the p5.js Web Editor API to enable programmatic sketch creation and management.

### What's Included

- **📚 Research Documentation** - Detailed findings about API endpoints and authentication
- **🔍 Browser Capture Tool** - JavaScript tool to intercept and log API calls
- **🧪 Test Scripts** - Working examples in Node.js, Python, and Bash
- **📖 API Documentation** - Comprehensive endpoint reference
- **💡 Examples** - Real-world usage scenarios

### What You Can Do

✅ Create sketches programmatically
✅ Update existing sketches
✅ Fetch sketch data
✅ List user's sketches
✅ Delete sketches
✅ Understand API authentication methods

---

## 📁 Project Structure

```
p5-api-reverse-engineering/
├── README.md                           # This file
├── docs/
│   ├── RESEARCH_FINDINGS.md           # Detailed research and findings
│   ├── API_REFERENCE.md               # API endpoint documentation
│   └── AUTHENTICATION.md              # Authentication methods guide
├── scripts/
│   ├── browser-api-capture.js         # Browser-based API capture tool
│   ├── test-upload.js                 # Node.js test script
│   ├── test-upload.py                 # Python test script
│   └── test-upload.sh                 # Bash/curl test script
├── examples/
│   ├── create-simple-sketch.js        # Basic sketch creation
│   ├── create-animated-sketch.js      # Animated sketch example
│   ├── batch-upload.js                # Upload multiple sketches
│   └── netlify-function-example.js    # Netlify serverless function
└── research/
    └── captured-requests.json         # Sample captured API requests
```

---

## 🚀 Quick Start

### Step 1: Clone and Setup

```bash
cd p5-api-reverse-engineering
```

### Step 2: Choose Your Tool

Pick the tool that matches your preference:

- **Browser DevTools** - Best for discovering new endpoints
- **Node.js** - Best for JavaScript developers
- **Python** - Best for Python developers
- **Bash/curl** - Best for quick tests and shell scripting

### Step 3: Get Authentication

You need authentication to use the API. Two methods:

#### Method A: Session Cookie (Recommended, Always Works)

1. Open https://editor.p5js.org and log in
2. Open DevTools (F12) → Application → Cookies
3. Find and copy the `connect.sid` cookie value
4. Use it in your scripts

#### Method B: Personal Access Token (If Available)

1. Log into https://editor.p5js.org
2. Go to Account Settings
3. Look for "API Tokens" or "Personal Access Tokens"
4. Generate a token
5. Use it with HTTP Basic Auth

---

## 🔍 Tool 1: Browser API Capture

**Purpose:** Discover and document API endpoints by intercepting real browser traffic.

### How to Use

1. **Open the p5.js editor:**
   ```
   https://editor.p5js.org
   ```

2. **Open DevTools Console (F12)**

3. **Paste the capture script:**
   ```javascript
   // Copy the contents of scripts/browser-api-capture.js
   // Paste into console and press Enter
   ```

4. **Use the editor normally:**
   - Create a new sketch
   - Save it
   - Update it
   - Observe captured API calls in console

5. **View captured data:**
   ```javascript
   // View all captured requests
   capturedRequests

   // Show API endpoint summary
   showCapturedAPI()

   // Export to JSON
   exportCapturedRequests()

   // Filter by pattern
   filterCapturedRequests('/api/projects')

   // Extract cookies
   extractCookies()
   ```

### What You'll See

```
📤 Outgoing Request
POST https://editor.p5js.org/api/projects
🔑 Using Session Cookie Authentication
Request Body: {
  "name": "My Sketch",
  "files": [...]
}

📥 Response Received
✅ 200 OK
Response Body: {
  "id": "abc123",
  "name": "My Sketch",
  ...
}
```

---

## 🧪 Tool 2: Node.js Test Script

**Purpose:** Programmatically create and manage sketches using JavaScript.

### Prerequisites

```bash
npm install axios
```

### Configuration

Edit `scripts/test-upload.js`:

```javascript
// Method 1: Session Cookie
const SESSION_COOKIE = 'paste_your_cookie_here';
const USE_TOKEN_AUTH = false;

// OR Method 2: Personal Access Token
const USERNAME = 'your_username';
const ACCESS_TOKEN = 'your_token';
const USE_TOKEN_AUTH = true;
```

### Run the Tests

```bash
node scripts/test-upload.js
```

### Expected Output

```
╔════════════════════════════════════════════════════════════════╗
║    p5.js Web Editor API - Upload Test Suite                   ║
╚════════════════════════════════════════════════════════════════╝

🔍 Testing Authentication...
✅ Authentication successful!

📝 Creating sketch: "Test Sketch - Basic"...
✅ Sketch created successfully!

📊 Project Details:
  ID: abc123
  Name: Test Sketch - Basic
  Owner: your_username

🔗 Sketch URL:
   https://editor.p5js.org/your_username/sketches/abc123

✅ All tests completed successfully!
```

### Use as Module

```javascript
const { createSketch, getProject, updateSketch } = require('./scripts/test-upload.js');

// Create a sketch
const project = await createSketch({
  name: 'My Custom Sketch',
  files: [...]
});

// Get project details
const details = await getProject(project.id);

// Update the sketch
await updateSketch(project.id, {
  name: 'Updated Name',
  files: [...]
});
```

---

## 🐍 Tool 3: Python Test Script

**Purpose:** Programmatically manage sketches using Python.

### Prerequisites

```bash
pip install requests
```

### Configuration

Edit `scripts/test-upload.py`:

```python
# Method 1: Session Cookie
SESSION_COOKIE = "paste_your_cookie_here"
USE_TOKEN_AUTH = False

# OR Method 2: Personal Access Token
USERNAME = "your_username"
ACCESS_TOKEN = "your_token"
USE_TOKEN_AUTH = True
```

### Run the Tests

```bash
python scripts/test-upload.py
```

### Use as Module

```python
from test_upload import P5APIClient

# Create client
client = P5APIClient(session_cookie="your_cookie")

# Create a sketch
project = client.create_sketch({
    "name": "My Python Sketch",
    "files": [...]
})

# Get project details
details = client.get_project(project['id'])

# Update sketch
client.update_sketch(project['id'], {
    "name": "Updated Name",
    "files": [...]
})
```

---

## 💻 Tool 4: Bash/curl Script

**Purpose:** Quick testing and shell script integration.

### Prerequisites

```bash
# curl (usually pre-installed)
# jq (optional, for pretty JSON)
sudo apt install jq  # Ubuntu/Debian
brew install jq      # macOS
```

### Configuration

Edit `scripts/test-upload.sh`:

```bash
# Method 1: Session Cookie
SESSION_COOKIE="paste_your_cookie_here"
AUTH_METHOD="cookie"

# OR Method 2: Personal Access Token
USERNAME="your_username"
ACCESS_TOKEN="your_token"
AUTH_METHOD="token"
```

### Run the Tests

```bash
chmod +x scripts/test-upload.sh
./scripts/test-upload.sh
```

### Use in Your Own Scripts

```bash
#!/bin/bash

# Source the functions
source scripts/test-upload.sh

# Call API
create_sketch
get_project
list_user_sketches
```

---

## 📚 Documentation

### 1. Research Findings

Read `docs/RESEARCH_FINDINGS.md` for:
- Detailed API endpoint discovery process
- Authentication method analysis
- File structure requirements
- Error handling
- Rate limiting considerations
- Legal and ethical considerations

### 2. API Reference

Read `docs/API_REFERENCE.md` for:
- Complete endpoint documentation
- Request/response formats
- Required parameters
- Example requests
- Error codes

### 3. Authentication Guide

Read `docs/AUTHENTICATION.md` for:
- Detailed authentication methods
- Session cookie extraction
- Personal Access Token setup
- Security best practices
- Troubleshooting

---

## 💡 Usage Examples

### Example 1: Create a Simple Sketch

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `connect.sid=${YOUR_SESSION_COOKIE}`
  }
});

const sketch = await client.post('/projects', {
  name: 'My Circle',
  files: [
    {
      name: 'sketch.js',
      content: `
        function setup() {
          createCanvas(400, 400);
        }

        function draw() {
          background(220);
          circle(200, 200, 100);
        }
      `,
      fileType: 'file'
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
            <script src="sketch.js"></script>
          </head>
          <body></body>
        </html>`,
      fileType: 'file'
    }
  ]
});

console.log(`Sketch URL: https://editor.p5js.org/${sketch.data.owner.username}/sketches/${sketch.data.id}`);
```

### Example 2: Batch Upload Multiple Sketches

See `examples/batch-upload.js` for a complete working example.

### Example 3: Netlify Serverless Function

See `examples/netlify-function-example.js` for integrating with Netlify Functions.

---

## 🔐 Security Considerations

### ⚠️ Important Warnings

1. **Never commit cookies or tokens to git**
   - Add them to `.gitignore`
   - Use environment variables

2. **Session cookies expire**
   - Typical expiration: 24 hours of inactivity
   - Implement refresh logic for long-running scripts

3. **Don't share your session cookie**
   - It grants full access to your account
   - Treat it like a password

4. **Rate limiting**
   - API may have rate limits
   - Implement exponential backoff
   - Add delays between requests

### Best Practices

```javascript
// Use environment variables
const SESSION_COOKIE = process.env.P5_SESSION_COOKIE;

// Add to .gitignore
echo ".env" >> .gitignore
echo "*.cookie" >> .gitignore

// Create .env file
cat > .env << EOF
P5_SESSION_COOKIE=your_cookie_here
P5_USERNAME=your_username
P5_ACCESS_TOKEN=your_token
EOF

// Load in your script
require('dotenv').config();
```

---

## 🤝 Contributing

### How to Contribute

1. **Test the API**
   - Run the capture tool
   - Document new endpoints you discover
   - Report findings in issues

2. **Improve documentation**
   - Fix typos and unclear sections
   - Add more examples
   - Translate to other languages

3. **Add features**
   - Create new test scenarios
   - Add support for more languages
   - Improve error handling

4. **Share findings**
   - Report issues on the p5.js-web-editor GitHub
   - Help others on forums
   - Write tutorials

### Research Priorities

- [ ] Test Personal Access Token generation
- [ ] Document asset upload (images, sounds)
- [ ] Map collection/folder management API
- [ ] Test rate limiting behavior
- [ ] Document CORS policies
- [ ] Test webhook endpoints (if any)

---

## 📖 Resources

### Official p5.js Resources

- **GitHub Repo:** https://github.com/processing/p5.js-web-editor
- **API Auth Issue #541:** https://github.com/processing/p5.js-web-editor/issues/541
- **Processing Foundation:** https://processingfoundation.org
- **Contact:** hello@processingfoundation.org

### Related Projects

- **p5mirrorLib:** https://github.com/molab-itp/p5mirror
  - For downloading/mirroring sketches
  - Does NOT upload to editor

- **p5.js Documentation:** https://p5js.org/reference/

### Community

- **Processing Forum:** https://discourse.processing.org/
- **p5.js Discord:** https://discord.gg/processingfoundation
- **GitHub Discussions:** https://github.com/processing/p5.js-web-editor/discussions

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error

**Cause:** Invalid or expired session cookie

**Solution:**
1. Get a fresh session cookie from browser
2. Make sure you're logged in
3. Check cookie is complete (they're long!)

### Issue: "CORS Error" in Browser

**Cause:** Browser same-origin policy

**Solution:**
1. Use the scripts (Node/Python/Bash) instead
2. Or use a backend proxy (Netlify Function)
3. Browser capture tool must run ON editor.p5js.org

### Issue: "404 Not Found" on API Endpoint

**Cause:** Endpoint doesn't exist or URL is wrong

**Solution:**
1. Use the browser capture tool to verify endpoint
2. Check for typos in URL
3. API may have changed - update scripts

### Issue: Cookie Expires Too Quickly

**Cause:** Server-side session timeout

**Solution:**
1. Use Personal Access Tokens instead (if available)
2. Implement cookie refresh logic
3. For development, keep browser logged in

### Issue: Personal Access Token Not Working

**Cause:** Feature may not be deployed to production

**Solution:**
1. Check Account Settings for token UI
2. Test with `/api/auth/access-check` endpoint
3. Fall back to session cookie method
4. Report findings to Processing Foundation

---

## 📝 License

This research project is for educational purposes. The p5.js Web Editor is:
- **License:** LGPL-2.1
- **Copyright:** Processing Foundation

Please respect:
- Don't abuse the API
- Don't scrape user data
- Don't use for commercial purposes without permission
- Consider contributing to official API documentation

---

## 🎓 Educational Use

This project is designed for:
- **Learning** web API reverse engineering
- **Understanding** authentication mechanisms
- **Practicing** API integration
- **Contributing** to open source documentation

**Not intended for:**
- Commercial use without permission
- Circumventing security measures
- Violating Terms of Service
- Scraping private user data

---

## 📧 Contact

**For questions about this research project:**
- Open an issue on GitHub
- Contact via ITP/NYU if applicable

**For official API access:**
- Contact Processing Foundation: hello@processingfoundation.org
- Comment on Issue #541: https://github.com/processing/p5.js-web-editor/issues/541

---

## 🙏 Acknowledgments

- **Processing Foundation** - For creating p5.js and the web editor
- **ITP/NYU** - For supporting creative coding education
- **Open Source Community** - For documentation and discussion

---

## 📅 Changelog

### 2025-01-15 - Initial Release

- ✅ Created browser API capture tool
- ✅ Implemented Node.js test script
- ✅ Implemented Python test script
- ✅ Implemented Bash/curl test script
- ✅ Documented authentication methods
- ✅ Mapped core API endpoints
- ✅ Created usage examples
- ✅ Wrote comprehensive documentation

### Next Steps

- [ ] Test Personal Access Token generation
- [ ] Document asset upload endpoints
- [ ] Create video tutorial
- [ ] Contribute findings to p5.js project

---

**Status:** Active Development 🚧

Last Updated: 2025-01-15
