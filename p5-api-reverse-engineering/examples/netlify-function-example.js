/**
 * Netlify Function Example - p5.js Sketch Upload
 *
 * PURPOSE: Example Netlify serverless function that creates p5.js sketches
 * This solves the CORS problem by making requests server-side
 *
 * SETUP:
 * 1. Create netlify/functions directory in your project
 * 2. Copy this file there
 * 3. Set environment variable in Netlify dashboard:
 *    P5_SESSION_COOKIE=your_session_cookie
 * 4. Deploy to Netlify
 *
 * USAGE:
 * POST https://your-site.netlify.app/.netlify/functions/netlify-function-example
 * Body: { "name": "Sketch Name", "code": "p5.js code" }
 */

const axios = require('axios');

// Netlify function handler
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { name, code } = JSON.parse(event.body);

    // Validate input
    if (!name || !code) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'Both "name" and "code" are required'
        })
      };
    }

    // Get session cookie from environment variable
    const sessionCookie = process.env.P5_SESSION_COOKIE;
    if (!sessionCookie) {
      console.error('P5_SESSION_COOKIE environment variable not set');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Server configuration error',
          message: 'Authentication not configured'
        })
      };
    }

    // Create p5.js sketch structure
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

    // Make request to p5.js editor API
    console.log('Creating sketch:', name);
    const response = await axios.post(
      'https://editor.p5js.org/api/projects',
      sketchData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `connect.sid=${sessionCookie}`
        },
        timeout: 10000
      }
    );

    const project = response.data;
    const username = project.owner?.username || project.user?.username;
    const sketchUrl = `https://editor.p5js.org/${username}/sketches/${project.id}`;

    console.log('Sketch created successfully:', sketchUrl);

    // Return success response
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Configure appropriately for your site
      },
      body: JSON.stringify({
        success: true,
        projectId: project.id,
        name: project.name,
        url: sketchUrl,
        fullUrl: `https://editor.p5js.org/${username}/full/${project.id}`,
        embedUrl: `https://editor.p5js.org/${username}/embed/${project.id}`
      })
    };

  } catch (error) {
    console.error('Error creating sketch:', error.message);

    // Handle specific error cases
    if (error.response) {
      // API returned an error
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: 'Authentication failed',
            message: 'Session cookie expired or invalid'
          })
        };
      }

      return {
        statusCode: status,
        body: JSON.stringify({
          error: 'API error',
          message: data.message || 'Failed to create sketch'
        })
      };
    }

    // Network or other error
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

/**
 * CLIENT-SIDE USAGE EXAMPLE:
 *
 * // In your frontend JavaScript:
 * async function uploadToP5Editor(name, code) {
 *   const response = await fetch('/.netlify/functions/create-sketch', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({ name, code })
 *   });
 *
 *   if (!response.ok) {
 *     const error = await response.json();
 *     throw new Error(error.message);
 *   }
 *
 *   const result = await response.json();
 *   console.log('Sketch URL:', result.url);
 *   return result;
 * }
 *
 * // Usage:
 * const code = `
 *   function setup() {
 *     createCanvas(400, 400);
 *   }
 *
 *   function draw() {
 *     background(220);
 *     circle(mouseX, mouseY, 50);
 *   }
 * `;
 *
 * uploadToP5Editor('My Interactive Circle', code)
 *   .then(result => {
 *     window.open(result.url, '_blank');
 *   })
 *   .catch(error => {
 *     console.error('Upload failed:', error);
 *   });
 */
