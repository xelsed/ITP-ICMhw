#!/usr/bin/env node

/**
 * p5.js Web Editor API - Sketch Upload Test Script
 *
 * PURPOSE: Test uploading sketches to editor.p5js.org programmatically
 *
 * REQUIREMENTS:
 * - Node.js 14+
 * - npm install axios
 *
 * SETUP:
 * 1. Log into editor.p5js.org in your browser
 * 2. Open DevTools → Application → Cookies
 * 3. Copy the value of 'connect.sid' cookie
 * 4. Paste it in the SESSION_COOKIE variable below
 *
 * OR (if Personal Access Tokens are working):
 * 1. Generate token in Account Settings
 * 2. Set USERNAME and ACCESS_TOKEN variables
 *
 * USAGE:
 * node test-upload.js
 */

const axios = require('axios');

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================

// Method 1: Session Cookie (copy from browser DevTools)
const SESSION_COOKIE = 'YOUR_SESSION_COOKIE_HERE';

// Method 2: Personal Access Token (if available)
const USERNAME = 'your_username';
const ACCESS_TOKEN = 'your_personal_access_token';

// Which authentication method to use
const USE_TOKEN_AUTH = false; // Set to true to use token, false for cookie

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = 'https://editor.p5js.org/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'p5-api-test-client/1.0'
  }
});

// Add authentication to requests
apiClient.interceptors.request.use(config => {
  if (USE_TOKEN_AUTH) {
    // Method 1: HTTP Basic Auth with Personal Access Token
    const auth = Buffer.from(`${USERNAME}:${ACCESS_TOKEN}`).toString('base64');
    config.headers.Authorization = `Basic ${auth}`;
    console.log('🔑 Using Token Authentication');
  } else {
    // Method 2: Session Cookie
    config.headers.Cookie = `connect.sid=${SESSION_COOKIE}`;
    config.withCredentials = true;
    console.log('🔑 Using Session Cookie Authentication');
  }
  return config;
});

// Log requests and responses
apiClient.interceptors.request.use(config => {
  console.log(`\n📤 ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  response => {
    console.log(`✅ ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    if (error.response) {
      console.log(`❌ ${error.response.status} ${error.response.statusText}`);
      console.log('Response:', error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// SKETCH TEMPLATES
// ============================================================================

const TEMPLATE_BASIC = {
  name: 'Test Sketch - Basic',
  files: [
    {
      name: 'sketch.js',
      content: `function setup() {
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
  text(\`x: \${mouseX}, y: \${mouseY}\`, width / 2, 20);
}`,
      fileType: 'file'
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html>
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
</html>`,
      fileType: 'file'
    }
  ]
};

const TEMPLATE_ANIMATION = {
  name: 'Test Sketch - Animation',
  files: [
    {
      name: 'sketch.js',
      content: `let angle = 0;

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
}`,
      fileType: 'file'
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html>
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
</html>`,
      fileType: 'file'
    }
  ]
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Test authentication by checking access
 */
async function testAuthentication() {
  console.log('\n🔍 Testing Authentication...');
  try {
    // Try the test endpoint if it exists
    const response = await apiClient.get('/auth/access-check');
    console.log('✅ Authentication successful!');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Test endpoint not found (this is okay)');
      return null; // Unknown, endpoint doesn't exist
    }
    console.log('❌ Authentication failed');
    return false;
  }
}

/**
 * Create a new sketch
 */
async function createSketch(sketchData) {
  console.log(`\n📝 Creating sketch: "${sketchData.name}"...`);

  try {
    const response = await apiClient.post('/projects', sketchData);

    const project = response.data;
    console.log('✅ Sketch created successfully!');
    console.log('\n📊 Project Details:');
    console.log('  ID:', project.id);
    console.log('  Name:', project.name);
    console.log('  Owner:', project.owner?.username || project.user?.username);
    console.log('  Created:', project.createdAt);

    const username = project.owner?.username || project.user?.username || USERNAME;
    const sketchUrl = `https://editor.p5js.org/${username}/sketches/${project.id}`;
    console.log('\n🔗 Sketch URL:');
    console.log('  ', sketchUrl);
    console.log('\n🎨 Full View:');
    console.log('  ', `https://editor.p5js.org/${username}/full/${project.id}`);

    return project;
  } catch (error) {
    console.log('❌ Failed to create sketch');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Get project details
 */
async function getProject(projectId) {
  console.log(`\n🔍 Fetching project ${projectId}...`);

  try {
    const response = await apiClient.get(`/projects/${projectId}`);
    console.log('✅ Project fetched successfully');
    return response.data;
  } catch (error) {
    console.log('❌ Failed to fetch project');
    throw error;
  }
}

/**
 * Update a sketch
 */
async function updateSketch(projectId, updates) {
  console.log(`\n✏️  Updating sketch ${projectId}...`);

  try {
    const response = await apiClient.put(`/projects/${projectId}`, updates);
    console.log('✅ Sketch updated successfully');
    return response.data;
  } catch (error) {
    console.log('❌ Failed to update sketch');
    throw error;
  }
}

/**
 * Delete a sketch
 */
async function deleteSketch(projectId) {
  console.log(`\n🗑️  Deleting sketch ${projectId}...`);

  try {
    await apiClient.delete(`/projects/${projectId}`);
    console.log('✅ Sketch deleted successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to delete sketch');
    throw error;
  }
}

/**
 * List user's sketches (public endpoint, no auth needed)
 */
async function listUserSketches(username) {
  console.log(`\n📋 Listing sketches for user: ${username}...`);

  try {
    const response = await axios.get(`${API_BASE_URL}/${username}/sketches`);
    console.log(`✅ Found ${response.data.length} sketches`);

    response.data.slice(0, 5).forEach((sketch, i) => {
      console.log(`\n  ${i + 1}. ${sketch.name}`);
      console.log(`     ID: ${sketch.id}`);
      console.log(`     Updated: ${sketch.updatedAt}`);
    });

    if (response.data.length > 5) {
      console.log(`\n  ... and ${response.data.length - 5} more`);
    }

    return response.data;
  } catch (error) {
    console.log('❌ Failed to list sketches');
    throw error;
  }
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Run all tests
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    p5.js Web Editor API - Upload Test Suite                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    // Test 1: Authentication
    await testAuthentication();

    // Test 2: Create a basic sketch
    const project = await createSketch(TEMPLATE_BASIC);

    // Test 3: Fetch the created project
    await getProject(project.id);

    // Test 4: Update the sketch
    const updates = {
      name: 'Test Sketch - Updated',
      files: TEMPLATE_ANIMATION.files
    };
    await updateSketch(project.id, updates);

    // Test 5: List user's sketches
    if (USERNAME !== 'your_username') {
      await listUserSketches(USERNAME);
    }

    // Test 6: Clean up (optional - comment out if you want to keep the sketch)
    // await deleteSketch(project.id);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║    ✅ All tests completed successfully!                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║    ❌ Tests failed                                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateConfig() {
  console.log('🔧 Validating configuration...');

  if (!USE_TOKEN_AUTH && SESSION_COOKIE === 'YOUR_SESSION_COOKIE_HERE') {
    console.error('\n❌ ERROR: SESSION_COOKIE not configured!');
    console.error('\n📖 Instructions:');
    console.error('1. Log into editor.p5js.org in your browser');
    console.error('2. Open DevTools (F12) → Application → Cookies');
    console.error('3. Copy the value of "connect.sid" cookie');
    console.error('4. Paste it in this script as SESSION_COOKIE');
    console.error('\nOR set USE_TOKEN_AUTH = true and configure token credentials\n');
    process.exit(1);
  }

  if (USE_TOKEN_AUTH && (USERNAME === 'your_username' || ACCESS_TOKEN === 'your_personal_access_token')) {
    console.error('\n❌ ERROR: Token credentials not configured!');
    console.error('\n📖 Instructions:');
    console.error('1. Log into editor.p5js.org');
    console.error('2. Go to Account Settings');
    console.error('3. Generate a Personal Access Token');
    console.error('4. Set USERNAME and ACCESS_TOKEN in this script');
    console.error('\nOR set USE_TOKEN_AUTH = false and use session cookie instead\n');
    process.exit(1);
  }

  console.log('✅ Configuration valid\n');
}

// ============================================================================
// MAIN
// ============================================================================

if (require.main === module) {
  // Check if axios is installed
  try {
    require.resolve('axios');
  } catch (e) {
    console.error('❌ axios is not installed!');
    console.error('Run: npm install axios');
    process.exit(1);
  }

  validateConfig();
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export functions for use as module
module.exports = {
  createSketch,
  getProject,
  updateSketch,
  deleteSketch,
  listUserSketches
};
