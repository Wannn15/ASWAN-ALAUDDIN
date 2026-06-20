const express = require('express');
const app = express();

app.use(express.json());

// Get port from environment variable
const PORT = process.env.PORT || 4001;
const SERVER_ID = process.env.SERVER_ID || 'server-default';

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Symbols
const symbols = {
  success: '✓',
  info: 'ℹ',
  request: '→',
  response: '←'
};

// Server statistics
const stats = {
  totalRequests: 0,
  totalProcessingTime: 0,
  startTime: Date.now()
};

function log(level, message, data = {}) {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.reset;
  let symbol = symbols.info;

  switch (level) {
    case 'success':
      color = colors.green;
      symbol = symbols.success;
      break;
    case 'request':
      color = colors.cyan;
      symbol = symbols.request;
      break;
    case 'response':
      color = colors.magenta;
      symbol = symbols.response;
      break;
  }

  const logMsg = `${color}[${SERVER_ID}] [${timestamp}] ${symbol} ${message}${colors.reset}`;
  console.log(logMsg, Object.keys(data).length > 0 ? data : '');
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    serverId: SERVER_ID,
    uptime: Date.now() - stats.startTime,
    totalRequests: stats.totalRequests,
    port: PORT
  });
});

// Main processing endpoint
app.post('/process', (req, res) => {
  const { requestId, algorithm } = req.body;
  const processingTime = Math.random() * 100 + 50; // Random processing time 50-150ms

  log('request', `Processing request`, { requestId, algorithm });

  stats.totalRequests++;
  stats.totalProcessingTime += processingTime;

  // Simulate processing
  setTimeout(() => {
    const response = {
      requestId,
      serverId: SERVER_ID,
      processedAt: new Date().toISOString(),
      processingTime: Math.round(processingTime),
      algorithm,
      stats: {
        totalRequests: stats.totalRequests,
        avgProcessingTime: Math.round(stats.totalProcessingTime / stats.totalRequests)
      },
      message: `Request processed successfully by ${SERVER_ID}`
    };

    log('response', `Request completed`, {
      requestId,
      processingTime: `${Math.round(processingTime)}ms`,
      totalRequests: stats.totalRequests
    });

    res.json(response);
  }, processingTime);
});

// Server info
app.get('/info', (req, res) => {
  res.json({
    serverId: SERVER_ID,
    port: PORT,
    startTime: new Date(stats.startTime),
    uptime: Date.now() - stats.startTime,
    stats: {
      totalRequests: stats.totalRequests,
      avgProcessingTime: stats.totalRequests > 0 ? Math.round(stats.totalProcessingTime / stats.totalRequests) : 0
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    serverId: SERVER_ID,
    status: 'running',
    port: PORT,
    endpoints: {
      health: '/health',
      process: 'POST /process',
      info: '/info'
    }
  });
});

// Start server
app.listen(PORT, () => {
  log('success', `Server started`, { port: PORT, serverId: SERVER_ID });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'Shutting down gracefully');
  process.exit(0);
});
