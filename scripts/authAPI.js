/**
 * 精简的认证API类
 * 基于FastAPI后端的前端认证管理系统
 */
class AuthAPI {
    constructor() {
        // 认证状态存储
        this.auth_key = null;
        this.auth_key_session_id = null;
        this.refresh_key = null;
        this.refresh_key_session_id = null;
        this.profile = null;
        this.avatarCache = new Map(); // 存储头像缓存 {user_id: svg_content}
        
        // 基础配置
        this.baseURL = window.location.origin;
        
        // 通用轮询管理器
        this.pollingTasks = new Map(); // 存储所有轮询任务
        this.defaultPollingInterval = 10000; // 默认10秒间隔

        // 初始化 - 尝试自动登录
        this.init();
    }

    /**
     * 自动初始化方法 - 页面加载完成后自动执行
     * 如果浏览器存在 httponly cookie，将自动完成登录
     */
    async init() {
        try {
            await this.getProfile();
            // 自动登录成功后启动profile轮询
            this.startPolling('profile', () => this.getProfile(), this.defaultPollingInterval);
        } catch (error) {
            // 自动登录失败，保持静默
            console.debug('Auto login failed:', error.message);
        }
    }

    /**
     * 核心请求方法
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @param {boolean} auth - 是否需要认证
     * @returns {Promise<any>} 解析后的响应数据
     */
    async makeRequest(endpoint, options = {}, auth = true) {
        const url = `${this.baseURL}${endpoint}`;
        
        // 构建请求配置
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // 确保发送 httponly cookies
            ...options
        };

        // 添加认证头
        if (auth && this.auth_key && this.auth_key_session_id) {
            config.headers['Authorization'] = `Bearer ${this.auth_key}:${this.auth_key_session_id}`;
        }

        // 处理请求体
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            // 处理不同的响应类型
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType && contentType.includes('image/svg+xml')) {
                data = await response.text();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;

        } catch (error) {
            // 处理认证失败 - 尝试刷新 token
            if (auth && (error.status === 401 || error.status === 403) && !options._isRetry) {
                try {
                    await this._refreshTokens();
                    // 重试请求
                    return await this.makeRequest(endpoint, { ...options, _isRetry: true }, auth);
                } catch (refreshError) {
                    // 刷新失败，清空认证信息
                    this._clearAuth();
                    this._emitEvent('profile-updated', {
                        error: error.message,
                        isAuthenticated: false,
                        profile: null
                    });
                    this.makeRequest('/api/clean-cookies', { method: 'POST' }, false);
                    throw error;
                }
            }
            this._emitEvent('profile-updated', {
                error: error.message,
                isAuthenticated: false,
                profile: null
            });
            this.makeRequest('/api/clean-cookies', { method: 'POST' }, false);
            throw error;
        }
    }

    /**
     * 获取用户资料
     * 特殊请求：获取 profile 信息并缓存头像
     */
    async getProfile() {
        try {
            // 获取用户资料
            const profileData = await this.makeRequest('/api/profile', {}, true);
            this.profile = profileData;

            // 获取并缓存头像
            const userId = profileData.user_id || profileData.id || profileData.username;
            if (userId && !this.avatarCache.has(userId)) {
                try {
                    const avatarSvg = await this.makeRequest(
                        `/avatar/beam?name=${encodeURIComponent(userId)}`, 
                        {}, 
                        true
                    );
                    this.avatarCache.set(userId, avatarSvg);
                    console.log('Avatar cached for user:', userId);
                    console.log('Avatar SVG (first 100 chars):', avatarSvg.substring(0, 100));
                } catch (avatarError) {
                    console.warn('Failed to load avatar:', avatarError.message);
                }
            }

            // 发送事件通知
            this._emitEvent('profile-updated', { 
                profile: this.profile,
                isAuthenticated: true 
            });

        } catch (error) {
            console.error('Failed to get profile:', error.message);
            this._clearAuth();
            this._emitEvent('profile-updated', { 
                error: error.message,
                isAuthenticated: false,
                profile: null 
            });
            this.makeRequest('/api/clean-cookies', { method: 'POST' }, false);
            throw error;
        }
    }

    /**
     * 用户登录
     * @param {string} username_or_email - 用户名或邮箱
     * @param {string} password - 密码
     * @param {boolean} remember_me - 是否记住登录状态
     */
    async login(username_or_email, password, remember_me = true) {
        try {
            const loginData = await this.makeRequest('/api/login', {
                method: 'POST',
                body: {
                    username_or_email,
                    password,
                    remember_me
                }
            }, false);

            if (loginData.success) {
                // 存储认证信息
                this.auth_key = loginData.auth_key;
                this.auth_key_session_id = loginData.auth_key_session_id;

                // 如果 remember_me 为 false，需要在内存中存储 refresh_key
                if (!remember_me && loginData.refresh_key && loginData.refresh_key_session_id) {
                    this.refresh_key = loginData.refresh_key;
                    this.refresh_key_session_id = loginData.refresh_key_session_id;
                }

                // 获取用户资料（会发送 profile-updated 事件）
                await this.getProfile();
                
                // 登录成功后启动profile轮询
                this.startPolling('profile', () => this.getProfile(), this.defaultPollingInterval);
            }

        } catch (error) {
            this._clearAuth();
            this._emitEvent('profile-updated', { 
                error: error.message, 
                isAuthenticated: false,
                profile: null 
            });
            throw error;
        }
    }

    /**
     * 用户登出
     * @param {boolean} all - 是否登出所有设备
     */
    async logout(all = false) {
        try {
            if (window.livestream) {
                console.warn('Notifying livestream server about logout...');
                await window.livestream.notifyServerExit();
            }
            if (all) {
                await this.makeRequest('/api/logout-all', { method: 'POST' }, true);
            } else {
                await this.makeRequest('/api/logout', { method: 'POST' }, true);
            }
        } catch (error) {
            console.warn('Logout request failed:', error.message);
        } finally {
            // 停止所有轮询任务
            this.stopAllPolling();
            this._clearAuth();
            this._emitEvent('profile-updated', { 
                isAuthenticated: false,
                profile: null 
            });
        }
    }

    /**
     * 更新密码
     * @param {string} original_password - 原密码
     * @param {string} new_password - 新密码
     */
    async updatePassword(original_password, new_password) {
        try {
            const updateData = await this.makeRequest('/api/update-password', {
                method: 'PUT',
                body: {
                    original_password: original_password,
                    password: new_password
                }
            }, true);

            if (updateData.success) {
                this._clearAuth();
                this._emitEvent('profile-updated', {
                    isAuthenticated: false,
                    profile: null
                });
                return updateData;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * 刷新认证令牌
     * @private
     */
    async _refreshTokens() {
        let requestBody = {};
        
        // 如果有内存中的 auth_key_session_id，添加到请求体
        if (this.auth_key_session_id) {
            requestBody.auth_key_session_id = this.auth_key_session_id;
        }

        const refreshData = await this.makeRequest('/api/refresh', {
            method: 'POST',
            body: requestBody
        }, false);

        if (refreshData.success) {
            this.auth_key = refreshData.auth_key;
            this.auth_key_session_id = refreshData.auth_key_session_id;
            
            // 更新内存中的 refresh_key（如果服务端返回了新的）
            if (refreshData.refresh_key && refreshData.refresh_key_session_id) {
                this.refresh_key = refreshData.refresh_key;
                this.refresh_key_session_id = refreshData.refresh_key_session_id;
            }
            
            return true;
        }
        return false;
    }

    /**
     * 清空认证信息
     * @private
     */
    _clearAuth() {
        // 停止所有轮询任务
        this.stopAllPolling();
        
        this.auth_key = null;
        this.auth_key_session_id = null;
        this.refresh_key = null;
        this.refresh_key_session_id = null;
        this.profile = null;
        // this.avatarCache.clear();  // Non necessary, keep cache for quick access
    }

    /**
     * 发送自定义事件
     * @private
     */
    _emitEvent(type, data = {}) {
        const event = new CustomEvent('api-event', {
            detail: { type, ...data, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }

    /**
     * 公共方法：获取当前认证状态
     */
    isAuthenticated() {
        return !!(this.auth_key && this.auth_key_session_id);
    }

    /**
     * 公共方法：获取当前用户资料
     */
    getCurrentProfile() {
        return this.profile;
    }

    /**
     * 公共方法：获取用户头像
     */
    getAvatar(userId) {
        return this.avatarCache.get(userId);
    }

    /**
     * 启动轮询任务
     * @param {string} taskId - 任务唯一标识符
     * @param {Function} taskFunction - 要执行的异步函数
     * @param {number} intervalMs - 轮询间隔（毫秒），默认使用defaultPollingInterval
     * @param {Object} options - 轮询选项
     * @param {boolean} options.stopOnError - 遇到错误时是否停止轮询，默认false
     * @param {boolean} options.stopOnAuthError - 遇到认证错误时是否停止轮询，默认true
     * @param {Function} options.onError - 错误处理回调函数
     */
    startPolling(taskId, taskFunction, intervalMs = null, options = {}) {
        // 如果任务已存在，先停止它
        this.stopPolling(taskId);
        
        const {
            stopOnError = false,
            stopOnAuthError = true,
            onError = null
        } = options;
        
        const interval = intervalMs || this.defaultPollingInterval;
        
        console.debug(`Starting polling task: ${taskId} (interval: ${interval}ms)`);
        
        const intervalId = setInterval(async () => {
            try {
                // 检查认证状态（仅对需要认证的任务）
                if (taskId === 'profile' && !this.isAuthenticated()) {
                    console.debug(`Stopping polling task ${taskId}: not authenticated`);
                    this.stopPolling(taskId);
                    return;
                }
                
                await taskFunction();
                console.debug(`Polling task ${taskId}: successful execution`);
                
            } catch (error) {
                console.warn(`Polling task ${taskId} failed:`, error.message);
                
                // 调用错误处理回调
                if (onError && typeof onError === 'function') {
                    try {
                        await onError(error);
                    } catch (callbackError) {
                        console.error(`Error in polling error callback:`, callbackError);
                    }
                }
                
                // 检查是否需要停止轮询
                const isAuthError = error.status === 401 || error.status === 403;
                
                if (stopOnError || (stopOnAuthError && isAuthError)) {
                    console.warn(`Stopping polling task ${taskId} due to error`);
                    this.stopPolling(taskId);
                    
                    // 如果是认证错误，清理认证信息
                    if (isAuthError) {
                        this._clearAuth();
                        this._emitEvent('profile-updated', {
                            error: 'Authentication expired during polling',
                            isAuthenticated: false,
                            profile: null
                        });
                    }
                }
            }
        }, interval);
        
        // 存储任务信息
        this.pollingTasks.set(taskId, {
            intervalId,
            taskFunction,
            interval,
            options,
            startTime: new Date()
        });
    }

    /**
     * 停止指定的轮询任务
     * @param {string} taskId - 任务标识符
     */
    stopPolling(taskId) {
        const task = this.pollingTasks.get(taskId);
        if (task) {
            clearInterval(task.intervalId);
            this.pollingTasks.delete(taskId);
            console.debug(`Polling task stopped: ${taskId}`);
            return true;
        }
        return false;
    }

    /**
     * 停止所有轮询任务
     */
    stopAllPolling() {
        const taskIds = Array.from(this.pollingTasks.keys());
        taskIds.forEach(taskId => this.stopPolling(taskId));
        console.debug('All polling tasks stopped');
    }

    /**
     * 获取轮询任务状态
     * @param {string} taskId - 任务标识符，如果不提供则返回所有任务状态
     */
    getPollingStatus(taskId = null) {
        if (taskId) {
            const task = this.pollingTasks.get(taskId);
            return task ? {
                taskId,
                isActive: true,
                interval: task.interval,
                startTime: task.startTime,
                runningTime: new Date() - task.startTime
            } : null;
        }
        
        // 返回所有任务状态
        const status = {};
        this.pollingTasks.forEach((task, id) => {
            status[id] = {
                taskId: id,
                isActive: true,
                interval: task.interval,
                startTime: task.startTime,
                runningTime: new Date() - task.startTime
            };
        });
        return status;
    }

    /**
     * 更新轮询任务的间隔
     * @param {string} taskId - 任务标识符
     * @param {number} newIntervalMs - 新的轮询间隔
     */
    updatePollingInterval(taskId, newIntervalMs) {
        const task = this.pollingTasks.get(taskId);
        if (task) {
            // 重启任务以应用新间隔
            const { taskFunction, options } = task;
            this.stopPolling(taskId);
            this.startPolling(taskId, taskFunction, newIntervalMs, options);
            return true;
        }
        return false;
    }

    /**
     * 设置默认轮询间隔
     * @param {number} intervalMs - 新的默认间隔
     */
    setDefaultPollingInterval(intervalMs) {
        this.defaultPollingInterval = intervalMs;
    }

    /**
     * 检查指定任务是否正在轮询
     * @param {string} taskId - 任务标识符
     */
    isPollingActive(taskId) {
        return this.pollingTasks.has(taskId);
    }

    /**
     * 事件监听器
     */
    on(callback) {
        window.addEventListener('api-event', callback);
    }

    off(callback) {
        window.removeEventListener('api-event', callback);
    }
}

// 创建全局实例
window.authAPI = new AuthAPI();

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthAPI;
}
