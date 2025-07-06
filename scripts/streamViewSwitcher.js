/**
 * View Switcher Module
 * 
 * This module provides the following functionalities:
 * 1. Grid/List view switching for stream display
 * 2. Tags view toggle for showing/hiding stream tags
 * 3. Stream sorting by title or time (ascending/descending)
 * 4. Automatic loading and saving of user view preferences using localStorage
 * 5. Processing stream descriptions for better display in list view
 * 
 * Core Implementation:
 * - Uses DOM event listeners for UI interaction
 * - Stores user preferences in localStorage
 * - Provides public methods for other modules to use
 */

document.addEventListener('DOMContentLoaded', function () {
    /************************************
     * INITIALIZATION
     ************************************/
    // DOM elements
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const tagsViewBtn = document.getElementById('tags-view-btn'); // Previously adminViewBtn
    const sortStreamsBtn = document.getElementById('sort-streams-btn');
    const streamList = document.getElementById('public-streams');
    
    // Load saved view preferences
    const savedView = localStorage.getItem('streamView') || 'grid';
    const isTagsView = localStorage.getItem('tagsView') === 'true';
    const savedSortMethod = localStorage.getItem('streamSort') || 'time-desc'; // Default to time descending (newest first)
    
    // Initialize view
    setActiveView(savedView);
    setTagsView(isTagsView);
    setSortMethod(savedSortMethod);
    
    /************************************
     * EVENT BINDING
     ************************************/
    // Bind click events
    gridViewBtn.addEventListener('click', function() {
        setActiveView('grid');
    });
    
    listViewBtn.addEventListener('click', function() {
        setActiveView('list');
    });
    
    tagsViewBtn.addEventListener('click', function() {
        setTagsView(!streamList.classList.contains('tags-view'));
    });
    
    sortStreamsBtn.addEventListener('click', function() {
        cycleSortMethod();
    });
    
    /************************************
     * VIEW MANAGEMENT FUNCTIONS
     ************************************/
    /**
     * Sets the active view (grid or list)
     * @param {string} viewType - The view type ('grid' or 'list')
     */
    function setActiveView(viewType) {
        if (viewType === 'grid') {
            streamList.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            streamList.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            
            // Process descriptions when in list view
            processStreamDescriptions();
        }
        
        // Save user preference
        localStorage.setItem('streamView', viewType);
    }
    
    /**
     * Sets the tags view state
     * @param {boolean} isTagsView - Whether to show tags view
     */
    function setTagsView(isTagsView) {
        if (isTagsView) {
            streamList.classList.add('tags-view');
            tagsViewBtn.classList.add('active');
        } else {
            streamList.classList.remove('tags-view');
            tagsViewBtn.classList.remove('active');
        }
        
        // Save user preference
        localStorage.setItem('tagsView', isTagsView);
    }
    
    /**
     * Processes stream descriptions for display
     * Handles empty descriptions and prevents duplicate processing
     */
    function processStreamDescriptions() {
        const streamItems = document.querySelectorAll('.stream-item');
        
        streamItems.forEach(streamItem => {
            // Get description element
            const descriptionEl = streamItem.querySelector('.stream-description');
            
            // Skip if already processed
            if (streamItem.hasAttribute('data-processed')) {
                return;
            }
            
            // Mark as processed to avoid duplicate processing
            streamItem.setAttribute('data-processed', 'true');
            
            // Get description text
            const descriptionText = descriptionEl.textContent.trim();
            
            // Handle empty descriptions
            if (!descriptionText) {
                descriptionEl.textContent = "The streamer seems provide a empty description...... Let's have a guess or just click in to view now!";
                descriptionEl.classList.add('empty-description');
            }
        });
    }

    // Process descriptions on initial load if in list view
    if (savedView === 'list') {
        processStreamDescriptions();
    }
    
    // Expose function for other scripts to call
    window.processStreamDescriptions = processStreamDescriptions;
    
    /************************************
     * SORTING FUNCTIONS
     ************************************/
    /**
     * Sets the current sort method and updates UI
     * @param {string} method - The sort method ('title-asc', 'title-desc', 'time-asc', 'time-desc')
     */
    function setSortMethod(method) {
        // Get sort icon element
        const sortIcon = document.getElementById('sort-icon');
        
        // Always keep button active
        sortStreamsBtn.classList.add('active');
        
        // Update icon and title based on sort method
        switch(method) {
            case 'title-asc':
                sortStreamsBtn.title = 'Title Ascending (A-Z)';
                sortIcon.src = './assets/images/arrow-up-a-z.svg';
                break;
            case 'title-desc':
                sortStreamsBtn.title = 'Title Descending (Z-A)';
                sortIcon.src = './assets/images/arrow-down-a-z.svg';
                break;
            case 'time-asc':
                sortStreamsBtn.title = 'Start Time (Oldest First)';
                sortIcon.src = './assets/images/arrow-up-1-9.svg';
                break;
            case 'time-desc':
                sortStreamsBtn.title = 'Start Time (Newest First)';
                sortIcon.src = './assets/images/arrow-down-1-9.svg';
                break;
            default:
                // Default to time descending if unexpected value
                method = 'time-desc';
                sortStreamsBtn.title = 'Start Time (Newest First)';
                sortIcon.src = './assets/images/arrow-down-1-9.svg';
                break;
        }
        
        // Execute sorting
        sortStreamItems(method);
        
        // Save user preference
        localStorage.setItem('streamSort', method);
    }
    
    /**
     * Cycles through sort methods in sequence
     * title-asc -> title-desc -> time-asc -> time-desc -> title-asc
     */
    function cycleSortMethod() {
        const currentMethod = localStorage.getItem('streamSort') || 'time-desc';
        
        // Cycle through the four sorting methods
        let nextMethod;
        
        switch(currentMethod) {
            case 'title-asc':
                nextMethod = 'title-desc';
                break;
            case 'title-desc':
                nextMethod = 'time-asc';
                break;
            case 'time-asc':
                nextMethod = 'time-desc';
                break;
            case 'time-desc':
                nextMethod = 'title-asc';
                break;
            default:
                nextMethod = 'time-desc'; // Ensure default value
        }
        
        setSortMethod(nextMethod);
    }
    
    /**
     * Sorts stream items based on the specified method
     * Respects stream status grouping (planned, live, replay, ended)
     * @param {string} method - The sort method
     */
    function sortStreamItems(method) {
        const allElements = Array.from(streamList.children);
        
        if (allElements.length === 0) {
            return; // No items to sort
        }
        
        // Separate stream items and separators
        const separators = allElements.filter(el => el.classList.contains('stream-separator'));
        const streamItems = allElements.filter(el => el.classList.contains('stream-item'));
        
        if (streamItems.length === 0) {
            return; // No stream items to sort
        }
        
        // Group stream items by status priority
        const statusPriority = {
            'planned': 0,
            'streaming': 1,
            'pausing': 1, // Same as streaming
            'replay': 2,
            'ended': 3
        };
        
        // Group items by status
        const groupedItems = {
            0: [], // planned
            1: [], // live (streaming/pausing)
            2: [], // replay
            3: []  // ended
        };
        
        streamItems.forEach(item => {
            const status = item.getAttribute('data-status') || 'ended';
            const priority = statusPriority[status] !== undefined ? statusPriority[status] : 3;
            groupedItems[priority].push(item);
        });
        
        // Sort each group individually
        Object.keys(groupedItems).forEach(priority => {
            const group = groupedItems[priority];
            if (group.length > 0) {
                group.sort((a, b) => {
                    switch(method) {
                        case 'title-asc': // Title ascending
                            const titleA = a.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                            const titleB = b.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                            return titleA.localeCompare(titleB);
                        
                        case 'title-desc': // Title descending
                            const titleDescA = a.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                            const titleDescB = b.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                            return titleDescB.localeCompare(titleDescA);
                        
                        case 'time-asc': // Time ascending (oldest first)
                            const timeA = new Date(a.getAttribute('data-time'));
                            const timeB = new Date(b.getAttribute('data-time'));
                            return timeA - timeB;
                        
                        case 'time-desc': // Time descending (newest first)
                            const timeDescA = new Date(a.getAttribute('data-time'));
                            const timeDescB = new Date(b.getAttribute('data-time'));
                            return timeDescB - timeDescA;
                        
                        default:
                            return 0;
                    }
                });
            }
        });
        
        // Clear stream list and rebuild with proper order
        streamList.innerHTML = '';
        
        // Rebuild with separators and sorted groups
        const groupLabels = {
            0: 'Planned Streams',
            1: 'Live Streams', 
            2: 'Replay Streams',
            3: 'Ended Streams'
        };
        
        let hasContent = false;
        Object.keys(groupedItems).forEach(priority => {
            const group = groupedItems[priority];
            if (group.length > 0) {
                // Add separator before each group except the first one
                if (hasContent && priority > 0) {
                    const separatorHTML = `
                        <div class="stream-separator grid-break" data-label="${groupLabels[priority]}">
                            <div class="separator-line"></div>
                            <span class="separator-label">${groupLabels[priority]}</span>
                            <div class="separator-line"></div>
                        </div>
                    `;
                    streamList.insertAdjacentHTML('beforeend', separatorHTML);
                }
                
                // Add sorted items from this group
                group.forEach(item => {
                    streamList.appendChild(item);
                });
                
                hasContent = true;
            }
        });
    }
    
    /************************************
     * PUBLIC API
     ************************************/
    // Expose sorting method for other scripts
    window.applySorting = function() {
        const currentMethod = localStorage.getItem('streamSort') || 'time-desc';
        sortStreamItems(currentMethod);
    };
});
