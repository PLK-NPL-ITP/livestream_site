/**
 * Stream Details Popup System
 * 
 * Author: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * Date: 2024-05-21
 * Copyright (c) 2025 NPL ITP Infrastructure (Development) Group
 * All rights reserved.
 * Distributed under the MIT License.
 * 
 * This module provides a comprehensive popup dialog system for displaying stream details when users
 * click on stream items in the list. Key features include:
 * 
 * - Dynamic content loading from stream list items into the popup
 * - Smooth animations for popup appearance and disappearance
 * - Backdrop blur effect with transition
 * - Multiple ways to close the popup (close button, ESC key, clicking outside)
 * - Stream metadata display including thumbnails, quality info, tags and visibility
 * - Direct navigation to view the selected stream
 */
document.addEventListener('DOMContentLoaded', function() {
    /**
     * SECTION: DOM Elements and Variables
     * Get references to DOM elements and initialize state variables
     */
    // Get main container elements
    const popup = document.getElementById('stream-details-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const viewStreamBtn = document.getElementById('btn-view-stream');
    const streamList = document.getElementById('public-streams');
    const dangerZone = document.getElementById('stream-danger-zone');
    
    // Popup content elements
    const popupThumbnail = document.getElementById('popup-thumbnail');
    const popupStatusBadge = document.getElementById('popup-status-badge');
    const popupQuality = document.getElementById('popup-quality');
    const popupTitle = document.getElementById('popup-title');
    const popupAuthor = document.getElementById('popup-author');
    const popupMeta = document.getElementById('popup-meta');
    
    // New detail elements
    const popupStreamId = document.getElementById('popup-stream-id');
    const popupStreamCode = document.getElementById('popup-stream-code');
    const popupAuthorId = document.getElementById('popup-author-id');
    const popupStartTime = document.getElementById('popup-start-time');
    
    const popupVisibility = document.getElementById('popup-visibility');
    const popupTags = document.getElementById('popup-tags');
    const popupDescription = document.getElementById('popup-description');
    
    // Danger zone buttons
    const terminateStreamBtn = document.getElementById('terminate-stream-btn');
    const editStreamBtn = document.getElementById('edit-stream-btn');
    
    // Current stream tracking variables
    let currentStreamCode = '';
    let currentStreamElement = null;
    
    // Initialize event listeners
    initEventListeners();
    
    // Create terminate stream popup HTML on initialization
    createTerminateStreamPopupHTML();
    
    // Initialize terminate stream popup styles and event listeners
    addTerminatePopupErrorStyles();
    initTerminateStreamEventListeners();
    
    /**
     * SECTION: Event Handlers Setup
     * Initialize all event listeners for popup interaction
     */
    function initEventListeners() {
        // Listen for clicks on stream list (event delegation)
        if (streamList) {
            streamList.addEventListener('click', function(event) {
                // Find closest stream item element
                const streamItem = event.target.closest('.stream-item');
                if (streamItem) {
                    showStreamDetails(streamItem);
                }
            });
        }
        
        // Close popup button
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', hidePopup);
        }
        
        // Close popup when clicking outside content area
        if (popup) {
            popup.addEventListener('click', function(event) {
                if (event.target === popup) {
                    hidePopup();
                }
            });
        }
        
        // View stream button
        if (viewStreamBtn) {
            viewStreamBtn.addEventListener('click', function() {
                if (currentStreamCode) {
                    viewStream(currentStreamCode);
                }
            });
        }
        
        // Support ESC key to close popup
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && popup.classList.contains('active')) {
                hidePopup();
            }
        });
        
        // Danger zone button listeners
        if (terminateStreamBtn) {
            terminateStreamBtn.addEventListener('click', function() {
                showTerminateStreamPopup();
            });
        }
        
        if (editStreamBtn) {
            editStreamBtn.addEventListener('click', function() {
                // TODO: Implement edit stream logic
                console.log('Edit stream requested for:', currentStreamCode);
            });
        }
        
        // Listen for profile updates to refresh danger zone visibility
        window.addEventListener('authAPI', function(event) {
            if (event.detail && event.detail.type === 'profile-updated') {
                updateDangerZoneVisibility();
            }
        });
    }
    
    /**
     * SECTION: View Stream Button Management
     * Update view stream button text and visibility based on stream status
     */
    function updateViewStreamButton(status) {
        if (!viewStreamBtn) return;
        
        const svgIcon = viewStreamBtn.querySelector('svg');
        
        switch (status) {
            case 'planned':
            case 'ended':
                // Hide button for planned and ended streams
                viewStreamBtn.style.display = 'none';
                break;
            case 'replay':
                // Show "VIEW REPLAY" for replay streams
                viewStreamBtn.style.display = 'flex';
                viewStreamBtn.innerHTML = svgIcon.outerHTML + '\n                    VIEW REPLAY';
                break;
            case 'streaming':
            case 'pausing':
            default:
                // Show "VIEW STREAM" for live streams
                viewStreamBtn.style.display = 'flex';
                viewStreamBtn.innerHTML = svgIcon.outerHTML + '\n                    VIEW STREAM';
                break;
        }
    }
    
    /**
     * SECTION: Danger Zone Management
     * Check if user has permission to see danger zone actions
     */
    function updateDangerZoneVisibility() {
        if (!dangerZone || !currentStreamElement) return;
        
        try {
            // Get current user profile
            const currentProfile = window.authAPI?.getCurrentProfile();
            if (!currentProfile) {
                dangerZone.style.display = 'none';
                return;
            }
            
            // Get stream author ID and status
            const streamAuthorId = currentStreamElement.getAttribute('author-id') || '';
            const streamStatus = currentStreamElement.getAttribute('data-status') || 'ended';
            const currentUserId = currentProfile.user_id || currentProfile.id || '';
            const userGroups = currentProfile.user_groups || [];
            
            // Check if user is the author or has admin privileges
            const isAuthor = streamAuthorId === currentUserId;
            const isAdmin = userGroups.includes('admin');
            
            if (isAuthor || isAdmin) {
                dangerZone.style.display = 'block';
                
                // Update terminate stream button visibility based on status
                updateTerminateStreamVisibility(streamStatus);
            } else {
                dangerZone.style.display = 'none';
            }
        } catch (error) {
            console.warn('Error checking danger zone visibility:', error);
            dangerZone.style.display = 'none';
        }
    }
    
    /**
     * Update terminate stream button visibility based on stream status
     * Only show for live streams (streaming, pausing)
     */
    function updateTerminateStreamVisibility(status) {
        if (!terminateStreamBtn) return;
        
        const terminateStreamItem = terminateStreamBtn.closest('.danger-item');
        if (!terminateStreamItem) return;
        
        switch (status) {
            case 'streaming':
            case 'pausing':
                // Show terminate button for live streams
                terminateStreamItem.style.display = 'flex';
                break;
            case 'planned':
            case 'ended':
            case 'replay':
            default:
                // Hide terminate button for non-live streams
                terminateStreamItem.style.display = 'none';
                break;
        }
    }
    
    /**
     * SECTION: Styles for Danger Zone
     * Add CSS styles to match userProfile danger zone design
     */
    function addDangerZoneStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Stream Popup Danger Zone Styles */
            .danger-zone-section {
                border-top: 2px solid #ff4757;
                background-color: #fafafa;
                padding: 0;
            }
            
            .popup-danger-zone {
                padding: 20px;
            }
            
            .popup-danger-zone .danger-title {
                color: #ff4757;
                font-weight: 700;
                font-size: 16px;
                margin: 0 0 16px 0;
            }
            
            .popup-danger-zone .danger-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .popup-danger-zone .danger-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 12px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background-color: white;
            }
            
            .popup-danger-zone .danger-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .popup-danger-zone .danger-action-title {
                font-size: 14px;
                font-weight: 600;
                color: #202124;
            }
            
            .popup-danger-zone .danger-action-desc {
                font-size: 12px;
                color: #5f6368;
            }
            
            .popup-danger-zone .danger-btn {
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid;
                white-space: nowrap;
            }
            
            .popup-danger-zone .danger-btn.secondary {
                background-color: white;
                color: #5f6368;
                border-color: #d0d7de;
            }
            
            .popup-danger-zone .danger-btn.secondary:hover {
                background-color: #f6f8fa;
                border-color: #8c959f;
            }
            
            .popup-danger-zone .danger-btn.primary {
                background-color: #ff4757;
                color: white;
                border-color: #ff4757;
            }
            
            .popup-danger-zone .danger-btn.primary:hover {
                background-color: #ff3742;
                border-color: #ff3742;
            }
        `;
        
        // Add styles to head if not already added
        if (!document.querySelector('#stream-danger-zone-styles')) {
            style.id = 'stream-danger-zone-styles';
            document.head.appendChild(style);
        }
    }
    
    // Initialize danger zone styles
    addDangerZoneStyles();
    
    /**
     * SECTION: Popup Display Logic
     * Show stream details in popup window
     * 
     * @param {HTMLElement} streamItem - Stream item DOM element
     */
    function showStreamDetails(streamItem) {
        if (!streamItem || !popup) return;
        window.updateStreamSnapshots(); // Update snapshots before showing popup
        
        // Store current stream reference and ID
        currentStreamElement = streamItem;
        currentStreamCode = streamItem.getAttribute('stream-code') || '';
        
        // Extract stream details from DOM attributes and elements
        const thumbnailSrc = streamItem.querySelector('.stream-thumbnail img')?.src || '';
        const qualityInfo = streamItem.querySelector('.quality-info')?.textContent || '';
        const title = streamItem.querySelector('h3')?.textContent || '';
        const author = streamItem.querySelector('.stream-author')?.textContent || '';
        const meta = streamItem.querySelector('.stream-meta')?.textContent || '';
        
        // Extract data from attributes
        const streamId = streamItem.getAttribute('data-id') || '';
        const streamCode = streamItem.getAttribute('stream-code') || '';
        const authorId = streamItem.getAttribute('author-id') || '';
        const startTimeStr = streamItem.getAttribute('data-time') || '';
        const status = streamItem.getAttribute('data-status') || 'ended';
        const visibility = streamItem.getAttribute('data-visibility') || 'public';
        
        // Process visibility text
        const visibilityText = visibility === 'private' ? 'Private' : 
                              visibility === 'unlisted' ? 'Unlisted' : 'Public';
        
        // Process description
        const description = streamItem.querySelector('.stream-description')?.textContent || 'No description provided';
        
        // Process tags
        const tagsStr = streamItem.getAttribute('data-tags') || '';
        const tags = tagsStr.split(',').filter(tag => tag.trim() !== '');
        
        // Format start time - show "Unknown" for planned streams
        let formattedStartTime = 'Unknown';
        if (startTimeStr && status !== 'planned') {
            try {
                const startTime = new Date(startTimeStr);
                formattedStartTime = startTime.toLocaleString();
            } catch (e) {
                formattedStartTime = 'Invalid Date';
            }
        }
        
        // Populate popup content
        popupThumbnail.src = thumbnailSrc;
        popupQuality.textContent = qualityInfo;
        popupTitle.textContent = title;
        popupAuthor.textContent = author;
        popupMeta.textContent = meta;
        
        // Set new detail fields
        popupStreamId.textContent = streamId;
        popupStreamCode.textContent = streamCode;
        popupAuthorId.textContent = authorId;
        popupStartTime.textContent = formattedStartTime;
        
        // Set status badge
        if (popupStatusBadge) {
            let badgeText = 'LIVE';
            let badgeClass = 'live-badge';
            
            switch (status) {
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
            
            popupStatusBadge.textContent = badgeText;
            popupStatusBadge.className = badgeClass;
        }
        
        // Set visibility indicator
        popupVisibility.textContent = visibilityText;
        popupVisibility.className = 'stream-visibility' + (visibility === 'private' ? ' private' : 
                                   visibility === 'unlisted' ? ' unlisted' : '');
        
        // Generate tags HTML
        popupTags.innerHTML = '';
        if (tags.length > 0) {
            tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'stream-tag';
                tagElement.textContent = tag;
                popupTags.appendChild(tagElement);
            });
        } else {
            const noTagsElement = document.createElement('span');
            noTagsElement.className = 'no-tags';
            noTagsElement.textContent = 'No tags';
            noTagsElement.style.color = '#999';
            noTagsElement.style.fontStyle = 'italic';
            popupTags.appendChild(noTagsElement);
        }
        
        // Set description
        popupDescription.textContent = description;
        
        // Update view stream button based on status
        updateViewStreamButton(status);
        
        // Update danger zone visibility based on current user
        updateDangerZoneVisibility();
        
        // Show popup
        popup.classList.add('active');
        
        // Ensure blur effect transitions smoothly
        requestAnimationFrame(() => {
            popup.style.backdropFilter = 'blur(5px)';
            popup.style.webkitBackdropFilter = 'blur(5px)';
            popup.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        });
        
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    /**
     * SECTION: Popup Dismissal Logic
     * Hide popup with animation effects
     */
    function hidePopup() {
        if (!popup) return;

        // Start background blur transition animation
        popup.style.backdropFilter = 'blur(0px)';
        popup.style.webkitBackdropFilter = 'blur(0px)';
        popup.style.backgroundColor = 'rgba(255, 255, 255, 0)';
        
        // Add closing animation
        const popupContent = popup.querySelector('.popup-content');
        const animationDuration = 300; // Animation duration in ms
            
        if (popupContent) {
            popupContent.classList.add('closing');
        }
            
        // Wait for animation to complete before hiding popup
        setTimeout(() => {
            // Reset all states
            popup.classList.remove('active');
            if (popupContent) {
                popupContent.classList.remove('closing');
            }
            document.body.style.overflow = ''; // Restore scrolling
            
            // Reset current stream references
            currentStreamCode = '';
            currentStreamElement = null;
            
            // Reset background styles for next display
            setTimeout(() => {
                popup.style.backdropFilter = '';
                popup.style.webkitBackdropFilter = '';
                popup.style.backgroundColor = '';
            }, 50);
        }, animationDuration);
    }
    
    /**
     * SECTION: Stream Viewing Logic
     * Handle stream viewing navigation
     * 
     * @param {string} streamCode - Stream ID to view
     */
    function viewStream(streamCode) {
        if (!streamCode) return;
        
        console.log(`Opening stream with ID: ${streamCode}`);
        
        // Get stream title (if available)
        let streamTitle = 'Stream';
        if (currentStreamElement) {
            streamTitle = currentStreamElement.querySelector('h3')?.textContent || 'Stream';
        }
        
        // Show success toast message
        toast.success('Connecting', `Joining livestream: ${streamTitle}`);
        preloaderControl.show()
        
        // Close popup
        hidePopup();
        
        //跳转到/livestream.html?card=0&stream-code={streamCode}
        setTimeout(() => {
            // preloaderControl.hide();
            window.location.href = `/livestream.html?card=0&stream-code=${encodeURIComponent(streamCode)}`;
        }, 2000); // 2 seconds delay to show success message
    }
    
    /**
     * SECTION: Terminate Stream Confirmation Popup
     * Create terminate stream confirmation popup HTML (based on userProfile delete account popup)
     */
    function createTerminateStreamPopupHTML() {
        // Check if popup already exists to avoid duplicates
        if (document.getElementById('terminate-stream-popup')) {
            return;
        }
        
        const terminateStreamPopupHTML = `
            <div class="terminate-stream-popup" id="terminate-stream-popup">
                <div class="terminate-stream-content">
                    <button class="close-danger-popup" id="close-terminate-stream-popup" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="terminate-stream-header">
                        <h2 class="terminate-stream-title">Terminate Stream</h2>
                        <p class="terminate-stream-subtitle">This action cannot be undone. This will permanently terminate the stream and disconnect all viewers.</p>
                    </div>
                    
                    <div class="terminate-stream-body">
                        <form class="terminate-stream-form" id="terminate-stream-form" novalidate>
                            <div class="terminate-stream-warning">
                                <p>Please type <strong>delete stream: <span id="terminate-streamcode-display"></span></strong> to confirm:</p>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="text" class="auth-input" id="terminate-confirmation-input" 
                                       required="required" placeholder="delete stream: your-stream-code">
                                <span class="auth-span">Type confirmation text</span>
                            </div>
                            
                            <div class="terminate-stream-actions">
                                <button type="button" class="danger-btn secondary" id="cancel-stream-termination">Cancel</button>
                                <button type="submit" class="danger-btn primary" id="confirm-stream-termination" disabled>Terminate Stream</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add the popup to the body
        document.body.insertAdjacentHTML('beforeend', terminateStreamPopupHTML);
    }
    
    /**
     * Show terminate stream popup
     */
    function showTerminateStreamPopup() {
        const terminatePopup = document.getElementById('terminate-stream-popup');
        const streamCodeDisplay = document.getElementById('terminate-streamcode-display');
        const confirmationInput = document.getElementById('terminate-confirmation-input');
        
        if (!terminatePopup || !currentStreamCode) return;
        
        // Update confirmation text with current stream code
        streamCodeDisplay.textContent = currentStreamCode;
        
        // Clear previous input and errors
        confirmationInput.value = '';
        clearTerminateErrors();
        
        // Show popup
        terminatePopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on input after animation
        setTimeout(() => {
            confirmationInput.focus();
        }, 150);
    }
    
    /**
     * Hide terminate stream popup
     */
    function hideTerminateStreamPopup() {
        const terminatePopup = document.getElementById('terminate-stream-popup');
        if (!terminatePopup) return;
        
        terminatePopup.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear form data
        const form = document.getElementById('terminate-stream-form');
        if (form) {
            form.reset();
        }
        clearTerminateErrors();
    }
    
    /**
     * SECTION: Initialize Terminate Stream Event Listeners
     */
    function initTerminateStreamEventListeners() {
        // Close button
        const closeTerminateBtn = document.getElementById('close-terminate-stream-popup');
        if (closeTerminateBtn) {
            closeTerminateBtn.addEventListener('click', hideTerminateStreamPopup);
        }
        
        // Cancel button
        const cancelTerminateBtn = document.getElementById('cancel-stream-termination');
        if (cancelTerminateBtn) {
            cancelTerminateBtn.addEventListener('click', hideTerminateStreamPopup);
        }
        
        // Confirm button (form submission)
        const terminateForm = document.getElementById('terminate-stream-form');
        if (terminateForm) {
            terminateForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleStreamTermination();
            });
        }
        
        // Close on ESC key
        document.addEventListener('keydown', function(event) {
            const terminatePopup = document.getElementById('terminate-stream-popup');
            if (event.key === 'Escape' && terminatePopup?.classList.contains('active')) {
                hideTerminateStreamPopup();
            }
        });
        
        // Close when clicking outside
        const terminatePopup = document.getElementById('terminate-stream-popup');
        if (terminatePopup) {
            terminatePopup.addEventListener('click', function(event) {
                if (event.target === terminatePopup) {
                    hideTerminateStreamPopup();
                }
            });
        }
        
        // Setup input validation
        setupTerminateInputValidation();
    }
    
    /**
     * Handle stream termination
     */
    async function handleStreamTermination() {
        const confirmationInput = document.getElementById('terminate-confirmation-input');
        const confirmButton = document.getElementById('confirm-stream-termination');
        
        if (!confirmationInput || !confirmButton || !currentStreamCode) return;
        
        // Validate input
        if (!validateTerminateForm()) {
            return;
        }
        
        // Disable button and show loading state
        confirmButton.disabled = true;
        confirmButton.textContent = 'Terminating...';
        
        try {
            // Make API request to terminate stream
            const response = await window.authAPI.makeRequest('/api/terminate-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stream_code: currentStreamCode
                })
            }, true); // auth=true
            
            if (response.success) {
                // Show success message
                toast.success('Stream Terminated', 'The stream has been successfully terminated.');
                
                // Hide both popups
                hideTerminateStreamPopup();
                hidePopup();
                
                // Refresh stream list if available
                if (window.refreshStreams) {
                    setTimeout(() => {
                        window.refreshStreams();
                    }, 1000);
                }
            } else {
                throw new Error(response.message || 'Failed to terminate stream');
            }
        } catch (error) {
            console.error('Error terminating stream:', error);
            
            // Show error message
            showTerminateError(confirmationInput, error.message || 'Failed to terminate stream. Please try again.');
            
            // Show toast error
            toast.error('Termination Failed', error.message || 'Failed to terminate stream. Please try again.');
        } finally {
            // Re-enable button
            confirmButton.disabled = false;
            confirmButton.textContent = 'Terminate Stream';
        }
    }
    
    /**
     * Validate terminate form
     */
    function validateTerminateForm() {
        const confirmationInput = document.getElementById('terminate-confirmation-input');
        const expectedText = `delete stream: ${currentStreamCode}`;
        
        if (!confirmationInput || !currentStreamCode) return false;
        
        const inputValue = confirmationInput.value.trim();
        
        if (inputValue !== expectedText) {
            showTerminateError(confirmationInput, `Please type exactly: ${expectedText}`);
            return false;
        }
        
        removeTerminateError(confirmationInput);
        return true;
    }
    
    /**
     * Setup terminate input validation
     */
    function setupTerminateInputValidation() {
        const confirmationInput = document.getElementById('terminate-confirmation-input');
        const confirmButton = document.getElementById('confirm-stream-termination');
        
        if (!confirmationInput || !confirmButton) return;
        
        confirmationInput.addEventListener('input', function() {
            const expectedText = `delete stream: ${currentStreamCode}`;
            const inputValue = this.value.trim();
            
            // Update button state
            if (inputValue === expectedText) {
                confirmButton.disabled = false;
                confirmButton.classList.remove('disabled');
                removeTerminateError(this);
            } else {
                confirmButton.disabled = true;
                confirmButton.classList.add('disabled');
            }
        });
        
        // Handle Enter key
        confirmationInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                console.warn('Enter pressed in terminate confirmation input');
                if (!confirmButton.disabled) {
                    handleStreamTermination();
                }
            }
        });

        confirmButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (!this.disabled) {
                handleStreamTermination();
            }
        });
    }
    
    /**
     * Show terminate error
     */
    function showTerminateError(input, message) {
        // Create or get error element
        let errorElement = input.parentNode.querySelector('.input-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'input-error';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add error styling to input
        input.classList.add('error');
        
        // Add shake animation
        input.style.animation = 'none';
        input.offsetHeight; // Trigger reflow
        input.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
    
    /**
     * Remove terminate error
     */
    function removeTerminateError(input) {
        const errorElement = input.parentNode.querySelector('.input-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        input.classList.remove('error');
    }
    
    /**
     * Clear terminate errors
     */
    function clearTerminateErrors() {
        const confirmationInput = document.getElementById('terminate-confirmation-input');
        const confirmButton = document.getElementById('confirm-stream-termination');
        
        if (confirmationInput) {
            removeTerminateError(confirmationInput);
        }
        
        if (confirmButton) {
            confirmButton.disabled = true;
            confirmButton.classList.add('disabled');
        }
    }

    /**
     * SECTION: Add Error Animation Styles for Terminate Popup
     */
    function addTerminatePopupErrorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Terminate Stream Popup Styles - matching userProfile delete account popup styles */
            .terminate-stream-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1100;
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
                opacity: 0;
                transition: opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, background-color 0.3s ease;
            }
            
            .terminate-stream-popup.active {
                display: flex;
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.9);
                -webkit-backdrop-filter: blur(5px);
                backdrop-filter: blur(5px);
            }
            
            .terminate-stream-popup.closing {
                opacity: 0;
                background-color: rgba(255, 255, 255, 0);
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
            }
            
            .terminate-stream-content {
                background-color: white;
                border-radius: 8px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                position: relative;
                padding: 0;
                display: flex;
                flex-direction: column;
                animation: danger-fade-in 0.3s ease forwards;
            }
            
            .terminate-stream-content.closing {
                animation: danger-fade-out 0.3s ease forwards;
            }
            
            .terminate-stream-popup .close-danger-popup {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255, 71, 87, 0.1);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                color: #ff4757;
                transition: background 0.2s;
            }
            
            .terminate-stream-popup .close-danger-popup:hover {
                background: rgba(255, 71, 87, 0.2);
            }
            
            /* Terminate Stream Popup Specific Styles */
            .terminate-stream-header {
                padding: 24px 24px 16px 24px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .terminate-stream-title {
                margin: 0 0 4px 0;
                font-size: 20px;
                font-weight: 600;
                color: #ff4757;
                font-family: 'Inter', sans-serif;
            }
            
            .terminate-stream-subtitle {
                margin: 0;
                font-size: 14px;
                color: #5f6368;
                font-family: 'Inter', sans-serif;
                line-height: 1.5;
            }
            
            .terminate-stream-body {
                padding: 24px;
            }
            
            .terminate-stream-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .terminate-stream-warning {
                padding: 16px;
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                color: #856404;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .terminate-stream-warning p {
                margin: 0;
            }
            
            .terminate-stream-warning strong {
                font-weight: 600;
                color: #6f5500;
            }
            
            .terminate-stream-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 8px;
            }
            

            
            /* Button disabled state */
            .terminate-stream-popup .danger-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            /* Shake animation for errors */
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            /* Responsive Design for Terminate Popup */
            @media (max-width: 768px) {
                .terminate-stream-content {
                    max-width: 95%;
                    margin: 5vh auto;
                }
                
                .terminate-stream-actions {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .terminate-stream-popup .danger-btn {
                    width: 100%;
                }
            }
            
            @media (max-width: 480px) {
                .terminate-stream-header {
                    padding: 20px 20px 12px 20px;
                }
                
                .terminate-stream-body {
                    padding: 20px;
                }
                
                .terminate-stream-title {
                    font-size: 18px;
                }
            }
        `;
        
        // Add styles to head if not already added
        if (!document.querySelector('#terminate-stream-popup-styles')) {
            style.id = 'terminate-stream-popup-styles';
            document.head.appendChild(style);
        }
    }
    
    // Setup terminate input validation
    setupTerminateInputValidation();
});
