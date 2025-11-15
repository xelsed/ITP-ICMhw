#!/usr/bin/env python3
"""
p5.js Web Editor API - Sketch Upload Test Script (Python)

PURPOSE: Test uploading sketches to editor.p5js.org programmatically using Python

REQUIREMENTS:
- Python 3.7+
- pip install requests

SETUP:
1. Log into editor.p5js.org in your browser
2. Open DevTools → Application → Cookies
3. Copy the value of 'connect.sid' cookie
4. Paste it in the SESSION_COOKIE variable below

OR (if Personal Access Tokens are working):
1. Generate token in Account Settings
2. Set USERNAME and ACCESS_TOKEN variables

USAGE:
python test-upload.py
"""

import requests
import json
import base64
import sys
from typing import Dict, List, Optional
from datetime import datetime

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

# Method 1: Session Cookie (copy from browser DevTools)
SESSION_COOKIE = "YOUR_SESSION_COOKIE_HERE"

# Method 2: Personal Access Token (if available)
USERNAME = "your_username"
ACCESS_TOKEN = "your_personal_access_token"

# Which authentication method to use
USE_TOKEN_AUTH = False  # Set to True to use token, False for cookie

# ============================================================================
# API CLIENT CONFIGURATION
# ============================================================================

API_BASE_URL = "https://editor.p5js.org/api"


class P5APIClient:
    """Client for interacting with p5.js Web Editor API"""

    def __init__(self, session_cookie: Optional[str] = None,
                 username: Optional[str] = None,
                 access_token: Optional[str] = None):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'p5-api-test-client-python/1.0'
        })

        # Setup authentication
        if access_token and username:
            # Method 1: HTTP Basic Auth with Personal Access Token
            auth_string = f"{username}:{access_token}"
            auth_bytes = auth_string.encode('utf-8')
            auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
            self.session.headers['Authorization'] = f'Basic {auth_b64}'
            print("🔑 Using Token Authentication")
        elif session_cookie:
            # Method 2: Session Cookie
            self.session.cookies.set('connect.sid', session_cookie,
                                    domain='editor.p5js.org')
            print("🔑 Using Session Cookie Authentication")
        else:
            print("⚠️  No authentication configured")

    def _request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with logging"""
        url = f"{self.base_url}{endpoint}"
        print(f"\n📤 {method.upper()} {endpoint}")

        try:
            response = self.session.request(method, url, **kwargs)
            print(f"✅ {response.status_code} {response.reason}")
            return response
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            raise

    def test_authentication(self) -> Optional[bool]:
        """Test authentication by checking access"""
        print("\n🔍 Testing Authentication...")
        try:
            response = self._request('GET', '/auth/access-check')
            if response.status_code == 200:
                print("✅ Authentication successful!")
                return True
            else:
                print("❌ Authentication failed")
                return False
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                print("⚠️  Test endpoint not found (this is okay)")
                return None
            print("❌ Authentication failed")
            return False

    def create_sketch(self, sketch_data: Dict) -> Dict:
        """Create a new sketch"""
        print(f'\n📝 Creating sketch: "{sketch_data["name"]}"...')

        response = self._request('POST', '/projects', json=sketch_data)
        response.raise_for_status()

        project = response.json()
        print("✅ Sketch created successfully!")
        print("\n📊 Project Details:")
        print(f"  ID: {project.get('id')}")
        print(f"  Name: {project.get('name')}")

        owner = project.get('owner') or project.get('user', {})
        username = owner.get('username') if isinstance(owner, dict) else str(owner)
        print(f"  Owner: {username}")
        print(f"  Created: {project.get('createdAt')}")

        sketch_url = f"https://editor.p5js.org/{username}/sketches/{project['id']}"
        print("\n🔗 Sketch URL:")
        print(f"   {sketch_url}")
        print("\n🎨 Full View:")
        print(f"   https://editor.p5js.org/{username}/full/{project['id']}")

        return project

    def get_project(self, project_id: str) -> Dict:
        """Get project details"""
        print(f"\n🔍 Fetching project {project_id}...")

        response = self._request('GET', f'/projects/{project_id}')
        response.raise_for_status()

        print("✅ Project fetched successfully")
        return response.json()

    def update_sketch(self, project_id: str, updates: Dict) -> Dict:
        """Update a sketch"""
        print(f"\n✏️  Updating sketch {project_id}...")

        response = self._request('PUT', f'/projects/{project_id}', json=updates)
        response.raise_for_status()

        print("✅ Sketch updated successfully")
        return response.json()

    def delete_sketch(self, project_id: str) -> bool:
        """Delete a sketch"""
        print(f"\n🗑️  Deleting sketch {project_id}...")

        response = self._request('DELETE', f'/projects/{project_id}')
        response.raise_for_status()

        print("✅ Sketch deleted successfully")
        return True

    def list_user_sketches(self, username: str) -> List[Dict]:
        """List user's sketches (public endpoint, no auth needed)"""
        print(f"\n📋 Listing sketches for user: {username}...")

        # This endpoint doesn't require authentication
        response = requests.get(f"{self.base_url}/{username}/sketches")
        response.raise_for_status()

        sketches = response.json()
        print(f"✅ Found {len(sketches)} sketches")

        for i, sketch in enumerate(sketches[:5], 1):
            print(f"\n  {i}. {sketch['name']}")
            print(f"     ID: {sketch['id']}")
            print(f"     Updated: {sketch['updatedAt']}")

        if len(sketches) > 5:
            print(f"\n  ... and {len(sketches) - 5} more")

        return sketches


# ============================================================================
# SKETCH TEMPLATES
# ============================================================================

TEMPLATE_BASIC = {
    "name": "Test Sketch - Basic (Python)",
    "files": [
        {
            "name": "sketch.js",
            "content": """function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Draw a circle that follows the mouse
  fill(255, 0, 0);
  circle(mouseX, mouseY, 50);

  // Display coordinates
  fill(0);
  textAlign(CENTER);
  text(`x: ${mouseX}, y: ${mouseY}`, width / 2, 20);
}""",
            "fileType": "file"
        },
        {
            "name": "index.html",
            "content": """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Sketch</title>
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
</html>""",
            "fileType": "file"
        }
    ]
}

TEMPLATE_ANIMATION = {
    "name": "Test Sketch - Animation (Python)",
    "files": [
        {
            "name": "sketch.js",
            "content": """let angle = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  translate(width / 2, height / 2);
  rotate(angle);

  fill(255, 0, 0);
  rectMode(CENTER);
  rect(0, 0, 100, 100);

  angle += 0.01;
}""",
            "fileType": "file"
        },
        {
            "name": "index.html",
            "content": """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animation Test</title>
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
</html>""",
            "fileType": "file"
        }
    ]
}


# ============================================================================
# TEST SCENARIOS
# ============================================================================

def run_tests(client: P5APIClient):
    """Run all tests"""
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║    p5.js Web Editor API - Upload Test Suite (Python)          ║")
    print("╚════════════════════════════════════════════════════════════════╝")

    try:
        # Test 1: Authentication
        client.test_authentication()

        # Test 2: Create a basic sketch
        project = client.create_sketch(TEMPLATE_BASIC)

        # Test 3: Fetch the created project
        client.get_project(project['id'])

        # Test 4: Update the sketch
        updates = {
            "name": "Test Sketch - Updated (Python)",
            "files": TEMPLATE_ANIMATION["files"]
        }
        client.update_sketch(project['id'], updates)

        # Test 5: List user's sketches
        if USERNAME != "your_username":
            client.list_user_sketches(USERNAME)

        # Test 6: Clean up (optional - comment out if you want to keep the sketch)
        # client.delete_sketch(project['id'])

        print("\n╔════════════════════════════════════════════════════════════════╗")
        print("║    ✅ All tests completed successfully!                        ║")
        print("╚════════════════════════════════════════════════════════════════╝")

    except Exception as e:
        print("\n╔════════════════════════════════════════════════════════════════╗")
        print("║    ❌ Tests failed                                             ║")
        print("╚════════════════════════════════════════════════════════════════╝")
        print(f"\nError details: {e}")
        sys.exit(1)


# ============================================================================
# VALIDATION
# ============================================================================

def validate_config():
    """Validate configuration"""
    print("🔧 Validating configuration...")

    if not USE_TOKEN_AUTH and SESSION_COOKIE == "YOUR_SESSION_COOKIE_HERE":
        print("\n❌ ERROR: SESSION_COOKIE not configured!")
        print("\n📖 Instructions:")
        print("1. Log into editor.p5js.org in your browser")
        print("2. Open DevTools (F12) → Application → Cookies")
        print('3. Copy the value of "connect.sid" cookie')
        print("4. Paste it in this script as SESSION_COOKIE")
        print("\nOR set USE_TOKEN_AUTH = True and configure token credentials\n")
        sys.exit(1)

    if USE_TOKEN_AUTH and (USERNAME == "your_username" or ACCESS_TOKEN == "your_personal_access_token"):
        print("\n❌ ERROR: Token credentials not configured!")
        print("\n📖 Instructions:")
        print("1. Log into editor.p5js.org")
        print("2. Go to Account Settings")
        print("3. Generate a Personal Access Token")
        print("4. Set USERNAME and ACCESS_TOKEN in this script")
        print("\nOR set USE_TOKEN_AUTH = False and use session cookie instead\n")
        sys.exit(1)

    print("✅ Configuration valid\n")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point"""
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("❌ requests library is not installed!")
        print("Run: pip install requests")
        sys.exit(1)

    validate_config()

    # Create API client with appropriate auth
    if USE_TOKEN_AUTH:
        client = P5APIClient(username=USERNAME, access_token=ACCESS_TOKEN)
    else:
        client = P5APIClient(session_cookie=SESSION_COOKIE)

    run_tests(client)


if __name__ == "__main__":
    main()
