// Least Connection Load Balancing Algorithm
// Routes requests to the server with the lowest number of active connections

class LeastConnection {
  constructor(servers) {
    this.servers = servers;
  }

  selectServer() {
    if (!this.servers || this.servers.length === 0) {
      return null;
    }

    // Find server with minimum active connections
    let minServer = this.servers[0];
    let minConnections = minServer.activeConnections || 0;

    for (let i = 1; i < this.servers.length; i++) {
      const activeConnections = this.servers[i].activeConnections || 0;
      if (activeConnections < minConnections) {
        minConnections = activeConnections;
        minServer = this.servers[i];
      }
    }

    return minServer;
  }

  reset() {
    // No state to reset for least connection
  }
}

module.exports = LeastConnection;
