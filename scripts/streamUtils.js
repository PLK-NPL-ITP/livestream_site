
/**
 * Stream Utilities Module
 * 
 * This module provides the following functionalities:
 * 1. Stream item initialization and management
 * 2. Dynamic time display and formatting
 * 3. Viewers count management with random fluctuations
 * 4. Unique ID generation for stream items
 * 5. Public API for external manipulation of stream items
 * 6. Demo stream items generation
 * 
 * Core Implementation:
 * - Uses data attributes to store stream metadata
 * - Updates time displays at regular intervals
 * - Provides realistic viewer count simulation
 * - Integrates with other modules through public API
 */

document.addEventListener('DOMContentLoaded', function () {
    /************************************
     * INITIALIZATION
     ************************************/
    // DOM elements
    const publicStreams = document.getElementById('public-streams');
    let streamItems = document.querySelectorAll('.stream-item');
    
    // Initialize
    initializeStreamItems();
    
    // Start time updaters
    startTimeUpdater();
    
    /************************************
     * STREAM ITEM MANAGEMENT
     ************************************/
    /**
     * Initializes all stream items with necessary data
     * Sets default values for missing attributes
     */
    function initializeStreamItems() {
        streamItems.forEach(item => {
            // Generate ID if missing
            if (!item.getAttribute('data-id')) {
                const uniqueId = generateUniqueId();
                item.setAttribute('data-id', uniqueId);
            }
            
            // Set default start time if missing
            if (!item.getAttribute('data-time')) {
                // Default to random 1-5 hours ago
                const randomHours = Math.floor(Math.random() * 5) + 1;
                const randomMinutes = Math.floor(Math.random() * 60);
                const startTime = new Date();
                startTime.setHours(startTime.getHours() - randomHours);
                startTime.setMinutes(startTime.getMinutes() - randomMinutes);
                
                item.setAttribute('data-time', startTime.toISOString());
            }
            
            // Update time display
            updateTimeDisplay(item);
            
            // Set random viewers count if missing
            if (!item.getAttribute('data-viewers')) {
                const randomViewers = Math.floor(Math.random() * 100) + 5; // Random between 5-104
                item.setAttribute('data-viewers', randomViewers);
            }
            
            // Update viewers display
            updateViewersDisplay(item);
        });
    }
    
    /**
     * Generates a unique ID in format xxx-xxxx
     * @returns {string} Unique ID string
     */
    function generateUniqueId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        
        // Generate first 3 characters
        for (let i = 0; i < 3; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        id += '-';
        
        // Generate last 4 characters
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return id;
    }
    
    /************************************
     * DISPLAY UPDATES
     ************************************/
    /**
     * Updates the time display for a stream item
     * @param {HTMLElement} streamItem - The stream item element
     */
    function updateTimeDisplay(streamItem) {
        const timeElement = streamItem.querySelector('.stream-meta');
        const startTimeStr = streamItem.getAttribute('data-time');
        
        if (timeElement && startTimeStr) {
            const startTime = new Date(startTimeStr);
            const currentTime = new Date();
            const timeDiff = getTimeDifference(startTime, currentTime);
            
            // Preserve viewers part when updating time
            const viewersText = timeElement.textContent.split('•')[1] || '';
            timeElement.textContent = `Started ${timeDiff} ago • ${viewersText.trim()}`;
        }
    }
    
    /**
     * Updates the viewers count display for a stream item
     * @param {HTMLElement} streamItem - The stream item element
     */
    function updateViewersDisplay(streamItem) {
        const metaElement = streamItem.querySelector('.stream-meta');
        const viewers = streamItem.getAttribute('data-viewers');
        
        if (metaElement && viewers) {
            // Preserve time part when updating viewers
            const timeText = metaElement.textContent.split('•')[0] || '';
            metaElement.textContent = `${timeText.trim()} • ${viewers} viewers`;
        }
    }
    
    /**
     * Calculates and formats time difference into human-readable string
     * @param {Date} startDate - The start date
     * @param {Date} endDate - The end date (usually current time)
     * @returns {string} Formatted time difference
     */
    function getTimeDifference(startDate, endDate) {
        // Calculate millisecond difference
        const diff = Math.abs(endDate - startDate);
        
        // Calculate hours, minutes, seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Format output
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Starts interval timers for updating time and viewer counts
     */
    function startTimeUpdater() {
        // Update time display every 5 seconds
        setInterval(() => {
            // Re-query all stream items to include dynamically added ones
            const currentStreamItems = document.querySelectorAll('.stream-item');
            currentStreamItems.forEach(updateTimeDisplay);
        }, 5000);
        
        // Randomly update viewer counts every 10 seconds
        setInterval(() => {
            const currentStreamItems = document.querySelectorAll('.stream-item');
            currentStreamItems.forEach(item => {
                if (Math.random() > 0.7) { // 30% chance to update
                    const currentViewers = parseInt(item.getAttribute('data-viewers') || '0');
                    const change = Math.floor(Math.random() * 5) - 2; // Random change between -2 and +2
                    const newViewers = Math.max(1, currentViewers + change); // Ensure at least 1 viewer
                    
                    item.setAttribute('data-viewers', newViewers);
                    updateViewersDisplay(item);
                }
            });
        }, 10000);
    }
    
    /************************************
     * PUBLIC API
     ************************************/
    /**
     * Sets the viewer count for a specific stream
     * @param {string} streamId - Stream ID in format xxx-xxxx
     * @param {number} viewers - New viewer count
     * @returns {boolean} Success status
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
     * Sets the start time for a specific stream
     * @param {string} streamId - Stream ID in format xxx-xxxx
     * @param {Date|string} startTime - New start time
     * @returns {boolean} Success status
     */
    window.setStreamStartTime = function(streamId, startTime) {
        if (!streamId || !startTime) return false;
        
        const streamItem = document.querySelector(`.stream-item[data-id="${streamId}"]`);
        if (streamItem) {
            // Ensure startTime is ISO format string
            const timeStr = startTime instanceof Date ? startTime.toISOString() : startTime;
            streamItem.setAttribute('data-time', timeStr);
            updateTimeDisplay(streamItem);
            return true;
        }
        
        return false;
    };
    
    /**
     * Adds a new stream item to the list
     * @param {Object} options - Stream item configuration options
     * @returns {HTMLElement} Newly created stream item element
     */
    window.addStreamItem = function(options) {
        // Check required parameters
        if (!options.thumbnailSrc || !options.qualityInfo || !options.title || 
            !options.author || !options.visibility || !options.tags) {
            console.error('Missing required parameters for adding stream item');
            return null;
        }
        
        // Get or generate ID
        const streamId = options.id || generateUniqueId();
        
        // Set start time, default to current time
        let startTime;
        if (options.startTime) {
            startTime = options.startTime instanceof Date ? 
                options.startTime : new Date(options.startTime);
        } else {
            // Default to random 1-5 hours ago
            startTime = new Date();
            const randomHours = Math.floor(Math.random() * 5) + 1;
            const randomMinutes = Math.floor(Math.random() * 60);
            startTime.setHours(startTime.getHours() - randomHours);
            startTime.setMinutes(startTime.getMinutes() - randomMinutes);
        }
        
        // Set viewers count, default to random value
        const viewers = options.viewers || Math.floor(Math.random() * 100) + 5;
        
        // Create tags HTML
        const tagsHTML = options.tags.map(tag => 
            `<span class="stream-tag">${tag}</span>`
        ).join('');
        
        // Create stream item HTML
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
        
        // Add to DOM
        publicStreams.insertAdjacentHTML('beforeend', streamHTML);
        
        // Get new element
        const newStreamItem = publicStreams.lastElementChild;
        
        // Update time display
        updateTimeDisplay(newStreamItem);
        
        // Process description text (if in list view mode)
        if (typeof window.processStreamDescriptions === 'function') {
            window.processStreamDescriptions();
        }
        
        // Trigger refiltering (if filters.js exists)
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
        
        // Apply current sorting (if set)
        if (typeof window.applySorting === 'function') {
            window.applySorting();
        }
        
        return newStreamItem;
    };
    
    /**
     * Clears all stream items from the list
     * @returns {boolean} Success status
     */
    window.clearAllStreamItems = function() {
        if (publicStreams) {
            publicStreams.innerHTML = '';
            return true;
        }
        return false;
    };
    
    /************************************
     * DEMO STREAMS
     ************************************/
    /**
     * Adds example stream items for demonstration
     * @returns {boolean} Success status
     */
    window.addExampleStreamItems = function() {
        // Clear existing items
        window.clearAllStreamItems();
        
        // Example 1: Weekly Team Meeting
        window.addStreamItem({
            thumbnailSrc: 'assets/images/stream1.jpg',
            qualityInfo: '1080p • 30fps',
            title: 'Weekly Team Meeting',
            author: 'Jane Doe',
            startTime: '2025-05-19T10:30:00',
            viewers: 45,
            visibility: 'public',
            tags: ['Discussion', 'Meeting', 'Planning'],
            description: 'Discussion of current project progress, upcoming milestones, and team assignments for the next sprint.',
            id: 'abc-1234'
        });
        
        // Example 2: Q&A Session
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
        
        // Example 3: Private Meeting
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
        
        // Example 4: API Workshop
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
        
        // Example 5: Product Showcase
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
        
        // Process all descriptions
        if (typeof window.processStreamDescriptions === 'function') {
            window.processStreamDescriptions();
        }
        
        return true;
    };
});
