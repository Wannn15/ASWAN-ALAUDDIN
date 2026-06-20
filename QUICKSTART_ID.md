# 🚀 QUICK START GUIDE - Load Balancer System

## 30-Second Setup

```bash
# 1. Navigate to project
cd load-balancer-docker

# 2. Start all containers
docker-compose up -d

# 3. Open dashboard
http://localhost:8080

# 4. View logs in real-time
docker-compose logs -f
```

That's it! ✅

---

## 📍 Access Points

| Component             | URL                          | Port |
| --------------------- | ---------------------------- | ---- |
| **Dashboard UI**      | http://localhost:8080        | 8080 |
| **Load Balancer API** | http://localhost:3000        | 3000 |
| **Server 1**          | http://localhost:4001/health | 4001 |
| **Server 2**          | http://localhost:4002/health | 4002 |
| **Server 3**          | http://localhost:4003/health | 4003 |

---

## 🧪 Testing Load Balancer

### Test #1: Via Web Dashboard

1. Open http://localhost:8080
2. Click "Send Request" button multiple times
3. Watch request log update in real-time
4. View server load bars

### Test #2: Via Curl

```bash
# Single request
curl -X POST http://localhost:3000/request

# Multiple requests
for i in {1..10}; do curl -X POST http://localhost:3000/request; sleep 0.1; done

# Switch algorithm
curl -X POST http://localhost:3000/algorithm/least-connection

# Check status
curl http://localhost:3000/algorithm
```

### Test #3: Automated Load Test

```bash
node load-test.js
```

---

## 👀 Monitor in Real-Time

```bash
# Terminal 1: View all logs
docker-compose logs -f

# Terminal 2: View only load-balancer
docker-compose logs -f load-balancer

# Terminal 3: View only servers
docker-compose logs -f server1
docker-compose logs -f server2
docker-compose logs -f server3

# Terminal 4: View only dashboard
docker-compose logs -f dashboard
```

---

## 🔄 Algorithm Switching

### Round Robin (Default)

- Distributes evenly: Server 1 → 2 → 3 → 1 → 2 → 3...
- Best for equal-load scenarios

### Least Connection

- Routes to server with fewest active connections
- Best for variable-load scenarios

**Switch via:**

- Web Dashboard: Click button
- API: `curl -X POST http://localhost:3000/algorithm/least-connection`
- API: `curl -X POST http://localhost:3000/algorithm/round-robin`

---

## 📊 What You'll See in Terminal

### Load Balancer Logs:

```
[12:34:56] → Incoming request { requestId: 'a1b2c3d4' }
[12:34:56] ℹ Routing to server-1 { activeConn: 1 }
[12:34:56] ← Response from server-1 { responseTime: 75ms }
[12:34:56] 📊 Server Load Status { server-1: 5, server-2: 3, server-3: 4 }
```

### Server Logs:

```
[server-1] [12:34:56] → Processing request { requestId: 'a1b2c3d4' }
[server-1] [12:34:56] ✓ Request completed { processingTime: 75ms }
```

### Dashboard Logs:

```
[Dashboard] [12:34:56] ℹ Dashboard started on port 8080
```

---

## 🛑 Stop All Containers

```bash
# Stop (keep data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes
docker-compose down -v

# Restart everything
docker-compose restart
```

---

## 🆘 Troubleshooting

```bash
# Check all containers are running
docker-compose ps

# View full logs
docker-compose logs

# Rebuild all images
docker-compose down
docker-compose up -d --build

# Reset everything
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📈 Performance Metrics Displayed

- **Request ID**: Unique identifier (UUID)
- **Server ID**: Which server handled it
- **Response Time**: How long it took
- **Active Connections**: Live connections per server
- **Total Requests**: Cumulative count per server
- **Load %**: Percentage of total requests

---

## 🎯 Demo Points

1. **Show Request Distribution**
   - Send requests via dashboard
   - Point to terminal showing round-robin pattern

2. **Show Algorithm Switching**
   - Switch from Round Robin to Least Connection
   - Send requests of different durations
   - Show how distribution changes

3. **Show Real-Time Monitoring**
   - Open dashboard
   - Terminal logs
   - Point to server load changing

4. **Show Load Testing**
   - Run `node load-test.js`
   - Show performance under load

---

## 💡 Key Features

✅ **Round Robin Distribution** - Even load across servers  
✅ **Least Connection** - Dynamic load based on connections  
✅ **Unique Request IDs** - Track each request  
✅ **Real-Time Dashboard** - Monitor live  
✅ **Terminal Logging** - Colored output with symbols  
✅ **Server Statistics** - Track metrics  
✅ **Health Checks** - Auto-restart failed containers  
✅ **Docker Orchestration** - 5 containers in harmony

---

**Status**: Ready to run! 🚀
