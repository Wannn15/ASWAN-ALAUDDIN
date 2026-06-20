# Load Balancer System - Rencana Implementasi

## Daftar Tugas

### 1. Load Balancer (Port 3000)

- [x] Implementasi algoritma Round Robin
- [x] Implementasi algoritma Least Connection
- [x] REST API untuk handle requests
- [x] Logging ke terminal (real-time)
- [x] Event emitter untuk update dashboard
- [x] Health check untuk servers

### 2. 3 Backend Servers

- [x] Server 1 (Port 4001)
- [x] Server 2 (Port 4002)
- [x] Server 3 (Port 4003)
- [x] Tracking request count & response time
- [x] Logging ke terminal
- [x] JSON response dengan metadata

### 3. Dashboard Web (Port 8080)

- [x] HTML/CSS/JavaScript untuk UI
- [x] Real-time update via WebSocket
- [x] Tampilkan request dengan ID unik
- [x] Tampilkan server mana yang handle request
- [x] Tampilkan current load setiap server
- [x] Pilih algoritma Round Robin/Least Connection

### 4. Docker Setup

- [x] Dockerfile untuk Load Balancer
- [x] Dockerfile untuk Servers
- [x] Dockerfile untuk Dashboard
- [x] docker-compose.yml untuk orchestration
- [x] Network untuk komunikasi antar container

### 5. Testing & Monitoring

- [x] Script untuk generate requests
- [x] Terminal logging untuk monitoring
- [x] Performance metrics

## Struktur Folder

```
load-balancer-docker/
├── load-balancer/
│   ├── index.js (main server)
│   ├── utils/
│   │   ├── roundrobin.js
│   │   └── leastconnection.js
│   ├── Dockerfile
│   └── package.json
├── servers/
│   ├── server.js (shared)
│   ├── Dockerfile
│   └── package.json
├── dashboard/
│   ├── index.js (express server)
│   ├── public/
│   │   └── index.html (UI)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── load-test.js (opsional)
└── PLAN.md
```

## Cara Menggunakan

```bash
# 1. Start semua container
docker-compose up -d

# 2. Buka dashboard di browser
http://localhost:8080

# 3. Lihat terminal logging dari load-balancer & servers
docker-compose logs -f

# 4. Testing dengan curl atau load-test.js
curl http://localhost:3000/request
node load-test.js
```
