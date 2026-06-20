const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const RoundRobin = require('./utils/roundrobin');
const LeastConnection = require('./utils/leastconnection');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Server configuration
const servers = [
  { id: 'server-1', host: 'server1', port: 4001, url: 'http://server1:4001', activeConnections: 0, totalRequests: 0 },
  { id: 'server-2', host: 'server2', port: 4002, url: 'http://server2:4002', activeConnections: 0, totalRequests: 0 },
  { id: 'server-3', host: 'server3', port: 4003, url: 'http://server3:4003', activeConnections: 0, totalRequests: 0 }
];

// Initialize algorithms
let roundRobinAlgo = new RoundRobin(servers);
let leastConnectionAlgo = new LeastConnection(servers);

// Current algorithm
let currentAlgorithm = 'round-robin';

// Request history for dashboard
const requestHistory = [];
const maxHistorySize = 100;

// WebSocket clients list
const clients = [];

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Symbols for logging
const symbols = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
  request: '→',
  response: '←',
  chart: '📊'
};

function logToConsole(level, message, data = {}) {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.reset;
  let symbol = symbols.info;

  switch (level) {
    case 'success':
      color = colors.green;
      symbol = symbols.success;
      break;
    case 'error':
      color = colors.red;
      symbol = symbols.error;
      break;
    case 'request':
      color = colors.blue;
      symbol = symbols.request;
      break;
    case 'response':
      color = colors.cyan;
      symbol = symbols.response;
      break;
    case 'stats':
      color = colors.magenta;
      symbol = symbols.chart;
      break;
  }

  const logMsg = `${color}[${timestamp}] ${symbol} ${message}${colors.reset}`;
  console.log(logMsg, Object.keys(data).length > 0 ? data : '');
}

function broadcastToClients(eventType, data) {
  // In production, use WebSocket. For now, this is a placeholder
  // Clients will poll /events endpoint or use WebSocket
  clients.forEach(client => {
    if (client && !client.destroyed) {
      try {
        client.write(`data: ${JSON.stringify({ eventType, data })}\n\n`);
      } catch (e) {
        // Client disconnected
      }
    }
  });
}

function selectServer() {
  let selectedServer;

  if (currentAlgorithm === 'least-connection') {
    selectedServer = leastConnectionAlgo.selectServer();
  } else {
    selectedServer = roundRobinAlgo.selectServer();
  }

  return selectedServer;
}

function updateServerStats() {
  logToConsole('stats', 'Server Load Status', {
    algorithm: currentAlgorithm,
    servers: servers.map(s => ({
      id: s.id,
      activeConn: s.activeConnections,
      totalReq: s.totalRequests
    }))
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    servers: servers.map(s => ({
      id: s.id,
      healthy: true,
      activeConnections: s.activeConnections,
      totalRequests: s.totalRequests
    }))
  });
});

// Get current algorithm
app.get('/algorithm', (req, res) => {
  res.json({
    current: currentAlgorithm,
    available: ['round-robin', 'least-connection']
  });
});

// Switch algorithm
app.post('/algorithm/:type', (req, res) => {
  const type = req.params.type;

  if (!['round-robin', 'least-connection'].includes(type)) {
    return res.status(400).json({ error: 'Invalid algorithm type' });
  }

  currentAlgorithm = type;
  logToConsole('success', `Algorithm switched to: ${type}`);
  broadcastToClients('algorithmChanged', { algorithm: type });

  res.json({ success: true, algorithm: type });
});

// Main request handling endpoint
app.post('/request', async (req, res) => {
  const requestId = uuidv4().substring(0, 8);
  const startTime = Date.now();

  logToConsole('request', 'Incoming request', { requestId });

  try {
    const selectedServer = selectServer();

    if (!selectedServer) {
      logToConsole('error', 'No server available');
      return res.status(503).json({ error: 'No servers available' });
    }

    // Increment active connections
    selectedServer.activeConnections++;
    selectedServer.totalRequests++;

    logToConsole('info', `Routing to ${selectedServer.id}`, { requestId, activeConn: selectedServer.activeConnections });

    // Make request to backend server
    const response = await fetch(`${selectedServer.url}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        algorithm: currentAlgorithm,
        timestamp: new Date().toISOString()
      })
    });

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    // Decrement active connections
    selectedServer.activeConnections--;

    logToConsole('response', `Response from ${selectedServer.id}`, {
      requestId,
      responseTime: `${responseTime}ms`,
      activeConn: selectedServer.activeConnections
    });

    // Add to history
    const historyItem = {
      requestId,
      serverId: selectedServer.id,
      algorithm: currentAlgorithm,
      responseTime,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    requestHistory.push(historyItem);
    if (requestHistory.length > maxHistorySize) {
      requestHistory.shift();
    }

    // Broadcast to dashboard
    broadcastToClients('requestCompleted', historyItem);

    // Log server stats
    updateServerStats();

    res.json({
      requestId,
      server: selectedServer.id,
      algorithm: currentAlgorithm,
      responseTime,
      serverResponse: data
    });
  } catch (error) {
    logToConsole('error', `Error processing request: ${error.message}`, { requestId });
    res.status(500).json({
      error: 'Error processing request',
      requestId,
      message: error.message
    });
  }
});

// Get load information
app.get('/load', (req, res) => {
  res.json({
    algorithm: currentAlgorithm,
    servers: servers.map(s => ({
      id: s.id,
      activeConnections: s.activeConnections,
      totalRequests: s.totalRequests,
      url: s.url
    }))
  });
});

// Get request history
app.get('/history', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  res.json({
    total: requestHistory.length,
    history: requestHistory.slice(-limit)
  });
});

// Reset statistics
app.post('/reset', (req, res) => {
  servers.forEach(s => {
    s.activeConnections = 0;
    s.totalRequests = 0;
  });
  requestHistory.length = 0;
  logToConsole('success', 'Statistics reset');
  res.json({ success: true, message: 'Statistics reset' });
});

// Server-Sent Events (SSE) for real-time updates
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial state
  res.write(`data: ${JSON.stringify({
    eventType: 'initialState',
    data: { algorithm: currentAlgorithm, servers, history: requestHistory.slice(-10) }
  })}\n\n`);

  clients.push(res);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Load Balancer',
    version: '1.0.0',
    status: 'running',
    algorithm: currentAlgorithm,
    servers: servers.length,
    endpoints: {
      health: '/health',
      load: '/load',
      history: '/history',
      request: 'POST /request',
      algorithm: 'GET /algorithm',
      algorithmSwitch: 'POST /algorithm/:type',
      reset: 'POST /reset',
      events: 'GET /events'
    }
  });
});

// Start server
app.listen(PORT, () => {
  logToConsole('success', `Load Balancer started on port ${PORT}`);
  logToConsole('info', `Algorithm: ${currentAlgorithm}`);
  logToConsole('info', `Backend Servers: ${servers.length}`, {
    servers: servers.map(s => `${s.id} (${s.url})`)
  });
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logToConsole('info', 'SIGTERM received, shutting down gracefully');
  process.exit(0);
});
