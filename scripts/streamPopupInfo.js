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
    
    // Popup content elements
    const popupThumbnail = document.getElementById('popup-thumbnail');
    const popupQuality = document.getElementById('popup-quality');
    const popupTitle = document.getElementById('popup-title');
    const popupAuthor = document.getElementById('popup-author');
    const popupMeta = document.getElementById('popup-meta');
    const popupVisibility = document.getElementById('popup-visibility');
    const popupTags = document.getElementById('popup-tags');
    const popupDescription = document.getElementById('popup-description');
    
    // Current stream tracking variables
    let currentStreamId = '';
    let currentStreamElement = null;
    
    // Initialize event listeners
    initEventListeners();
    
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
                if (currentStreamId) {
                    viewStream(currentStreamId);
                }
            });
        }
        
        // Support ESC key to close popup
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && popup.classList.contains('active')) {
                hidePopup();
            }
        });
    }
    
    /**
     * SECTION: Popup Display Logic
     * Show stream details in popup window
     * 
     * @param {HTMLElement} streamItem - Stream item DOM element
     */
    function showStreamDetails(streamItem) {
        if (!streamItem || !popup) return;
        
        // Store current stream reference and ID
        currentStreamElement = streamItem;
        currentStreamId = streamItem.getAttribute('data-id') || '';
        
        // Extract stream details from DOM
        const thumbnailSrc = streamItem.querySelector('.stream-thumbnail img')?.src || '';
        const qualityInfo = streamItem.querySelector('.quality-info')?.textContent || '';
        const title = streamItem.querySelector('h3')?.textContent || '';
        const author = streamItem.querySelector('.stream-author')?.textContent || '';
        const meta = streamItem.querySelector('.stream-meta')?.textContent || '';
        const visibility = streamItem.getAttribute('data-visibility') || 'public';
        const visibilityText = visibility === 'private' ? 'Private' : 'Public';
        const description = streamItem.querySelector('.stream-description')?.textContent || 'No description provided';
        
        // Process tags
        const tagsStr = streamItem.getAttribute('data-tags') || '';
        const tags = tagsStr.split(',').filter(tag => tag.trim() !== '');
        
        // Populate popup content
        popupThumbnail.src = thumbnailSrc;
        popupQuality.textContent = qualityInfo;
        popupTitle.textContent = title;
        popupAuthor.textContent = author;
        popupMeta.textContent = meta;
        
        // Set visibility indicator
        popupVisibility.textContent = visibilityText;
        popupVisibility.className = 'stream-visibility' + (visibility === 'private' ? ' private' : '');
        
        // Generate tags HTML
        popupTags.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'stream-tag';
            tagElement.textContent = tag;
            popupTags.appendChild(tagElement);
        });
        
        // Set description
        popupDescription.textContent = description;
        
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
            currentStreamId = '';
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
     * @param {string} streamId - Stream ID to view
     */
    function viewStream(streamId) {
        if (!streamId) return;
        
        console.log(`Opening stream with ID: ${streamId}`);
        
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
        
        // Use delay for actual navigation to allow user to see toast message
        setTimeout(() => {
            // Actual implementation would navigate to stream viewer page
            // window.location.href = `./stream-viewer.html?id=${streamId}`;
            preloaderControl.hide();
            toast.warning('Development Notice', 'The Livestream View feature is under development, please wait for the next version!');
        }, 4500);
    }
});
