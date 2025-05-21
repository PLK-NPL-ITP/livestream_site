document.addEventListener('DOMContentLoaded', function () {
    // 设备检测函数
    function checkDeviceCompatibility() {
        const smallScreenMaxWidth = 768; // 定义小屏幕设备的最大宽度（通常手机是小于768px）
        const currentWidth = window.innerWidth;
        
        // 检查是否已经在不可用设备页面，避免无限重定向
        if (window.location.href.includes('unavailable-device.html')) {
            return;
        }
        
        // 检查是否是从不可用设备页面返回的（通过URL参数判断）
        const urlParams = new URLSearchParams(window.location.search);
        const fromUnavailable = urlParams.get('from') === 'unavailable';
        
        if (currentWidth < smallScreenMaxWidth) {
            // 小屏幕设备，重定向到不可用页面
            window.location.href = 'unavailable-device.html';
        } else {
            // 中大屏幕设备，显示欢迎消息（但如果是从不可用页面返回则不显示）
            if (typeof toast !== 'undefined' && toast.success && !fromUnavailable) {
                toast.success('设备兼容', '欢迎使用我们的直播平台');
            }
        }
    }
    
    // 在页面加载时执行设备检测
    checkDeviceCompatibility();
    
    // 监听窗口大小变化，重新检测设备兼容性
    // 使用防抖处理，避免频繁触发重定向
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkDeviceCompatibility, 250);
    });
    
    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const consoleNav = document.getElementById('console-nav');
    const privateStreamsNotice = document.getElementById('private-streams-notice');

    // State
    let isLoggedIn = true; // Change to true to test logged in state
    let currentIndex = 0;


    // Initialize
    updateAuthState();
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

    function setupEventListeners() {
        // Login button
        loginBtn.addEventListener('click', toggleLogin);

        // Join stream button
        document.querySelector('.btn-join')?.addEventListener('click', joinStream);

        // Start new stream button
        document.querySelector('.btn-new')?.addEventListener('click', startNewStream);


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
});