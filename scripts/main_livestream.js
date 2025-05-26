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
                toast.success('IntraStream Notice', 'Welcome to IntraStream! Realtime Streaming！');
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
});