#!/usr/bin/env node

/**
 * Load Testing Script for Load Balancer
 * Sends requests to the load balancer and logs the results
 */

const LB_URL = process.env.LB_URL || 'http://localhost:3000';
const REQUESTS_PER_SECOND = parseInt(process.env.RPS || '5');
const DURATION_SECONDS = parseInt(process.env.DURATION || '30');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

const symbols = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    arrow: '→'
};

class LoadTester {
    constructor(baseUrl, rps, duration) {
        this.baseUrl = baseUrl;
        this.rps = rps;
        this.duration = duration;
        this.results = {
            total: 0,
            success: 0,
            failed: 0,
            totalTime: 0,
            minTime: Infinity,
            maxTime: -Infinity,
            responseTimes: []
        };
        this.startTime = null;
        this.intervalId = null;
    }

    log(level, message, data = {}) {
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
                color = colors.cyan;
                symbol = symbols.arrow;
                break;
            case 'stats':
                color = colors.magenta;
                symbol = '📊';
                break;
        }

        const logMsg = `${color}[${timestamp}] ${symbol} ${message}${colors.reset}`;
        console.log(logMsg, Object.keys(data).length > 0 ? data : '');
    }

    async sendRequest() {
        try {
            const requestStart = Date.now();
            
            const response = await fetch(`${this.baseUrl}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const responseTime = Date.now() - requestStart;

            this.results.success++;
            this.results.totalTime += responseTime;
            this.results.responseTimes.push(responseTime);
            this.results.minTime = Math.min(this.results.minTime, responseTime);
            this.results.maxTime = Math.max(this.results.maxTime, responseTime);

            this.log('success', `Request processed`, {
                requestId: data.requestId?.substring(0, 8),
                server: data.server,
                responseTime: `${responseTime}ms`,
                total: this.results.total
            });

            return { success: true, responseTime };
        } catch (error) {
            this.results.failed++;
            this.log('error', `Request failed: ${error.message}`, { total: this.results.total });
            return { success: false, error: error.message };
        }
    }

    getAverageResponseTime() {
        return this.results.success > 0 
            ? Math.round(this.results.totalTime / this.results.success) 
            : 0;
    }

    getMedianResponseTime() {
        if (this.results.responseTimes.length === 0) return 0;
        const sorted = [...this.results.responseTimes].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
            : sorted[mid];
    }

    printStats() {
        console.log('\n' + colors.bright + colors.magenta + '═══════════════════════════════════════════════════════' + colors.reset);
        console.log(colors.bright + colors.magenta + '                    LOAD TEST RESULTS                    ' + colors.reset);
        console.log(colors.bright + colors.magenta + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

        const stats = {
            'Total Requests': this.results.total,
            'Successful': colors.green + this.results.success + colors.reset,
            'Failed': this.results.failed > 0 ? colors.red + this.results.failed + colors.reset : this.results.failed,
            'Success Rate': `${((this.results.success / this.results.total) * 100).toFixed(2)}%`,
            'Min Response Time': `${this.results.minTime}ms`,
            'Max Response Time': `${this.results.maxTime}ms`,
            'Avg Response Time': `${this.getAverageResponseTime()}ms`,
            'Median Response Time': `${this.getMedianResponseTime()}ms`,
            'Requests/Second': `${(this.results.total / this.duration).toFixed(2)}`
        };

        Object.entries(stats).forEach(([key, value]) => {
            console.log(`  ${key.padEnd(20)}: ${value}`);
        });

        console.log('\n' + colors.bright + colors.magenta + '═══════════════════════════════════════════════════════' + colors.reset + '\n');
    }

    async run() {
        this.startTime = Date.now();
        this.log('info', `Starting load test`, {
            url: this.baseUrl,
            rps: this.rps,
            duration: `${this.duration}s`
        });

        const delayBetweenRequests = 1000 / this.rps;
        let lastRequestTime = 0;
        let running = true;

        const startTestTime = Date.now();

        return new Promise((resolve) => {
            const timer = setInterval(async () => {
                const elapsedSeconds = (Date.now() - startTestTime) / 1000;

                if (elapsedSeconds >= this.duration) {
                    clearInterval(timer);
                    running = false;
                    
                    this.log('info', 'Load test completed');
                    this.printStats();
                    resolve(this.results);
                    return;
                }

                const now = Date.now();
                if (now - lastRequestTime >= delayBetweenRequests) {
                    this.results.total++;
                    await this.sendRequest();
                    lastRequestTime = now;
                }
            }, 10);

            // Print progress every 5 seconds
            const progressTimer = setInterval(() => {
                if (!running) {
                    clearInterval(progressTimer);
                    return;
                }
                const elapsed = (Date.now() - startTestTime) / 1000;
                this.log('stats', `Progress: ${this.results.total} requests | Success: ${this.results.success} | Failed: ${this.results.failed} | Time: ${elapsed.toFixed(1)}s`);
            }, 5000);
        });
    }
}

// Main execution
async function main() {
    console.log(colors.bright + colors.cyan + '\n╔════════════════════════════════════════╗' + colors.reset);
    console.log(colors.bright + colors.cyan + '║     Load Balancer Load Testing Tool    ║' + colors.reset);
    console.log(colors.bright + colors.cyan + '╚════════════════════════════════════════╝' + colors.reset + '\n');

    const tester = new LoadTester(LB_URL, REQUESTS_PER_SECOND, DURATION_SECONDS);

    try {
        // Check if load balancer is reachable
        const response = await fetch(`${LB_URL}/health`);
        if (!response.ok) {
            throw new Error('Load balancer health check failed');
        }
        
        const health = await response.json();
        console.log(colors.green + '✓ Load Balancer is healthy\n' + colors.reset);
        
        // Start load test
        await tester.run();
    } catch (error) {
        console.error(colors.red + `✗ Error: Cannot connect to load balancer at ${LB_URL}` + colors.reset);
        console.error(colors.dim + `Make sure the load balancer is running and accessible.` + colors.reset);
        process.exit(1);
    }
}

main().catch(error => {
    console.error(colors.red + `Fatal error: ${error.message}` + colors.reset);
    process.exit(1);
});
