/**
 * Livestream Viewer Application
 * 
 * 作者: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * 日期: 2025-07-06
 * 
 * 这个脚本实现了直播观看页面的完整逻辑:
 * - URL参数验证和重定向
 * - 用户认证状态检查
 * - 长轮询流状态监控
 * - WebRTC连接管理
 * - 状态变化响应
 */

document.addEventListener('DOMContentLoaded', function () {
    // 全局状态管理
    const livestreamState = {
        streamCode: null,
        visitorId: null,
        currentStreamInfo: null,
        previousStreamInfo: null, // 新增：用于比较变化
        srsRtcPlayer: null,
        plyrInstance: null,
        pollingInterval: null,
        isConnected: false,
        currentUserId: null // 新增：用于跟踪当前用户身份
    };

    // 初始化应用
    initializeLivestreamApp();

    async function initializeLivestreamApp() {
        // 立即显示preloader
        window.preloaderControl.show('Loading......', animate=false);
        window.preloaderControl.updateDebugInfo('Initializing application components...');

        // 1. 检查URL参数获取stream-code
        if (!checkStreamCodeParameter()) {
            return; // 如果没有stream-code，已经重定向
        }

        // 2. 设置认证状态监听器
        setupAuthEventListener();

        // 3. 初始化当前用户身份
        initializeCurrentUserId();

        // 4. 初始化视频播放器
        initializeVideoPlayer();

        // 5. 开始长轮询检查流状态
        startStreamPolling();
    }

    /**
     * 检查URL参数中的stream-code
     * @returns {boolean} 是否找到有效的stream-code
     */
    function checkStreamCodeParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        const streamCode = urlParams.get('stream-code');

        if (!streamCode || !isValidStreamCode(streamCode)) {
            window.preloaderControl.updateDebugInfo('ERROR: Invalid or missing stream-code parameter. Required format: xxx-xxxx or xxx-xxxx-xxx');
            setTimeout(() => {
                window.location.href = '/?card=0';
            }, 1500);
            return false;
        }

        livestreamState.streamCode = streamCode;
        window.preloaderControl.updateDebugInfo(`Stream code validated: ${streamCode}. Preparing to connect to stream...`);
        return true;
    }

    /**
     * 验证stream-code格式
     * @param {string} code - 流代码
     * @returns {boolean} 是否有效
     */
    function isValidStreamCode(code) {
        // 检查格式: xxx-xxxx-xxx 或类似格式
        const pattern = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+$|^[a-zA-Z0-9]+-[a-zA-Z0-9]+$/;
        return pattern.test(code);
    }

    /**
     * 初始化视频播放器
     */
    function initializeVideoPlayer() {
        window.preloaderControl.updateDebugInfo('Initializing Plyr video player with WebRTC support...');
        
        // 为直播和回放创建不同的播放器配置
        const liveControls = [
            'play-large', 'play', 'mute', 'volume', 'pip', 'airplay', 'fullscreen'
        ];
        
        const replayControls = [
            'play-large', 'restart', 'rewind', 'play', 'fast-forward', 
            'progress', 'current-time', 'duration', 'mute', 'volume', 
            'settings', 'pip', 'airplay', 'fullscreen'
        ];
        
        if (!livestreamState.plyrInstance) {
            livestreamState.plyrInstance = new Plyr('#player', {
                controls: liveControls, // 默认使用直播控件
                autoplay: true,
                muted: true
            });
        }

        livestreamState.plyrInstance.on('ready', () => {
            console.log('Plyr视频播放器已准备就绪');
            window.preloaderControl.updateDebugInfo('Video player ready. Waiting for stream authentication and status check...');
        });
    }

    /**
     * 开始长轮询检查流状态
     */
    async function startStreamPolling() {
        window.preloaderControl.updateDebugInfo('Sending authentication request to server...');
        
        try {
            await checkStreamStatus();
            
            // 设置定期轮询
            livestreamState.pollingInterval = setInterval(async () => {
                try {
                    await checkStreamStatus();
                } catch (error) {
                    console.error('轮询错误:', error);
                    handlePollingError();
                }
            }, 3000); // 每3秒轮询一次

        } catch (error) {
            console.error('初始流状态检查失败:', error);
            handlePollingError();
        }
    }

    /**
     * 检查流状态
     */
    async function checkStreamStatus() {
        try {
            // 构建请求URL，包含visitor_id（如果有的话）
            let requestUrl = `/api/view-stream?stream_code=${livestreamState.streamCode}`;
            if (livestreamState.visitorId) {
                requestUrl += `&visitor_id=${livestreamState.visitorId}`;
            }

            const response = await window.authAPI.makeRequest(
                requestUrl,
                { method: 'POST' },
                true
            );

            if (response.success) {
                handleSuccessfulStreamResponse(response);
            } else {
                handleUnsuccessfulStreamResponse(response);
            }

        } catch (error) {
            console.error('Stream status check failed:', error);
            // 如果是认证错误，显示登录页面
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                showLoginPrompt();
            } else {
                handlePollingError();
            }
        }
    }

    /**
     * 处理成功的流响应
     * @param {Object} response - API响应
     */
    async function handleSuccessfulStreamResponse(response) {
        // 检查是否是退出观看的消息（stream ended的情况）
        if (response.message === "Exit from watching stream") {
            window.preloaderControl.updateDebugInfo('STREAM ENDED: Stream has ended, redirecting to homepage...');
            // 断开连接
            if (livestreamState.isConnected) {
                disconnectWebRTC();
            }
            setTimeout(() => {
                window.location.href = '/?card=0';
            }, 2000);
            return;
        }

        // 正常的流信息响应
        if (!response.stream_info) {
            window.preloaderControl.updateDebugInfo('ERROR: Invalid server response - missing stream info');
            handlePollingError();
            return;
        }

        // 保存visitor_id（如果服务器提供）
        if (response.visitor_id) {
            livestreamState.visitorId = response.visitor_id;
            window.preloaderControl.updateDebugInfo(`Anonymous visitor session established: ${response.visitor_id.substring(0, 16)}...`);
        }

        // 检查流信息变化并更新头部
        const newStreamInfo = response.stream_info;
        const hasInfoChanges = checkAndUpdateStreamHeader(newStreamInfo, livestreamState.previousStreamInfo);
        
        // 保存之前的流信息用于下次比较
        livestreamState.previousStreamInfo = livestreamState.currentStreamInfo ? { ...livestreamState.currentStreamInfo } : null;
        
        // 完整存储流信息
        livestreamState.currentStreamInfo = newStreamInfo;

        const streamInfo = livestreamState.currentStreamInfo;
        const streamStatus = streamInfo.stream_status;
        const streamerName = streamInfo.streamer_name || 'Unknown';
        const streamTitle = streamInfo.stream_title || 'Untitled Stream';
        const viewerCount = streamInfo.viewer_count || 0;

        // 显示详细的流信息
        console.log('完整流信息:', streamInfo);
        if (hasInfoChanges) {
            console.log('Stream info changed, header updated');
        }
        window.preloaderControl.updateDebugInfo(`Stream info loaded: "${streamTitle}" by ${streamerName} (${viewerCount} viewers, status: ${streamStatus})`);

        if (streamStatus === 'streaming') {
            // 流正在进行，尝试建立WebRTC连接
            window.preloaderControl.updateDebugInfo(`Stream is LIVE: "${streamTitle}" by ${streamerName}. Establishing WebRTC connection...`);
            if (!livestreamState.isConnected) {
                await startWebRTCConnection();
            }
        } else if (streamStatus === 'replay') {
            // 回放流，使用视频文件播放
            window.preloaderControl.updateDebugInfo(`Stream is REPLAY: "${streamTitle}" by ${streamerName}. Loading video player...`);
            if (!livestreamState.isConnected) {
                await startReplayVideoPlayer();
            }
        } else if (!livestreamState.isConnected) {
            // 流状态不是streaming或replay，显示等待状态
            disconnectWebRTC();
            showWaitingState(streamStatus, streamTitle, streamerName);
        }
    }

    /**
     * 处理不成功的流响应
     * @param {Object} response - API响应
     */
    function handleUnsuccessfulStreamResponse(response) {
        const message = response.message || 'Authentication required';
        window.preloaderControl.updateDebugInfo(`ACCESS DENIED: ${message}. Please login to continue...`);
        showLoginPrompt();
    }

    /**
     * 显示登录提示
     */
    function showLoginPrompt() {
        window.preloaderControl.updateDebugInfo('WAITING: User authentication required. Login popup will appear shortly...');
        
        // 显示认证弹窗
        if (window.showAuthPopup) {
            setTimeout(() => {
                window.showAuthPopup();
            }, 1000);
        }
    }

    /**
     * 显示等待状态
     * @param {string} status - 流状态
     * @param {string} streamTitle - 流标题（可选，从 livestreamState.currentStreamInfo 获取）
     * @param {string} streamerName - 主播名称（可选，从 livestreamState.currentStreamInfo 获取）
     */
    function showWaitingState(status, streamTitle = '', streamerName = '') {
        // 如果没有提供标题和名称，尝试从完整的流信息中获取
        if (!streamTitle && livestreamState.currentStreamInfo) {
            streamTitle = livestreamState.currentStreamInfo.stream_title || 'Untitled Stream';
        }
        if (!streamerName && livestreamState.currentStreamInfo) {
            streamerName = livestreamState.currentStreamInfo.streamer_name || 'Unknown';
        }

        const statusMessages = {
            'pausing': `PAUSED: "${streamTitle}" by ${streamerName}. Waiting for streamer to resume...`,
            'preparing': `PREPARING: "${streamTitle}" by ${streamerName}. Stream is being prepared...`,
            'waiting': `WAITING: "${streamTitle}" by ${streamerName}. Stream will start soon...`,
            'reconnecting': 'RECONNECTING: Video stream interrupted. Attempting to reconnect...',
            'connection_lost': 'CONNECTION LOST: WebRTC connection permanently lost. Monitoring for stream recovery...'
        };
        
        const message = statusMessages[status] || `UNKNOWN STATUS: Stream status is "${status}". Please wait...`;
        window.preloaderControl.updateDebugInfo(message);
        
        if (!document.querySelector('.preloader')) {
            window.preloaderControl.show('Loading......');
        }
    }

    /**
     * 开始WebRTC连接
     */
    async function startWebRTCConnection() {
        window.preloaderControl.updateDebugInfo('Establishing WebRTC peer connection to media server...');

        // 清理旧连接
        if (livestreamState.srsRtcPlayer) {
            livestreamState.srsRtcPlayer.close();
            livestreamState.srsRtcPlayer = null;
        }

        livestreamState.srsRtcPlayer = new SrsRtcWhipWhepAsync();
        const videoEl = document.getElementById('player');
        videoEl.srcObject = livestreamState.srsRtcPlayer.stream;

        try {
            // 构建WebRTC URL
            const webrtcUrl = `http://localhost:1985/rtc/v1/whep/?app=live&stream=${livestreamState.streamCode}`;
            window.preloaderControl.updateDebugInfo(`Connecting to WebRTC endpoint: ${webrtcUrl}`);
            
            await livestreamState.srsRtcPlayer.play(webrtcUrl, {
                videoOnly: false,
                audioOnly: false,
                disconnectOnTimeout: false,
                onconnected: function () {
                    console.log('🚀 WebRTC连接成功');
                    window.preloaderControl.updateDebugInfo('WebRTC peer connection established! Waiting for first video frame...');
                },
                onfirstvideo: function () {
                    console.log('🎬 收到第一个视频数据包');
                    livestreamState.isConnected = true;
                    
                    // 隐藏preloader
                    window.preloaderControl.hide();
                    
                    // 开始播放
                    videoEl.muted = true;
                    videoEl.autoplay = true;
                    videoEl.play().catch(() => {});
                    if (livestreamState.plyrInstance) {
                        livestreamState.plyrInstance.play();
                    }
                    
                    if (window.toast) {
                        toast.warning("Livestream is muted", "Please unmute to hear the audio.");
                    }
                },
                oninactivevideo: function () {
                    console.log('⚠️ 视频流中断超过3秒');
                    livestreamState.isConnected = false;
                    showWaitingState('reconnecting');
                },
                onvideoresume: function () {
                    console.log('🎥 视频流恢复');
                    livestreamState.isConnected = true;
                    window.preloaderControl.hide();
                }
            });

        } catch (error) {
            console.error('WebRTC连接失败:', error);
            livestreamState.isConnected = false;
            window.preloaderControl.updateDebugInfo(`WebRTC CONNECTION FAILED: ${error.message}. Retrying in 3 seconds...`);
            
            // 重新检查流状态
            setTimeout(() => {
                checkStreamStatus();
            }, 3000);
        }
    }

    /**
     * 断开WebRTC连接或回放视频
     */
    function disconnectWebRTC() {
        // 断开WebRTC连接
        if (livestreamState.srsRtcPlayer) {
            livestreamState.srsRtcPlayer.close();
            livestreamState.srsRtcPlayer = null;
        }
        
        // 断开回放视频
        const videoEl = document.getElementById('player');
        if (videoEl && videoEl.src && !videoEl.src.includes('blob:')) {
            // 如果是视频文件而不是blob URL，清除它
            videoEl.pause();
            videoEl.src = '';
            videoEl.load();
        }
        
        livestreamState.isConnected = false;
        console.log('All connections disconnected');
    }

    /**
     * 开始回放视频播放器
     */
    async function startReplayVideoPlayer() {
        window.preloaderControl.updateDebugInfo('Setting up replay video player with quality options...');

        try {
            // 断开任何现有的WebRTC连接
            if (livestreamState.srsRtcPlayer) {
                livestreamState.srsRtcPlayer.close();
                livestreamState.srsRtcPlayer = null;
            }

            // 重新配置播放器为回放模式
            await reconfigurePlayerForReplay();

            // 设置多质量源
            const videoEl = document.getElementById('player');
            setupReplayVideoSources(videoEl);

            // 设置视频事件监听器
            setupReplayVideoEvents(videoEl);

            // 标记为已连接
            livestreamState.isConnected = true;
            
            // 开始播放
            try {
                await videoEl.play();
                window.preloaderControl.hide();
                
                if (window.toast) {
                    toast.info("Replay Video Loaded", "Use controls to navigate through the video.");
                }
            } catch (playError) {
                console.warn('Auto-play failed, user interaction required:', playError);
                window.preloaderControl.hide();
            }

        } catch (error) {
            console.error('回放视频播放器启动失败:', error);
            livestreamState.isConnected = false;
            window.preloaderControl.updateDebugInfo(`Replay video failed to load: ${error.message}. Retrying in 3 seconds...`);
            
            // 重新检查流状态
            setTimeout(() => {
                checkStreamStatus();
            }, 3000);
        }
    }

    /**
     * 重新配置播放器为回放模式
     */
    async function reconfigurePlayerForReplay() {
        if (!livestreamState.plyrInstance) {
            return;
        }

        // 销毁现有播放器
        livestreamState.plyrInstance.destroy();

        // 创建新的回放播放器，使用源配置格式来启用质量选项
        livestreamState.plyrInstance = new Plyr('#player', {
            controls: [
                'play-large', 'restart', 'rewind', 'play', 'fast-forward', 
                'progress', 'current-time', 'duration', 'mute', 'volume', 
                'settings', 'pip', 'airplay', 'fullscreen'
            ],
            autoplay: false,
            muted: false,
            settings: ['quality', 'speed'],
            speed: {
                selected: 1,
                options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
            }
        });

        // 等待播放器准备就绪后设置源
        return new Promise((resolve) => {
            livestreamState.plyrInstance.on('ready', () => {
                console.log('Player reconfigured for replay mode');
                resolve();
            });
        });
    }

    /**
     * 设置回放视频的多质量源
     * @param {HTMLVideoElement} videoEl - 视频元素
     */
    function setupReplayVideoSources(videoEl) {
        // 构建不同质量的视频源
        const baseUrl = `/streams/${livestreamState.streamCode}/${livestreamState.streamCode}`;
        
        const sources = [
            {
                src: `${baseUrl}.2K.mp4`,
                type: 'video/mp4',
                size: 1440
            },
            {
                src: `${baseUrl}.1080p.mp4`,
                type: 'video/mp4',
                size: 1080
            },
            {
                src: `${baseUrl}.720p.mp4`,
                type: 'video/mp4',
                size: 720
            }
        ];

        // 设置源到播放器
        livestreamState.plyrInstance.source = {
            type: 'video',
            sources: sources
        };

        window.preloaderControl.updateDebugInfo(`Loading replay video with multiple quality options...`);
        console.log('Replay video sources configured:', sources);
    }

    /**
     * 设置回放视频事件监听器
     * @param {HTMLVideoElement} videoEl - 视频元素
     */
    function setupReplayVideoEvents(videoEl) {
        videoEl.addEventListener('loadstart', () => {
            console.log('🎬 开始加载回放视频');
            window.preloaderControl.updateDebugInfo('Loading replay video...');
        });

        videoEl.addEventListener('canplay', () => {
            console.log('🎬 回放视频可以播放');
            window.preloaderControl.updateDebugInfo('Replay video ready to play');
        });

        videoEl.addEventListener('error', (e) => {
            console.error('❌ 回放视频加载错误:', e);
            livestreamState.isConnected = false;
            window.preloaderControl.updateDebugInfo('Replay video error: Failed to load video file');
            
            // 尝试降级到720p
            const currentSrc = videoEl.src;
            if (currentSrc.includes('1080p')) {
                const fallbackUrl = currentSrc.replace('1080p', '720p');
                console.log('Trying fallback quality:', fallbackUrl);
                videoEl.src = fallbackUrl;
                videoEl.load();
            }
        });

        videoEl.addEventListener('waiting', () => {
            console.log('⏳ 回放视频缓冲中');
            window.preloaderControl.updateDebugInfo('Buffering replay video...');
        });

        videoEl.addEventListener('playing', () => {
            console.log('▶️ 回放视频开始播放');
            window.preloaderControl.hide();
        });

        videoEl.addEventListener('ended', () => {
            console.log('🏁 回放视频播放结束');
            if (window.toast) {
                toast.info("Replay Finished", "The video has ended.");
            }
        });
    }

    /**
     * 切换回放视频质量 (由 Plyr 自动处理)
     * @param {string} quality - 目标质量 (1080p, 720p, 等)
     */
    function switchReplayQuality(quality) {
        console.log('Quality change requested:', quality);
        // 注意：使用 Plyr 源配置时，质量切换由 Plyr 自动处理
        // 这个函数主要用于日志记录和调试
        if (livestreamState.currentStreamInfo?.stream_status === 'replay') {
            console.log(`Replay quality switched to: ${quality}`);
        }
    }

    /**
     * 断开回放视频连接
     */
    function disconnectReplayVideo() {
        const videoEl = document.getElementById('player');
        if (videoEl) {
            videoEl.pause();
            videoEl.src = '';
            videoEl.load();
        }
        livestreamState.isConnected = false;
        console.log('Replay video disconnected');
    }

    /**
     * 处理轮询错误
     */
    function handlePollingError() {
        window.preloaderControl.updateDebugInfo('SERVER CONNECTION ERROR: Lost connection to stream server. Retrying in 3 seconds...');
        
        // 停止当前轮询
        if (livestreamState.pollingInterval) {
            clearInterval(livestreamState.pollingInterval);
        }
        
        // 3秒后重试
        setTimeout(() => {
            startStreamPolling();
        }, 3000);
    }

    /**
     * 通知服务器退出观看
     */
    async function notifyServerExit() {
        if (!livestreamState.streamCode || !window.authAPI) {
            return;
        }

        try {
            // 构建退出请求URL
            let exitUrl = `/api/view-stream?stream_code=${livestreamState.streamCode}&exit=true`;
            if (livestreamState.visitorId) {
                exitUrl += `&visitor_id=${livestreamState.visitorId}`;
                await window.authAPI.makeRequest(exitUrl, { method: 'POST' }, false);
            } else {
                await window.authAPI.makeRequest(exitUrl, { method: 'POST' }, true);
            }            
        } catch (error) {
            console.error('Failed to notify server about exit:', error);
        }
    }

    /**
     * 清理所有资源
     */
    function cleanupResources() {
        // 清理轮询
        if (livestreamState.pollingInterval) {
            clearInterval(livestreamState.pollingInterval);
            livestreamState.pollingInterval = null;
        }
        
        // 清理WebRTC连接
        disconnectWebRTC();
        
        // 通知服务器退出观看
        notifyServerExit();
    }

    /**
     * 页面卸载时清理资源
     */
    window.addEventListener('beforeunload', function(event) {
        cleanupResources();
    });

    // // 处理页面隐藏事件（移动端、标签页切换等）
    // window.addEventListener('pagehide', function(event) {
    //     cleanupResources();
    // });

    // // 处理浏览器返回事件
    // window.addEventListener('popstate', function(event) {
    //     cleanupResources();
    // });

    // // 处理页面可见性变化（标签页切换到其他页面）
    // document.addEventListener('visibilitychange', function() {
    //     if (document.visibilityState === 'hidden') {
    //         cleanupResources();
    //     }
    // });

    /************************************
     * 格式化工具函数 (参考 streamUtils.js)
     ************************************/
    
    /**
     * Format viewer count with proper suffixes
     * @param {number} count - Viewer count
     * @returns {string} Formatted viewer count
     */
    function formatViewerCount(count) {
        if (count < 1000) {
            return count.toString();
        } else if (count < 1000000) {
            return (count / 1000).toFixed(1).replace('.0', '') + 'K';
        } else {
            return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
        }
    }
    
    /**
     * Format quality info from API data
     * @param {Array} qualityInfo - Quality info array from API
     * @returns {string} Formatted quality string (Resolution • Codec)
     */
    function formatQualityInfo(qualityInfo) {
        if (!Array.isArray(qualityInfo) || qualityInfo.length === 0) {
            return '1920x1080 • H264';
        }
        
        const videoInfo = qualityInfo.find(info => info.type === 'video');
        if (videoInfo && videoInfo.width && videoInfo.height && videoInfo.codec) {
            const resolution = `${videoInfo.width}x${videoInfo.height}`;
            const codec = videoInfo.codec || 'H264';
            return `${resolution} • ${codec}`;
        }
        
        // Fallback if video info is incomplete
        return '1280x720 • H264';
    }
    
    /**
     * 获取流状态的显示文本
     * @param {string} status - 流状态
     * @returns {string} 显示文本
     */
    function getStatusDisplayText(status) {
        switch (status) {
            case 'streaming':
                return 'LIVE';
            case 'pausing':
                return 'LIVE';
            case 'ended':
                return 'ENDED';
            case 'replay':
                return 'REPLAY';
            case 'planned':
                return 'SCHEDULED';
            default:
                return 'LIVE';
        }
    }
    
    /**
     * 更新流头部信息
     * @param {Object} streamInfo - 流信息
     */
    function updateStreamHeader(streamInfo) {
        // 获取DOM元素
        const titleElement = document.getElementById('current-stream-title');
        const authorElement = document.getElementById('current-stream-author');
        const viewersElement = document.getElementById('current-stream-viewers');
        const qualityElement = document.getElementById('current-stream-quality');
        const statusElement = document.getElementById('live-status');
        
        if (!titleElement || !authorElement || !viewersElement || !qualityElement || !statusElement) {
            console.warn('Stream header elements not found');
            return;
        }
        
        // 更新标题
        titleElement.textContent = streamInfo.stream_title || 'Untitled Stream';
        
        // 更新作者
        authorElement.textContent = `by ${streamInfo.streamer_name || 'Unknown'}`;
        
        // 更新观看人数
        const viewerCount = streamInfo.viewer_count || 0;
        const formattedViewers = formatViewerCount(viewerCount);
        viewersElement.textContent = `${formattedViewers} viewer${viewerCount !== 1 ? 's' : ''}`;
        
        // 更新画质信息
        const qualityText = formatQualityInfo(streamInfo.quality_info);
        qualityElement.textContent = qualityText;
        
        // 更新状态
        const statusText = getStatusDisplayText(streamInfo.stream_status);
        statusElement.textContent = statusText;
        statusElement.className = `live-indicator ${streamInfo.stream_status}`;
    }
    
    /**
     * 检查流信息是否有变化并更新头部
     * @param {Object} newStreamInfo - 新的流信息
     * @param {Object} oldStreamInfo - 旧的流信息
     * @returns {boolean} 是否有变化
     */
    function checkAndUpdateStreamHeader(newStreamInfo, oldStreamInfo) {
        let hasChanges = false;
        
        if (!oldStreamInfo) {
            // 首次加载，直接更新
            updateStreamHeader(newStreamInfo);
            return true;
        }
        
        // 检查关键字段是否有变化
        const fieldsToCheck = [
            'stream_title',
            'streamer_name', 
            'viewer_count',
            'stream_status'
        ];
        
        for (const field of fieldsToCheck) {
            if (newStreamInfo[field] !== oldStreamInfo[field]) {
                hasChanges = true;
                break;
            }
        }
        
        // 检查画质信息变化（比较 JSON 字符串）
        const oldQualityString = JSON.stringify(oldStreamInfo.quality_info || []);
        const newQualityString = JSON.stringify(newStreamInfo.quality_info || []);
        if (oldQualityString !== newQualityString) {
            hasChanges = true;
        }
        
        // 如果有变化，更新头部
        if (hasChanges) {
            updateStreamHeader(newStreamInfo);
            console.log('Stream header updated due to info changes');
        }
        
        return hasChanges;
    }
    
    /**
     * 设置认证状态监听器
     */
    function setupAuthEventListener() {
        if (!window.authAPI) {
            console.warn('AuthAPI not available, skipping auth event listener setup');
            return;
        }

        // 监听认证状态变化事件
        window.authAPI.on((event) => {
            const { type, profile, isAuthenticated } = event.detail;
            
            if (type === 'profile-updated') {
                handleAuthProfileUpdate(profile, isAuthenticated);
            }
        });
        
        console.log('Auth event listener setup completed');
    }

    /**
     * 初始化当前用户身份
     */
    function initializeCurrentUserId() {
        if (window.authAPI) {
            const currentProfile = window.authAPI.getCurrentProfile();
            if (currentProfile) {
                livestreamState.currentUserId = getUserId(currentProfile);
                console.log('Current user ID initialized:', livestreamState.currentUserId);
            }
        }
    }

    /**
     * 从 profile 中提取用户ID
     * @param {Object} profile - 用户资料对象
     * @returns {string|null} 用户ID
     */
    function getUserId(profile) {
        if (!profile) return null;
        return profile.user_id || profile.id || profile.username || null;
    }

    /**
     * 处理认证资料更新事件
     * @param {Object} profile - 新的用户资料
     * @param {boolean} isAuthenticated - 是否已认证
     */
    async function handleAuthProfileUpdate(profile, isAuthenticated) {
        const newUserId = getUserId(profile);
        const previousUserId = livestreamState.currentUserId;
        
        console.log('Auth profile update received:', {
            previousUserId,
            newUserId,
            isAuthenticated
        });

        // 检查用户身份是否发生变化
        const userIdChanged = previousUserId !== newUserId;
        
        if (userIdChanged) {
            console.log('User identity changed, reconnecting stream...');
            
            // 显示 preloader 并更新状态信息
            window.preloaderControl.show('Loading......', true);
            if (isAuthenticated && newUserId) {
                window.preloaderControl.updateDebugInfo(`User identity changed to: ${newUserId}. Reconnecting stream with new credentials...`);
            } else {
                window.preloaderControl.updateDebugInfo('User logged out. Reconnecting as anonymous visitor...');
            }
            
            // 执行重连序列
            await performIdentityReconnection(newUserId);
        } else if (!isAuthenticated && previousUserId) {
            // 用户登出但身份未变化的情况（理论上不应该发生，但为了安全起见）
            console.log('User logged out, reconnecting as anonymous...');
            window.preloaderControl.show('Loading......', true);
            window.preloaderControl.updateDebugInfo('User logged out. Reconnecting as anonymous visitor...');
            await performIdentityReconnection(null);
        }
    }

    /**
     * 执行身份变更重连序列
     * @param {string|null} newUserId - 新的用户ID
     */
    async function performIdentityReconnection(newUserId) {
        try {
            // 1. 断开当前连接（WebRTC或回放视频）
            if (livestreamState.isConnected) {
                console.log('Disconnecting current connection...');
                disconnectWebRTC();
            }
            
            // 2. 通知服务器退出观看（使用旧身份）
            console.log('Notifying server about exit with previous identity...');
            await notifyServerExit();
            
            // 3. 清理轮询状态
            if (livestreamState.pollingInterval) {
                clearInterval(livestreamState.pollingInterval);
                livestreamState.pollingInterval = null;
            }
            
            // 4. 重置相关状态
            livestreamState.visitorId = null; // 清除访客ID，让服务器重新分配
            livestreamState.previousStreamInfo = null; // 清除之前的流信息缓存
            
            // 5. 更新当前用户ID
            livestreamState.currentUserId = newUserId;
            
            // 6. 等待短暂时间确保服务器端状态更新
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 7. 重新开始长轮询（使用新身份）
            console.log('Restarting stream polling with new identity...');
            window.preloaderControl.updateDebugInfo('Reestablishing connection with new credentials...');
            startStreamPolling();
            
        } catch (error) {
            console.error('Error during identity reconnection:', error);
            window.preloaderControl.updateDebugInfo(`Reconnection error: ${error.message}. Retrying in 3 seconds...`);
            
            // 重连失败，3秒后重试
            setTimeout(() => {
                performIdentityReconnection(newUserId);
            }, 3000);
        }
    }

    // 暴露必要的函数和状态到全局作用域
    window.livestream = {
        // 暴露核心状态
        state: livestreamState,

        // 暴露关键函数
        notifyServerExit: notifyServerExit,
        cleanupResources: cleanupResources,
        disconnectWebRTC: disconnectWebRTC,

        // 暴露WebRTC相关函数
        startWebRTCConnection: startWebRTCConnection,

        // 暴露回放相关函数
        startReplayVideoPlayer: startReplayVideoPlayer,
        switchReplayQuality: switchReplayQuality,
        disconnectReplayVideo: disconnectReplayVideo,

        // 暴露状态检查函数
        checkStreamStatus: checkStreamStatus,

        // 暴露工具函数
        formatViewerCount: formatViewerCount,
        formatQualityInfo: formatQualityInfo,
        updateStreamHeader: updateStreamHeader
    };
});