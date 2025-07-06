/**
 * Stream Filters Module
 * 
 * This module provides the following functionalities:
 * 1. Tag-based filtering of stream items
 * 2. Visibility filtering (all/public/private)
 * 3. Dynamic tag collection from stream items
 * 4. Interactive dropdown menus for filter selection
 * 5. User interface updates reflecting active filters
 * 
 * Core Implementation:
 * - Uses checkbox-based tag selection for OR-logic filtering
 * - Maintains filter state for real-time updates
 * - Provides API for other modules to trigger filtering
 * - Uses event delegation for efficient DOM interaction
 */

document.addEventListener('DOMContentLoaded', function () {
    /************************************
     * INITIALIZATION
     ************************************/
    // DOM elements
    const publicStreams = document.getElementById('public-streams');
    const visibilityDropdownBtn = document.getElementById('visibility-dropdown-btn');
    const visibilityDropdownContent = document.getElementById('visibility-dropdown-content');
    const visibilityOptions = document.querySelectorAll('.visibility-option');
    const tagsDropdownBtn = document.getElementById('tags-dropdown-btn');
    const tagsDropdownContent = document.getElementById('tags-dropdown-content');
    
    // State variables
    let allStreamItems = [];
    let selectedTags = [];
    let currentVisibility = 'all'; // Default show all streams
    
    // Initialize filters
    initializeFilters();
    
    /************************************
     * FILTER SETUP FUNCTIONS
     ************************************/
    /**
     * Initializes all filters and populates tag dropdowns
     */
    function initializeFilters() {
        // Get all stream items
        refreshStreamItems();
        
        // Collect all unique tags
        const allTags = collectAllTags();
        
        // Generate tag checkboxes
        generateTagCheckboxes(allTags);
        
        // Set up event listeners
        setupEventListeners();
        
        // Apply filters initially
        applyFilters();
    }
    
    /**
     * Refreshes the stream items list
     * Useful when new items are added dynamically
     */
    function refreshStreamItems() {
        allStreamItems = Array.from(publicStreams.querySelectorAll('.stream-item'));
    }
    
    /**
     * Collects all unique tags from stream items
     * @returns {Array} Array of unique tags, sorted alphabetically
     */
    function collectAllTags() {
        const tagsSet = new Set();
        
        allStreamItems.forEach(item => {
            const tagsData = item.getAttribute('data-tags');
            if (tagsData) {
                const tags = tagsData.split(',');
                tags.forEach(tag => tagsSet.add(tag.trim()));
            }
        });
        
        return Array.from(tagsSet).sort();
    }
    
    /**
     * Generates tag checkboxes in the dropdown
     * @param {Array} tags - Array of tag strings
     */
    function generateTagCheckboxes(tags) {
        tagsDropdownContent.innerHTML = '';
        
        tags.forEach(tag => {
            const label = document.createElement('label');
            label.className = 'tag-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    addSelectedTag(tag);
                } else {
                    removeSelectedTag(tag);
                }
                applyFilters();
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(tag));
            tagsDropdownContent.appendChild(label);
        });
    }
    
    /************************************
     * TAG MANAGEMENT FUNCTIONS
     ************************************/
    /**
     * Adds a tag to the selected tags list
     * @param {string} tag - The tag to add
     */
    function addSelectedTag(tag) {
        if (!selectedTags.includes(tag)) {
            selectedTags.push(tag);
            updateDropdownButton();
        }
    }
    
    /**
     * Removes a tag from the selected tags list
     * @param {string} tag - The tag to remove
     */
    function removeSelectedTag(tag) {
        const index = selectedTags.indexOf(tag);
        if (index !== -1) {
            selectedTags.splice(index, 1);
            updateDropdownButton();
        }
    }
    
    /**
     * Updates the tags dropdown button text to show selected count
     */
    function updateDropdownButton() {
        if (selectedTags.length > 0) {
            tagsDropdownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Filter Tags (${selectedTags.length})
            `;
        } else {
            tagsDropdownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Filter Tags
            `;
        }
    }
    
    /************************************
     * FILTER APPLICATION FUNCTIONS
     ************************************/
    /**
     * Applies all filters to stream items
     * Filters by both visibility and tags using OR logic
     * Also manages separator visibility based on filtered content
     */
    function applyFilters() {
        // Refresh stream items list to ensure it includes new additions
        refreshStreamItems();
        
        // Use currentVisibility variable for filter
        const visibility = currentVisibility;
        
        // Track which groups have visible items
        const visibleGroups = new Set();
        
        allStreamItems.forEach(item => {
            const itemVisibility = item.getAttribute('data-visibility');
            const itemTags = item.getAttribute('data-tags')?.split(',').map(tag => tag.trim()) || [];
            const itemStatus = item.getAttribute('data-status') || 'ended';
            
            // Visibility filter
            const visibilityMatch = 
                visibility === 'all' || 
                (visibility === 'public' && itemVisibility === 'public') || 
                (visibility === 'private' && itemVisibility === 'private') ||
                (visibility === 'unlisted' && itemVisibility === 'unlisted');
            
            // Tag filter (using OR logic - show if any selected tag matches)
            const tagsMatch = 
                selectedTags.length === 0 || 
                selectedTags.some(tag => itemTags.includes(tag));
            
            // Show item if both filters match
            if (visibilityMatch && tagsMatch) {
                item.style.display = '';
                
                // Track which group this visible item belongs to
                if (itemStatus === 'planned') {
                    visibleGroups.add('Planned Streams');
                } else if (itemStatus === 'streaming' || itemStatus === 'pausing') {
                    visibleGroups.add('Live Streams');
                } else if (itemStatus === 'replay') {
                    visibleGroups.add('Replay Streams');
                } else {
                    visibleGroups.add('Ended Streams');
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        // Manage separator visibility
        const separators = document.querySelectorAll('.stream-separator');
        separators.forEach(separator => {
            const label = separator.getAttribute('data-label');
            if (visibleGroups.has(label)) {
                separator.style.display = '';
            } else {
                separator.style.display = 'none';
            }
        });
    }
    
    /************************************
     * EVENT HANDLING
     ************************************/
    /**
     * Sets up all event listeners for filters
     */
    function setupEventListeners() {
        // Visibility option click events
        visibilityOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Update selected state
                const value = this.getAttribute('data-value');
                selectVisibilityOption(value);
                
                // Apply filters
                applyFilters();
                
                // Close dropdown
                visibilityDropdownContent.classList.remove('show');
                visibilityDropdownBtn.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Visibility dropdown toggle
        visibilityDropdownBtn.addEventListener('click', function() {
            visibilityDropdownContent.classList.toggle('show');
            this.setAttribute('aria-expanded', visibilityDropdownContent.classList.contains('show'));
        });
        
        // Tags dropdown toggle
        tagsDropdownBtn.addEventListener('click', function() {
            tagsDropdownContent.classList.toggle('show');
            this.setAttribute('aria-expanded', tagsDropdownContent.classList.contains('show'));
        });
        
        // Click outside to close dropdowns
        document.addEventListener('click', function(event) {
            // Close tags dropdown
            if (!event.target.closest('.tags-dropdown') && tagsDropdownContent.classList.contains('show')) {
                tagsDropdownContent.classList.remove('show');
                tagsDropdownBtn.setAttribute('aria-expanded', 'false');
            }
            
            // Close visibility dropdown
            if (!event.target.closest('.visibility-dropdown') && visibilityDropdownContent.classList.contains('show')) {
                visibilityDropdownContent.classList.remove('show');
                visibilityDropdownBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    /**
     * Selects a visibility option and updates UI
     * @param {string} value - The visibility value ('all', 'public', 'private')
     */
    function selectVisibilityOption(value) {
        // Update current visibility
        currentVisibility = value;
        
        // Update all option states
        visibilityOptions.forEach(option => {
            const optionValue = option.getAttribute('data-value');
            const checkbox = option.querySelector('.visibility-checkbox');
            
            if (optionValue === value) {
                checkbox.classList.add('checked');
            } else {
                checkbox.classList.remove('checked');
            }
        });
        
        // Update dropdown button text
        updateVisibilityButton(value);
    }
    
    /**
     * Updates visibility dropdown button text
     * @param {string} value - The visibility value
     */
    function updateVisibilityButton(value) {
        let text = 'All Streams';
        if (value === 'public') {
            text = 'Public Streams';
        } else if (value === 'private') {
            text = 'Private Streams';
        }
        
        visibilityDropdownBtn.innerHTML = `
            <img src="./assets/images/visibility.svg" alt="Visibility Filter" class="svg-icon">
            ${text}
        `;
    }
    
    /************************************
     * PUBLIC API
     ************************************/
    // Expose function for other scripts
    window.applyFilters = function() {
        // Refresh tag list
        const allTags = collectAllTags();
        generateTagCheckboxes(allTags);
        
        // Apply filters
        applyFilters();
    };
});
