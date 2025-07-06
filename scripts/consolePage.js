document.addEventListener('DOMContentLoaded', function () {
    const consoleContent = document.getElementById('console-content');
    
    function setupMetricsCharts() {
        // Configuration
        const maxDataPoints = 60;
        let timeWindow = 600;
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
        let diskReadData = Array(maxDataPoints).fill(0);
        let diskWriteData = Array(maxDataPoints).fill(0);

        // Generate time labels
        function updateTimeLabels() {
            const now = new Date();
            for (let i = 0; i < maxDataPoints; i++) {
                const time = new Date(now.getTime() - (maxDataPoints - i - 1) * (timeWindow * 1000 / maxDataPoints));
                timeLabels[i] = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        }
        updateTimeLabels();

        // CPU Chart (dual line with adaptive Y-axis)
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
            options: getAdaptiveChartOptions('CPU Usage', '%', true)
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
            options: getAdaptiveChartOptions('Network Usage', 'KBps', true)
        });

        // Disk Chart (dual line with adaptive Y-axis)
        const diskChart = new Chart(diskCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Disk Read',
                        data: diskReadData,
                        borderColor: '#9c27b0',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Disk Write',
                        data: diskWriteData,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 0
                    }
                ]
            },
            options: getAdaptiveChartOptions('Disk I/O', 'KBps', true)
        });

        // 智能单位转换函数
        function formatBytesPerSecond(value) {
            if (value >= 1024 * 1024) {
                return (value / (1024 * 1024)).toFixed(2) + 'GBps';
            } else if (value >= 1024) {
                return (value / 1024).toFixed(2) + 'MBps';
            } else {
                return value.toFixed(2) + 'KBps';
            }
        }

        // 获取合适的字节单位
        function getBytesUnit(maxValue) {
            if (maxValue >= 1024 * 1024) {
                return { unit: 'GBps', divisor: 1024 * 1024 };
            } else if (maxValue >= 1024) {
                return { unit: 'MBps', divisor: 1024 };
            } else {
                return { unit: 'KBps', divisor: 1 };
            }
        }

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
        
        // Adaptive chart options for CPU, Network, and Disk
        function getAdaptiveChartOptions(title, unit, showLegend = false, tickCallback = null, tooltipCallback = null, minRange = null) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
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
                                if (tooltipCallback) {
                                    return `${context.dataset.label}: ${tooltipCallback(context.raw)}`;
                                }
                                // 对于网络和磁盘，使用智能单位转换
                                if (unit === 'KBps') {
                                    return `${context.dataset.label}: ${formatBytesPerSecond(context.raw)}`;
                                }
                                return `${context.dataset.label}: ${parseFloat(context.raw).toFixed(2)}${unit}`;
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
                            callback: tickCallback || function (value) {
                                // 对于网络和磁盘，使用智能单位转换
                                if (unit === 'KBps') {
                                    return formatBytesPerSecond(value);
                                }
                                return parseFloat(value).toFixed(2) + unit;
                            }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    }
                },
                interaction: { mode: 'nearest', intersect: false }
            };
        }

        // Update Y-axis max for adaptive charts with minimum range support
        function updateAdaptiveYAxis(chart, minRange, ...dataArrays) {
            const allData = dataArrays.flat();
            const currentMax = Math.max(...allData);
            let maxWithMargin = parseFloat((currentMax * 1.2).toFixed(2)); // Add 20% margin
            
            // 确保最小区间
            if (maxWithMargin < minRange) {
                maxWithMargin = minRange;
            }

            chart.options.scales.y.max = maxWithMargin;
            chart.update('none');
        }

        // Update Y-axis max for memory chart (legacy support)
        function updateMemoryYAxis() {
            updateAdaptiveYAxis(memoryChart, 1, memTotalData, memServiceData); // 最小1KB区间
        }

        // Update Y-axis max for CPU chart
        function updateCpuYAxis() {
            updateAdaptiveYAxis(cpuChart, 1, cpuTotalData, cpuServiceData); // 最小1%区间
        }

        // Update Y-axis max for disk chart
        function updateDiskYAxis() {
            updateAdaptiveYAxis(diskChart, 50, diskReadData, diskWriteData); // 最小50KBps区间
        }

        // Update Y-axis max for network chart
        function updateNetworkYAxis() {
            updateAdaptiveYAxis(networkChart, 50, networkUpData, networkDownData); // 最小50KBps区间
        }

        // Real-time data updates from API
        async function updateCharts(isInitialLoad = false) {
            console.log('Updating charts with new data...', isInitialLoad ? '(Initial Load)' : '(Regular Update)');
            if (window.hasMetricsPermission === false) {
                clearInterval(dataInterval);
                return;
            }

            try {
                // 根据是否初始化和时间窗口计算请求参数
                let timeDelta, timeInterval, pollInterval;
                
                if (isInitialLoad) {
                    // 初始加载时，请求整个时间窗口的数据
                    timeDelta = timeWindow;
                    timeInterval = Math.max(1, Math.floor(timeWindow / maxDataPoints)); // 确保至少1秒间隔
                    pollInterval = timeInterval * 1000; // 转换为毫秒
                } else {
                    // 常规更新时，根据时间窗口调整请求参数
                    if (timeWindow <= 60) {
                        // 60秒窗口：高频更新
                        pollInterval = 2000; // 2秒轮询
                        timeDelta = 3;
                        timeInterval = 1; // 1秒间隔
                    } else if (timeWindow <= 300) {
                        // 5分钟窗口：中频更新
                        pollInterval = 4000; // 4秒轮询
                        timeDelta = 4;
                        timeInterval = 2; // 2秒间隔
                    } else {
                        // 10分钟窗口：低频更新
                        pollInterval = 10000; // 10秒轮询
                        timeDelta = 10;
                        timeInterval = 5; // 5秒间隔
                    }
                }

                // 构建API请求URL
                const apiUrl = `/api/system-stats?time_delta=${timeDelta}&time_interval=${timeInterval}`;
                console.log(`Requesting: ${apiUrl} (Poll interval: ${pollInterval}ms)`);

                // 调用API获取系统统计数据
                const response = await window.authAPI.makeRequest(apiUrl, { auth: true });
                const systemStats = response["system_stats"];
                console.log('Fetched system stats:', systemStats);

                // 存储当前的轮询间隔，用于后续更新
                window.currentPollInterval = pollInterval;

                if (systemStats && Array.isArray(systemStats) && systemStats.length > 0) {
                    let newDataPoints = [];

                    if (isInitialLoad) {
                        // 初始加载时，使用所有返回的数据点，不进行去重检查
                        console.log(`Initial load: processing all ${systemStats.length} data points`);
                        newDataPoints = systemStats.map(dataPoint => ({
                            ...dataPoint,
                            timestampObj: new Date(dataPoint.timestamp),
                            timestampKey: new Date(dataPoint.timestamp).getTime()
                        }));
                    } else {
                        // 常规更新时，进行去重检查
                        console.log(`Regular update: checking for duplicates among ${systemStats.length} data points`);
                        
                        // 获取现有的时间戳集合，用于去重
                        const existingTimestamps = new Set();
                        for (let i = 0; i < timeLabels.length; i++) {
                            if (timeLabels[i]) {
                                // 将时间标签转换回时间戳进行比较（简化方案）
                                const today = new Date().toDateString();
                                const fullTimeString = `${today} ${timeLabels[i]}`;
                                const timestamp = new Date(fullTimeString).getTime();
                                existingTimestamps.add(timestamp);
                            }
                        }

                        // 过滤重复数据
                        for (const dataPoint of systemStats) {
                            const timestamp = new Date(dataPoint.timestamp);
                            const timestampKey = timestamp.getTime();
                            
                            // 检查是否为重复数据
                            if (!existingTimestamps.has(timestampKey)) {
                                newDataPoints.push({
                                    ...dataPoint,
                                    timestampObj: timestamp,
                                    timestampKey: timestampKey
                                });
                            } else {
                                console.log('Skipping duplicate timestamp:', dataPoint.timestamp);
                            }
                        }
                    }

                    // 按时间排序
                    newDataPoints.sort((a, b) => a.timestampKey - b.timestampKey);

                    if (newDataPoints.length === 0) {
                        console.log('No new data points to process');
                        return;
                    }

                    console.log(`Processing ${newDataPoints.length} new data points`);

                    if (isInitialLoad) {
                        // 初始加载时，清空数组并重新填充
                        timeLabels.length = 0;
                        cpuTotalData.length = 0;
                        cpuServiceData.length = 0;
                        memTotalData.length = 0;
                        memServiceData.length = 0;
                        networkUpData.length = 0;
                        networkDownData.length = 0;
                        diskReadData.length = 0;
                        diskWriteData.length = 0;

                        // 填充所有数据点，如果数据不足maxDataPoints，则在前面补零
                        const dataPointsToUse = newDataPoints.slice(-maxDataPoints); // 取最后maxDataPoints个数据点
                        const paddingNeeded = maxDataPoints - dataPointsToUse.length;

                        // 添加填充的空数据
                        for (let i = 0; i < paddingNeeded; i++) {
                            timeLabels.push('');
                            cpuTotalData.push(0);
                            cpuServiceData.push(0);
                            memTotalData.push(0);
                            memServiceData.push(0);
                            networkUpData.push(0);
                            networkDownData.push(0);
                            diskReadData.push(0);
                            diskWriteData.push(0);
                        }

                        // 添加实际数据
                        for (const dataPoint of dataPointsToUse) {
                            const timestamp = dataPoint.timestampObj;
                            const timeString = timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                second: '2-digit' 
                            });

                            timeLabels.push(timeString);
                            
                            // CPU数据映射 (需要乘以100转换为百分比)
                            const osCpuPercent = parseFloat((dataPoint.os_cpu_percent * 100 || 0).toFixed(2));
                            const srsCpuPercent = parseFloat((dataPoint.srs_cpu_percent * 100 || 0).toFixed(2));
                            cpuTotalData.push(osCpuPercent);
                            cpuServiceData.push(srsCpuPercent);

                            // 内存数据映射 (需要乘以100转换为百分比)
                            const osMemoryPercent = parseFloat((dataPoint.os_memory_percent * 100 || 0).toFixed(2));
                            const srsMemoryPercent = parseFloat((dataPoint.srs_memory_percent * 100 || 0).toFixed(2));
                            memTotalData.push(osMemoryPercent);
                            memServiceData.push(srsMemoryPercent);

                            // 网络数据映射（KBps）
                            const srsRecvKbps = parseFloat((dataPoint.srs_recv_KBps || 0).toFixed(2));
                            const srsSendKbps = parseFloat((dataPoint.srs_send_KBps || 0).toFixed(2));
                            networkDownData.push(srsRecvKbps);
                            networkUpData.push(srsSendKbps);

                            // 磁盘数据映射（直接显示读写速度）
                            const diskWriteKbps = parseFloat((dataPoint.disk_write_KBps || 0).toFixed(2));
                            const diskReadKbps = parseFloat((dataPoint.disk_read_KBps || 0).toFixed(2));
                            diskReadData.push(diskReadKbps);
                            diskWriteData.push(diskWriteKbps);
                        }
                    } else {
                        // 常规更新时，逐个添加新数据点
                        for (const dataPoint of newDataPoints) {
                            const timestamp = dataPoint.timestampObj;
                            const timeString = timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                second: '2-digit' 
                            });

                            // 移除旧数据
                            timeLabels.shift();
                            cpuTotalData.shift();
                            cpuServiceData.shift();
                            memTotalData.shift();
                            memServiceData.shift();
                            networkUpData.shift();
                            networkDownData.shift();
                            diskReadData.shift();
                            diskWriteData.shift();

                            // 添加新数据
                            timeLabels.push(timeString);
                            
                            // CPU数据映射 (需要乘以100转换为百分比)
                            const osCpuPercent = parseFloat((dataPoint.os_cpu_percent * 100 || 0).toFixed(2));
                            const srsCpuPercent = parseFloat((dataPoint.srs_cpu_percent * 100 || 0).toFixed(2));
                            cpuTotalData.push(osCpuPercent);
                            cpuServiceData.push(srsCpuPercent);

                            // 内存数据映射 (需要乘以100转换为百分比)
                            const osMemoryPercent = parseFloat((dataPoint.os_memory_percent * 100 || 0).toFixed(2));
                            const srsMemoryPercent = parseFloat((dataPoint.srs_memory_percent * 100 || 0).toFixed(2));
                            memTotalData.push(osMemoryPercent);
                            memServiceData.push(srsMemoryPercent);

                            // 网络数据映射（KBps）
                            const srsRecvKbps = parseFloat((dataPoint.srs_recv_KBps || 0).toFixed(2));
                            const srsSendKbps = parseFloat((dataPoint.srs_send_KBps || 0).toFixed(2));
                            networkDownData.push(srsRecvKbps);
                            networkUpData.push(srsSendKbps);

                            // 磁盘数据映射（直接显示读写速度）
                            const diskWriteKbps = parseFloat((dataPoint.disk_write_KBps || 0).toFixed(2));
                            const diskReadKbps = parseFloat((dataPoint.disk_read_KBps || 0).toFixed(2));
                            diskReadData.push(diskReadKbps);
                            diskWriteData.push(diskWriteKbps);
                        }
                    }

                    // 使用最新的数据点更新显示值
                    const latestData = newDataPoints[newDataPoints.length - 1];
                    const osCpuPercent = parseFloat((latestData.os_cpu_percent * 100 || 0).toFixed(2));
                    const srsCpuPercent = parseFloat((latestData.srs_cpu_percent * 100 || 0).toFixed(2));
                    const osMemoryPercent = parseFloat((latestData.os_memory_percent * 100 || 0).toFixed(2));
                    const srsMemoryPercent = parseFloat((latestData.srs_memory_percent * 100 || 0).toFixed(2));
                    const srsRecvKbps = parseFloat((latestData.srs_recv_KBps || 0).toFixed(2));
                    const srsSendKbps = parseFloat((latestData.srs_send_KBps || 0).toFixed(2));
                    const diskWriteKbps = parseFloat((latestData.disk_write_KBps || 0).toFixed(2));
                    const diskReadKbps = parseFloat((latestData.disk_read_KBps || 0).toFixed(2));

                    // 更新图表数据
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
                    diskChart.data.datasets[0].data = diskReadData;
                    diskChart.data.datasets[1].data = diskWriteData;

                    // 更新显示的数值
                    document.getElementById('cpu-value').textContent =
                        `${osCpuPercent.toFixed(2)}% (${srsCpuPercent.toFixed(2)}%)`;

                    document.getElementById('memory-value').textContent =
                        `${osMemoryPercent.toFixed(2)}% (${srsMemoryPercent.toFixed(2)}%)`;

                    document.getElementById('network-value').textContent =
                        `${formatBytesPerSecond(srsSendKbps)}↑ ${formatBytesPerSecond(srsRecvKbps)}↓`;

                    document.getElementById('disk-value').textContent = 
                        `R:${formatBytesPerSecond(diskReadKbps)} W:${formatBytesPerSecond(diskWriteKbps)}`;

                    // 更新自适应Y轴
                    updateCpuYAxis();
                    updateMemoryYAxis();
                    updateNetworkYAxis();
                    updateDiskYAxis();

                    // 更新图表显示
                    cpuChart.update('none'); // 无动画更新以提高性能
                    memoryChart.update('none');
                    networkChart.update('none');
                    diskChart.update('none');

                } else {
                    console.warn('No valid data received from API');
                }

            } catch (error) {
                console.error('Failed to fetch system stats:', error);
                // 如果API调用失败，可以选择使用模拟数据作为后备
                // 或者显示错误状态
            }
        }

        // Start data updates with dynamic interval based on time window
        function startUpdates() {
            clearInterval(dataInterval);
            // 首次调用为初始加载
            updateCharts(true).then(() => {
                // 使用计算出的轮询间隔进行后续更新
                const pollInterval = window.currentPollInterval || 4000; // 默认4秒
                console.log(`Starting regular updates with ${pollInterval}ms interval`);
                dataInterval = setInterval(() => updateCharts(false), pollInterval);
            });
        }
        startUpdates();

        // Time range buttons (动态调整轮询间隔)
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                timeWindow = parseInt(this.dataset.range);
                updateTimeLabels();
                
                // 清空现有数据，重新初始化
                for (let i = 0; i < maxDataPoints; i++) {
                    timeLabels[i] = '';
                    cpuTotalData[i] = 0;
                    cpuServiceData[i] = 0;
                    memTotalData[i] = 0;
                    memServiceData[i] = 0;
                    networkUpData[i] = 0;
                    networkDownData[i] = 0;
                    diskReadData[i] = 0;
                    diskWriteData[i] = 0;
                }
                
                // 重新开始更新，使用新的时间窗口计算轮询间隔
                clearInterval(dataInterval);
                updateCharts(true).then(() => {
                    // 使用新计算出的轮询间隔
                    const pollInterval = window.currentPollInterval || 4000;
                    console.log(`Time range changed to ${timeWindow}s, new poll interval: ${pollInterval}ms`);
                    dataInterval = setInterval(() => updateCharts(false), pollInterval);
                });
            });
        });

        // Initial data population with zeros (will be updated by API)
        for (let i = 0; i < maxDataPoints; i++) {
            cpuTotalData[i] = 0;
            cpuServiceData[i] = 0;
            memTotalData[i] = 0;
            memServiceData[i] = 0;
            networkUpData[i] = 0;
            networkDownData[i] = 0;
            diskReadData[i] = 0;
            diskWriteData[i] = 0;
        }

        // Start with initial API call (handled by startUpdates)

        // Cleanup function
        return () => {
            clearInterval(dataInterval);
        };
    }


    // 获取当前用户组的通用函数
    function getCurrentUserGroup() {
        const currentProfile = window.authAPI ? window.authAPI.getCurrentProfile() : null;
        
        if (!currentProfile?.user_group) {
            return 'visitor';
        }
        
        if (Array.isArray(currentProfile.user_group)) {
            // 如果是数组，选择最高权限级别
            const groups = currentProfile.user_group;
            const hierarchy = ['visitor', 'user', 'streamer', 'manager', 'admin'];
            return groups.reduce((highest, group) => {
                const currentIndex = hierarchy.indexOf(group);
                const highestIndex = hierarchy.indexOf(highest);
                return currentIndex > highestIndex ? group : highest;
            }, 'visitor');
        }
        
        // 如果是字符串，直接使用
        return currentProfile.user_group;
    }

    // 检查用户是否有权限查看系统指标
    function checkMetricsPermission(userGroup) {
        const allowedGroups = ['streamer', 'manager', 'admin'];
        
        if (Array.isArray(userGroup)) {
            // 如果userGroup是数组，检查是否包含任一允许的组
            return userGroup.some(group => allowedGroups.includes(group));
        } else {
            // 如果userGroup是字符串，直接检查
            return allowedGroups.includes(userGroup);
        }
    }

    function getUserPermissionsTable() {
        // 获取当前用户信息
        const currentUserGroup = getCurrentUserGroup();
        
        // 定义权限分类和详细信息
        const permissionCategories = 
            window.permissionData ||
            (() => {
            try {
                // 尝试从全局window.permissionData获取（如果后端已注入）
                if (window.permissionData) return window.permissionData;
                // 否则同步请求本地JSON（仅限本地开发环境）
                let xhr = new XMLHttpRequest();
                xhr.open('GET', './assets/permission.json', false);
                xhr.send(null);
                if (xhr.status === 200) {
                return JSON.parse(xhr.responseText);
                }
            } catch (e) {
                console.error('Failed to load permission.json:', e);
            }
            return [];
            })();

        // 获取权限图标
        function getPermissionIcon(permission) {
            switch (permission) {
                case 'denied':
                    return `<span class="permission-icon denied" title="Not allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
                        </svg>
                    </span>`;
                case 'allowed':
                    return `<span class="permission-icon allowed" title="Allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
                        </svg>
                    </span>`;
                case 'highest':
                    return `<span class="permission-icon highest" title="Highest privilege">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm74.1-396.4c5.8 4.7 7.6 12.9 4.2 19.6L281.9 240l70.1 0c6.8 0 12.9 4.3 15.1 10.7s.2 13.5-5.1 17.8l-160 128c-5.9 4.7-14.2 4.7-20.1-.1s-7.6-12.9-4.3-19.6L230.1 272 160 272c-6.8 0-12.8-4.3-15.1-10.7s-.2-13.5 5.1-17.8l160-128c5.9-4.7 14.2-4.7 20.1 .1z"/>
                        </svg>
                    </span>`;
                default:
                    return `<span class="permission-icon denied">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M256 512A256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
                        </svg>
                    </span>`;
            }
        }

        // 生成统一表格HTML
        let tableHTML = `
            <div class="permissions-header">
                <h2>User Permissions</h2>
                <div class="current-user-info">
                    <span class="current-role">Current Role: <strong class="role-${currentUserGroup}">${currentUserGroup.charAt(0).toUpperCase() + currentUserGroup.slice(1)}</strong></span>
                </div>
            </div>
            <div class="permissions-table-container">
                <table class="permissions-table unified-table">
                    <thead>
                        <tr>
                            <th class="permission-name">Permission</th>
                            <th class="role-header ${currentUserGroup === 'visitor' ? 'current-role' : ''}">Visitor</th>
                            <th class="role-header ${currentUserGroup === 'user' ? 'current-role' : ''}">User</th>
                            <th class="role-header ${currentUserGroup === 'streamer' ? 'current-role' : ''}">Streamer</th>
                            <th class="role-header ${currentUserGroup === 'manager' ? 'current-role' : ''}">Manager</th>
                            <th class="role-header ${currentUserGroup === 'admin' ? 'current-role' : ''}">Admin</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        permissionCategories.forEach((category, categoryIndex) => {
            // 添加分类分隔行
            tableHTML += `
                <tr class="category-separator-row">
                    <td colspan="6" class="category-separator">
                        <div class="category-separator-content">
                            <span class="category-separator-text">${category.category}</span>
                            <div class="category-separator-line"></div>
                        </div>
                    </td>
                </tr>
            `;

            // 添加权限行
            category.permissions.forEach((permission, permissionIndex) => {
                const hasDescription = permission.description && permission.description.trim() !== '';
                
                tableHTML += `
                    <tr class="permission-row ${categoryIndex % 2 === 0 ? 'even-category' : 'odd-category'}">
                        <td class="permission-name-cell">
                            <div class="permission-name-wrapper">
                                <span class="permission-name-text">${permission.name}</span>
                                ${hasDescription ? `
                                    <button class="permission-info-btn" onclick="showPermissionDetails('${permission.name}', \`${permission.description}\`)" title="More information">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                                        </svg>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                        <td class="permission-cell ${currentUserGroup === 'visitor' ? 'current-user-cell' : ''}">
                            ${getPermissionIcon(permission.visitor)}
                        </td>
                        <td class="permission-cell ${currentUserGroup === 'user' ? 'current-user-cell' : ''}">
                            ${getPermissionIcon(permission.user)}
                        </td>
                        <td class="permission-cell ${currentUserGroup === 'streamer' ? 'current-user-cell' : ''}">
                            ${getPermissionIcon(permission.streamer)}
                        </td>
                        <td class="permission-cell ${currentUserGroup === 'manager' ? 'current-user-cell' : ''}">
                            ${getPermissionIcon(permission.manager)}
                        </td>
                        <td class="permission-cell ${currentUserGroup === 'admin' ? 'current-user-cell' : ''}">
                            ${getPermissionIcon(permission.admin)}
                        </td>
                    </tr>
                `;
            });
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }

    function setupConsoleContent() {
        // 检查当前用户是否有权限查看系统指标
        const consolePageNavbar = document.getElementById('console-nav');
        const currentUserGroup = getCurrentUserGroup();
        window.hasMetricsPermission = checkMetricsPermission(currentUserGroup);

        if (window.hasMetricsPermission) {
            // 有权限时显示系统指标和权限表格
            consoleContent.innerHTML = `
                <div class="metrics-header">
                    <h2>System Metrics</h2>
                    <div class="time-range">
                        <button class="time-btn" data-range="60">60s</button>
                        <button class="time-btn" data-range="300">5min</button>
                        <button class="time-btn active" data-range="600">10min</button>
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
                ${getUserPermissionsTable()}
            `;
            
            // Deprecated: System Logs
            // <h2 class="logs-header">Stream Logs</h2>
            // <div class="console-log-list">
            //     ${generateLogItems(10)}
            // </div>
            // Initialize charts after DOM is ready
            setupMetricsCharts();

            consolePageNavbar.innerHTML = "Console"
        } else {
            // 无权限时只显示权限表格
            consoleContent.innerHTML = `
                ${getUserPermissionsTable()}
            `;
            consolePageNavbar.innerHTML = "User Permissions";
        }

        // 监听认证状态变化，更新权限表格
        setupPermissionsUpdateListener();
    }

    function setupPermissionsUpdateListener() {
        // 存储当前用户组状态
        let currentUserGroupState = getCurrentUserGroup();
        
        // 监听认证状态变化
        window.addEventListener('api-event', (event) => {
            console.log('Auth event received:', event.detail);
            if (event.detail.type === 'profile-updated') {
                const newUserGroup = getCurrentUserGroup();
                console.log('User group changed:', currentUserGroupState, '->', newUserGroup);
                
                // 检查权限是否发生变化
                const oldPermission = checkMetricsPermission(currentUserGroupState);
                const newPermission = checkMetricsPermission(newUserGroup);
                
                if (oldPermission !== newPermission || currentUserGroupState !== newUserGroup) {
                    // 权限发生变化或用户组发生变化时，重新渲染整个控制台内容
                    console.log('Permissions or user group changed, updating console content...');
                    setupConsoleContent();
                    currentUserGroupState = newUserGroup;
                }
            }
        });
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

    function createPermissionDetailsPopup() {
        const popupHTML = `
            <div class="permission-details-popup" id="permission-details-popup">
                <div class="permission-details-content">
                    <button class="close-permission-popup" id="close-permission-popup" title="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="permission-details-header">
                        <h3 class="permission-details-title" id="permission-details-title">Permission Details</h3>
                    </div>
                    
                    <div class="permission-details-body">
                        <p class="permission-details-description" id="permission-details-description">
                            Permission description will appear here.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加弹窗到页面
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // 添加事件监听器
        document.getElementById('close-permission-popup').addEventListener('click', hidePermissionDetails);
        document.getElementById('permission-details-popup').addEventListener('click', function(e) {
            if (e.target === this) {
                hidePermissionDetails();
            }
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('permission-details-popup').classList.contains('active')) {
                hidePermissionDetails();
            }
        });
    }

    // 显示权限详情
    window.showPermissionDetails = function(permissionName, description) {
        // 如果弹窗不存在，先创建
        if (!document.getElementById('permission-details-popup')) {
            createPermissionDetailsPopup();
        }
        
        const popup = document.getElementById('permission-details-popup');
        const content = popup.querySelector('.permission-details-content');
        const title = document.getElementById('permission-details-title');
        const desc = document.getElementById('permission-details-description');
        
        title.textContent = permissionName;
        desc.innerHTML = description;
        
        popup.style.display = 'flex';
        content.classList.remove('closing');
        
        // 添加动画效果
        setTimeout(() => {
            popup.classList.add('active');
        }, 10);
    }

    // 隐藏权限详情
    function hidePermissionDetails() {
        const popup = document.getElementById('permission-details-popup');
        if (popup) {
            const content = popup.querySelector('.permission-details-content');
            popup.classList.remove('active');
            
            setTimeout(() => {
                content.classList.add('closing');
                setTimeout(() => {
                    popup.style.display = 'none';
                    content.classList.remove('closing');
                }, 300);
            }, 0);
        }
    }

    setupConsoleContent();
});