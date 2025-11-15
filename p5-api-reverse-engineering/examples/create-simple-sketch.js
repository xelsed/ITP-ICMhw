#!/usr/bin/env node

/**
 * Simple Sketch Creation Example
 *
 * Demonstrates the minimal code needed to create a p5.js sketch programmatically.
 *
 * USAGE:
 * 1. Set environment variable: export P5_SESSION_COOKIE="your_cookie"
 * 2. Run: node create-simple-sketch.js
 */

const axios = require('axios');

// Configuration
const SESSION_COOKIE = process.env.P5_SESSION_COOKIE;

if (!SESSION_COOKIE) {
  console.error('❌ Error: P5_SESSION_COOKIE environment variable not set');
  console.error('\n📖 Instructions:');
  console.error('1. Log into editor.p5js.org');
  console.error('2. Get session cookie from DevTools');
  console.error('3. Run: export P5_SESSION_COOKIE="your_cookie"');
  console.error('4. Try again');
  process.exit(1);
}

// Create API client
const client = axios.create({
  baseURL: 'https://editor.p5js.org/api',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `connect.sid=${SESSION_COOKIE}`
  }
});

// Simple sketch data
const sketchData = {
  name: 'Hello p5.js API',
  files: [
    {
      name: 'sketch.js',
      content: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Draw hello message
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);
  text('Hello, World!', width / 2, height / 2);

  // Draw a bouncing circle
  const x = (frameCount * 2) % width;
  const y = 100 + sin(frameCount * 0.05) * 50;
  fill(255, 0, 0);
  circle(x, y, 50);
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
    <title>Hello p5.js API</title>
    <style>
      body {
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
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

// Create the sketch
async function createSketch() {
  console.log('🎨 Creating sketch...');

  try {
    const response = await client.post('/projects', sketchData);
    const project = response.data;

    console.log('✅ Success!\n');
    console.log('📊 Project Details:');
    console.log(`  ID: ${project.id}`);
    console.log(`  Name: ${project.name}`);
    console.log(`  Owner: ${project.owner?.username || project.user?.username}`);
    console.log(`  Created: ${project.createdAt}\n`);

    const username = project.owner?.username || project.user?.username;
    console.log('🔗 Links:');
    console.log(`  Editor: https://editor.p5js.org/${username}/sketches/${project.id}`);
    console.log(`  Full View: https://editor.p5js.org/${username}/full/${project.id}`);
    console.log(`  Present: https://editor.p5js.org/${username}/present/${project.id}`);
    console.log(`  Embed: https://editor.p5js.org/${username}/embed/${project.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run
createSketch();
