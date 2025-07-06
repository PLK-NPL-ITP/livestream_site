
/**
 * Stream Utilities Module
 * 
 * This module provides the following functionalities:
 * 1. Stream item initialization and management from API
 * 2. Dynamic time display and formatting
 * 3. Real-time stream data fetching via long polling
 * 4. Stream status management (planned, streaming, pausing, ended, replay)
 * 5. Intelligent incremental updates for changed data only
 * 6. Smart stream group reorganization on status changes
 * 
 * Core Implementation:
 * - Uses data attributes to store stream metadata
 * - Updates only changed content to optimize performance
 * - Fetches real stream data from /api/get-streams endpoint
 * - Integrates with other modules through public API
 * - Advanced incremental update system
 */

document.addEventListener('DOMContentLoaded', function () {
    /************************************
     * INITIALIZATION & STATE
     ************************************/
    // DOM elements
    const publicStreams = document.getElementById('public-streams');
    
    // State management
    let currentStreams = new Map(); // Cache for current streams data
    let pollingInterval = null;
    let isPolling = false;
    
    // Initialize the module
    initialize();
    
    /************************************
     * MAIN INITIALIZATION
     ************************************/
    /**
     * Initialize the module
     */
    function initialize() {
        // Start long polling
        startLongPolling();
        
        // Initialize user group UI
        updateUserGroupUI();
        
        // Listen for auth state changes
        setupAuthEventListeners();
    }
    
    /************************************
     * UTILITY FUNCTIONS
     ************************************/
    /**
     * Calculate time difference and return formatted string
     * @param {Date} startTime - Start time
     * @param {Date} currentTime - Current time
     * @returns {string} Formatted time difference
     */
    function getTimeDifference(startTime, currentTime) {
        const diffMs = currentTime - startTime;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSeconds < 60) {
            return `${diffSeconds}s`;
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else {
            return `${diffDays}d`;
        }
    }
    
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
     * Get current user group from authAPI profile
     * @returns {string} User group (visitor, user, streamer, manager, admin)
     */
    function getCurrentUserGroup() {
        const currentProfile = window.authAPI ? window.authAPI.getCurrentProfile() : null;
        
        if (!currentProfile?.user_group) {
            return 'visitor';
        }
        
        if (Array.isArray(currentProfile.user_group)) {
            const groups = currentProfile.user_group;
            const hierarchy = ['visitor', 'user', 'streamer', 'manager', 'admin'];
            return groups.reduce((highest, group) => {
                const currentIndex = hierarchy.indexOf(group);
                const highestIndex = hierarchy.indexOf(highest);
                return currentIndex > highestIndex ? group : highest;
            }, 'visitor');
        }
        
        return currentProfile.user_group;
    }
    
    /************************************
     * USER GROUP MANAGEMENT
     ************************************/
    /**
     * Update UI based on user group permissions
     */
    function updateUserGroupUI() {
        const userGroup = getCurrentUserGroup();
        
        // Handle visibility filter dropdown
        const visibilityDropdown = document.querySelector('.visibility-filter');
        const unlistedOption = document.querySelector('.visibility-option[data-value="unlisted"]');
        
        if (visibilityDropdown) {
            if (userGroup === 'visitor') {
                visibilityDropdown.style.display = 'none';
            } else {
                visibilityDropdown.style.display = '';
                
                if (unlistedOption) {
                    if (userGroup === 'admin') {
                        unlistedOption.style.display = '';
                    } else {
                        unlistedOption.style.display = 'none';
                    }
                }
            }
        }
        
        console.log(`UI initialized for user group: ${userGroup}`);
    }
    
    /**
     * Setup auth event listeners
     */
    function setupAuthEventListeners() {
        if (window.authAPI) {
            window.authAPI.on(function(event) {
                if (event.detail.type === 'profile-updated') {
                    // Update UI when auth state changes
                    setTimeout(() => {
                        updateUserGroupUI();
                        // Trigger additional polling on profile update
                        fetchStreams();
                    }, 100);
                }
            });
        }
    }
    
    /************************************
     * LONG POLLING IMPLEMENTATION
     ************************************/
    /**
     * Start long polling for stream data
     */
    function startLongPolling() {
        if (isPolling) return;
        
        isPolling = true;
        
        // Initial fetch
        fetchStreams();
        
        // Start polling every 3 seconds
        pollingInterval = setInterval(() => {
            fetchStreams();
        }, 3000);
        
        console.log('Long polling started for streams');
    }
    
    /**
     * Stop long polling
     */
    function stopLongPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        isPolling = false;
        console.log('Long polling stopped');
    }
    
    /**
     * Fetch streams from API
     */
    async function fetchStreams() {
        try {
            let streams;
            
            if (window.authAPI) {
                console.log('Fetching streams with authAPI');
                streams = await window.authAPI.makeRequest('/api/get-streams', {}, true);
            } else {
                const response = await fetch('/api/get-streams');
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                streams = await response.json();
            }
            
            if (Array.isArray(streams)) {
                processStreamData(streams);
            }
            
        } catch (error) {
            console.error('Failed to fetch streams:', error.message);
        }
    }
    
    /************************************
     * INTELLIGENT STREAM DATA PROCESSING
     ************************************/
    /**
     * Process incoming stream data with intelligent updates
     * @param {Array} streams - Array of stream objects from API
     */
    function processStreamData(streams) {
        const existingStreams = new Set(currentStreams.keys());
        const newStreamIds = new Set(streams.map(s => s.stream_id));
        
        let hasNewStreams = false;
        let hasRemovedStreams = false;
        let hasStreamUpdates = false;
        
        // Process each stream
        streams.forEach(stream => {
            const streamId = stream.stream_id;
            const existingStream = currentStreams.get(streamId);
            
            if (!existingStream) {
                // New stream - add it
                hasNewStreams = true;
                addNewStream(stream);
            } else {
                // Check if stream actually has changes before updating
                const hasChanges = checkStreamChanges(existingStream, stream);
                if (hasChanges) {
                    hasStreamUpdates = true;
                    updateExistingStream(existingStream, stream);
                }
            }
        });
        
        // Remove streams that no longer exist
        existingStreams.forEach(streamId => {
            if (!newStreamIds.has(streamId)) {
                hasRemovedStreams = true;
                removeStream(streamId);
            }
        });
        
        updateAllTimeDisplays();
        
        // Update snapshots for active streams
        // updateStreamSnapshots();

        // Update cache
        currentStreams.clear();
        streams.forEach(stream => {
            currentStreams.set(stream.stream_id, stream);
        });
        
        // Only apply external filters and sorting if there were actual changes
        if (hasNewStreams || hasRemovedStreams || hasStreamUpdates) {
            applyExternalFiltersAndSorting();
        }
    }
    
    /**
     * Check if a stream has any changes that require updates
     * @param {Object} oldData - Previous stream data
     * @param {Object} newData - New stream data from API
     * @returns {boolean} True if stream has changes
     */
    function checkStreamChanges(oldData, newData) {
        // Quick checks for the most common changes
        if (oldData.stream_status !== newData.stream_status) return true;
        if (oldData.viewer_count !== newData.viewer_count) return true;
        if (oldData.stream_title !== newData.stream_title) return true;
        if (oldData.stream_description !== newData.stream_description) return true;
        if (oldData.streamer_name !== newData.streamer_name) return true;
        
        // More expensive checks for arrays
        const oldTagsString = JSON.stringify(oldData.stream_tags || []);
        const newTagsString = JSON.stringify(newData.stream_tags || []);
        if (oldTagsString !== newTagsString) return true;
        
        const oldQualityString = JSON.stringify(oldData.quality_info || []);
        const newQualityString = JSON.stringify(newData.quality_info || []);
        if (oldQualityString !== newQualityString) return true;
        
        return false; // No changes detected
    }
    
    /**
     * Add a new stream to the UI
     * @param {Object} streamData - Stream data from API
     */
    function addNewStream(streamData) {
        const displayData = convertAPIStreamToDisplay(streamData);
        if (!displayData) return;
        
        // Find correct group position
        const targetGroup = getStreamGroup(streamData.stream_status);
        const insertPosition = findInsertPosition(targetGroup);
        
        // Create stream element
        const streamElement = createStreamElement(displayData);
        
        // Insert at correct position
        if (insertPosition.nextSibling) {
            publicStreams.insertBefore(streamElement, insertPosition.nextSibling);
        } else {
            publicStreams.appendChild(streamElement);
        }
        
        // Ensure group separator exists
        ensureGroupSeparator(targetGroup, insertPosition.separator);
        
        console.log(`Added new stream: ${streamData.stream_title}`);
    }
    
    /**
     * Update an existing stream with new data
     * @param {Object} oldData - Previous stream data
     * @param {Object} newData - New stream data from API
     */
    function updateExistingStream(oldData, newData) {
        const streamElement = document.querySelector(`[data-id="${newData.stream_id}"]`);
        if (!streamElement) return;
        
        let needsGroupMove = false;
        let hasAnyChanges = false;
        
        // Check for status change (requires group move)
        if (oldData.stream_status !== newData.stream_status) {
            needsGroupMove = true;
            hasAnyChanges = true;
            updateStreamStatus(streamElement, newData.stream_status);
        }
        
        // Check for viewer count change
        if (oldData.viewer_count !== newData.viewer_count) {
            hasAnyChanges = true;
            updateViewerCount(streamElement, newData.viewer_count);
        }
        
        // Check for title change
        if (oldData.stream_title !== newData.stream_title) {
            hasAnyChanges = true;
            updateStreamTitle(streamElement, newData.stream_title);
        }
        
        // Check for description change
        if (oldData.stream_description !== newData.stream_description) {
            hasAnyChanges = true;
            updateStreamDescription(streamElement, newData.stream_description);
        }
        
        // Check for author change
        if (oldData.streamer_name !== newData.streamer_name) {
            hasAnyChanges = true;
            updateStreamAuthor(streamElement, newData.streamer_name);
        }
        
        // Check for tags change (more efficient comparison)
        const oldTagsString = JSON.stringify(oldData.stream_tags || []);
        const newTagsString = JSON.stringify(newData.stream_tags || []);
        if (oldTagsString !== newTagsString) {
            hasAnyChanges = true;
            updateStreamTags(streamElement, newData.stream_tags);
        }
        
        // Check for quality change (more efficient comparison)
        const oldQualityString = JSON.stringify(oldData.quality_info || []);
        const newQualityString = JSON.stringify(newData.quality_info || []);
        if (oldQualityString !== newQualityString) {
            hasAnyChanges = true;
            updateStreamQuality(streamElement, newData.quality_info);
        }
        
        // Move to correct group if status changed
        if (needsGroupMove) {
            moveStreamToCorrectGroup(streamElement, newData.stream_status);
        }
        
        // Log only if there were actual changes
        if (hasAnyChanges) {
            console.log(`Updated stream: ${newData.stream_title} (${newData.stream_id})`);
        }
    }
    
    /**
     * Remove a stream from the UI
     * @param {string} streamId - Stream ID to remove
     */
    function removeStream(streamId) {
        const streamElement = document.querySelector(`[data-id="${streamId}"]`);
        if (streamElement) {
            streamElement.remove();
            currentStreams.delete(streamId);
            console.log(`Removed stream: ${streamId}`);
        }
    }
    
    /************************************
     * INDIVIDUAL UPDATE FUNCTIONS
     ************************************/
    /**
     * Update stream status and badge
     * @param {HTMLElement} streamElement - Stream element
     * @param {string} status - New status
     */
    function updateStreamStatus(streamElement, status) {
        const oldStatus = streamElement.getAttribute('data-status');
        
        // Only proceed if status actually changed
        if (oldStatus === status) return;
        
        streamElement.setAttribute('data-status', status);
        
        const badge = streamElement.querySelector('.live-badge');
        if (!badge) return;
        
        // Determine new badge text and classes
        let badgeText = '';
        let badgeClasses = 'live-badge';
        
        switch (status) {
            case 'streaming':
            case 'pausing':
                badgeText = 'LIVE';
                break;
            case 'planned':
                badgeText = 'PLANNED';
                badgeClasses += ' planned';
                break;
            case 'replay':
                badgeText = 'REPLAY';
                badgeClasses += ' replay';
                break;
            case 'ended':
                badgeText = 'ENDED';
                badgeClasses += ' ended';
                break;
        }
        
        // Only update badge if text or classes changed
        const currentBadgeText = badge.textContent.trim();
        const currentBadgeClass = badge.className;
        
        if (currentBadgeText !== badgeText) {
            badge.textContent = badgeText;
        }
        
        if (currentBadgeClass !== badgeClasses) {
            badge.className = badgeClasses;
        }
        
        // Handle quality info visibility based on status change
        const qualityElement = streamElement.querySelector('.quality-info');
        if (status === 'planned') {
            // Hide quality for planned streams
            if (qualityElement && qualityElement.style.display !== 'none') {
                qualityElement.style.display = 'none';
            }
        } else if (oldStatus === 'planned' && status !== 'planned') {
            // Show quality when changing from planned to other status
            if (qualityElement && qualityElement.style.display === 'none') {
                qualityElement.style.display = '';
            } else if (!qualityElement) {
                // Create quality element if it doesn't exist
                const thumbnail = streamElement.querySelector('.stream-thumbnail');
                if (thumbnail) {
                    const qualityHTML = `<span class="quality-info">1280x720 • H264</span>`;
                    thumbnail.insertAdjacentHTML('beforeend', qualityHTML);
                }
            }
        }
    }
    
    /**
     * Update viewer count
     * @param {HTMLElement} streamElement - Stream element
     * @param {number} viewerCount - New viewer count
     */
    function updateViewerCount(streamElement, viewerCount) {
        const currentViewers = parseInt(streamElement.getAttribute('data-viewers')) || 0;
        
        // Only update if viewer count actually changed
        if (currentViewers !== viewerCount) {
            streamElement.setAttribute('data-viewers', viewerCount);
            updateTimeAndViewerDisplay(streamElement);
        }
    }
    
    /**
     * Update stream title
     * @param {HTMLElement} streamElement - Stream element
     * @param {string} title - New title
     */
    function updateStreamTitle(streamElement, title) {
        const titleElement = streamElement.querySelector('h3');
        if (titleElement) {
            const currentTitle = titleElement.textContent.trim();
            const newTitle = (title || '').trim();
            
            // Only update if title actually changed
            if (currentTitle !== newTitle) {
                titleElement.textContent = newTitle;
            }
        }
    }
    
    /**
     * Update stream description
     * @param {HTMLElement} streamElement - Stream element
     * @param {string} description - New description
     */
    function updateStreamDescription(streamElement, description) {
        const descElement = streamElement.querySelector('.stream-description');
        if (descElement) {
            const currentDescription = descElement.textContent.trim();
            const newDescription = (description || '').trim();
            const hasContent = newDescription.length > 0;
            const currentDisplay = descElement.style.display;
            const newDisplay = hasContent ? 'block' : 'none';
            const hasDescriptionClass = streamElement.classList.contains('has-description');
            
            // Only update text if description actually changed
            if (currentDescription !== newDescription) {
                descElement.textContent = newDescription;
            }
            
            // Only update display style if it actually changed
            if (currentDisplay !== newDisplay) {
                descElement.style.display = newDisplay;
            }
            
            // Only update class if it actually changed
            if (hasContent && !hasDescriptionClass) {
                streamElement.classList.add('has-description');
            } else if (!hasContent && hasDescriptionClass) {
                streamElement.classList.remove('has-description');
            }
        }
    }
    
    /**
     * Update stream author
     * @param {HTMLElement} streamElement - Stream element
     * @param {string} author - New author name
     */
    function updateStreamAuthor(streamElement, author) {
        const authorElement = streamElement.querySelector('.stream-author');
        if (authorElement) {
            const currentAuthor = authorElement.textContent.trim();
            const newAuthor = (author || 'Unknown Streamer').trim();
            
            // Only update if author actually changed
            if (currentAuthor !== newAuthor) {
                authorElement.textContent = newAuthor;
            }
        }
    }
    
    /**
     * Update stream tags
     * @param {HTMLElement} streamElement - Stream element
     * @param {Array} tags - New tags array
     */
    function updateStreamTags(streamElement, tags) {
        const infoLeft = streamElement.querySelector('.stream-info-left');
        if (!infoLeft) return;
        
        const tagsArray = Array.isArray(tags) ? tags : [];
        const newTagsString = tagsArray.join(',');
        const currentTagsString = streamElement.getAttribute('data-tags') || '';
        
        // Only update if tags actually changed
        if (currentTagsString !== newTagsString) {
            // Remove existing tags
            const existingTags = infoLeft.querySelectorAll('.stream-tag');
            existingTags.forEach(tag => tag.remove());
            
            // Add new tags
            const tagsHTML = tagsArray.map(tag => 
                `<span class="stream-tag">${tag}</span>`
            ).join('');
            
            if (tagsHTML) {
                infoLeft.insertAdjacentHTML('beforeend', tagsHTML);
            }
            
            // Update data attribute
            streamElement.setAttribute('data-tags', newTagsString);
        }
    }
    
    /**
     * Update stream quality
     * @param {HTMLElement} streamElement - Stream element
     * @param {Array} qualityInfo - New quality info
     */
    function updateStreamQuality(streamElement, qualityInfo) {
        const qualityElement = streamElement.querySelector('.quality-info');
        const status = streamElement.getAttribute('data-status');
        
        if (status === 'planned') {
            // For planned streams, hide quality info
            if (qualityElement && qualityElement.style.display !== 'none') {
                qualityElement.style.display = 'none';
            }
        } else {
            const formattedQuality = formatQualityInfo(qualityInfo);
            
            // For other streams, show and update quality info
            if (qualityElement) {
                const currentQuality = qualityElement.textContent.trim();
                
                // Only update text if quality actually changed
                if (currentQuality !== formattedQuality) {
                    qualityElement.textContent = formattedQuality;
                }
                
                // Only update display if currently hidden
                if (qualityElement.style.display === 'none') {
                    qualityElement.style.display = '';
                }
            } else {
                // Create quality element if it doesn't exist
                const thumbnail = streamElement.querySelector('.stream-thumbnail');
                if (thumbnail) {
                    const qualityHTML = `<span class="quality-info">${formattedQuality}</span>`;
                    thumbnail.insertAdjacentHTML('beforeend', qualityHTML);
                }
            }
        }
    }
    
    
    /************************************
     * GROUP MANAGEMENT FUNCTIONS
     ************************************/
    /**
     * Get stream group based on status
     * @param {string} status - Stream status
     * @returns {string} Group name
     */
    function getStreamGroup(status) {
        switch (status) {
            case 'planned':
                return 'planned';
            case 'streaming':
            case 'pausing':
                return 'live';
            case 'replay':
                return 'replay';
            case 'ended':
            default:
                return 'ended';
        }
    }
    
    /**
     * Find insert position for a stream group
     * @param {string} groupName - Group name
     * @returns {Object} Insert position info
     */
    function findInsertPosition(groupName) {
        const groupOrder = ['planned', 'live', 'replay', 'ended'];
        const groupIndex = groupOrder.indexOf(groupName);
        
        let lastElementOfGroup = null;
        let separatorElement = null;
        
        // Find existing separator for this group
        const separators = document.querySelectorAll('.stream-separator');
        for (const separator of separators) {
            const label = separator.getAttribute('data-label');
            if (label && label.toLowerCase().includes(groupName)) {
                separatorElement = separator;
                break;
            }
        }
        
        // Find last element of the group
        const groupClasses = {
            'planned': '[data-status="planned"]',
            'live': '[data-status="streaming"], [data-status="pausing"]',
            'replay': '[data-status="replay"]',
            'ended': '[data-status="ended"]'
        };
        
        const groupElements = document.querySelectorAll(groupClasses[groupName]);
        if (groupElements.length > 0) {
            lastElementOfGroup = groupElements[groupElements.length - 1];
        }
        
        return {
            nextSibling: lastElementOfGroup ? lastElementOfGroup.nextSibling : null,
            separator: separatorElement
        };
    }
    
    /**
     * Move stream to correct group
     * @param {HTMLElement} streamElement - Stream element
     * @param {string} newStatus - New status
     */
    function moveStreamToCorrectGroup(streamElement, newStatus) {
        const targetGroup = getStreamGroup(newStatus);
        const insertPosition = findInsertPosition(targetGroup);
        
        // Remove from current position
        streamElement.remove();
        
        // Insert at correct position
        if (insertPosition.nextSibling) {
            publicStreams.insertBefore(streamElement, insertPosition.nextSibling);
        } else {
            publicStreams.appendChild(streamElement);
        }
        
        // Ensure group separator exists
        ensureGroupSeparator(targetGroup, insertPosition.separator);
        
        console.log(`Moved stream to ${targetGroup} group`);
    }
    
    /**
     * Ensure group separator exists
     * @param {string} groupName - Group name
     * @param {HTMLElement} existingSeparator - Existing separator element
     */
    function ensureGroupSeparator(groupName, existingSeparator) {
        if (existingSeparator) return;
        
        const groupLabels = {
            'planned': 'Planned Streams',
            'live': 'Live Streams',
            'replay': 'Replay Streams',
            'ended': 'Ended Streams'
        };
        
        const label = groupLabels[groupName];
        if (!label) return;
        
        // Create separator
        const separatorHTML = `
            <div class="stream-separator grid-break" data-label="${label}">
                <div class="separator-line"></div>
                <span class="separator-label">${label}</span>
                <div class="separator-line"></div>
            </div>
        `;
        
        // Find position to insert separator
        const groupOrder = ['planned', 'live', 'replay', 'ended'];
        const currentGroupIndex = groupOrder.indexOf(groupName);
        
        let insertBefore = null;
        
        // Find the first stream of this group or next group
        for (let i = currentGroupIndex; i < groupOrder.length; i++) {
            const group = groupOrder[i];
            const groupClasses = {
                'planned': '[data-status="planned"]',
                'live': '[data-status="streaming"], [data-status="pausing"]',
                'replay': '[data-status="replay"]',
                'ended': '[data-status="ended"]'
            };
            
            const firstStreamOfGroup = document.querySelector(groupClasses[group]);
            if (firstStreamOfGroup) {
                insertBefore = firstStreamOfGroup;
                break;
            }
        }
        
        if (insertBefore) {
            insertBefore.insertAdjacentHTML('beforebegin', separatorHTML);
        } else {
            publicStreams.insertAdjacentHTML('beforeend', separatorHTML);
        }
    }
    
    /************************************
     * STREAM ELEMENT CREATION
     ************************************/
    /**
     * Convert API stream format to internal display format
     * @param {Object} apiStream - Stream object from API
     * @returns {Object} Display format object
     */
    function convertAPIStreamToDisplay(apiStream) {
        try {
            const qualityInfo = formatQualityInfo(apiStream.quality_info);
            const visibility = apiStream.stream_visibility || 'unlisted';
            const status = apiStream.stream_status || 'planned';
            const viewers = apiStream.viewer_count || 0;
            let thumbnailSrc = 'assets/images/stream1.jpg';
            if (status != 'planned') {
                thumbnailSrc = `/streams/${apiStream.stream_code}/snapshot.jpg`;
            }
            const tags = Array.isArray(apiStream.stream_tags) ? apiStream.stream_tags : [];
            
            return {
                streamCode: apiStream.stream_code,
                streamId: apiStream.stream_id,
                thumbnailSrc: thumbnailSrc,
                qualityInfo: qualityInfo,
                title: apiStream.stream_title ,
                author_id: apiStream.streamer_id,
                author: apiStream.streamer_name,
                startTime: apiStream.active_time,
                viewers: viewers,
                visibility: visibility,
                tags: tags,
                description: apiStream.stream_description || "The streamer seems provide a empty description...... Let's have a guess or just click in to view now!",
                status: status
            };
        } catch (error) {
            console.error('Error converting API stream data:', error);
            return null;
        }
    }
    
    /**
     * Create stream element from display data
     * @param {Object} displayData - Display format data
     * @returns {HTMLElement} Stream element
     */
    function createStreamElement(displayData) {
        const startTime = displayData.startTime instanceof Date ? 
            displayData.startTime : new Date(displayData.startTime);
        
        // Determine badge text and class
        let badgeText = 'LIVE';
        let badgeClass = 'live-badge';
        
        switch (displayData.status) {
            case 'streaming':
            case 'pausing':
                badgeText = 'LIVE';
                badgeClass = 'live-badge';
                break;
            case 'planned':
                badgeText = 'PLANNED';
                badgeClass = 'live-badge planned';
                break;
            case 'replay':
                badgeText = 'REPLAY';
                badgeClass = 'live-badge replay';
                break;
            case 'ended':
                badgeText = 'ENDED';
                badgeClass = 'live-badge ended';
                break;
        }
        
        // Create tags HTML
        const tagsHTML = displayData.tags.map(tag => 
            `<span class="stream-tag">${tag}</span>`
        ).join('');
        
        // Create stream item HTML
        const streamHTML = `
            <div class="stream-item" 
                 data-visibility="${displayData.visibility}" 
                 data-tags="${displayData.tags.join(',')}" 
                 data-id="${displayData.streamId}"
                 author-id="${displayData.author_id}"
                 stream-code="${displayData.streamCode}"
                 data-time="${startTime.toISOString()}" 
                 data-viewers="${displayData.viewers}"
                 data-status="${displayData.status}">
                <div class="stream-thumbnail">
                    <img src="${displayData.thumbnailSrc}" alt="Stream thumbnail">
                    <span class="${badgeClass}">${badgeText}</span>
                    ${displayData.status === 'planned' ? '' : `<span class="quality-info">${displayData.qualityInfo}</span>`}
                </div>
                <div class="stream-info">
                    <div class="stream-info-left">
                        <h3>${displayData.title}</h3>
                        <p class="stream-author">${displayData.author}</p>
                        <p class="stream-meta">Started 0s ago • ${displayData.viewers} viewers</p>
                        <span class="stream-visibility${displayData.visibility === 'private' ? ' private' : ''}">${displayData.visibility === 'private' ? 'Private' : displayData.visibility === 'unlisted' ? 'Unlisted' : 'Public'}</span>
                        ${tagsHTML}
                    </div>
                    <p class="stream-description" style="display: ${displayData.description ? 'block' : 'none'}">${displayData.description || ''}</p>
                </div>
            </div>
        `;
        
        // Create element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = streamHTML;
        const streamElement = tempDiv.firstElementChild;
        
        // Update time display
        updateTimeAndViewerDisplay(streamElement);
        
        return streamElement;
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
    
    /************************************
     * TIME AND DISPLAY UPDATES
     ************************************/
    /**
     * Update all time displays
     */
    function updateAllTimeDisplays() {
        const streamItems = document.querySelectorAll('.stream-item');
        streamItems.forEach(updateTimeAndViewerDisplay);
    }
    
    /**
     * Update snapshots for all active streams (non-planned)
     */
    function updateStreamSnapshots() {
        const activeStreamItems = document.querySelectorAll('.stream-item:not([data-status="planned"])');
        activeStreamItems.forEach(updateStreamSnapshot);
    }
    
    /**
     * Update snapshot for a single stream item
     * @param {HTMLElement} streamItem - The stream item element
     */
    function updateStreamSnapshot(streamItem) {
        const streamCode = streamItem.getAttribute('stream-code');
        const status = streamItem.getAttribute('data-status');
        
        if (!streamCode || status === 'planned') return;
        
        const thumbnailImg = streamItem.querySelector('.stream-thumbnail img');
        if (!thumbnailImg) return;
        
        // Update snapshot with timestamp
        const timestamp = Date.now();
        const newSrc = `/streams/${streamCode}/snapshot.jpg?t=${timestamp}`;
        thumbnailImg.src = newSrc;
    }
    
    /**
     * Updates the time and viewer display for a stream item
     * @param {HTMLElement} streamItem - The stream item element
     */
    function updateTimeAndViewerDisplay(streamItem) {
        const timeElement = streamItem.querySelector('.stream-meta');
        const startTimeStr = streamItem.getAttribute('data-time');
        const viewers = parseInt(streamItem.getAttribute('data-viewers')) || 0;
        const status = streamItem.getAttribute('data-status') || 'ended';
        
        if (!timeElement || !startTimeStr) return;
        
        const startTime = new Date(startTimeStr);
        const currentTime = new Date();
        
        let newTimeText = '';
        
        switch (status) {
            case 'planned':
                // For planned streams, don't show time and viewer count
                newTimeText = 'Scheduled Stream';
                break;
            case 'streaming':
            case 'pausing':
                newTimeText = `Started ${getTimeDifference(startTime, currentTime)} ago • ${formatViewerCount(viewers)} viewers`;
                break;
            case 'replay':
                newTimeText = `Recorded ${getTimeDifference(startTime, currentTime)} ago • ${formatViewerCount(viewers)} viewers`;
                break;
            case 'ended':
                newTimeText = `Ended ${getTimeDifference(startTime, currentTime)} ago • ${formatViewerCount(viewers)} viewers`;
                break;
            default:
                newTimeText = `${getTimeDifference(startTime, currentTime)} ago • ${formatViewerCount(viewers)} viewers`;
        }
        
        // Only update DOM if the text actually changed
        const currentTimeText = timeElement.textContent.trim();
        if (currentTimeText !== newTimeText) {
            timeElement.textContent = newTimeText;
        }
    }
    
    /**
     * Apply external filters and sorting if available
     */
    function applyExternalFiltersAndSorting() {
        if (typeof window.processStreamDescriptions === 'function') {
            window.processStreamDescriptions();
        }
        
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
        
        if (typeof window.applySorting === 'function') {
            window.applySorting();
        }
    }
    
    // Expose snapshot functions
    window.updateStreamSnapshots = updateStreamSnapshots;
});
