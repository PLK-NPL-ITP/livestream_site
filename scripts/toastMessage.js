/**
 * Toast Notification System
 * 
 * Author: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * Date: 2024-05-21
 * Copyright (c) 2025 NPL ITP Infrastructure (Development) Group
 * All rights reserved.
 * Distributed under the MIT License.
 * 
 * This module implements a comprehensive toast notification system with the following features:
 * - Multiple notification types: success, error, warning, info, default
 * - Animated appearance and disappearance
 * - Configurable duration and dismissible options
 * - Visual indicators with icons and progress bars
 * - Flexible API supporting different parameter formats
 * - Auto-removal from DOM when dismissed
 * 
 * Implementation uses pure JavaScript with DOM manipulation techniques to create
 * and manage notification elements dynamically.
 */

/**
 * SECTION: Core Utility Functions
 * Basic helper functions for toast creation and management
 */

// Create toast container
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Generate unique ID
function generateId() {
    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * SECTION: Toast UI Elements Creation
 * Functions to build toast UI components
 */

// Create toast icon
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
    
    // Create image element
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
 * Create main toast element
 * @param {string} title - Title text
 * @param {string} message - Message content
 * @param {string} type - Notification type
 * @param {number} duration - Duration in milliseconds
 * @returns {HTMLElement} - Toast element
 */
function createToastElement(title, message, type, duration) {
    const toastId = generateId();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    
    // Add icon
    const icon = createToastIcon(type);
    
    // Add content
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
    
    // Create progress bar
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress-bar';
    progressBar.style.animationDuration = `${duration}ms`;
    
    // Set progress bar color based on notification type
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
    
    // Assemble toast
    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(progress);
    
    return toast;
}

/**
 * SECTION: Main Toast API Functions
 * Core functions for showing and managing toast notifications
 */

/**
 * Show toast notification
 * @param {string} title - Title to display
 * @param {string} message - Message content to display
 * @param {object} options - Configuration options
 * @param {string} options.type - Type: 'success', 'error', 'warning', 'info', 'default'
 * @param {number} options.duration - Duration in milliseconds
 * @param {boolean} options.dismissible - Whether clickable to dismiss
 */
function showToast(title, message, options = {}) {
    // Default options
    const defaultOptions = {
        type: 'default',
        duration: 3000,
        dismissible: true
    };
    
    // Merge options
    const mergedOptions = {...defaultOptions, ...options};
    
    // If only two arguments passed and second is an object, first is message with no title
    if (typeof message === 'object' && options === undefined) {
        options = message;
        message = title;
        title = getDefaultTitle(options.type || defaultOptions.type);
    }
    
    // Ensure toast container exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = createToastContainer();
    }
    
    // Create toast element
    const toast = createToastElement(title, message, mergedOptions.type, mergedOptions.duration);
    
    // Add to container
    container.appendChild(toast);
    
    // Trigger display animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // If dismissible, add click event
    if (mergedOptions.dismissible) {
        toast.addEventListener('click', () => {
            dismissToast(toast);
        });
    }
    
    // Set auto-dismiss
    const timeoutId = setTimeout(() => {
        dismissToast(toast);
    }, mergedOptions.duration);
    
    // Store timeout ID for potential cancellation
    toast.dataset.timeoutId = timeoutId;
    
    // Return toast ID for manual dismissal if needed
    return toast.id;
}

/**
 * Get default title based on notification type
 * @param {string} type - Message type
 * @returns {string} - Default title
 */
function getDefaultTitle(type) {
    switch(type) {
        case 'success':
            return 'Success';
        case 'error':
            return 'Error';
        case 'warning':
            return 'Warning';
        case 'info':
            return 'Info';
        default:
            return 'Notification';
    }
}

/**
 * Dismiss a specific toast notification
 * @param {HTMLElement|string} toast - Toast element or ID
 */
function dismissToast(toast) {
    // If string ID is passed
    if (typeof toast === 'string') {
        toast = document.getElementById(toast);
    }
    
    if (!toast) return;
    
    // Clear the auto-dismiss timer
    if (toast.dataset.timeoutId) {
        clearTimeout(parseInt(toast.dataset.timeoutId));
    }
    
    // Add exit animation
    toast.classList.add('toast-exit');
    
    // Remove element after animation completes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
            
            // If container is empty, remove it too
            const container = document.querySelector('.toast-container');
            if (container && container.children.length === 0) {
                document.body.removeChild(container);
            }
        }
    }, 300); // Match toast-out animation duration
}

/**
 * SECTION: Convenience Methods
 * Shorthand methods for different toast notification types
 */
const toast = {
    success: (title, message, options) => {
        // Handle different parameter scenarios
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
