/**
 * p5.js Web Editor API Capture Tool
 *
 * PURPOSE: Intercept and log all API requests made by the p5.js editor
 * to discover endpoints, payloads, and authentication methods.
 *
 * USAGE:
 * 1. Open https://editor.p5js.org in Chrome/Firefox
 * 2. Open DevTools Console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Perform actions in the editor (create sketch, save, etc.)
 * 5. View captured API calls in console
 * 6. Copy captured data for analysis
 *
 * WHAT IT CAPTURES:
 * - All fetch() requests
 * - All XMLHttpRequest requests
 * - Request URL, method, headers, body
 * - Response status, headers, body
 * - Timestamps
 *
 * EDUCATIONAL USE: Understanding web APIs through observation
 */

(function() {
  'use strict';

  console.log('%c🔍 p5.js API Capture Tool Started', 'color: #00ff00; font-size: 16px; font-weight: bold;');
  console.log('%cAll API requests will be logged below...', 'color: #00ffff;');
  console.log('%cTo export data, type: capturedRequests', 'color: #ffff00;');

  // Storage for captured requests
  window.capturedRequests = [];

  // Helper function to format data nicely
  function formatRequest(data) {
    console.group(`%c${data.method} ${data.url}`, 'color: #ff6600; font-weight: bold;');
    console.log('%cTimestamp:', 'color: #00ffff;', data.timestamp);
    console.log('%cMethod:', 'color: #00ffff;', data.method);
    console.log('%cURL:', 'color: #00ffff;', data.url);

    if (data.headers && Object.keys(data.headers).length > 0) {
      console.log('%cRequest Headers:', 'color: #00ffff;', data.headers);
    }

    if (data.body) {
      console.log('%cRequest Body:', 'color: #00ffff;');
      try {
        console.log(JSON.parse(data.body));
      } catch (e) {
        console.log(data.body);
      }
    }

    if (data.response) {
      console.log('%cResponse Status:', 'color: #00ff00;', data.response.status);
      if (data.response.body) {
        console.log('%cResponse Body:', 'color: #00ff00;');
        try {
          console.log(JSON.parse(data.response.body));
        } catch (e) {
          console.log(data.response.body);
        }
      }
    }

    console.groupEnd();
  }

  // Intercept fetch() API
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;

    const requestData = {
      type: 'fetch',
      timestamp: new Date().toISOString(),
      url: url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body || null
    };

    // Log the request
    console.log('%c📤 Outgoing Request', 'color: #ff6600; font-weight: bold;');
    formatRequest(requestData);

    // Call original fetch and capture response
    return originalFetch.apply(this, args)
      .then(async response => {
        // Clone response so we can read it
        const clonedResponse = response.clone();

        // Try to read response body
        let responseBody;
        try {
          responseBody = await clonedResponse.text();
        } catch (e) {
          responseBody = '[Unable to read response body]';
        }

        requestData.response = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody
        };

        // Store the complete request/response
        window.capturedRequests.push(requestData);

        // Log the response
        console.log('%c📥 Response Received', 'color: #00ff00; font-weight: bold;');
        formatRequest(requestData);

        return response;
      })
      .catch(error => {
        requestData.error = error.message;
        window.capturedRequests.push(requestData);

        console.log('%c❌ Request Failed', 'color: #ff0000; font-weight: bold;');
        console.error(error);

        throw error;
      });
  };

  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._captureData = {
      type: 'xhr',
      timestamp: new Date().toISOString(),
      method: method,
      url: url,
      headers: {}
    };
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (this._captureData) {
      this._captureData.headers[header] = value;
    }
    return originalXHRSetRequestHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (this._captureData) {
      this._captureData.body = body;

      // Log the request
      console.log('%c📤 XHR Request', 'color: #ff6600; font-weight: bold;');
      formatRequest(this._captureData);

      // Capture response
      this.addEventListener('load', () => {
        this._captureData.response = {
          status: this.status,
          statusText: this.statusText,
          headers: this.getAllResponseHeaders(),
          body: this.responseText
        };

        window.capturedRequests.push(this._captureData);

        console.log('%c📥 XHR Response', 'color: #00ff00; font-weight: bold;');
        formatRequest(this._captureData);
      });

      this.addEventListener('error', () => {
        this._captureData.error = 'Network error';
        window.capturedRequests.push(this._captureData);
        console.log('%c❌ XHR Failed', 'color: #ff0000; font-weight: bold;');
      });
    }

    return originalXHRSend.apply(this, arguments);
  };

  // Utility functions exposed to window
  window.exportCapturedRequests = function() {
    const data = JSON.stringify(window.capturedRequests, null, 2);
    console.log('%c📋 Copy the data below:', 'color: #ffff00; font-size: 14px;');
    console.log(data);

    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data)
        .then(() => {
          console.log('%c✅ Copied to clipboard!', 'color: #00ff00;');
        })
        .catch(err => {
          console.log('%c⚠️  Copy to clipboard failed, please copy manually', 'color: #ff9900;');
        });
    }

    return data;
  };

  window.clearCapturedRequests = function() {
    window.capturedRequests = [];
    console.log('%c🗑️  Captured requests cleared', 'color: #ff9900;');
  };

  window.filterCapturedRequests = function(urlPattern) {
    return window.capturedRequests.filter(req =>
      req.url.includes(urlPattern)
    );
  };

  window.showCapturedAPI = function() {
    console.log('%c📊 API Endpoints Summary', 'color: #00ffff; font-size: 14px; font-weight: bold;');

    const apiRequests = window.capturedRequests.filter(req =>
      req.url.includes('/api/')
    );

    const grouped = apiRequests.reduce((acc, req) => {
      const key = `${req.method} ${req.url}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(req);
      return acc;
    }, {});

    Object.keys(grouped).forEach(endpoint => {
      const requests = grouped[endpoint];
      console.log(`\n${endpoint} (${requests.length} calls)`);
      console.log('  Sample request:', requests[0]);
    });
  };

  window.extractCookies = function() {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    console.log('%c🍪 Current Cookies:', 'color: #ffff00; font-size: 14px;');
    console.log(cookies);

    if (cookies['connect.sid']) {
      console.log('%c✅ Session cookie found!', 'color: #00ff00;');
      console.log('%cValue:', 'color: #00ffff;', cookies['connect.sid']);
      console.log('%c⚠️  Keep this secret! Do not share publicly.', 'color: #ff0000;');
    } else {
      console.log('%c❌ No session cookie found. Are you logged in?', 'color: #ff0000;');
    }

    return cookies;
  };

  // Instructions
  console.log('\n%c📖 Available Commands:', 'color: #ffff00; font-size: 14px; font-weight: bold;');
  console.log('%c• capturedRequests', 'color: #00ffff;', '- View all captured requests');
  console.log('%c• exportCapturedRequests()', 'color: #00ffff;', '- Export to JSON');
  console.log('%c• clearCapturedRequests()', 'color: #00ffff;', '- Clear all captures');
  console.log('%c• filterCapturedRequests("pattern")', 'color: #00ffff;', '- Filter by URL pattern');
  console.log('%c• showCapturedAPI()', 'color: #00ffff;', '- Show API endpoint summary');
  console.log('%c• extractCookies()', 'color: #00ffff;', '- Extract session cookies');

  console.log('\n%c🎯 Next Steps:', 'color: #00ff00; font-size: 14px; font-weight: bold;');
  console.log('1. Create a new sketch');
  console.log('2. Save the sketch');
  console.log('3. Update the sketch');
  console.log('4. Run: showCapturedAPI()');
  console.log('5. Run: exportCapturedRequests()');

  console.log('\n%c✨ Capture tool ready! Start using the editor...', 'color: #00ff00; font-size: 14px; font-weight: bold;');
})();
