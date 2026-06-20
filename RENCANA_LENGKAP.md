# 📋 Rencana Lengkap Load Balancer dengan Docker

## Ringkasan Proyek

Sistem load balancer lengkap dengan 3 server backend, web dashboard real-time, dan algoritma distribusi request.

---

## 🎯 Tujuan Utama

1. ✅ Implementasi algoritma **Round Robin** - Distribusi merata ke server 1→2→3→1...
2. ✅ Implementasi algoritma **Least Connection** - Kirim ke server dengan koneksi terendah
3. ✅ **3 Server Backend** di Docker container dengan port berbeda (4001, 4002, 4003)
4. ✅ **Load Balancer** untuk routing request dengan terminal logging
5. ✅ **Web Dashboard** untuk visualisasi load dengan ID request yang berbeda
6. ✅ **Terminal Real-Time** untuk melihat semua aktivitas

---

## 📂 Struktur Proyek

```
load-balancer-docker/
├── load-balancer/                    # Container Load Balancer (Port 3000)
│   ├── index.js                      # Main LB server dengan algoritma
│   ├── utils/
│   │   ├── roundrobin.js             # Algoritma Round Robin
│   │   └── leastconnection.js        # Algoritma Least Connection
│   ├── Dockerfile                    # Docker image LB
│   └── package.json
│
├── servers/                          # Container Backend Servers
│   ├── server.js                     # Template server (1, 2, 3)
│   ├── Dockerfile
│   └── package.json
│
├── dashboard/                        # Container Web Dashboard (Port 8080)
│   ├── index.js                      # Express server
│   ├── public/
│   │   └── index.html                # Web UI dengan real-time updates
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml                # Orkestrasi 5 container
├── load-test.js                      # Script untuk testing
├── RENCANA_LENGKAP.md               # File ini
└── README.md
```

---

## 🔧 Komponen Sistem

### 1. Load Balancer (Port 3000)

**Fungsi:**

- Menerima request dari client
- Memilih server dengan algoritma yang aktif
- Menghitung active connections
- Logging ke terminal dengan format warna-warni
- Mengirim data real-time ke dashboard

**Fitur Terminal:**

```
[16:45:23] → Incoming request { requestId: 'a1b2c3d4' }
[16:45:23] ℹ Routing to server-1 { requestId: 'a1b2c3d4', activeConn: 1 }
[16:45:23] ← Response from server-1 { responseTime: 75, totalRequests: 5 }
[16:45:23] 📊 Server Load Status {
  algorithm: 'round-robin',
  servers: [
    { id: 'server-1', activeConn: 0, totalReq: 5 },
    { id: 'server-2', activeConn: 0, totalReq: 4 },
    { id: 'server-3', activeConn: 0, totalReq: 3 }
  ]
}
```

### 2. Server Backend (Port 4001, 4002, 4003)

**3 Container Terpisah:**

- Server 1: Port 4001 (server-1)
- Server 2: Port 4002 (server-2)
- Server 3: Port 4003 (server-3)

**Fitur:**

- Menerima request dan processing
- Tracking request count & response time
- Logging ID request unik ke terminal
- JSON response dengan metadata

**Contoh Terminal Output:**

```
[server-1] [16:45:23] → Processing request { requestId: 'a1b2c3d4', algorithm: 'round-robin' }
[server-1] [16:45:23] ✓ Request completed { totalTime: 75ms, totalRequests: 5 }
```

### 3. Web Dashboard (Port 8080)

**Fitur Real-Time:**

- Tombol untuk switch algoritma (Round Robin ↔ Least Connection)
- Tombol "Kirim Request" untuk generate request
- **Request Log** - Daftar request dengan ID unik dan server tujuan
- **Server Load Cards** - Progress bar untuk beban setiap server
- **Response Time Chart** - Grafik visualisasi
- **Real-time Updates** - Live update via polling

**Tampilan Web:**

```
┌─────────────────────────────────────────────┐
│       Load Balancer Dashboard               │
├─────────────────────────────────────────────┤
│  Algoritma: [Round Robin]  [Least Conn]    │
│                                             │
│  [📤 Kirim Request]  [🔄 Reset Data]       │
├─────────────────────────────────────────────┤
│                                             │
│  Server Load Status:                        │
│  ┌─────────────┐  ┌─────────────┐          │
│  │ Server 1    │  │ Server 2    │          │
│  │ ████░░░░░░░ │  │ ██░░░░░░░░░ │          │
│  │ 4/10 req    │  │ 2/10 req    │          │
│  └─────────────┘  └─────────────┘          │
│                                             │
│  Request History:                           │
│  ID: a1b2c3d4 → Server-1 → 75ms ✓         │
│  ID: b2c3d4e5 → Server-2 → 82ms ✓         │
│  ID: c3d4e5f6 → Server-3 → 65ms ✓         │
│  ID: d4e5f6g7 → Server-1 → 78ms ✓         │
└─────────────────────────────────────────────┘
```

---

## 🚀 Cara Menjalankan

### Langkah 1: Persiapan

```bash
# Navigasi ke folder proyek
cd load-balancer-docker

# Pastikan Docker daemon sudah running
docker --version
```

### Langkah 2: Start Semua Container

```bash
# Start dengan detached mode (background)
docker-compose up -d

# Tunggu ~3-5 detik untuk semua container startup
```

### Langkah 3: Cek Status Container

```bash
# Lihat semua container yang running
docker-compose ps

# Output:
# NAME           STATUS
# load-balancer  Up 2 seconds
# server1        Up 2 seconds
# server2        Up 2 seconds
# server3        Up 2 seconds
# dashboard      Up 2 seconds
```

### Langkah 4: Lihat Terminal Logging

```bash
# Lihat log dari semua container (real-time)
docker-compose logs -f

# Lihat log hanya dari load-balancer
docker-compose logs -f load-balancer

# Lihat log hanya dari server1
docker-compose logs -f server1

# Ctrl+C untuk keluar dari log
```

### Langkah 5: Buka Web Dashboard

Buka browser di salah satu URL:

- **Dashboard**: http://localhost:8080
- **Load Balancer API**: http://localhost:3000/health
- **Server 1**: http://localhost:4001/health
- **Server 2**: http://localhost:4002/health
- **Server 3**: http://localhost:4003/health

---

## 📊 Testing Load Balancer

### Cara 1: Via Web Dashboard

1. Buka http://localhost:8080
2. Klik tombol "Kirim Request" berkali-kali
3. Lihat request masuk dengan ID unik
4. Lihat di terminal bagaimana load di-distribute

### Cara 2: Via Load Testing Script

```bash
# Jalankan automated load test
node load-test.js

# Script akan:
# - Generate 50 requests dengan interval 200ms
# - Test Round Robin distribution
# - Test Least Connection distribution
# - Tampilkan performance metrics
```

### Cara 3: Via curl (Manual)

```bash
# Kirim 1 request
curl -X POST http://localhost:3000/request

# Kirim beberapa request sekaligus
for i in {1..5}; do curl -X POST http://localhost:3000/request; done

# Switch ke Least Connection
curl -X POST http://localhost:3000/algorithm/least-connection

# Switch ke Round Robin
curl -X POST http://localhost:3000/algorithm/round-robin

# Cek status algoritma
curl http://localhost:3000/algorithm
```

---

## 🔍 Mengamati Sistem

### Terminal Output Explained

```bash
# Load Balancer Log:
[16:45:23] → Incoming request { requestId: 'a1b2c3d4' }
              └─ Request masuk ke load balancer

[16:45:23] ℹ Routing to server-1 { activeConn: 1 }
              └─ Kirim ke server-1 (active connection naik)

[16:45:23] ← Response from server-1 { responseTime: 75ms, totalRequests: 5 }
              └─ Response dari server-1 (active connection turun)

[16:45:23] 📊 Server Load Status
              └─ Summary statistik semua server
```

### Web Dashboard Real-Time Update

- **Request Log**: Setiap request baru langsung muncul dengan format:

  ```
  ID: a1b2c3d4 | Server: server-1 | Response Time: 75ms | Status: ✓
  ```

- **Server Load Bars**: Progress bar mengindikasikan beban:
  ```
  Server 1: ████░░░░░░░ (4/10 requests)
  Server 2: ██░░░░░░░░░ (2/10 requests)  ← Least Connection akan kirim ke sini
  Server 3: ████████░░░ (8/10 requests)
  ```

---

## ⚙️ Algoritma Explained

### Round Robin

**Cara Kerja:**

- Distribusi merata secara circular
- Server 1 → Server 2 → Server 3 → Server 1 → ...

**Contoh:**

```
Request 1 → Server-1 ✓
Request 2 → Server-2 ✓
Request 3 → Server-3 ✓
Request 4 → Server-1 ✓
Request 5 → Server-2 ✓
```

**Terminal Log:**

```
[Routing] Round Robin index=0 → server-1
[Routing] Round Robin index=1 → server-2
[Routing] Round Robin index=2 → server-3
[Routing] Round Robin index=0 → server-1
```

### Least Connection

**Cara Kerja:**

- Selalu kirim ke server dengan koneksi aktif terendah
- Optimal untuk request dengan durasi berbeda

**Contoh:**

```
Server-1: 3 active connections
Server-2: 1 active connection ← Dikirim ke sini
Server-3: 5 active connections

Jika ada request baru → Server-2 (punya koneksi paling sedikit)
```

**Terminal Log:**

```
[Routing] Least Connection: server-1 (3), server-2 (1), server-3 (5)
[Routing] Least Connection index=1 → server-2
```

---

## 📈 Metriks yang Ditrack

### Per-Server Metrics

- `activeConnections`: Jumlah koneksi aktif saat ini
- `totalRequests`: Total request yang pernah diproses
- `responseTime`: Min/Max/Avg response time

### Global Metrics

- `totalRequests`: Total request ke semua server
- `currentAlgorithm`: Algoritma yang sedang aktif
- `uptime`: Berapa lama sistem berjalan

### Dashboard Display

```
Server-1 Statistics:
  • Total Requests: 25
  • Active Connections: 3
  • Avg Response Time: 76ms
  • Load: 40%

Server-2 Statistics:
  • Total Requests: 20
  • Active Connections: 1
  • Avg Response Time: 82ms
  • Load: 20%

Server-3 Statistics:
  • Total Requests: 22
  • Active Connections: 5
  • Avg Response Time: 71ms
  • Load: 50%
```

---

## 🛠️ Troubleshooting

### Container Gagal Start

```bash
# Check logs
docker-compose logs

# Rebuild container
docker-compose down
docker-compose up -d --build

# Clean up dan restart
docker-compose down -v
docker-compose up -d
```

### Dashboard tidak bisa diakses

```bash
# Cek dashboard container
docker-compose ps dashboard

# Check container log
docker-compose logs dashboard

# Cek port sudah dibuka
lsof -i :8080

# Akses dari host bukan dari container
# Gunakan: http://localhost:8080 (bukan http://127.0.0.1:8080)
```

### Server tidak bisa diakses dari load balancer

```bash
# Check network
docker network ls
docker network inspect load-balancer-docker_lb-network

# Restart container
docker-compose restart
```

---

## 🔄 API Endpoints

### Load Balancer Endpoints

```
POST /request
  → Send request, automatically routed to a server
  Response: { requestId, serverId, responseTime, success }

GET /algorithm
  → Get current algorithm and available options
  Response: { current: 'round-robin', available: [...] }

POST /algorithm/:type
  → Switch algorithm
  Params: type = 'round-robin' | 'least-connection'

GET /load
  → Get current server load status
  Response: { servers: [...], currentAlgorithm, totalRequests }

GET /history
  → Get request history
  Response: { requests: [...] }

GET /health
  → Health check
  Response: { status: 'healthy', servers: [...] }
```

### Server Endpoints

```
GET /health
  → Health check
  Response: { status, serverId, uptime, totalRequests, port }

POST /process
  → Process a request
  Body: { requestId, algorithm }
  Response: { requestId, serverId, processingTime, totalRequests }
```

### Dashboard API

```
GET /api/lb-status
  → Get load balancer status

POST /api/send-request
  → Send request via load balancer
```

---

## ✅ Checklist Fungsionalitas

- [x] Round Robin algorithm
- [x] Least Connection algorithm
- [x] 3 backend servers (4001, 4002, 4003)
- [x] Load balancer (3000)
- [x] Web dashboard (8080)
- [x] Request ID unik (UUID)
- [x] Terminal logging dengan warna dan simbol
- [x] Server load tracking
- [x] Active connections counting
- [x] Real-time dashboard updates
- [x] Algorithm switching via UI
- [x] Performance metrics
- [x] Health checks
- [x] Docker compose orchestration
- [x] Load testing script

---

## 🎓 Untuk Presentasi / Demo

### Setup Demo (15 menit)

```bash
# 1. Start containers
docker-compose up -d

# 2. Monitor terminal
docker-compose logs -f

# 3. Di terminal baru, buka dashboard
# http://localhost:8080

# 4. Start load test
node load-test.js
```

### Menunjukkan Round Robin

```bash
# Di dashboard: Select "Round Robin"
# Di terminal: Lihat distribusi 1→2→3→1→2→3

# Output di terminal:
# → Request 1 to server-1
# → Request 2 to server-2
# → Request 3 to server-3
# → Request 4 to server-1
# (pattern berulang)
```

### Menunjukkan Least Connection

```bash
# Di dashboard: Select "Least Connection"
# Di terminal: Lihat distribusi berdasarkan koneksi aktif

# Kirim request yang panjang ke beberapa server
# Lihat request baru akan masuk ke server yang paling sepi

# Output di terminal:
# Least Connection: s1(3), s2(1), s3(5)
# → Request to server-2 (punya koneksi paling sedikit)
```

---

## 📝 Notes

- Semua container sudah dikonfigurasi dengan health checks
- Setiap container akan auto-restart jika crash
- Log sudah format dengan warna dan simbol untuk memudahkan monitoring
- Database/Persistence: Tidak ada, semua data hanya di memory (sesuai requirement)
- Network: Docker bridge network custom "lb-network"

---

**Status**: ✅ Semua sudah siap dijalankan!

Tinggal jalankan `docker-compose up -d` dan semuanya akan berjalan dengan sempurna.
