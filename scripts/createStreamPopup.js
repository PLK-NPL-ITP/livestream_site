/**
 * Create Stream Popup System
 * 
 * Author: GitHub Copilot
 * Date: 2025年7月6日
 * 
 * This module provides a create stream popup system that integrates with the auth system.
 * Features:
 * - Permission-based visibility (only for streamer, manager, admin users)
 * - Modern UI consistent with auth popup design
 * - Tag input system with space-separated tag creation
 * - Form validation and error handling
 * - Integration with existing site design patterns
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * SECTION: Initialize Create Stream Popup System
     */
    initCreateStreamPopupSystem();
    
    function initCreateStreamPopupSystem() {
        // Create the popup HTML structure
        createStreamPopupHTML();
        
        // Add styles for the popup
        addCreateStreamStyles();
        
        // Initialize event listeners
        initCreateStreamEventListeners();
        
        // Listen for auth events to control button visibility
        setupAuthEventListeners();
        
        // Check initial auth state
        checkInitialAuthState();
    }
    
    /**
     * SECTION: Create Popup HTML Structure
     */
    function createStreamPopupHTML() {
        const createStreamPopupHTML = `
            <div class="create-stream-popup" id="create-stream-popup">
                <div class="create-stream-popup-content">
                    <button class="create-stream-close-popup" id="create-stream-close-popup" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="create-stream-header">
                        <h2 class="create-stream-title">Create New Stream</h2>
                        <p class="create-stream-subtitle">Set up your livestream with custom settings</p>
                    </div>
                    
                    <div class="create-stream-body">
                        <form class="create-stream-form" id="create-stream-form" novalidate>
                            <!-- Stream Title -->
                            <div class="stream-input-group">
                                <label class="stream-span">Stream Title</label>
                                <input type="text" class="stream-input" id="stream-title" 
                                       required="required" placeholder="Enter an engaging title for your stream">
                            </div>
                            
                            <!-- Stream Tags -->
                            <div class="stream-input-group">
                                <label class="stream-span">Tags (optional - press space to add)</label>
                                <div class="tags-input-container" id="tags-input-container">
                                    <div class="tags-display" id="tags-display"></div>
                                    <input type="text" class="tags-input" id="stream-tags-input" 
                                           placeholder="gaming meeting tutorial education">
                                </div>
                            </div>
                            
                            <!-- Stream Visibility -->
                            <div class="stream-input-group">
                                <label class="stream-span">Stream Visibility</label>
                                <div class="stream-visibility-dropdown">
                                    <button type="button" class="stream-visibility-btn" id="stream-visibility-btn">
                                        <span class="visibility-text">Public</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                    <div class="stream-visibility-dropdown-content" id="stream-visibility-dropdown-content">
                                        <div class="stream-visibility-option" data-value="public">
                                            <span class="stream-visibility-checkbox checked" id="stream-visibility-public"></span>
                                            <span class="stream-visibility-label">Public</span>
                                        </div>
                                        <div class="stream-visibility-option" data-value="private">
                                            <span class="stream-visibility-checkbox" id="stream-visibility-private"></span>
                                            <span class="stream-visibility-label">Private</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Stream Description -->
                            <div class="stream-input-group">
                                <label class="stream-span">Stream Description (optional)</label>
                                <textarea class="stream-textarea" id="stream-description" 
                                          placeholder="Provide a detailed description of what viewers can expect from your stream..." rows="4"></textarea>
                            </div>
                            
                            <button type="submit" class="create-stream-submit-btn">
                                <span>Create Stream</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add the popup to the body
        document.body.insertAdjacentHTML('beforeend', createStreamPopupHTML);
        
        // Add stream created success popup
        const streamCreatedPopupHTML = `
            <div class="stream-created-popup" id="stream-created-popup">
                <div class="stream-created-popup-content">
                    <div class="stream-created-header">
                        <div class="success-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="var(--secondary-color)"/>
                                <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h2 class="stream-created-title">Stream Created Successfully!</h2>
                        <p class="stream-created-subtitle">Your livestream is ready to go</p>
                    </div>
                    
                    <div class="stream-created-body">
                        <div class="stream-info-grid">
                            <div class="stream-info-item">
                                <span class="info-label">Stream Code</span>
                                <span class="info-value" id="created-stream-code">-</span>
                            </div>
                            <div class="stream-info-item">
                                <span class="info-label">Stream ID</span>
                                <span class="info-value" id="created-stream-id">-</span>
                            </div>
                            <div class="stream-info-item">
                                <span class="info-label">Title</span>
                                <span class="info-value" id="created-stream-title">-</span>
                            </div>
                            <div class="stream-info-item">
                                <span class="info-label">Visibility</span>
                                <span class="info-value" id="created-stream-visibility">-</span>
                            </div>
                            <div class="stream-info-item">
                                <span class="info-label">Status</span>
                                <span class="info-value status" id="created-stream-status">-</span>
                            </div>
                        </div>
                        
                        <div class="stream-created-actions">
                            <button class="stream-created-confirm-btn" id="stream-created-confirm-btn">
                                <span>Got it!</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', streamCreatedPopupHTML);
    }
    
    /**
     * SECTION: Add Create Stream Styles
     */
    function addCreateStreamStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Create Stream Popup Styles - Based on Auth Popup */
            .create-stream-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1001;
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
                opacity: 0;
                transition: opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, background-color 0.3s ease;
            }

            .create-stream-popup.active {
                display: flex;
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.9);
                -webkit-backdrop-filter: blur(8px);
                backdrop-filter: blur(8px);
            }

            .create-stream-popup.closing {
                opacity: 0;
                background-color: rgba(255, 255, 255, 0);
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
                transition: opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, background-color 0.3s ease;
            }

            .create-stream-popup-content {
                background: rgba(255, 255, 255, 0.98);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                width: 90%;
                max-width: 520px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 
                           0 8px 16px rgba(0, 0, 0, 0.06),
                           0 0 0 1px rgba(255, 255, 255, 0.05);
                -webkit-backdrop-filter: blur(16px);
                backdrop-filter: blur(16px);
                position: relative;
                transform: scale(0.9) translateY(20px);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                max-height: 90vh;
                overflow-y: auto;
            }

            .create-stream-popup.active .create-stream-popup-content {
                transform: scale(1) translateY(0);
            }

            .create-stream-popup-content.closing {
                transform: scale(0.9) translateY(20px);
                transition: all 0.3s ease;
            }

            .create-stream-close-popup {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                color: var(--gray-color);
                transition: all 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .create-stream-close-popup:hover {
                background: rgba(255, 71, 87, 0.1);
                color: var(--primary-color);
                transform: scale(1.05);
                box-shadow: 0 6px 12px rgba(255, 71, 87, 0.2);
            }

            .create-stream-close-popup:active {
                transform: scale(0.95);
            }

            .create-stream-header {
                padding: 2.5rem 2.5rem 2rem 2.5rem;
                text-align: center;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);
                background: linear-gradient(135deg, rgba(255, 71, 87, 0.02), rgba(255, 71, 87, 0.05));
            }

            .create-stream-title {
                font-family: 'Pacifico', cursive;
                font-size: 1.9rem;
                color: var(--primary-color);
                margin-bottom: 0.8rem;
                text-shadow: 0 1px 3px rgba(255, 71, 87, 0.2);
            }

            .create-stream-subtitle {
                color: var(--gray-color);
                font-size: 1rem;
                margin-bottom: 0;
                font-weight: 400;
                opacity: 0.8;
            }

            .create-stream-body {
                padding: 2rem 2.5rem 2.5rem 2.5rem;
                background: linear-gradient(180deg, rgba(248, 249, 250, 0.3), rgba(255, 255, 255, 0.1));
            }

            .create-stream-form {
                display: flex;
                flex-direction: column;
            }

            .stream-input-group {
                margin: 0 0 1.5rem 0;
                display: flex;
                flex-direction: column;
                position: relative;
                width: 100%;
            }

            .stream-input-group:last-child {
                margin-bottom: 0;
            }

            .stream-span {
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--dark-color);
                margin-bottom: 0.5rem;
                display: block;
            }

            .stream-input, .stream-textarea {
                padding: 14px 16px;
                border: 2px solid var(--light-gray);
                background: #ffffff;
                border-radius: 10px;
                outline: none;
                color: var(--dark-color);
                font-size: 1rem;
                font-family: 'Inter', sans-serif;
                transition: all 0.3s ease;
                width: 100%;
                resize: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
            }

            .stream-input:focus, .stream-textarea:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
                transform: translateY(-1px);
            }

            .stream-input::placeholder, .stream-textarea::placeholder {
                color: var(--gray-color);
                opacity: 0.7;
            }

            .stream-textarea {
                min-height: 100px;
                resize: vertical;
            }

            /* Visibility Dropdown Styles - Based on existing filters */
            .stream-visibility-dropdown {
                position: relative;
                width: 100%;
            }

            .stream-visibility-btn {
                padding: 14px 16px;
                border: 2px solid var(--light-gray);
                background: #ffffff;
                border-radius: 10px;
                outline: none;
                color: var(--dark-color);
                font-size: 1rem;
                font-family: 'Inter', sans-serif;
                transition: all 0.3s ease;
                width: 100%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .stream-visibility-btn:focus,
            .stream-visibility-btn:hover {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
                transform: translateY(-1px);
            }

            .stream-visibility-btn svg {
                transition: transform 0.3s ease;
                color: var(--gray-color);
            }

            .stream-visibility-btn.active svg {
                transform: rotate(180deg);
            }

            .stream-visibility-dropdown-content {
                display: none;
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                background-color: white;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
                border-radius: 10px;
                z-index: 1000;
                padding: 12px;
                border: 1px solid var(--light-gray);
            }

            .stream-visibility-dropdown-content.show {
                display: block;
            }

            .stream-visibility-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 8px;
                margin-bottom: 4px;
                font-size: 1rem;
            }

            .stream-visibility-option:last-child {
                margin-bottom: 0;
            }

            .stream-visibility-option:hover {
                background-color: rgba(248, 249, 250, 0.8);
            }

            .stream-visibility-checkbox {
                width: 18px;
                height: 18px;
                border: 2px solid var(--light-gray);
                border-radius: 50%;
                display: inline-block;
                position: relative;
                transition: all 0.2s ease;
            }

            .stream-visibility-checkbox.checked {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
            }

            .stream-visibility-checkbox.checked::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
            }

            .stream-visibility-label {
                color: var(--dark-color);
                font-weight: 500;
            }

            /* Tags Input Specific Styles */
            .tags-input-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                min-height: 52px;
                padding: 8px 16px;
                border: 2px solid var(--light-gray);
                background: #ffffff;
                border-radius: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
                gap: 0.5rem;
            }

            .tags-input-container:focus-within {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
                transform: translateY(-1px);
            }

            .tags-display {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .tag-item {
                display: inline-flex;
                align-items: center;
                background: linear-gradient(135deg, var(--primary-color), #e63946);
                color: white;
                padding: 0.4rem 0.8rem;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 500;
                gap: 0.4rem;
                box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
                transition: all 0.2s ease;
            }

            .tag-item:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(255, 71, 87, 0.3);
            }

            .tag-remove {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                cursor: pointer;
                padding: 2px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 12px;
                font-weight: bold;
            }

            .tag-remove:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .tags-input {
                border: none !important;
                flex: 1;
                min-width: 120px;
                padding: 8px 0;
                outline: none;
                font-size: 1rem;
                background: transparent;
                color: var(--dark-color);
            }

            .tags-input::placeholder {
                color: var(--gray-color) !important;
                opacity: 0.7;
            }

            .create-stream-submit-btn {
                background: linear-gradient(135deg, var(--primary-color), #e63946);
                color: white;
                border: none;
                border-radius: 10px;
                padding: 16px 32px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 1rem;
                box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
                position: relative;
                overflow: hidden;
            }

            .create-stream-submit-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
            }

            .create-stream-submit-btn:hover::before {
                left: 100%;
            }

            .create-stream-submit-btn:hover {
                background: linear-gradient(135deg, #e63946, #d62839);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(255, 71, 87, 0.3);
            }

            .create-stream-submit-btn:active {
                transform: translateY(0);
                box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
            }

            .create-stream-submit-btn.loading {
                opacity: 0.8;
                cursor: not-allowed;
                transform: none;
                background: var(--gray-color);
            }

            .create-stream-submit-btn.loading::before {
                display: none;
            }

            /* Error states */
            .stream-input.input-error, .stream-textarea.input-error {
                animation: inputShake 0.4s;
                border-color: var(--danger-color) !important;
                box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.1) !important;
            }

            .stream-span.error {
                color: var(--danger-color) !important;
                font-weight: 600;
            }

            @keyframes inputShake {
                0% { transform: translateX(0); }
                20% { transform: translateX(-10px); }
                40% { transform: translateX(10px); }
                60% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
                100% { transform: translateX(0); }
            }

            /* Responsive design */
            @media (max-width: 480px) {
                .create-stream-popup-content {
                    width: 95%;
                    margin: 1rem;
                    max-height: 95vh;
                }

                .create-stream-header {
                    padding: 1.5rem 1.5rem 1rem 1.5rem;
                }

                .create-stream-body {
                    padding: 1rem 1.5rem 1.5rem 1.5rem;
                }

                .create-stream-title {
                    font-size: 1.5rem;
                }
            }

            /* Stream Created Success Popup Styles */
            .stream-created-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1002;
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
                opacity: 0;
                transition: opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, background-color 0.3s ease;
            }

            .stream-created-popup.active {
                display: flex;
                opacity: 1;
                background-color: rgba(0, 0, 0, 0.6);
                -webkit-backdrop-filter: blur(8px);
                backdrop-filter: blur(8px);
            }

            .stream-created-popup-content {
                background: rgba(255, 255, 255, 0.98);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 
                           0 8px 16px rgba(0, 0, 0, 0.1);
                -webkit-backdrop-filter: blur(16px);
                backdrop-filter: blur(16px);
                position: relative;
                transform: scale(0.8) translateY(30px);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                overflow: hidden;
            }

            .stream-created-popup.active .stream-created-popup-content {
                transform: scale(1) translateY(0);
            }

            .stream-created-header {
                padding: 2rem 2rem 1.5rem 2rem;
                text-align: center;
                background: linear-gradient(135deg, rgba(52, 168, 83, 0.05), rgba(52, 168, 83, 0.1));
                border-bottom: 1px solid rgba(52, 168, 83, 0.1);
            }

            .success-icon {
                margin-bottom: 1rem;
                display: flex;
                justify-content: center;
            }

            .stream-created-title {
                font-family: 'Pacifico', cursive;
                font-size: 1.7rem;
                color: var(--secondary-color);
                margin-bottom: 0.5rem;
                text-shadow: 0 1px 3px rgba(52, 168, 83, 0.2);
            }

            .stream-created-subtitle {
                color: var(--gray-color);
                font-size: 1rem;
                font-weight: 400;
                opacity: 0.9;
            }

            .stream-created-body {
                padding: 1.5rem 2rem 2rem 2rem;
            }

            .stream-info-grid {
                display: grid;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .stream-info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: rgba(248, 249, 250, 0.8);
                border-radius: 10px;
                border: 1px solid var(--light-gray);
            }

            .info-label {
                font-weight: 600;
                color: var(--gray-color);
                font-size: 0.9rem;
            }

            .info-value {
                font-weight: 600;
                color: var(--dark-color);
                font-size: 1rem;
                font-family: 'Inter', monospace;
                background: white;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                border: 1px solid var(--light-gray);
                text-align: right;
                max-width: 70%;
            }

            .info-value.status {
                color: var(--secondary-color);
                background: rgba(52, 168, 83, 0.1);
                border-color: var(--secondary-color);
                text-transform: uppercase;
                font-size: 0.85rem;
                letter-spacing: 0.5px;
            }

            .stream-created-actions {
                display: flex;
                justify-content: center;
            }

            .stream-created-confirm-btn {
                background: linear-gradient(135deg, var(--secondary-color), #2e7d32);
                color: white;
                border: none;
                border-radius: 10px;
                padding: 14px 32px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 12px rgba(52, 168, 83, 0.3);
                position: relative;
                overflow: hidden;
            }

            .stream-created-confirm-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
            }

            .stream-created-confirm-btn:hover::before {
                left: 100%;
            }

            .stream-created-confirm-btn:hover {
                background: linear-gradient(135deg, #2e7d32, #1b5e20);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(52, 168, 83, 0.4);
            }

            .stream-created-confirm-btn:active {
                transform: translateY(0);
            }

            /* Success popup responsive design */
            @media (max-width: 480px) {
                .stream-created-popup-content {
                    width: 95%;
                    margin: 1rem;
                }

                .stream-created-header {
                    padding: 1.5rem 1.5rem 1rem 1.5rem;
                }

                .stream-created-body {
                    padding: 1rem 1.5rem 1.5rem 1.5rem;
                }

                .stream-created-title {
                    font-size: 1.4rem;
                }

                .stream-info-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.5rem;
                }

                .info-value {
                    align-self: stretch;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * SECTION: Event Listeners Setup
     */
    function initCreateStreamEventListeners() {
        // Get DOM elements
        const createStreamPopup = document.getElementById('create-stream-popup');
        const createStreamCloseBtn = document.getElementById('create-stream-close-popup');
        const createStreamForm = document.getElementById('create-stream-form');
        const tagsInput = document.getElementById('stream-tags-input');
        
        // START A NEW STREAM button click handler
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-new')) {
                e.preventDefault();
                showCreateStreamPopup();
            }
        });
        
        // Close popup handlers
        createStreamCloseBtn.addEventListener('click', hideCreateStreamPopup);
        
        // Close popup when clicking outside
        createStreamPopup.addEventListener('click', function(e) {
            if (e.target === createStreamPopup) {
                hideCreateStreamPopup();
            }
        });
        
        // ESC key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && createStreamPopup.classList.contains('active')) {
                hideCreateStreamPopup();
            }
        });
        
        // Form submission handler
        createStreamForm.addEventListener('submit', handleCreateStreamSubmit);
        
        // Tags input handlers
        setupTagsInput();
        
        // Visibility dropdown handlers
        setupVisibilityDropdown();
        
        // Input validation handlers
        setupStreamInputValidation();
        
        // Stream created popup handlers
        setupStreamCreatedPopup();
    }
    
    /**
     * SECTION: Tags Input System
     */
    function setupTagsInput() {
        const tagsInput = document.getElementById('stream-tags-input');
        const tagsDisplay = document.getElementById('tags-display');
        let tags = [];
        
        tagsInput.addEventListener('keydown', function(e) {
            if (e.key === ' ' && tagsInput.value.trim()) {
                e.preventDefault();
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            } else if (e.key === 'Backspace' && !tagsInput.value && tags.length > 0) {
                e.preventDefault();
                removeTag(tags.length - 1);
            }
        });
        
        tagsInput.addEventListener('blur', function() {
            if (tagsInput.value.trim()) {
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });
        
        function addTag(tagText) {
            if (tagText && !tags.includes(tagText) && tags.length < 10) {
                tags.push(tagText);
                renderTags();
            }
        }
        
        function removeTag(index) {
            if (index >= 0 && index < tags.length) {
                tags.splice(index, 1);
                renderTags();
            }
        }
        
        function renderTags() {
            tagsDisplay.innerHTML = tags.map((tag, index) => `
                <span class="tag-item">
                    ${tag}
                    <button type="button" class="tag-remove" data-index="${index}">×</button>
                </span>
            `).join('');
            
            // Add click handlers for remove buttons
            tagsDisplay.querySelectorAll('.tag-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    removeTag(index);
                });
            });
        }
        
        // Store tags getter for form submission
        window.getStreamTags = () => tags;
    }
    
    /**
     * SECTION: Visibility Dropdown System
     */
    function setupVisibilityDropdown() {
        const visibilityBtn = document.getElementById('stream-visibility-btn');
        const visibilityDropdown = document.getElementById('stream-visibility-dropdown-content');
        let selectedValue = 'public';
        
        // Toggle dropdown
        visibilityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const isOpen = visibilityDropdown.classList.contains('show');
            
            if (isOpen) {
                closeVisibilityDropdown();
            } else {
                openVisibilityDropdown();
            }
        });
        
        // Handle option selection
        visibilityDropdown.addEventListener('click', function(e) {
            const option = e.target.closest('.stream-visibility-option');
            if (option) {
                const value = option.dataset.value;
                selectVisibilityOption(value);
                closeVisibilityDropdown();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.stream-visibility-dropdown')) {
                closeVisibilityDropdown();
            }
        });
        
        // Close dropdown on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeVisibilityDropdown();
            }
        });
        
        function openVisibilityDropdown() {
            visibilityDropdown.classList.add('show');
            visibilityBtn.classList.add('active');
        }
        
        function closeVisibilityDropdown() {
            visibilityDropdown.classList.remove('show');
            visibilityBtn.classList.remove('active');
        }
        
        function selectVisibilityOption(value) {
            selectedValue = value;
            
            // Update button text
            const visibilityText = visibilityBtn.querySelector('.visibility-text');
            const options = {
                'public': 'Public',
                'private': 'Private',
                'unlisted': 'Unlisted'
            };
            visibilityText.textContent = options[value] || 'Public';
            
            // Update checkboxes
            document.querySelectorAll('.stream-visibility-checkbox').forEach(checkbox => {
                checkbox.classList.remove('checked');
            });
            const selectedCheckbox = document.getElementById(`stream-visibility-${value}`);
            if (selectedCheckbox) {
                selectedCheckbox.classList.add('checked');
            }
        }
        
        // Store visibility getter for form submission
        window.getStreamVisibility = () => selectedValue;
        
        // Store visibility setter for external use
        window.setStreamVisibility = selectVisibilityOption;
    }
    
    /**
     * SECTION: Permission Checking
     */
    function checkUserPermissions(profile) {
        if (!profile || !profile.user_group) {
            return false;
        }
        
        const allowedGroups = ['streamer', 'manager', 'admin'];
        const userGroups = Array.isArray(profile.user_group) ? profile.user_group : [profile.user_group];
        
        return userGroups.some(group => allowedGroups.includes(group));
    }
    
    function updateButtonVisibility(hasPermission) {
        const newStreamBtn = document.querySelector('.btn-new');
        if (newStreamBtn) {
            if (hasPermission) {
                newStreamBtn.style.display = 'flex';
            } else {
                newStreamBtn.style.display = 'none';
            }
        }
    }
    
    function setupVisibilityOptions(profile) {
        const visibilityDropdownContent = document.getElementById('stream-visibility-dropdown-content');
        if (!visibilityDropdownContent) return;
        
        // Check if user is manager or admin
        const isManagerOrAdmin = profile && profile.user_group && 
            (Array.isArray(profile.user_group) ? profile.user_group : [profile.user_group])
            .some(group => ['manager', 'admin'].includes(group));
        
        // Base options for all users
        let optionsHTML = `
            <div class="stream-visibility-option" data-value="public">
                <span class="stream-visibility-checkbox checked" id="stream-visibility-public"></span>
                <span class="stream-visibility-label">Public</span>
            </div>
            <div class="stream-visibility-option" data-value="private">
                <span class="stream-visibility-checkbox" id="stream-visibility-private"></span>
                <span class="stream-visibility-label">Private</span>
            </div>
        `;
        
        // Add unlisted option for managers and admins
        if (isManagerOrAdmin) {
            optionsHTML += `
                <div class="stream-visibility-option" data-value="unlisted">
                    <span class="stream-visibility-checkbox" id="stream-visibility-unlisted"></span>
                    <span class="stream-visibility-label">Unlisted</span>
                </div>
            `;
        }
        
        // Update dropdown content
        visibilityDropdownContent.innerHTML = optionsHTML;
        
        // Reset to default selection (public)
        if (window.setStreamVisibility) {
            window.setStreamVisibility('public');
        }
    }
    
    /**
     * SECTION: Auth Event Listeners
     */
    function setupAuthEventListeners() {
        window.addEventListener('api-event', function(e) {
            if (e.detail.type === 'profile-updated') {
                const hasPermission = checkUserPermissions(e.detail.profile);
                updateButtonVisibility(hasPermission);
                setupVisibilityOptions(e.detail.profile);
            }
        });
    }
    
    function checkInitialAuthState() {
        if (window.authAPI && window.authAPI.getCurrentProfile) {
            const profile = window.authAPI.getCurrentProfile();
            const hasPermission = checkUserPermissions(profile);
            updateButtonVisibility(hasPermission);
            setupVisibilityOptions(profile);
        }
    }
    
    /**
     * SECTION: Popup Display Functions
     */
    function showCreateStreamPopup() {
        const createStreamPopup = document.getElementById('create-stream-popup');
        createStreamPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Setup visibility options based on current user
        if (window.authAPI && window.authAPI.getCurrentProfile) {
            const profile = window.authAPI.getCurrentProfile();
            setupVisibilityOptions(profile);
        }
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById('stream-title');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }
    
    function hideCreateStreamPopup() {
        const createStreamPopup = document.getElementById('create-stream-popup');
        const createStreamPopupContent = createStreamPopup.querySelector('.create-stream-popup-content');
        
        // Add closing animation classes
        createStreamPopup.classList.add('closing');
        createStreamPopupContent.classList.add('closing');
        
        // Wait for animation to complete
        setTimeout(() => {
            createStreamPopup.classList.remove('active', 'closing');
            createStreamPopupContent.classList.remove('closing');
            document.body.style.overflow = '';
            clearForm();
        }, 300);
    }
    
    /**
     * SECTION: Form Handling
     */
    async function handleCreateStreamSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.create-stream-submit-btn');
        const titleInput = document.getElementById('stream-title');
        const descriptionInput = document.getElementById('stream-description');
        
        // Validate form
        const validationResult = validateCreateStreamForm();
        if (!validationResult.isValid) {
            return;
        }
        
        // Add loading state
        submitBtn.classList.add('loading');
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.textContent;
        btnText.textContent = 'Creating Stream...';
        
        const formData = {
            stream_name: titleInput.value.trim(),
            description: descriptionInput.value.trim() || null,
            stream_tags: window.getStreamTags() || [],
            visibility: window.getStreamVisibility ? window.getStreamVisibility() : 'public'
        };
        
        try {
            // Call the API to create stream
            const response = await window.authAPI.makeRequest('/api/create-stream', {
                method: 'POST',
                body: formData
            }, true);
            
            console.log('Stream created successfully:', response);
            
            // Show success popup with stream details
            showStreamCreatedPopup(response);
            
        } catch (error) {
            console.error('Failed to create stream:', error);
            if (window.showToast) {
                window.showToast('Failed to create stream: ' + error.message, 'error');
            }
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            const btnText = submitBtn.querySelector('span');
            btnText.textContent = 'Create Stream';
        }
    }
    
    /**
     * SECTION: Form Validation
     */
    function validateCreateStreamForm() {
        let isAllValid = true;
        const errors = [];
        
        const titleInput = document.getElementById('stream-title');
        
        // Validate title (only required field)
        if (!titleInput.value.trim()) {
            showStreamError(titleInput, 'Stream title is required');
            isAllValid = false;
            errors.push('Stream title is required');
        } else if (titleInput.value.trim().length < 3) {
            showStreamError(titleInput, 'Stream title must be at least 3 characters');
            isAllValid = false;
            errors.push('Stream title too short');
        } else {
            removeStreamError(titleInput);
        }
        
        return { isValid: isAllValid, errors: errors };
    }
    
    function showStreamError(input, message) {
        const inputGroup = input.closest('.stream-input-group');
        const span = inputGroup.querySelector('.stream-span');
        
        // Store original text if not already stored
        if (!span.dataset.originalText) {
            span.dataset.originalText = span.textContent;
        }
        
        // Add error style and shake animation
        input.classList.add('input-error');
        
        setTimeout(() => {
            input.classList.remove('input-error');
        }, 500);
        
        // Change label content to error message
        span.textContent = message;
        span.classList.add('error');
    }
    
    function removeStreamError(input) {
        const inputGroup = input.closest('.stream-input-group');
        const span = inputGroup.querySelector('.stream-span');
        
        if (span.classList.contains('error')) {
            span.classList.remove('error');
            
            // Restore original label content
            if (span.dataset.originalText) {
                span.textContent = span.dataset.originalText;
            }
        }
    }
    
    function setupStreamInputValidation() {
        const inputs = document.querySelectorAll('.stream-input, .stream-textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                removeStreamError(input);
            });
        });
    }
    
    function clearForm() {
        const form = document.getElementById('create-stream-form');
        form.reset();
        
        // Reset visibility to default (public)
        if (window.setStreamVisibility) {
            window.setStreamVisibility('public');
        }
        
        // Clear tags
        const tagsDisplay = document.getElementById('tags-display');
        tagsDisplay.innerHTML = '';
        if (window.getStreamTags) {
            // Reset tags array
            window.getStreamTags = () => [];
        }
        
        // Clear any error states
        const inputs = form.querySelectorAll('.stream-input, .stream-textarea');
        inputs.forEach(input => {
            removeStreamError(input);
        });
    }
    
    /**
     * SECTION: Stream Created Success Popup
     */
    function setupStreamCreatedPopup() {
        const streamCreatedPopup = document.getElementById('stream-created-popup');
        const confirmBtn = document.getElementById('stream-created-confirm-btn');
        
        // Confirm button handler
        confirmBtn.addEventListener('click', function() {
            hideStreamCreatedPopup();
            hideCreateStreamPopup();
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && streamCreatedPopup.classList.contains('active')) {
                hideStreamCreatedPopup();
                hideCreateStreamPopup();
            }
        });
    }
    
    function showStreamCreatedPopup(streamData) {
        const streamCreatedPopup = document.getElementById('stream-created-popup');
        
        // Populate stream information
        populateStreamInfo(streamData);
        
        // Show the popup
        streamCreatedPopup.classList.add('active');
        
        // Focus on confirm button
        setTimeout(() => {
            const confirmBtn = document.getElementById('stream-created-confirm-btn');
            if (confirmBtn) {
                confirmBtn.focus();
            }
        }, 300);
    }
    
    function hideStreamCreatedPopup() {
        const streamCreatedPopup = document.getElementById('stream-created-popup');
        streamCreatedPopup.classList.remove('active');
    }
    
    function populateStreamInfo(streamData) {
        // Map the data to the UI elements
        const mappings = [
            { id: 'created-stream-code', value: streamData.stream_code || '-' },
            { id: 'created-stream-id', value: streamData.stream_id || '-' },
            { id: 'created-stream-title', value: streamData.stream_title || '-' },
            { id: 'created-stream-visibility', value: capitalizeFirst(streamData.stream_visibility || 'public') },
            { id: 'created-stream-status', value: capitalizeFirst(streamData.stream_status || 'planned') }
        ];
        
        mappings.forEach(mapping => {
            const element = document.getElementById(mapping.id);
            if (element) {
                element.textContent = mapping.value;
            }
        });
    }
    
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    /**
     * SECTION: Public API
     * Expose functions for external use
     */
    window.createStreamPopup = {
        show: showCreateStreamPopup,
        hide: hideCreateStreamPopup
    };
});
