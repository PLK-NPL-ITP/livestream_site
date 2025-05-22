/**
 * URL Parameters Manager
 * 
 * Author: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * Date: 2024-05-21
 * Copyright (c) 2025 NPL ITP Infrastructure (Development) Group
 * All rights reserved.
 * Distributed under the MIT License.
 *  
 * This module handles reading from and writing to URL parameters,
 * specifically for stream connection settings.
 */

/**
 * URL Parameters handler for stream settings
 */
const urlParamsManager = {
    // Timeout reference for debouncing
    _updateTimeout: null,
    
    /**
     * Read parameters from URL and apply them to form inputs
     * @param {Object} inputMap - Mapping of param names to input elements
     * @param {Object} validators - Validation functions
     */
    populateFormFromURL: function(inputMap, validators) {
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL Parameters:', urlParams.toString());

        // Track if any advanced params were found
        let hasAdvancedParams = false;
        
        // Process each input field
        for (const [param, input] of Object.entries(inputMap)) {
            if (urlParams.has(param) && input.element) {
                const value = urlParams.get(param);
                
                // Validate parameter value before applying
                if (value && (!input.validator || input.validator(value) === true)) {
                    input.element.value = value;
                    
                    // If this is an advanced setting parameter, mark it
                    if (input.isAdvanced) {
                        hasAdvancedParams = true;
                    }
                }
            }
        }
        
        return hasAdvancedParams;
    },
    
    /**
     * Update URL parameters based on current form values with debouncing
     * @param {Object} inputMap - Mapping of param names to input elements
     * @param {number} delay - Delay in milliseconds (default: 500)
     */
    updateURLParams: function(inputMap, delay = 500) {
        // Clear any pending timeout
        clearTimeout(this._updateTimeout);
        
        // Set new timeout
        this._updateTimeout = setTimeout(() => {
            // Create URL object
            const url = new URL(window.location.href);
            
            // Clear existing params
            for (const param of Object.keys(inputMap)) {
                url.searchParams.delete(param);
            }
            
            // Add valid params
            for (const [param, input] of Object.entries(inputMap)) {
                const value = input.element?.value?.trim();
                if (value) {
                    url.searchParams.set(param, value);
                }
            }
            
            // Preserve card parameter if needed
            const cardParam = new URLSearchParams(window.location.search).get('card');
            if (cardParam !== null && /^[0-3]$/.test(cardParam)) {
                url.searchParams.set('card', cardParam);
            }
            
            // Push new URL
            window.history.pushState({}, '', url);
        }, delay);
    },
    
    /**
     * Get card parameter from URL
     * @returns {number} - Card index (0-3) or default of 0 if not valid
     */
    getCardFromURL: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const cardParam = urlParams.get('card');
        
        // Check if card parameter is valid using the validators
        return (validators.cardParam(cardParam)) 
            ? parseInt(cardParam, 10) 
            : 0;
    },
    
    /**
     * Update card parameter in URL
     * @param {number} index - Card index to set
     */
    updateCardParam: function(index) {
        const url = new URL(window.location.href);
        url.searchParams.set('card', index.toString());
        window.history.replaceState({}, '', url);
    }
};

// Make URL params manager available globally or for import
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = urlParamsManager;
} else {
    window.urlParamsManager = urlParamsManager;
}
