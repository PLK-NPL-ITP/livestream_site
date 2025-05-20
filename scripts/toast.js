/**
 * Toast通知系统
 * 用于显示临时通知消息，带有动画效果和自动消失
 */

// 创建toast容器
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// 生成唯一ID
function generateId() {
    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// 创建toast图标
function createToastIcon(type) {
    const icon = document.createElement('div');
    icon.className = `toast-icon ${type}-icon`;
    
    let iconPath = '';
    
    switch(type) {
        case 'success':
            iconPath = './assets/images/circle-check.svg';
            break;
        case 'error':
            iconPath = './assets/images/circle-xmark.svg';
            break;
        case 'warning':
            iconPath = './assets/images/circle-exclamation.svg';
            break;
        case 'info':
            iconPath = './assets/images/circle-info.svg';
            break;
        default:
            iconPath = './assets/images/circle-info.svg';
    }
    
    // 创建图像元素
    const img = document.createElement('img');
    img.src = iconPath;
    img.alt = `${type} icon`;
    img.width = 20;
    img.height = 20;
    img.className = 'toast-icon-svg';
    
    icon.appendChild(img);
    return icon;
}

/**
 * 创建主要toast元素
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 * @param {string} type - 类型
 * @param {number} duration - 持续时间
 * @returns {HTMLElement} - Toast元素
 */
function createToastElement(title, message, type, duration) {
    const toastId = generateId();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    
    // 添加图标
    const icon = createToastIcon(type);
    
    // 添加内容
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    const titleEl = document.createElement('h4');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;
    
    const messageEl = document.createElement('p');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    
    content.appendChild(titleEl);
    content.appendChild(messageEl);
    
    // 创建进度条
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress-bar';
    progressBar.style.animationDuration = `${duration}ms`;
    
    // 根据类型设置进度条颜色
    switch(type) {
        case 'success':
            progressBar.style.backgroundColor = 'rgba(52, 168, 83, 0.2)';
            break;
        case 'error':
            progressBar.style.backgroundColor = 'rgba(234, 67, 53, 0.2)';
            break;
        case 'warning':
            progressBar.style.backgroundColor = 'rgba(255, 191, 0, 0.2)';
            break;
        case 'info':
            progressBar.style.backgroundColor = 'rgba(255, 71, 87, 0.2)';
            break;
        default:
            progressBar.style.backgroundColor = 'rgba(95, 99, 104, 0.2)';
    }
    
    progress.appendChild(progressBar);
    
    // 组装toast
    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(progress);
    
    return toast;
}

/**
 * 显示toast通知
 * @param {string} title - 要显示的标题
 * @param {string} message - 要显示的消息内容
 * @param {object} options - 配置选项
 * @param {string} options.type - 类型: 'success', 'error', 'warning', 'info', 'default'
 * @param {number} options.duration - 持续时间(毫秒)
 * @param {boolean} options.dismissible - 是否可以点击关闭
 */
function showToast(title, message, options = {}) {
    // 默认选项
    const defaultOptions = {
        type: 'default',
        duration: 3000,
        dismissible: true
    };
    
    // 合并选项
    const mergedOptions = {...defaultOptions, ...options};
    
    // 如果只传递了两个参数，且第二个是对象，那么第一个是message，没有title
    if (typeof message === 'object' && options === undefined) {
        options = message;
        message = title;
        title = getDefaultTitle(options.type || defaultOptions.type);
    }
    
    // 确保有toast容器
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = createToastContainer();
    }
    
    // 创建toast元素
    const toast = createToastElement(title, message, mergedOptions.type, mergedOptions.duration);
    
    // 添加到容器
    container.appendChild(toast);
    
    // 触发显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 如果可关闭，添加点击事件
    if (mergedOptions.dismissible) {
        toast.addEventListener('click', () => {
            dismissToast(toast);
        });
    }
    
    // 设置自动消失
    const timeoutId = setTimeout(() => {
        dismissToast(toast);
    }, mergedOptions.duration);
    
    // 存储timeout ID以便可以取消
    toast.dataset.timeoutId = timeoutId;
    
    // 返回toast的ID，以便可以手动关闭
    return toast.id;
}

/**
 * 根据类型获取默认标题
 * @param {string} type - 消息类型
 * @returns {string} - 默认标题
 */
function getDefaultTitle(type) {
    switch(type) {
        case 'success':
            return '成功';
        case 'error':
            return '错误';
        case 'warning':
            return '警告';
        case 'info':
            return '提示';
        default:
            return '通知';
    }
}

/**
 * 关闭特定toast
 * @param {HTMLElement|string} toast - toast元素或ID
 */
function dismissToast(toast) {
    // 如果传入的是ID字符串
    if (typeof toast === 'string') {
        toast = document.getElementById(toast);
    }
    
    if (!toast) return;
    
    // 清除自动消失的定时器
    if (toast.dataset.timeoutId) {
        clearTimeout(parseInt(toast.dataset.timeoutId));
    }
    
    // 添加退出动画
    toast.classList.add('toast-exit');
    
    // 动画结束后移除元素
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
            
            // 如果容器为空，也移除容器
            const container = document.querySelector('.toast-container');
            if (container && container.children.length === 0) {
                document.body.removeChild(container);
            }
        }
    }, 300); // 与toast-out动画时间相匹配
}

// 便捷方法
const toast = {
    success: (title, message, options) => {
        // 处理不同的参数情况
        if (typeof message === 'object' || message === undefined) {
            return showToast(title, { ...message, type: 'success' });
        }
        return showToast(title, message, { ...options, type: 'success' });
    },
    error: (title, message, options) => {
        if (typeof message === 'object' || message === undefined) {
            return showToast(title, { ...message, type: 'error' });
        }
        return showToast(title, message, { ...options, type: 'error' });
    },
    warning: (title, message, options) => {
        if (typeof message === 'object' || message === undefined) {
            return showToast(title, { ...message, type: 'warning' });
        }
        return showToast(title, message, { ...options, type: 'warning' });
    },
    info: (title, message, options) => {
        if (typeof message === 'object' || message === undefined) {
            return showToast(title, { ...message, type: 'info' });
        }
        return showToast(title, message, { ...options, type: 'info' });
    },
    default: (title, message, options) => {
        if (typeof message === 'object' || message === undefined) {
            return showToast(title, { ...message, type: 'default' });
        }
        return showToast(title, message, { ...options, type: 'default' });
    },
    dismiss: (toastId) => dismissToast(toastId)
};
