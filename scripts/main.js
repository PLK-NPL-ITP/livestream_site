document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const scroller = document.getElementById('scroller');
    const cards = document.querySelectorAll('.scroller-card');
    const navItems = document.querySelectorAll('.nav-item');
    const indicatorDots = document.querySelectorAll('.indicator-dot');
    const loginBtn = document.getElementById('login-btn');
    const consoleNav = document.getElementById('console-nav');
    const consoleContent = document.getElementById('console-content');
    const privateStreamsNotice = document.getElementById('private-streams-notice');
    const publicStreams = document.getElementById('public-streams');

    // State
    let isLoggedIn = true; // Change to true to test logged in state
    let currentIndex = 0;
    let isDragging = false;
    let startPosX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;

    // Initialize
    updateAuthState();
    setupConsoleContent();
    setupEventListeners();

    function updateAuthState() {
        if (isLoggedIn) {
            loginBtn.textContent = 'Log Out';
            privateStreamsNotice.style.display = 'none';
            consoleNav.textContent = 'Console';
        } else {
            loginBtn.textContent = 'Log In';
            privateStreamsNotice.style.display = 'block';
            consoleNav.textContent = 'Log In to View';
        }
    }

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
        if (isLoggedIn) {
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
        } else {
            consoleContent.innerHTML = `
                <div class="login-prompt">
                    <h2>Please log in to access the console</h2>
                    <button class="btn-auth" id="prompt-login-btn">Log In</button>
                </div>
            `;
            document.getElementById('prompt-login-btn').addEventListener('click', toggleLogin);
        }
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

    function setupEventListeners() {
        // Login button
        loginBtn.addEventListener('click', toggleLogin);

        // Nav items click
        navItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (index === 2 && !isLoggedIn) {
                    toggleLogin();
                    return;
                }
                goToCard(index);
            });
        });

        // Indicator dots click
        indicatorDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (index === 2 && !isLoggedIn) {
                    toggleLogin();
                    return;
                }
                goToCard(index);
            });
        });

        // Join stream button
        document.querySelector('.btn-join')?.addEventListener('click', joinStream);

        // Start new stream button
        document.querySelector('.btn-new')?.addEventListener('click', startNewStream);

        // Touch events for mobile
        scroller.addEventListener('touchstart', touchStart);
        scroller.addEventListener('touchmove', touchMove);
        scroller.addEventListener('touchend', touchEnd);

        // Mouse events for desktop
        scroller.addEventListener('mousedown', touchStart);
        scroller.addEventListener('mousemove', touchMove);
        scroller.addEventListener('mouseup', touchEnd);
        scroller.addEventListener('mouseleave', touchEnd);

        // Wheel event for horizontal scrolling
        scroller.addEventListener('wheel', handleWheel, { passive: false });

        document.getElementById('advanced-toggle').addEventListener('click', function (e) {
            e.preventDefault();
            const settings = document.getElementById('advanced-settings');
            const section = document.getElementsByClassName('code-section')[0];
            const toggle = this;

            if (settings.style.display === 'flex') {
                settings.style.display = 'none';
                section.classList.toggle('expand')
                toggle.textContent = 'Click to open advanced Connection Settings';
            } else {
                settings.style.display = 'flex';
                section.classList.toggle('expand')
                toggle.textContent = 'Click to hide advanced Connection Settings';
            }
        });
        setTimeout(() => {
            document.getElementById("home-animation-svg").style.opacity = 1;
            var style = document.createElement('style');
            style.innerHTML = `
                .livestream-icon svg {
                    animation: iconEntrance 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                .livestream-icon::before {
                    animation: pulse 1.5s ease-out 0.5s forwards;
                }
            `
            document.head.appendChild(style);
        }, 500);
    }

    function toggleLogin() {
        isLoggedIn = !isLoggedIn;
        updateAuthState();
        setupConsoleContent();

        if (currentIndex === 2) {
            // If we're on the console page, refresh its content
            setupConsoleContent();
        }
    }

    function joinStream() {
        const code = document.getElementById('stream-code').value.trim();
        if (code) {
            alert(`Redirecting to stream: ${code}`);
            // In a real implementation, this would redirect to the stream page
            // window.location.href = `/stream/${code}`;
        } else {
            alert('Please enter a stream code');
        }
    }

    function startNewStream() {
        if (isLoggedIn) {
            toast.success('准备就绪', '正在启动新的直播...');
            // 在实际实现中，这将初始化一个新的直播
            // 并重定向到直播创建页面
            setTimeout(() => {
                console.log('即将跳转到创建直播页面');
                // window.location.href = '/create-stream';
            }, 1500);
        } else {
            toast.warning('需要登录', '请先登录以开始新的直播');
            setTimeout(() => {
                toggleLogin();
            }, 1000);
        }
    }

    function goToCard(index) {
        if (index < 0 || index >= cards.length) return;

        currentIndex = index;
        updateActiveCard();
        updateActiveNav();
        updateActiveIndicator();
        
        // 更新URL参数，不刷新页面
        const url = new URL(window.location.href);
        url.searchParams.set('card', index.toString());
        window.history.replaceState({}, '', url);

        // Scroll to the card
        cards[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }

    function updateActiveCard() {
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === currentIndex);
        });
    }

    function updateActiveNav() {
        navItems.forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });
    }

    function updateActiveIndicator() {
        indicatorDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function isAtScrollBoundary(element) {
        return {
            top: element.scrollTop === 0,
            bottom: Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
        };
    }

    function findScrollableParent(element) {
        while (element && element !== scroller) {
            const style = window.getComputedStyle(element);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                style.overflowX === 'auto' || style.overflowX === 'scroll') {
                if (element.scrollHeight > element.clientHeight ||
                    element.scrollWidth > element.clientWidth) {
                    return element;
                }
            }
            element = element.parentElement;
        }
        return null;
    }

    function touchStart(e) {
        const scrollableElement = findScrollableParent(e.target);

        if (scrollableElement && scrollableElement !== scroller) {
            const boundaries = isAtScrollBoundary(scrollableElement);

            // Only allow page switching if:
            // 1. At top and scrolling up
            // 2. At bottom and scrolling down
            // 3. Not in a scrollable element
            if (!((boundaries.top && e.deltaY < 0) ||
                (boundaries.bottom && e.deltaY > 0))) {
                return;
            }
        }
        
        console.log('Touch start');
        if (e.type === 'mousedown') {
            startPosX = e.clientX;
        } else {
            startPosX = e.touches[0].clientX;
        }
        prevTranslate = currentTranslate;
        cancelAnimationFrame(animationID);
    }

    function touchMove(e) {
        if (!isDragging && e.type !== 'touchmove') return;
        
        const scrollableElement = findScrollableParent(e.target);

        if (scrollableElement && scrollableElement !== scroller) {
            const boundaries = isAtScrollBoundary(scrollableElement);

            // Only allow page switching if:
            // 1. At top and scrolling up
            // 2. At bottom and scrolling down
            // 3. Not in a scrollable element
            if (!((boundaries.top && e.deltaY < 0) ||
                (boundaries.bottom && e.deltaY > 0))) {
                return;
            }
        }
        console.log('Touch move');

        const currentPosition = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const diff = currentPosition - startPosX;

        // Apply damping effect
        currentTranslate = prevTranslate + diff * 0.7;

        // Apply rubber band effect at boundaries
        if (currentIndex === 0 && currentTranslate > 0) {
            currentTranslate = Math.log(1 + diff * 0.01) * 50;
        } else if (currentIndex === cards.length - 1 && currentTranslate < 0) {
            currentTranslate = -Math.log(1 + Math.abs(diff) * 0.01) * 50;
        }

        scroller.style.transform = `translateX(${currentTranslate}px)`;
        isDragging = true;
    }

    function touchEnd() {
        if (!isDragging) return;
        
        console.log('Touch end');
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;

        scroller.style.transform = `translateX(0)`;
        if (movedBy < -100 && currentIndex < cards.length - 1) {
            // Swipe left
            goToCard(currentIndex + 1);
        } else if (movedBy > 100 && currentIndex > 0) {
            // Swipe right
            goToCard(currentIndex - 1);
        } else {
            // Return to current card
            goToCard(currentIndex);
        }
    }

    function handleWheel(e) {
        const scrollableElement = findScrollableParent(e.target);

        if (scrollableElement && scrollableElement !== scroller) {
            const boundaries = isAtScrollBoundary(scrollableElement);

            // Only allow page switching if:
            // 1. At top and scrolling up
            // 2. At bottom and scrolling down
            // 3. Not in a scrollable element
            if (!((boundaries.top && e.deltaY < 0) ||
                (boundaries.bottom && e.deltaY > 0))) {
                return;
            }
        }
        
        e.preventDefault();
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

        if (e.deltaY > 0 && currentIndex < cards.length - 1) {
            // Scroll down - move right
            goToCard(currentIndex + 1);
        } else if (e.deltaY < 0 && currentIndex > 0) {
            // Scroll up - move left
            goToCard(currentIndex - 1);
        }
    }
    
    // 从URL参数中获取card参数，切换到指定卡片
    function getInitialCardFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const cardParam = urlParams.get('card');
        
        // 检查card参数是否存在且为0-3之间的数字
        if (cardParam !== null && /^[0-3]$/.test(cardParam)) {
            const cardIndex = parseInt(cardParam, 10);
            return cardIndex;
        }
        
        // 默认返回0
        return 0;
    }

    // 初始化时获取并切换到指定卡片
    const initialCard = getInitialCardFromURL();
    
    // 根据URL参数初始化卡片
    goToCard(initialCard);

    // Handle window resize
    window.addEventListener('resize', () => {
        setTimeout(() => {
            goToCard(currentIndex);
        }, 500);
    });
});