// Round Robin Load Balancing Algorithm
// Distributes requests to servers in circular fashion: 1 → 2 → 3 → 1 → 2 → 3...

class RoundRobin {
  constructor(servers) {
    this.servers = servers;
    this.currentIndex = 0;
  }

  selectServer() {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }

  reset() {
    this.currentIndex = 0;
  }
}

module.exports = RoundRobin;
