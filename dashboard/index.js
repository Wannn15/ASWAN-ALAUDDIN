const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Color codes for logging
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m'
};

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.cyan}[Dashboard] [${timestamp}] ℹ ${message}${colors.reset}`);
}

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get load balancer info
app.get('/api/lb-status', async (req, res) => {
  try {
    const response = await fetch('http://load-balancer:3000/load');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch load balancer status' });
  }
});

// API endpoint to send request through load balancer
app.post('/api/send-request', async (req, res) => {
  try {
    const response = await fetch('http://load-balancer:3000/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Start server
app.listen(PORT, () => {
  log(`Dashboard started on port ${PORT}`);
  log(`Open browser at http://localhost:${PORT}`);
});
