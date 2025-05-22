/**
 * Form Validation System
 * 
 * Author: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * Date: 2024-05-21
 * Copyright (c) 2025 NPL ITP Infrastructure (Development) Group
 * All rights reserved.
 * Distributed under the MIT License.
 * 
 * This module handles form validation and user interaction for livestream connection settings.
 * Works with validators.js and url-params.js to manage validation rules and URL parameters.
 * 
 * Implementation Methods:
 * - Uses DOM event listeners for user interaction
 * - Implements custom CSS animations for validation feedback
 * - Utilizes validator functions from external module
 * - Maintains URL parameters synchronization with form state
 * - Displays toast notifications for validation results
 * 
 * Features:
 * - Real-time validation with visual feedback
 * - Form submission handling
 * - Error animations and notifications
 * - Advanced settings toggle
 * - URL parameter management
 */

// Load dependencies
document.addEventListener('DOMContentLoaded', function() {
    /**
     * SECTION: Initialization and DOM Setup
     */
    // Get DOM elements
    const streamCodeInput = document.getElementById('stream-code');
    const streamIpInput = document.getElementById('stream-ip');
    const streamPortInput = document.getElementById('stream-port');
    const streamSchemaInput = document.getElementById('stream-schema');
    const streamVhostInput = document.getElementById('stream-vhost');
    const enterButton = document.querySelector('.btn-enter');
    const advancedSettings = document.getElementById('advanced-settings');
    const advancedToggle = document.getElementById('advanced-toggle');
    
    // Store original label content for restoration
    const originalLabels = new Map();
    
    // Add CSS styles for error animations
    const customAnimationStyle = document.createElement('style');
    customAnimationStyle.textContent = `
        @keyframes inputShake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
            100% { transform: translateX(0); }
        }
        
        .input-error {
            animation: inputShake 0.4s;
            border-color: #ff0000 !important;
        }
        
        @keyframes fadeOutError {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        .error-fade-out {
            animation: fadeOutError 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(customAnimationStyle);
    
    // Save original label content
    function saveOriginalLabels() {
        document.querySelectorAll('.input-box').forEach(box => {
            const input = box.querySelector('input');
            const span = box.querySelector('.code-span');
            if (input && span) {
                originalLabels.set(input.id, span.textContent);
            }
        });
    }
    
    // Initialize on page load
    saveOriginalLabels();
    
    /**
     * SECTION: Setup Input-Validator Mapping and URL Params
     */
    // Create mapping between URL parameters and input fields
    const inputMap = {
        'stream-code': { 
            element: streamCodeInput, 
            validator: validators.streamCode,
            isAdvanced: false
        },
        'server': { 
            element: streamIpInput, 
            validator: validators.serverLocation,
            isAdvanced: true
        },
        'port': { 
            element: streamPortInput, 
            validator: validators.portNumber,
            isAdvanced: true
        },
        'schema': { 
            element: streamSchemaInput, 
            validator: validators.schema,
            isAdvanced: true
        },
        'vhost': { 
            element: streamVhostInput, 
            validator: validators.vhost,
            isAdvanced: true
        },
        // Compatibility alias
        'app': { 
            element: streamVhostInput, 
            validator: validators.vhost,
            isAdvanced: true
        }
    };
    
    // Populate form from URL parameters
    const hasAdvancedParams = urlParamsManager.populateFormFromURL(inputMap, validators);
    
    // Show advanced settings panel if advanced parameters exist
    if (hasAdvancedParams) {
        const section = document.getElementsByClassName('code-section')[0];
        
        advancedSettings.style.display = 'flex';
        section?.classList.toggle('expand');
        if (advancedToggle) {
            advancedToggle.textContent = 'Click to hide advanced Connection Settings';
        }
    }
    
    /**
     * SECTION: Error Handling and Validation Functions
     */

    // Function to display error messages
    function showError(input, message) {
        // Get the corresponding span tag
        const inputBox = input.closest('.input-box');
        const span = inputBox.querySelector('.code-span');
        
        // Clear any existing fade-out timer
        if (span._fadeTimer) {
            clearTimeout(span._fadeTimer);
            delete span._fadeTimer;
        }
        
        // Add error style and shake animation to input
        input.classList.add('input-error');
        
        // Remove and reapply animation (if user submits multiple errors)
        setTimeout(() => {
            input.classList.remove('input-error');
            setTimeout(() => {
                if (span.classList.contains('error')) {
                    input.classList.add('input-error');
                }
            }, 10);
        }, 500);
        
        // Change label content to error message
        span.textContent = message;
        span.style.color = '#ff0000';
        span.classList.add('error');
    }
    
    // Function to remove error messages
    function removeError(input) {
        // Get the corresponding span tag
        const inputBox = input.closest('.input-box');
        const span = inputBox.querySelector('.code-span');
        
        // Reset to original label content
        if (span.classList.contains('error')) {
            span.textContent = originalLabels.get(input.id) || '';
            span.style.color = '';
            span.classList.remove('error');
            input.classList.remove('input-error');
        }
    }
    
    // Function to validate a single input
    function validateInput(input, validatorFn) {
        const value = input.value.trim();
        
        // If input is empty, show "Field required" message
        if (!value) {
            showError(input, "Error: This field is required");
            return { isValid: false, error: "This field cannot be empty" };
        }
        
        const result = validatorFn(value);
        
        if (result !== true) {
            showError(input, result);
            return { isValid: false, error: result };
        }
        
        removeError(input);
        return { isValid: true };
    }
    
    // Function to get display name for input fields
    function getFieldDisplayName(input) {
        switch(input.id) {
            case 'stream-code':
                return 'Stream Code';
            case 'stream-ip':
                return 'Server Address';
            case 'stream-port':
                return 'Port Number';
            case 'stream-schema':
                return 'Protocol';
            case 'stream-vhost':
                return 'VHost';
            default:
                return 'Input Field';
        }
    }
    
    /**
     * SECTION: Form Validation
     */
    // Function to validate all inputs
    function validateAllInputs() {
        // Check if advanced settings are visible
        const isAdvancedVisible = (advancedSettings.style.display === 'flex');
        
        let isAllValid = true;
        const errors = [];
        
        // Validate stream code
        const streamCodeResult = validateInput(streamCodeInput, validators.streamCode);
        if (!streamCodeResult.isValid) {
            isAllValid = false;
            errors.push({
                field: getFieldDisplayName(streamCodeInput),
                error: streamCodeResult.error
            });
        }
        
        // If advanced settings are visible, validate all fields
        if (isAdvancedVisible) {
            // Define advanced fields to validate
            const advancedFields = [
                { input: streamIpInput, validator: validators.serverLocation },
                { input: streamPortInput, validator: validators.portNumber },
                { input: streamSchemaInput, validator: validators.schema },
                { input: streamVhostInput, validator: validators.vhost }
            ];
            
            // Validate each advanced field
            advancedFields.forEach(field => {
                const result = validateInput(field.input, field.validator);
                if (!result.isValid) {
                    isAllValid = false;
                    errors.push({
                        field: getFieldDisplayName(field.input),
                        error: result.error
                    });
                }
            });
        }
        
        return { isValid: isAllValid, errors: errors };
    }
    
    /**
     * SECTION: Form Submission Handling
     */
    // Add click event listener to Enter button
    enterButton.addEventListener('click', function(e) {
        // Prevent default form submission
        e.preventDefault();
        
        // Validate form
        const validationResult = validateAllInputs();
        if (validationResult.isValid) {
            // Ensure URL parameters are updated
            updateURLParams();
            
            // Validation passed, proceed with joining livestream
            const streamCode = streamCodeInput.value.trim();
            
            // Show success toast message
            toast.success('Connecting', `Joining livestream: StreamCode[${streamCode}]`);
            
            // Can add redirection code here - delay to let user see toast message
            setTimeout(() => {
                // window.location.href = `/stream/${streamCode}`;
                console.log(`Redirecting to livestream: ${streamCode}`);
            }, 1500);
        } else {
            // Validation failed, show specific error messages
            if (validationResult.errors.length > 0) {
                // Show errors for each field separately
                validationResult.errors.forEach((error, index) => {
                    // Stagger error messages for better user experience
                    setTimeout(() => {
                        toast.error(`${error.field} Validation Failed`, error.error.replace('Error: ', ''));
                    }, index * 300); // 300ms delay between messages
                });
            } else {
                // If no specific errors (shouldn't happen), show generic error message
                toast.error('Validation Failed', 'Please check all input fields are correct');
            }
        }
    });
    
    /**
     * SECTION: URL Parameter Management
     */
    // Function to update URL parameters
    function updateURLParams() {
        // Get values from all input fields
        const streamCode = streamCodeInput.value.trim();
        const server = streamIpInput.value.trim();
        const port = streamPortInput.value.trim();
        const schema = streamSchemaInput.value.trim();
        const vhost = streamVhostInput.value.trim();
        
        // Create URL object
        const url = new URL(window.location.href);
        
        // Clear old parameters
        url.searchParams.delete('stream-code');
        url.searchParams.delete('server');
        url.searchParams.delete('port');
        url.searchParams.delete('schema');
        url.searchParams.delete('vhost');
        
        // Add valid parameters
        if (streamCode) url.searchParams.set('stream-code', streamCode);
        if (server) url.searchParams.set('server', server);
        if (port) url.searchParams.set('port', port);
        if (schema) url.searchParams.set('schema', schema);
        if (vhost) url.searchParams.set('vhost', vhost);
        
        // Preserve card parameter
        const cardParam = new URLSearchParams(window.location.search).get('card');
        if (cardParam !== null && /^[0-3]$/.test(cardParam)) {
            url.searchParams.set('card', cardParam);
        }
        
        // Update URL without refreshing the page
        window.history.replaceState({}, '', url);
    }

    /**
     * SECTION: Event Listeners
     */
    // Remove error indicators and update URL when input field content changes
    [streamCodeInput, streamIpInput, streamPortInput, streamSchemaInput, streamVhostInput].forEach(input => {
        input.addEventListener('input', function() {
            removeError(this);
            urlParamsManager.updateURLParams(inputMap);
            
            // Real-time validation - but with debounce to avoid frequent triggers
            if (this.value.trim().length > 0) {
                // Use different validator based on field type
                let validator;
                switch(this.id) {
                    case 'stream-code':
                        validator = validators.streamCode;
                        break;
                    case 'stream-ip':
                        validator = validators.serverLocation;
                        break;
                    case 'stream-port':
                        validator = validators.portNumber;
                        break;
                    case 'stream-schema':
                        validator = validators.schema;
                        break;
                    case 'stream-vhost':
                        validator = validators.vhost;
                        break;
                }
            }
        });
    });
    
    // Add Enter key event listener to Stream Code input
    streamCodeInput.addEventListener('keydown', function(e) {
        // If Enter key is pressed
        if (e.key === 'Enter') {
            // Prevent default behavior
            e.preventDefault();
            
            // Update URL immediately
            updateURLParams();
            
            // If advanced options are not expanded, simulate Enter button click
            if (advancedSettings.style.display !== 'flex') {
                enterButton.click();
            }
        }
    });
});
