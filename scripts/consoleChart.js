document.addEventListener('DOMContentLoaded', function () {
    const consoleContent = document.getElementById('console-content');
    
    function setupMetricsCharts() {
        // Configuration
        const maxDataPoints = 60;
        let timeWindow = 60;
        let dataInterval;

        // Get canvas elements
        const cpuCtx = document.getElementById('cpu-canvas').getContext('2d');
        const memoryCtx = document.getElementById('memory-canvas').getContext('2d');
        const networkCtx = document.getElementById('network-canvas').getContext('2d');
        const diskCtx = document.getElementById('disk-canvas').getContext('2d');

        // Initialize data
        let timeLabels = Array(maxDataPoints).fill('');
        let cpuTotalData = Array(maxDataPoints).fill(0);
        let cpuServiceData = Array(maxDataPoints).fill(0);
        let memTotalData = Array(maxDataPoints).fill(0);
        let memServiceData = Array(maxDataPoints).fill(0);
        let networkUpData = Array(maxDataPoints).fill(0);
        let networkDownData = Array(maxDataPoints).fill(0);
        let diskData = Array(maxDataPoints).fill(0);

        // Generate time labels
        function updateTimeLabels() {
            const now = new Date();
            for (let i = 0; i < maxDataPoints; i++) {
                const time = new Date(now.getTime() - (maxDataPoints - i - 1) * (timeWindow * 1000 / maxDataPoints));
                timeLabels[i] = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        }
        updateTimeLabels();

        // CPU Chart (dual line)
        const cpuChart = new Chart(cpuCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Total CPU',
                        data: cpuTotalData,
                        borderColor: '#4285f4',
                        backgroundColor: 'rgba(66, 133, 244, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Service CPU',
                        data: cpuServiceData,
                        borderColor: '#ea4335',
                        backgroundColor: 'rgba(234, 67, 53, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    }
                ]
            },
            options: getChartOptions('CPU Usage', '%', true)
        });

        // Memory Chart (dual line with adaptive Y-axis)
        const memoryChart = new Chart(memoryCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Total Memory',
                        data: memTotalData,
                        borderColor: '#34a853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Service Memory',
                        data: memServiceData,
                        borderColor: '#fbbc05',
                        backgroundColor: 'rgba(251, 188, 5, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    }
                ]
            },
            options: getChartOptions('Memory Usage', '%', true)
        });

        // Network Chart (dual line)
        const networkChart = new Chart(networkCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Upload',
                        data: networkUpData,
                        borderColor: '#673ab7',
                        backgroundColor: 'rgba(103, 58, 183, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Download',
                        data: networkDownData,
                        borderColor: '#ff5722',
                        backgroundColor: 'rgba(255, 87, 34, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    }
                ]
            },
            options: getMemoryChartOptions('Network Usage', 'Kbps', true)
        });

        // Disk Chart
        const diskChart = new Chart(diskCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Disk Usage',
                    data: diskData,
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: getChartOptions('Disk Usage', '%')
        });

        // Common chart options
        function getChartOptions(title, unit, showLegend = false) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 250 },
                plugins: {
                    legend: {
                        display: showLegend,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${context.raw}${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function (value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: { mode: 'nearest', intersect: false }
            };
        }

        // Special memory chart options with adaptive Y-axis
        function getMemoryChartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                const unit = value > 1024 ? 'MB' : 'KB';
                                const displayValue = value > 1024 ? (value / 1024).toFixed(2) : value;
                                return `${context.dataset.label}: ${displayValue}${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        min: 0,
                        ticks: {
                            callback: function (value) {
                                if (value >= 1024) {
                                    return (value / 1024).toFixed(1) + 'MB';
                                }
                                return value + 'KB';
                            },
                            stepSize: function (context) {
                                const max = context.chart.scales.y.max;
                                if (max > 10240) return 2048;
                                if (max > 5120) return 1024;
                                if (max > 1024) return 512;
                                return 256;
                            }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    }
                },
                interaction: { mode: 'nearest', intersect: false }
            };
        }

        // Update Y-axis max for memory chart
        function updateMemoryYAxis() {
            const allMemoryData = [...memTotalData, ...memServiceData];
            const currentMax = Math.max(...allMemoryData);
            const maxWithMargin = currentMax * 1.2; // Add 20% margin

            memoryChart.options.scales.y.max = maxWithMargin;

            // Adjust step size based on max value
            const stepSize = maxWithMargin > 10240 ? 2048 :
                maxWithMargin > 5120 ? 1024 :
                    maxWithMargin > 1024 ? 512 : 256;

            memoryChart.options.scales.y.ticks.stepSize = stepSize;
            memoryChart.update();
        }

        // Simulate data updates
        function updateCharts() {
            // Shift old data
            timeLabels.shift();
            cpuTotalData.shift();
            cpuServiceData.shift();
            memTotalData.shift();
            memServiceData.shift();
            networkUpData.shift();
            networkDownData.shift();
            diskData.shift();

            // Add current time
            const now = new Date();
            timeLabels.push(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

            // Generate new simulated data and round to 2 decimal places
            const cpuBase = Math.random() * 30 + 20;
            cpuTotalData.push(parseFloat(Math.min(100, Math.max(0, cpuBase + (Math.random() * 6 - 3))).toFixed(2)));
            cpuServiceData.push(parseFloat(Math.min(cpuTotalData[cpuTotalData.length - 1],
                Math.max(0, cpuBase * 0.7 + (Math.random() * 4 - 2))).toFixed(2)));

            const memBase = Math.random() * 30 + 20;
            memTotalData.push(parseFloat(Math.min(100, Math.max(0, memBase + (Math.random() * 6 - 3))).toFixed(2)));
            memServiceData.push(parseFloat(Math.min(memTotalData[memTotalData.length - 1],
                Math.max(0, memBase * 0.7 + (Math.random() * 4 - 2))).toFixed(2)));

            const networkBase = Math.random() * 1000;
            networkUpData.push(parseFloat(Math.min(2048, Math.max(0, networkBase + (Math.random() * 100 - 50))).toFixed(2)));
            networkDownData.push(parseFloat(Math.min(2048, Math.max(0, networkBase + (Math.random() * 100 - 50))).toFixed(2)));

            diskData.push(parseFloat(Math.min(100, Math.max(0, diskData[diskData.length - 1] + (Math.random() * 2 - 1))).toFixed(2)));

            // Update charts
            cpuChart.data.labels = timeLabels;
            cpuChart.data.datasets[0].data = cpuTotalData;
            cpuChart.data.datasets[1].data = cpuServiceData;

            memoryChart.data.labels = timeLabels;
            memoryChart.data.datasets[0].data = memTotalData;
            memoryChart.data.datasets[1].data = memServiceData;

            networkChart.data.labels = timeLabels;
            networkChart.data.datasets[0].data = networkUpData;
            networkChart.data.datasets[1].data = networkDownData;

            diskChart.data.labels = timeLabels;
            diskChart.data.datasets[0].data = diskData;

            // Update displayed values
            document.getElementById('cpu-value').textContent =
                `${cpuTotalData[cpuTotalData.length - 1]}% (${cpuServiceData[cpuServiceData.length - 1]}%)`;

            document.getElementById('memory-value').textContent =
                `${memTotalData[memTotalData.length - 1]}% (${memServiceData[memServiceData.length - 1]}%)`;

            document.getElementById('network-value').textContent =
                `${networkUpData[networkUpData.length - 1]}↑ ${networkDownData[networkDownData.length - 1]}↓ Kbps`;

            document.getElementById('disk-value').textContent = `${diskData[diskData.length - 1]}%`;

            // Update charts
            memoryChart.update();
            cpuChart.update();
            networkChart.update();
            diskChart.update();
        }

        // Start data updates
        function startUpdates() {
            clearInterval(dataInterval);
            const updateInterval = timeWindow * 1000 / maxDataPoints;
            dataInterval = setInterval(updateCharts, updateInterval);
        }
        startUpdates();

        // Time range buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                timeWindow = parseInt(this.dataset.range);
                updateTimeLabels();
                startUpdates();
            });
        });

        // Initial data population - also rounded to 2 decimal places
        for (let i = 0; i < maxDataPoints; i++) {
            const cpuBase = Math.random() * 30 + 20;
            cpuTotalData[i] = parseFloat(cpuBase.toFixed(2));
            cpuServiceData[i] = parseFloat((cpuBase * 0.7).toFixed(2));

            const memBase = Math.random() * 30 + 20;
            memTotalData[i] = parseFloat(memBase.toFixed(2));
            memServiceData[i] = parseFloat((memBase * Math.random()).toFixed(2));

            networkUpData[i] = parseFloat((Math.random() * 300 + 100).toFixed(2));
            networkDownData[i] = parseFloat((Math.random() * 300 + 100).toFixed(2));
            diskData[i] = parseFloat((Math.random() * 20 + 30).toFixed(2));
        }

        // Initial update
        updateCharts();

        // Cleanup function
        return () => {
            clearInterval(dataInterval);
        };
    }


    function setupConsoleContent() {
        consoleContent.innerHTML = `
            <div class="metrics-header">
                <h2>System Metrics</h2>
                <div class="time-range">
                    <button class="time-btn active" data-range="60">60s</button>
                    <button class="time-btn" data-range="300">5min</button>
                    <button class="time-btn" data-range="600">10min</button>
                </div>
            </div>
            <div class="metrics-charts">
                <div class="metric-chart" id="cpu-chart">
                    <div class="chart-header">
                        <span class="metric-name">CPU Usage</span>
                        <span class="metric-value" id="cpu-value">0%</span>
                    </div>
                    <canvas id="cpu-canvas"></canvas>
                </div>
                <div class="metric-chart" id="memory-chart">
                    <div class="chart-header">
                        <span class="metric-name">Memory Usage</span>
                        <span class="metric-value" id="memory-value">0%</span>
                    </div>
                    <canvas id="memory-canvas"></canvas>
                </div>
                <div class="metric-chart" id="network-chart">
                    <div class="chart-header">
                        <span class="metric-name">Network Usage</span>
                        <span class="metric-value" id="network-value">0↑ 0↓ Kbps</span>
                    </div>
                    <canvas id="network-canvas"></canvas>
                </div>
                <div class="metric-chart" id="disk-chart">
                    <div class="chart-header">
                        <span class="metric-name">Disk Usage</span>
                        <span class="metric-value" id="disk-value">0%</span>
                    </div>
                    <canvas id="disk-canvas"></canvas>
                </div>
            </div>
            <h2 class="logs-header">Stream Logs</h2>
            <div class="console-log-list">
                ${generateLogItems(10)}
            </div>
        `;

        // Initialize charts after DOM is ready
        setTimeout(setupMetricsCharts, 0);
    }

    function generateLogItems(count) {
        const levels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];
        const messages = [
            'Stream started successfully',
            'New viewer connected',
            'Bandwidth usage high',
            'Dropped frames detected',
            'Connection issue with CDN',
            'Stream quality adjusted',
            'Recording started',
            'Viewer count updated',
            'Warning: CPU usage high',
            'Error: Audio encoder failed'
        ];

        let html = '';
        for (let i = 0; i < count; i++) {
            const level = levels[Math.floor(Math.random() * levels.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
            const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');

            html += `
                <div class="log-card">
                    <span class="log-level ${level.toLowerCase()}">${level}</span>
                    <span class="log-timestamp">${hours}:${minutes}</span>
                    <span class="log-message">${message}</span>
                    <button class="log-details-btn">Details</button>
                </div>
            `;
        }
        return html;
    }

    setupConsoleContent();
});