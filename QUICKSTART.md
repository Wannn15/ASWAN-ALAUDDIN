# 🚀 Load Balancer Docker - QUICKSTART Guide

Complete Load Balancing System with Round Robin & Least Connection Algorithms

## 📋 Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v1.29+)
- **Node.js** (v18+) - Only if running load-test.js locally

## 🎯 Quick Start (5 Minutes)

### 1. Start All Services

```bash
cd /path/to/load-balancer-docker
docker-compose up -d
```

Wait a few seconds for all services to build and start. You should see:
```
✓ load-balancer is healthy
✓ server1 is healthy
✓ server2 is healthy
✓ server3 is healthy
✓ dashboard is healthy
```

### 2. Open Dashboard

Open your browser and navigate to:
```
http://localhost:8080
```

You should see a beautiful dashboard with:
- Algorithm selector (Round Robin / Least Connection)
- Server load status for all 3 servers
- Request log with unique IDs
- Control buttons

### 3. Send Your First Request

Click the **"📤 Send Request"** button on the dashboard. You should see:

1. **In Terminal**: Request logs showing which server processed it
```
[load-balancer] [14:30:45] → Incoming request (req-id-abc123)
[load-balancer] [14:30:45] ℹ Routing to server-1
[server-1] [14:30:45] → Processing request
[server-1] [14:30:45] ← Request completed (45ms)
[load-balancer] [14:30:45] ← Response from server-1 (45ms)
```

2. **In Dashboard**: New request appears in the log with:
   - Unique Request ID (#abc123)
   - Which server handled it (server-1, server-2, or server-3)
   - Current algorithm used
   - Response time in milliseconds

3. **Server Load Update**: The load bar for server-1 updates to show it just handled a request

### 4. Switch Algorithm

Click **"🔄 Round Robin"** or **"📊 Least Connection"** button to change the routing algorithm:

- **Round Robin**: Routes requests in sequence (1→2→3→1→2→3...)
- **Least Connection**: Routes to server with lowest active connections

Watch how requests are distributed differently!

## 🔍 View Logs

### See All Container Logs
```bash
docker-compose logs -f
```

### See Only Load Balancer Logs
```bash
docker-compose logs -f load-balancer
```

### See Only Server 1 Logs
```bash
docker-compose logs -f server1
```

### See Only Dashboard Logs
```bash
docker-compose logs -f dashboard
```

## 📊 Load Testing

### Using Load Testing Script

Generate automated load to see the load balancer in action:

```bash
# Basic: 5 requests/second for 30 seconds
node load-test.js

# Custom: 10 requests/second for 60 seconds
RPS=10 DURATION=60 node load-test.js

# Against custom URL
LB_URL=http://custom-host:3000 node load-test.js
```

The script will show:
```
[14:31:00] → Request sent (#abc123) - server-1 - 42ms
[14:31:00] → Request sent (#def456) - server-2 - 38ms
[14:31:00] → Request sent (#ghi789) - server-3 - 45ms
...
════════════════════════════════════════════════════════
                   LOAD TEST RESULTS
════════════════════════════════════════════════════════
Total Requests        : 150
Successful            : 150
Failed                : 0
Success Rate          : 100.00%
Min Response Time     : 35ms
Max Response Time     : 128ms
Avg Response Time     : 52ms
Median Response Time  : 50ms
Requests/Second       : 5.00
════════════════════════════════════════════════════════
```

### Using cURL

Send individual requests:

```bash
# Send a request
curl -X POST http://localhost:3000/request

# Get current load
curl http://localhost:3000/load

# Get request history
curl http://localhost:3000/history?limit=10

# Switch to Least Connection
curl -X POST http://localhost:3000/algorithm/least-connection

# Switch to Round Robin
curl -X POST http://localhost:3000/algorithm/round-robin

# Get health status
curl http://localhost:3000/health

# Reset statistics
curl -X POST http://localhost:3000/reset
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network: lb-network            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐                                   │
│  │   Dashboard      │  (Port 8080)                      │
│  │  - Web UI        │  http://localhost:8080            │
│  │  - Real-time     │                                   │
│  │    monitoring    │                                   │
│  └────────┬─────────┘                                   │
│           │ HTTP                                        │
│  ┌────────▼─────────────────────────────────────────┐  │
│  │     Load Balancer (Port 3000)                    │  │
│  │  - Round Robin Algorithm                         │  │
│  │  - Least Connection Algorithm                    │  │
│  │  - Request routing & logging                     │  │
│  │  - Health monitoring                             │  │
│  └────────┬─────────────────────────────────────────┘  │
│           │                                             │
│      ┌────┼────┬──────────┐                            │
│      │    │    │          │                            │
│  ┌───▼──┐ ┌──▼──┐ ┌──────▼──┐                         │
│  │Server│ │Server│ │ Server  │                        │
│  │  1   │ │  2   │ │   3     │                        │
│  │:4001 │ │:4002 │ │:4003    │                        │
│  │      │ │      │ │         │                        │
│  │ Proc │ │ Proc │ │ Proc    │                        │
│  │ 1-3s │ │ 1-3s │ │ 1-3s    │                        │
│  └──────┘ └──────┘ └─────────┘                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart all services
docker-compose restart

# View logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f load-balancer

# Rebuild images
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# Check service status
docker-compose ps

# Access service shell
docker-compose exec load-balancer sh
```

## 📡 API Endpoints

### Load Balancer (Port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get load balancer info |
| GET | `/health` | Health check |
| GET | `/algorithm` | Get current algorithm |
| POST | `/algorithm/:type` | Switch algorithm (round-robin, least-connection) |
| POST | `/request` | Send request to a server |
| GET | `/load` | Get server load status |
| GET | `/history` | Get request history |
| POST | `/reset` | Reset all statistics |
| GET | `/events` | Server-Sent Events (SSE) stream |

### Backend Servers (Ports 4001-4003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get server info |
| GET | `/health` | Health check |
| GET | `/info` | Get detailed server stats |
| POST | `/process` | Process a request |

## 🎨 Dashboard Features

### Algorithm Selector
- Switch between Round Robin and Least Connection
- Real-time algorithm switching (no service restart needed)

### Server Load Display
- Active connections per server
- Total requests handled
- Load percentage with color coding:
  - 🟢 Green: Low load (0-33%)
  - 🟠 Orange: Medium load (34-66%)
  - 🔴 Red: High load (67-100%)

### Request Log
- Request ID (unique identifier)
- Which server processed it
- Algorithm used
- Response time
- Real-time updates

### Statistics
- Total requests sent
- Average response time
- Success rate monitoring

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check if ports are in use
netstat -an | grep "LISTEN"

# Kill process using port (example: port 3000)
# Windows: netstat -ano | findstr :3000 && taskkill /PID <PID> /F
# Linux/Mac: lsof -i :3000 && kill -9 <PID>
```

### Can't Connect to Dashboard
```bash
# Check if dashboard is running
docker-compose ps

# Restart dashboard
docker-compose restart dashboard

# Check logs
docker-compose logs dashboard
```

### Requests Failing
```bash
# Check load balancer logs
docker-compose logs load-balancer

# Check server status
curl http://localhost:3000/health

# Check individual server health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Change port in environment variable

# For example, to use port 9000 instead of 3000:
docker-compose up -d -e PORT=9000 load-balancer
```

## 📝 Environment Variables

Set these in `docker-compose.yml` to customize behavior:

```bash
# Load Balancer
PORT=3000                   # Load balancer port
NODE_ENV=production         # Environment (development/production)

# Servers
PORT=4001/4002/4003         # Server ports
SERVER_ID=server-1/2/3      # Server identifier
NODE_ENV=production

# Dashboard
PORT=8080                   # Dashboard port
NODE_ENV=production
```

## 💡 Advanced Usage

### Custom Network Configuration
Edit `docker-compose.yml` to change network name or add more services.

### Adding More Servers
1. Add a new service in `docker-compose.yml`
2. Update the servers array in `load-balancer/index.js`
3. Rebuild: `docker-compose up -d --build`

### Custom Algorithms
Add new algorithm files in `load-balancer/utils/`:
1. Create algorithm class
2. Import in `load-balancer/index.js`
3. Add to algorithm selector in dashboard

### Performance Tuning
- Adjust request timeout values
- Modify server processing time
- Increase/decrease load test RPS

## 📚 Project Structure

```
load-balancer-docker/
├── load-balancer/
│   ├── index.js                    # Main LB server
│   ├── utils/
│   │   ├── roundrobin.js           # RR algorithm
│   │   └── leastconnection.js      # LC algorithm
│   ├── package.json
│   └── Dockerfile
├── servers/
│   ├── server.js                   # Backend server code
│   ├── package.json
│   └── Dockerfile
├── dashboard/
│   ├── index.js                    # Express server
│   ├── public/
│   │   └── index.html              # Web UI
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml              # Service orchestration
├── load-test.js                    # Load testing tool
├── PLAN.md                         # Project plan
├── QUICKSTART.md                   # This file
└── README.md                       # Documentation
```

## 🎓 Learning Objectives

This project demonstrates:

- ✅ Load balancing algorithms (Round Robin, Least Connection)
- ✅ Docker containerization & orchestration
- ✅ Microservices architecture
- ✅ Real-time web dashboards
- ✅ REST API design
- ✅ Terminal logging & monitoring
- ✅ Performance testing
- ✅ Health checks & graceful degradation

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check health endpoints: `curl http://localhost:3000/health`

---

**Happy Load Balancing!** 🎉
