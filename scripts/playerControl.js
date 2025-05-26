/**
 * playerControl.js - 处理视频播放器的控制和当前流信息的显示
 */
document.addEventListener('DOMContentLoaded', function () {
    // 播放器元素
    const playerElement = document.getElementById('player');
    
    // 直播信息容器
    const streamPlayerHeader = document.getElementById('stream-player-header');
    
    // 当前流信息元素的引用
    let currentStreamTitle;
    let currentStreamAuthor;
    let currentStreamId;
    let currentStreamViewers;
    let currentStreamTime;
    let currentStreamTags;
    let currentStreamQuality;
    let liveStatus;
    
    // 生成直播头部信息HTML结构
    function generateStreamHeaderHTML(streamData) {
        // 格式化时间
        let formattedDate = '';
        if (streamData && streamData.startTime) {
            const startDate = new Date(streamData.startTime);
            formattedDate = `${startDate.getFullYear()}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getDate().toString().padStart(2, '0')} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        }
        // 标签
        let tagsHTML = '';
        if (streamData && streamData.tags && Array.isArray(streamData.tags)) {
            tagsHTML = streamData.tags.map(tag => `<span class="stream-tag-header">${tag}</span>`).join('');
        }
        return `
            <div class="stream-player-header-left">
                <h2 id="current-stream-title">${streamData?.title || ''}</h2>
                <span class="stream-author" id="current-stream-author">${streamData?.author || ''}</span>
                <span class="stream-id" id="current-stream-id">ID: ${streamData?.id || ''}</span>
                <span class="stream-viewers" id="current-stream-viewers">${streamData?.viewers || 0} viewers</span>
                <span class="stream-start-time" id="current-stream-time">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                        <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                    </svg>
                    ${formattedDate}
                </span>
                <div class="stream-tags-header" id="current-stream-tags">${tagsHTML}</div>
            </div>
            <div class="stream-player-header-right">
                <span class="stream-quality" id="current-stream-quality">${streamData?.qualityInfo || ''}</span>
                <span class="live-indicator" id="live-status">Livestreaming</span>
            </div>
        `;
    }

    // 初始化直播头部信息
    function initStreamHeader() {
        // 添加HTML结构
        streamPlayerHeader.innerHTML = generateStreamHeaderHTML();
        
        // 获取所有直播信息元素的引用
        currentStreamTitle = document.getElementById('current-stream-title');
        currentStreamAuthor = document.getElementById('current-stream-author');
        currentStreamId = document.getElementById('current-stream-id');
        currentStreamViewers = document.getElementById('current-stream-viewers');
        currentStreamTime = document.getElementById('current-stream-time');
        currentStreamTags = document.getElementById('current-stream-tags');
        currentStreamQuality = document.getElementById('current-stream-quality');
        liveStatus = document.getElementById('live-status');
    }
    
    // 初始化头部
    initStreamHeader();
    
    /**
     * 更新当前播放的直播信息
     * @param {Object} streamData - 直播数据对象
     */
    window.updateCurrentStream = function(streamData) {
        if (!streamPlayerHeader || !streamData) return;
        streamPlayerHeader.innerHTML = generateStreamHeaderHTML(streamData);
        // 重新获取元素引用
        const currentStreamViewers = document.getElementById('current-stream-viewers');
        // 如果有视频源，更新播放器源
        if (streamData.videoSrc) {
            const sourceElement = playerElement.querySelector('source');
            sourceElement.src = streamData.videoSrc;
            playerElement.load();
        }
        // 定期更新观看人数
        if (currentStreamViewers) {
            setInterval(function() {
                const currentViewers = parseInt(currentStreamViewers.textContent) || 0;
                const change = Math.floor(Math.random() * 5) - 2; // -2 到 +2 的随机变化
                const newViewers = Math.max(1, currentViewers + change);
                currentStreamViewers.textContent = `${newViewers} viewers`;
            }, 10000);
        }
    };

    // 初始化默认流信息 (使用第一个示例流)
    window.addEventListener('load', function() {
        setTimeout(function() {
            const defaultStream = {
                thumbnailSrc: 'assets/images/stream1.jpg',
                qualityInfo: '1080p • 30fps',
                title: 'Weekly Team Meeting',
                author: 'Jane Doe',
                startTime: '2025-05-19T10:30:00',
                viewers: 45,
                visibility: 'public',
                tags: ['Discussion', 'Meeting', 'Planning'],
                description: 'Discussion of current project progress, upcoming milestones, and team assignments for the next sprint.',
                id: 'abc-1234',
                videoSrc: './assets/video/video_sample.mp4'
            };
            window.updateCurrentStream(defaultStream);
        }, 300);
    });
    
    // 添加查看直播的功能（从流列表查看特定直播）
    if (typeof window.viewStream !== 'function') {
        window.viewStream = function(streamId) {
            // TODO: 根据streamId获取流数据并更新播放器
            console.log(`查看直播: ${streamId}`);
            
            // 如果需要，可以滚动到播放器视图
            const scroller = document.getElementById('scroller');
            if (scroller) {
                scroller.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
                
                // 更新导航栏激活状态
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach(item => {
                    item.classList.remove('active');
                });
                const homeNav = document.querySelector('.nav-item[data-target="0"]');
                if (homeNav) {
                    homeNav.classList.add('active');
                }
            }
        };
    }
});
