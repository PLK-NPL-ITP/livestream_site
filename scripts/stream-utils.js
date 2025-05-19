
document.addEventListener('DOMContentLoaded', function () {
    // DOM 元素
    const publicStreams = document.getElementById('public-streams');
    let streamItems = document.querySelectorAll('.stream-item');
    
    // 初始化
    initializeStreamItems();
    
    // 开始定时更新
    startTimeUpdater();
    
    /**
     * 初始化所有直播项
     */
    function initializeStreamItems() {
        streamItems.forEach(item => {
            // 如果没有data-id，为其生成一个唯一ID
            if (!item.getAttribute('data-id')) {
                const uniqueId = generateUniqueId();
                item.setAttribute('data-id', uniqueId);
            }
            
            // 如果没有data-time，设置当前时间作为开始时间
            if (!item.getAttribute('data-time')) {
                // 默认设置为随机的1到5小时前
                const randomHours = Math.floor(Math.random() * 5) + 1;
                const randomMinutes = Math.floor(Math.random() * 60);
                const startTime = new Date();
                startTime.setHours(startTime.getHours() - randomHours);
                startTime.setMinutes(startTime.getMinutes() - randomMinutes);
                
                item.setAttribute('data-time', startTime.toISOString());
            }
            
            // 更新时间显示
            updateTimeDisplay(item);
            
            // 如果没有初始观看人数，设置一个随机数
            if (!item.getAttribute('data-viewers')) {
                const randomViewers = Math.floor(Math.random() * 100) + 5; // 5-104之间的随机数
                item.setAttribute('data-viewers', randomViewers);
            }
            
            // 更新观看人数显示
            updateViewersDisplay(item);
        });
    }
    
    /**
     * 生成唯一ID，格式为xxx-xxxx
     */
    function generateUniqueId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        
        // 生成前三位
        for (let i = 0; i < 3; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        id += '-';
        
        // 生成后四位
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return id;
    }
    
    /**
     * 更新时间显示
     */
    function updateTimeDisplay(streamItem) {
        const timeElement = streamItem.querySelector('.stream-meta');
        const startTimeStr = streamItem.getAttribute('data-time');
        
        if (timeElement && startTimeStr) {
            const startTime = new Date(startTimeStr);
            const currentTime = new Date();
            const timeDiff = getTimeDifference(startTime, currentTime);
            
            // 替换开始时间部分，保留观看人数部分
            const viewersText = timeElement.textContent.split('•')[1] || '';
            timeElement.textContent = `Started ${timeDiff} ago • ${viewersText.trim()}`;
        }
    }
    
    /**
     * 更新观看人数显示
     */
    function updateViewersDisplay(streamItem) {
        const metaElement = streamItem.querySelector('.stream-meta');
        const viewers = streamItem.getAttribute('data-viewers');
        
        if (metaElement && viewers) {
            // 保留已经计算好的时间部分
            const timeText = metaElement.textContent.split('•')[0] || '';
            metaElement.textContent = `${timeText.trim()} • ${viewers} viewers`;
        }
    }
    
    /**
     * 计算时间差并格式化为友好字符串
     */
    function getTimeDifference(startDate, endDate) {
        // 计算毫秒差
        const diff = Math.abs(endDate - startDate);
        
        // 计算时分秒
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // 格式化输出
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * 开始定时更新时间
     */
    function startTimeUpdater() {
        // 每秒更新一次时间显示
        setInterval(() => {
            // 重新获取所有的直播项，确保包含动态添加的项目
            const currentStreamItems = document.querySelectorAll('.stream-item');
            currentStreamItems.forEach(updateTimeDisplay);
        }, 5000);
        
        // 随机更新观看人数（模拟真实情况）
        setInterval(() => {
            const currentStreamItems = document.querySelectorAll('.stream-item');
            currentStreamItems.forEach(item => {
                if (Math.random() > 0.7) { // 30%的概率更新
                    const currentViewers = parseInt(item.getAttribute('data-viewers') || '0');
                    const change = Math.floor(Math.random() * 5) - 2; // -2到2的随机变化
                    const newViewers = Math.max(1, currentViewers + change); // 确保至少有1个观众
                    
                    item.setAttribute('data-viewers', newViewers);
                    updateViewersDisplay(item);
                }
            });
        }, 10000); // 每10秒更新一次
    }
    
    /**
     * 公开API，允许外部设置观看人数
     * @param {string} streamId - 直播ID，格式为xxx-xxxx
     * @param {number} viewers - 新的观看人数
     */
    window.setStreamViewers = function(streamId, viewers) {
        if (!streamId || isNaN(viewers)) return false;
        
        const streamItem = document.querySelector(`.stream-item[data-id="${streamId}"]`);
        if (streamItem) {
            streamItem.setAttribute('data-viewers', viewers);
            updateViewersDisplay(streamItem);
            return true;
        }
        
        return false;
    };
    
    /**
     * 公开API，允许外部设置直播开始时间
     * @param {string} streamId - 直播ID，格式为xxx-xxxx
     * @param {Date|string} startTime - 新的开始时间
     */
    window.setStreamStartTime = function(streamId, startTime) {
        if (!streamId || !startTime) return false;
        
        const streamItem = document.querySelector(`.stream-item[data-id="${streamId}"]`);
        if (streamItem) {
            // 确保startTime是ISO格式字符串
            const timeStr = startTime instanceof Date ? startTime.toISOString() : startTime;
            streamItem.setAttribute('data-time', timeStr);
            updateTimeDisplay(streamItem);
            return true;
        }
        
        return false;
    };
    
    /**
     * 添加新的直播项
     * @param {Object} options - 直播项的配置选项
     * @param {string} options.thumbnailSrc - 缩略图路径
     * @param {string} options.qualityInfo - 质量信息，例如"1080p • 30fps"
     * @param {string} options.title - 直播标题
     * @param {string} options.author - 直播作者
     * @param {Date|string} [options.startTime] - 开始时间，默认为当前时间
     * @param {number} [options.viewers] - 观看人数，默认为随机值
     * @param {string} options.visibility - 可见性，"public"或"private"
     * @param {string[]} options.tags - 标签数组
     * @param {string} options.description - 直播描述
     * @returns {HTMLElement} 新创建的直播项元素
     */
    window.addStreamItem = function(options) {
        // 检查必要的参数是否存在
        if (!options.thumbnailSrc || !options.qualityInfo || !options.title || 
            !options.author || !options.visibility || !options.tags) {
            console.error('Missing required parameters for adding stream item');
            return null;
        }
        
        // 获取或生成ID
        const streamId = options.id || generateUniqueId();
        
        // 设置开始时间，默认为当前时间
        let startTime;
        if (options.startTime) {
            startTime = options.startTime instanceof Date ? 
                options.startTime : new Date(options.startTime);
        } else {
            // 默认为随机的1-5小时前
            startTime = new Date();
            const randomHours = Math.floor(Math.random() * 5) + 1;
            const randomMinutes = Math.floor(Math.random() * 60);
            startTime.setHours(startTime.getHours() - randomHours);
            startTime.setMinutes(startTime.getMinutes() - randomMinutes);
        }
        
        // 设置观看人数，默认为随机值
        const viewers = options.viewers || Math.floor(Math.random() * 100) + 5;
        
        // 创建标签HTML
        const tagsHTML = options.tags.map(tag => 
            `<span class="stream-tag">${tag}</span>`
        ).join('');
        
        // 创建直播项HTML
        const streamHTML = `
            <div class="stream-item" data-visibility="${options.visibility}" data-tags="${options.tags.join(',')}" data-id="${streamId}" data-time="${startTime.toISOString()}" data-viewers="${viewers}">
                <div class="stream-thumbnail">
                    <img src="${options.thumbnailSrc}" alt="Stream thumbnail">
                    <span class="live-badge">LIVE</span>
                    <span class="quality-info">${options.qualityInfo}</span>
                </div>
                <div class="stream-info">
                    <div class="stream-info-left">
                        <h3>${options.title}</h3>
                        <p class="stream-author">${options.author}</p>
                        <p class="stream-meta">Started 0s ago • ${viewers} viewers</p>
                        <span class="stream-visibility${options.visibility === 'private' ? ' private' : ''}">${options.visibility === 'private' ? 'Private' : 'Public'}</span>
                        ${tagsHTML}
                    </div>
                    <p class="stream-description">${options.description || ''}</p>
                </div>
            </div>
        `;
        
        // 添加到DOM
        publicStreams.insertAdjacentHTML('beforeend', streamHTML);
        
        // 获取新添加的元素
        const newStreamItem = publicStreams.lastElementChild;
        
        // 更新时间显示
        updateTimeDisplay(newStreamItem);
        
        // 处理描述文本(如果处在列表视图模式)
        if (typeof window.processStreamDescriptions === 'function') {
            window.processStreamDescriptions();
        }
        
        // 触发重新筛选（如果filters.js存在这个函数）
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
        
        return newStreamItem;
    };
    
    /**
     * 清除所有直播项
     */
    window.clearAllStreamItems = function() {
        if (publicStreams) {
            publicStreams.innerHTML = '';
        }
    };
    
    /**
     * 添加示例直播项
     */
    window.addExampleStreamItems = function() {
        // 清除现有直播项
        window.clearAllStreamItems();
        
        // 示例1：每周团队会议
        window.addStreamItem({
            thumbnailSrc: 'assets/images/stream1.jpg',
            qualityInfo: '1080p • 30fps',
            title: 'Weekly Team Meeting',
            author: 'Jane Doe',
            startTime: '2025-05-19T10:30:00',
            viewers: 45,
            visibility: 'public',
            tags: ['Discussion', 'Meeting', 'Planning'],
            description: 'Discussion of current project progress, upcoming milestones, and team assignments for the next sprint.'
        });
        
        // 示例2：问答环节
        window.addStreamItem({
            thumbnailSrc: 'assets/images/stream1.jpg',
            qualityInfo: '1080p • 30fps',
            title: 'Q&A Session',
            author: 'John Smith',
            startTime: '2025-05-19T12:15:00',
            viewers: 38,
            visibility: 'public',
            tags: ['QA', 'Management', 'Tools'],
            description: 'Q&A session with the team lead about the new project management methodologies being implemented next month.'
        });
        
        // 示例3：私人会议
        window.addStreamItem({
            thumbnailSrc: 'assets/images/stream1.jpg',
            qualityInfo: '1080p • 30fps',
            title: 'Private Strategy Meeting',
            author: 'Alex Chen',
            startTime: '2025-05-19T11:45:00',
            viewers: 15,
            visibility: 'private',
            tags: ['General', 'Internal'],
            description: ''
        });
        
        // 示例4：API集成教学
        window.addStreamItem({
            thumbnailSrc: 'assets/images/stream1.jpg',
            qualityInfo: '1080p • 30fps',
            title: 'API Integration Workshop',
            author: 'Sarah Johnson',
            startTime: '2025-05-19T09:00:00',
            viewers: 72,
            visibility: 'public',
            tags: ['Educational', 'Code', 'API'],
            description: 'Live coding session demonstrating the new API integration with third-party services. Join to learn the implementation details! This hands-on session will help developers understand how to efficiently connect our platform with external services.'
        });
        
        // 示例5：产品展示
        window.addStreamItem({
            thumbnailSrc: 'assets/images/stream1.jpg',
            qualityInfo: '1080p • 30fps',
            title: 'Product Showcase',
            author: 'Michael Wilson',
            startTime: '2025-05-19T13:30:00',
            viewers: 104,
            visibility: 'public',
            tags: ['Product', 'Demo', 'Feature', 'Discussion', 'Meeting', 'Planning', 'Educational', 'Code', 'API'],
            description: 'Product showcase for the upcoming release. We\'ll be demonstrating all the new features and taking feedback from the team. This live session is especially important for product managers and UX designers as we\'ll cover detailed interface changes.'
        });
        
        // 最后确保处理所有直播项的描述
        if (typeof window.processStreamDescriptions === 'function') {
            window.processStreamDescriptions();
        }
        
        return true;
    };
});
