# Quick Start Guide

Get started with the p5.js Web Editor API in 5 minutes.

---

## 1. Get Your Session Cookie (2 minutes)

### Steps:

1. **Open https://editor.p5js.org** in Chrome

2. **Log in** to your account

3. **Open DevTools**
   - Press `F12`
   - Or right-click → Inspect

4. **Go to Application tab** → Cookies → https://editor.p5js.org

5. **Find cookie named `connect.sid`**

6. **Copy its value** (looks like: `s%3AaBcDeFgHiJkLmNoPqRsTuVwXyZ...`)

---

## 2. Choose Your Tool

Pick whichever language you prefer:

### Option A: Node.js (Recommended)

```bash
# Install dependencies
npm install

# Set your cookie
export P5_SESSION_COOKIE="paste_your_cookie_here"

# Run test
npm test

# Or run examples
npm run example:simple
npm run example:batch
```

### Option B: Python

```bash
# Install dependencies
pip install requests

# Set your cookie
export P5_SESSION_COOKIE="paste_your_cookie_here"

# Run test
python scripts/test-upload.py
```

### Option C: Bash

```bash
# Edit the script and paste your cookie
nano scripts/test-upload.sh

# Run
./scripts/test-upload.sh
```

### Option D: Browser (Discovery Mode)

1. Open https://editor.p5js.org
2. Open DevTools Console (F12)
3. Copy and paste `scripts/browser-api-capture.js`
4. Use the editor normally
5. Run `showCapturedAPI()` to see endpoints

---

## 3. Create Your First Sketch (1 minute)

### Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Cookie': `connect.sid=${process.env.P5_SESSION_COOKIE}`
  }
});

const sketch = await client.post('/projects', {
  name: 'My First API Sketch',
  files: [
    {
      name: 'sketch.js',
      content: `
        function setup() {
          createCanvas(400, 400);
        }

        function draw() {
          background(220);
          circle(mouseX, mouseY, 50);
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

console.log('Created:', sketch.data.id);
```

### Python

```python
import requests
import os

session = requests.Session()
session.cookies.set('connect.sid', os.environ['P5_SESSION_COOKIE'],
                    domain='editor.p5js.org')

sketch = session.post('https://editor.p5js.org/api/projects', json={
    'name': 'My First API Sketch',
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
            ''',
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
                </html>''',
            'fileType': 'file'
        }
    ]
})

print('Created:', sketch.json()['id'])
```

### curl

```bash
curl -X POST https://editor.p5js.org/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=$P5_SESSION_COOKIE" \
  -d '{
    "name": "My First API Sketch",
    "files": [
      {
        "name": "sketch.js",
        "content": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n  circle(mouseX, mouseY, 50);\n}",
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

## 4. View Your Sketch

The API will return a project ID. Access your sketch at:

```
https://editor.p5js.org/YOUR_USERNAME/sketches/PROJECT_ID
```

Or full view:

```
https://editor.p5js.org/YOUR_USERNAME/full/PROJECT_ID
```

---

## Common Operations

### Get a sketch

```javascript
const sketch = await client.get('/projects/PROJECT_ID');
```

### Update a sketch

```javascript
await client.put('/projects/PROJECT_ID', {
  name: 'Updated Name',
  files: [...]
});
```

### Delete a sketch

```javascript
await client.delete('/projects/PROJECT_ID');
```

### List your sketches

```javascript
const sketches = await axios.get(
  'https://editor.p5js.org/api/YOUR_USERNAME/sketches'
);
```

---

## Troubleshooting

### "Unauthorized" Error

Your cookie expired. Get a fresh one:
1. Log out of editor.p5js.org
2. Log back in
3. Get new cookie from DevTools
4. Update environment variable

### "CORS Error" in Browser

Can't make API requests from different domains in browser.

**Solutions:**
- Use Node.js/Python/bash scripts instead
- Or use the browser capture tool ON editor.p5js.org
- Or use a backend proxy (Netlify Function)

### Cookie Not Working

Make sure you copied the entire value:
- Should start with `s%3A`
- Should be very long (100+ characters)
- Should not include the cookie name, just the value

---

## Next Steps

📚 **Read the docs:**
- [Research Findings](docs/RESEARCH_FINDINGS.md) - Detailed API analysis
- [Authentication Guide](docs/AUTHENTICATION.md) - Complete auth documentation
- [API Reference](docs/API_REFERENCE.md) - Full endpoint documentation

💡 **Try the examples:**
- `examples/create-simple-sketch.js` - Basic sketch creation
- `examples/batch-upload.js` - Upload multiple sketches
- `examples/netlify-function-example.js` - Serverless integration

🔍 **Explore the API:**
- Use `scripts/browser-api-capture.js` to discover endpoints
- Try different sketch structures
- Document your findings

---

## Security Reminder

⚠️ **Never commit your session cookie!**

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "*.cookie" >> .gitignore

# Use environment variables
export P5_SESSION_COOKIE="your_cookie"

# Or .env file
cat > .env << EOF
P5_SESSION_COOKIE=your_cookie_here
EOF
```

---

## Need Help?

- 📖 Read [AUTHENTICATION.md](docs/AUTHENTICATION.md)
- 📖 Read [API_REFERENCE.md](docs/API_REFERENCE.md)
- 🐛 Check [Troubleshooting](README.md#troubleshooting)
- 💬 Ask on [Processing Forum](https://discourse.processing.org/)
- 📧 Contact Processing Foundation: hello@processingfoundation.org

---

**You're all set! Start creating sketches programmatically! 🎨**
