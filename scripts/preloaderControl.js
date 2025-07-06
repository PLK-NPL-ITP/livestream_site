/**
 * 动态Preloader控制模块
 * 
 * 作者: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * 日期: 2025-05-22
 * 
 * 这个脚本实现了动态添加和控制preloader的功能:
 * - 在当前活动卡片的容器中动态添加preloader
 * - 通过平滑的opacity过渡效果显示和隐藏
 * - 显示preloader时禁用横向滚动
 * - 控制导航栏项目和指示点的显示/隐藏
 */

document.addEventListener('DOMContentLoaded', function() {
    // 缓存常用DOM元素
    scroller = document.getElementById('scroller');
    navItems = document.querySelectorAll('.nav-item');
    indicatorDots = document.querySelectorAll('.indicator-dot');
    
    // 存储原始overflow状态
    let originalOverflow;
    
    // 预加载器HTML模板
    const preloaderTemplate = `
    <div class="preloader" style="opacity: 0; display: none;">
        <div class="preloader-content">
            <div class="preloader-item">
                <h2 class="ml13 ml13-dynamic">Loading......</h2>
            </div>
            <div class="preloader-item">
                <div class="wrapper">
                    <div class="box-wrap">
                        <div class="box one"></div>
                        <div class="box two"></div>
                        <div class="box three"></div>
                        <div class="box four"></div>
                        <div class="box five"></div>
                        <div class="box six"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="preloader-item preloader-debug-container">
                <p class="preloader-debug-info"></p>
        </div>
    </div>`;
    
    /**
     * 获取当前活动卡片的容器
     */
    function getCurrentCardContainer() {
        const activeCard = document.querySelector('.scroller-card.active');
        if (!activeCard) return null;
        
        return activeCard.querySelector(':scope > div') || activeCard.firstElementChild;
    }
    
    /**
     * 在当前卡片容器中动态添加preloader
     */
    function addPreloaderToCurrentCard() {
        const container = getCurrentCardContainer();
        if (!container) return;
        
        // 检查是否已存在preloader
        let preloader = container.querySelector('.preloader');
        if (!preloader) {
            // 创建新的preloader元素
            container.insertAdjacentHTML('afterbegin', preloaderTemplate);
            preloader = container.querySelector('.preloader');
            
            // 初始化文本动画
            initTextAnimation();
        }
        
        return preloader;
    }
    
    /**
     * 初始化文本动画
     */
    function initTextAnimation() {
        const textWrapper = document.querySelector('.ml13-dynamic');
        if (!textWrapper) return;
        
        // 拆分文字
        const words = textWrapper.textContent.trim().split(' ');
        textWrapper.innerHTML = '';
        
        // 包装每个单词和字母
        words.forEach(function(word) {
            const wordSpan = document.createElement('span');
            wordSpan.classList.add('word');
            wordSpan.innerHTML = word.replace(/\S/g, "<span class='letter'>$&</span>");
            textWrapper.appendChild(wordSpan);
            textWrapper.appendChild(document.createTextNode(' '));
        });
        
        // 创建动画
        if (typeof anime !== 'undefined') {
            anime.timeline({ loop: true })
                .add({
                    targets: '.ml13-dynamic .letter',
                    translateY: [40, 0],
                    translateZ: 0,
                    opacity: [0, 1],
                    filter: ['blur(5px)', 'blur(0px)'],
                    easing: "easeOutExpo",
                    duration: 1000,
                    delay: (el, i) => 300 + 30 * i
                }).add({
                    targets: '.ml13-dynamic .letter',
                    translateY: [0, -40],
                    opacity: [1, 0],
                    filter: ['blur(0px)', 'blur(5px)'],
                    easing: "easeInExpo",
                    duration: 1000,
                    delay: (el, i) => 100 + 30 * i
                });
        }
    }
    
    /**
     * 显示preloader
     * @param {string} loadingText - 可选的加载文本
     * @param {boolean} animate - 是否启用淡入动画
     */
    function showPreloader(loadingText = 'Loading......', animate = true) {
        // 先添加preloader到DOM
        const preloader = addPreloaderToCurrentCard();
        if (!preloader) return;
        
        // 更新加载文本（如果提供）
        const textElement = preloader.querySelector('.ml13-dynamic');
        if (textElement && textElement.textContent !== loadingText) {
            textElement.textContent = loadingText;
            initTextAnimation();
        }

        // 清空调试信息
        const debugInfoElement = preloader.querySelector('.preloader-debug-info');
        if (debugInfoElement) {
            debugInfoElement.textContent = '';
        }
        
        // 禁止横向滚动（使用全局allowScroll变量）
        window.allowScroll = false;
        
        // 隐藏导航和指示点（通过opacity）
        navItems.forEach(item => {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '0';
        });
        
        indicatorDots.forEach(dot => {
            dot.style.transition = 'opacity 0.3s ease';
            dot.style.opacity = '0';
        });
        
        
        if (preloader.parentNode && typeof preloader.parentNode.scrollTo === 'function') {
            preloader.parentNode.scrollTo({ top: 0, behavior: 'auto' });
            preloader.parentNode.style.overflow = 'hidden'; 
        }
        
        // 显示preloader（立即显示，无动画）
        if (animate) {
            preloader.style.display = 'flex';
            preloader.style.opacity = '0'; // 初始透明度为0
            setTimeout(() => {
                preloader.style.opacity = '1'; // 淡入效果
            }, 10); // 确保样式更新后再开始淡入
        } else {
            preloader.style.display = 'flex';
            preloader.style.opacity = '1';
        }
    }
    
    /**
     * 隐藏preloader
     * @param {Function} callback - 隐藏完成后的回调函数
     */
    function hidePreloader(callback) {
        const container = getCurrentCardContainer();
        if (!container) {
            if (callback) callback();
            return;
        }
        
        const preloader = container.querySelector('.preloader');
        if (!preloader) {
            if (callback) callback();
            return;
        }
        
        // 淡出效果
        preloader.parentNode.style.overflow = ''; // 恢复overflow
        preloader.style.opacity = '0';
        
        // 恢复横向滚动（使用全局allowScroll变量）
        window.allowScroll = true;
        
        // 恢复导航和指示点显示
        navItems.forEach(item => {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '1';
        });
        
        indicatorDots.forEach(dot => {
            dot.style.transition = 'opacity 0.3s ease';
            dot.style.opacity = '1';
        });
        
        // 动画完成后从DOM中移除preloader
        setTimeout(() => {
            preloader.parentNode.removeChild(preloader);
            if (callback) callback();
        }, 500);
    }

    /**
     * 更新Preloader中的调试信息
     * @param {string} message - 要显示的调试信息
     */
    function updateDebugInfo(message) {
        const container = getCurrentCardContainer();
        if (!container) return;

        const preloader = container.querySelector('.preloader');
        if (!preloader) return;

        const debugInfoElement = preloader.querySelector('.preloader-debug-info');
        if (debugInfoElement) {
            debugInfoElement.textContent = message;
        }
    }

    // 暴露公共API
    window.preloaderControl = {
        show: showPreloader,
        hide: hidePreloader,
        updateDebugInfo: updateDebugInfo
    };
});
