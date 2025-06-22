/**
 * Data Validation Rules
 * 
 * Author: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * Date: 2024-05-21
 * Copyright (c) 2025 NPL ITP Infrastructure (Development) Group
 * All rights reserved.
 * Distributed under the MIT License.
 * 
 * This module provides validation functions for different form field types
 * including stream codes, server locations, port numbers, and card numbers.
 */

// Export all validators as a module
const validators = {
    /**
     * Validates stream code format (xxx-xxxx with lowercase letters and numbers)
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    streamCode: function(value) {
        const regex = /^[a-z0-9]{3}-[a-z0-9]{4}$/;
        return regex.test(value) ? true : "Error: Format should be xxx-xxxx (lowercase letters or numbers)";
    },
    
    /**
     * Validates server location (domain name, IPv4, or IPv6 address)
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    serverLocation: function(value) {
        // Domain name format
        const domainRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
        
        // IPv4 format
        const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        
        // IPv6 format (simplified, supports common IPv6 formats)
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
        
        if (domainRegex.test(value)) return true;
        
        if (ipv4Regex.test(value)) {
            // Validate IPv4 address range
            const parts = value.split('.');
            for (let i = 0; i < 4; i++) {
                const part = parseInt(parts[i]);
                if (part < 0 || part > 255) return "Error: IPv4 address segments should be between 0-255";
            }
            return true;
        }
        
        if (ipv6Regex.test(value)) return true;
        
        return "Error: Should be a valid domain, IPv4 or IPv6 address";
    },
    
    /**
     * Validates port number (1-65535)
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    portNumber: function(value) {
        if (!/^\d+$/.test(value)) return "Error: Port number should be digits only";
        const port = parseInt(value);
        return (port >= 1 && port <= 65535) ? true : "Error: Port number range is 1-65535";
    },
    
    /**
     * Validates schema (only HTTP and HTTPS)
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    schema: function(value) {
        const upperValue = value.toUpperCase();
        return (upperValue === 'HTTP' || upperValue === 'HTTPS') ? true : "Error: Only HTTP or HTTPS are allowed";
    },
    
    /**
     * Validates vhost (no spaces allowed)
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    vhost: function(value) {
        return (/\s/.test(value)) ? "Error: Cannot contain spaces" : true;
    },
    
    /**
     * Validates card parameter (must be 0-3)
     * @param {string} value - Card parameter value to validate
     * @returns {boolean} - True if valid, false if invalid
     */
    cardParam: function(value) {
        return value !== null && /^[0-3]$/.test(value);
    },
    
    /**
     * Validates username format (alphanumeric, underscore, and hyphen only)
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    username: function(value) {
        const regex = /^[a-zA-Z0-9_-]+$/;
        return regex.test(value) ? true : "Error: Username can only contain letters, numbers, underscore, and hyphen";
    },
    
    /**
     * Validates email format
     * @param {string} value - Input value to validate
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    email: function(value) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(value) ? true : "Error: Please enter a valid email address";
    }
};

// Make validators available globally or for import
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = validators;
} else {
    window.validators = validators;
}
