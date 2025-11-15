#!/usr/bin/env node

/**
 * Batch Upload Example
 *
 * Demonstrates uploading multiple sketches programmatically.
 * Includes error handling, rate limiting, and progress tracking.
 *
 * USAGE:
 * 1. Set environment variable: export P5_SESSION_COOKIE="your_cookie"
 * 2. Run: node batch-upload.js
 */

const axios = require('axios');

// Configuration
const SESSION_COOKIE = process.env.P5_SESSION_COOKIE;
const DELAY_BETWEEN_UPLOADS = 2000; // 2 seconds between uploads

if (!SESSION_COOKIE) {
  console.error('❌ P5_SESSION_COOKIE not set. See AUTHENTICATION.md');
  process.exit(1);
}

// Create API client
const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `connect.sid=${SESSION_COOKIE}`
  },
  timeout: 10000
});

// Helper to create delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Collection of sketches to upload
const sketches = [
  {
    name: 'Bouncing Ball',
    code: `let x, y;
let xSpeed, ySpeed;

function setup() {
  createCanvas(400, 400);
  x = width / 2;
  y = height / 2;
  xSpeed = 3;
  ySpeed = 2;
}

function draw() {
  background(220);

  // Draw ball
  fill(255, 0, 0);
  circle(x, y, 50);

  // Move ball
  x += xSpeed;
  y += ySpeed;

  // Bounce off edges
  if (x < 25 || x > width - 25) {
    xSpeed *= -1;
  }
  if (y < 25 || y > height - 25) {
    ySpeed *= -1;
  }
}`
  },
  {
    name: 'Random Circles',
    code: `function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  // Draw random circle on mouse press
  if (mouseIsPressed) {
    fill(random(255), random(255), random(255));
    circle(mouseX, mouseY, random(20, 60));
  }
}`
  },
  {
    name: 'Rainbow Background',
    code: `let hue = 0;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(hue, 80, 100);
  hue = (hue + 1) % 360;

  // Display color value
  fill(0);
  textAlign(CENTER);
  textSize(24);
  text('Hue: ' + hue, width / 2, height / 2);
}`
  },
  {
    name: 'Mouse Trail',
    code: `let points = [];

function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  background(220, 10); // Fade effect

  // Add current mouse position
  if (mouseIsPressed) {
    points.push({ x: mouseX, y: mouseY });
  }

  // Draw all points
  fill(255, 0, 0);
  noStroke();
  for (let p of points) {
    circle(p.x, p.y, 10);
  }

  // Clear old points
  if (points.length > 100) {
    points.shift();
  }
}

function mousePressed() {
  points = []; // Clear on click
}`
  },
  {
    name: 'Clock',
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  translate(width / 2, height / 2);

  // Clock face
  stroke(0);
  strokeWeight(4);
  noFill();
  circle(0, 0, 300);

  // Hour hand
  let h = hour() % 12;
  let hAngle = map(h, 0, 12, 0, TWO_PI) - HALF_PI;
  strokeWeight(8);
  line(0, 0, cos(hAngle) * 70, sin(hAngle) * 70);

  // Minute hand
  let m = minute();
  let mAngle = map(m, 0, 60, 0, TWO_PI) - HALF_PI;
  strokeWeight(6);
  line(0, 0, cos(mAngle) * 100, sin(mAngle) * 100);

  // Second hand
  let s = second();
  let sAngle = map(s, 0, 60, 0, TWO_PI) - HALF_PI;
  stroke(255, 0, 0);
  strokeWeight(2);
  line(0, 0, cos(sAngle) * 120, sin(sAngle) * 120);
}`
  }
];

// Create sketch helper
async function createSketch(name, code) {
  const sketchData = {
    name: name,
    files: [
      {
        name: 'sketch.js',
        content: code,
        fileType: 'file'
      },
      {
        name: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
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

  const response = await client.post('/projects', sketchData);
  return response.data;
}

// Batch upload with error handling
async function batchUpload() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    p5.js Batch Upload                                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📦 Uploading ${sketches.length} sketches...\n`);

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < sketches.length; i++) {
    const { name, code } = sketches[i];
    const progress = `[${i + 1}/${sketches.length}]`;

    try {
      console.log(`${progress} 🚀 Uploading "${name}"...`);

      const project = await createSketch(name, code);
      const username = project.owner?.username || project.user?.username;
      const url = `https://editor.p5js.org/${username}/sketches/${project.id}`;

      results.success.push({ name, url, id: project.id });

      console.log(`${progress} ✅ Success: ${url}\n`);

      // Rate limiting: wait between uploads
      if (i < sketches.length - 1) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_UPLOADS}ms before next upload...\n`);
        await delay(DELAY_BETWEEN_UPLOADS);
      }

    } catch (error) {
      results.failed.push({ name, error: error.message });
      console.error(`${progress} ❌ Failed: ${name}`);
      console.error(`   Error: ${error.message}\n`);

      // If authentication failed, stop
      if (error.response?.status === 401) {
        console.error('❌ Authentication failed. Session cookie expired?');
        break;
      }

      // Continue with other uploads
      await delay(DELAY_BETWEEN_UPLOADS);
    }
  }

  // Print summary
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    Upload Complete                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`✅ Successful: ${results.success.length}/${sketches.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${sketches.length}\n`);

  if (results.success.length > 0) {
    console.log('📋 Successful Uploads:');
    results.success.forEach(({ name, url }) => {
      console.log(`  • ${name}`);
      console.log(`    ${url}`);
    });
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('⚠️  Failed Uploads:');
    results.failed.forEach(({ name, error }) => {
      console.log(`  • ${name}: ${error}`);
    });
    console.log();
  }

  // Export results to JSON
  const resultsJson = JSON.stringify(results, null, 2);
  require('fs').writeFileSync('upload-results.json', resultsJson);
  console.log('💾 Results saved to upload-results.json');
}

// Run
batchUpload().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
