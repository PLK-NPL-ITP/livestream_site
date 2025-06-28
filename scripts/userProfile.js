/**
 * User Profile Popup System
 * 
 * Author: GitHub Copilot
 * Date: 2025-06-14
 * 
 * This module provides a comprehensive user profile popup system with support for displaying
 * user information and account management options. Key features include:
 * 
 * - Glassmorphism design with backdrop blur effects matching site design
 * - User profile information display from API
 * - Avatar generation based on username
 * - Danger zone for account management actions
 * - Modern UI with responsive design matching StreamPopup style
 * - Integration with existing site design patterns
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * SECTION: Initialize User Profile System
     */
    initUserProfileSystem();
    
    function initUserProfileSystem() {
        // Create the popup HTML structure
        createUserProfileHTML();
        
        // Create danger zone confirmation popups
        createConfirmationPopupHTML();
        createChangePasswordPopupHTML();
        createDeleteAccountPopupHTML();
        
        // Initialize event listeners
        initProfileEventListeners();
        
        // Setup profile event listeners
        setupProfileEventListeners();
        
        // Add profile styles
        addProfileStyles();
        
        // Add error animation styles
        addDangerPopupErrorStyles();
    }
    
    /**
     * SECTION: Create Popup HTML Structure
     */
    function createUserProfileHTML() {
        const userProfileHTML = `
            <div class="user-profile-popup" id="user-profile-popup">
                <div class="user-profile-content">
                    <button class="close-profile-popup" id="close-profile-popup" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="profile-header">
                        <div class="profile-avatar-section">
                            <div class="profile-avatar" id="profile-avatar">
                                <img class="avatar-image" id="avatar-image" src="" alt="User Avatar">
                            </div>
                            <div class="profile-basic-info">
                                <h2 class="profile-name" id="profile-name">Jason JP Yang</h2>
                                <p class="profile-username" id="profile-username">@Jason_Yang</p>
                                <div class="profile-status">
                                    <span class="status-badge active" id="profile-status">
                                        <span class="status-dot"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-body">
                        <div class="profile-section">
                            <h3 class="section-title">Account Information</h3>
                            <div class="profile-details">
                                <div class="detail-item">
                                    <span class="detail-label">User ID</span>
                                    <span class="detail-value" id="profile-user-id">1f656188-1d7d-4599-9624-bc205ca4f8e9</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Email</span>
                                    <span class="detail-value" id="profile-email">jiepengyang@outlook.com</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Account Status</span>
                                    <span class="detail-value account-status" id="profile-account-status">
                                        <span class="status-icon activated">✓</span>
                                        Activated
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Last Active</span>
                                    <span class="detail-value" id="profile-last-active">2025-06-14 09:31:22</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">User Groups</span>
                                    <span class="detail-value" id="profile-user-groups">
                                        <div class="user-groups-container"></div>
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-section danger-zone">
                            <h3 class="section-title danger-title">Danger Zone</h3>
                            <div class="danger-actions">
                                <div class="danger-item">
                                    <div class="danger-info">
                                        <span class="danger-action-title">Change Password</span>
                                        <span class="danger-action-desc">Update your account password</span>
                                    </div>
                                    <button class="danger-btn secondary" id="change-password-btn">Change Password</button>
                                </div>
                                
                                <div class="danger-item">
                                    <div class="danger-info">
                                        <span class="danger-action-title">Sign Out</span>
                                        <span class="danger-action-desc">Sign out from this device</span>
                                    </div>
                                    <button class="danger-btn secondary" id="logout-btn">Logout</button>
                                </div>
                                
                                <div class="danger-item">
                                    <div class="danger-info">
                                        <span class="danger-action-title">Sign Out from All Devices</span>
                                        <span class="danger-action-desc">Sign out from all devices and sessions</span>
                                    </div>
                                    <button class="danger-btn secondary" id="logout-all-btn">Logout from All Devices</button>
                                </div>
                                
                                <div class="danger-item">
                                    <div class="danger-info">
                                        <span class="danger-action-title">Delete Account</span>
                                        <span class="danger-action-desc">Permanently delete your account and all data</span>
                                    </div>
                                    <button class="danger-btn primary" id="delete-account-btn">Delete Account</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add the popup to the body
        document.body.insertAdjacentHTML('beforeend', userProfileHTML);
    }
    
    /**
     * SECTION: Add Profile Styles
     */
    function addProfileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* User Profile Popup Styles - Matching StreamPopup Design */
            .user-profile-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
                opacity: 0;
                transition: opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, background-color 0.3s ease;
            }

            .user-profile-popup.active {
                display: flex;
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.9);
                -webkit-backdrop-filter: blur(5px);
                backdrop-filter: blur(5px);
            }

            .user-profile-content {
                background-color: white;
                border-radius: 8px;
                width: 90%;
                max-width: 900px;
                max-height: 70vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                position: relative;
                padding: 0;
                display: flex;
                flex-direction: column;
                animation: profile-fade-in 0.3s ease forwards;
            }

            @keyframes profile-fade-in {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .user-profile-content.closing {
                animation: profile-fade-out 0.3s ease forwards;
            }

            @keyframes profile-fade-out {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(20px);
                    opacity: 0;
                }
            }

            .close-profile-popup {
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

            .close-profile-popup:hover {
                background: rgba(255, 71, 87, 0.2);
            }

            .profile-header {
                padding: 24px 24px 16px 24px;
                border-bottom: 1px solid #f0f0f0;
            }

            .profile-avatar-section {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .profile-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 3px solid white;
            }

            .avatar-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }

            .profile-basic-info {
                flex: 1;
            }

            .profile-name {
                margin: 0 0 4px 0;
                font-size: 20px;
                font-weight: 600;
                color: #202124;
                font-family: 'Inter', sans-serif;
            }

            .profile-username {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: #5f6368;
                font-family: 'Inter', sans-serif;
            }

            .profile-status {
                display: flex;
                align-items: center;
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                background-color: #e8f5e8;
                color: #2e7d2e;
            }

            .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: #34a853;
            }

            .profile-body {
                padding: 0;
            }

            .profile-section {
                padding: 20px 24px;
            }

            .profile-section:not(:last-child) {
                border-bottom: 1px solid #f0f0f0;
            }

            .section-title {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #202124;
                font-family: 'Inter', sans-serif;
            }

            .profile-details {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
            }

            .detail-label {
                font-size: 14px;
                color: #5f6368;
                font-weight: 500;
            }

            .detail-value {
                font-size: 14px;
                color: #202124;
                font-family: 'Consolas', 'Monaco', monospace;
                text-align: right;
                max-width: 60%;
                word-break: break-all;
            }

            .account-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-family: 'Inter', sans-serif !important;
            }

            .status-icon.activated {
                color: #34a853;
                font-weight: bold;
            }

            /* User Groups Styles */
            .user-groups-container {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                justify-content: flex-end;
                max-width: 100%;
            }

            .user-group-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                background-color: #e8f0fe;
                color: #1a73e8;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                font-family: 'Inter', sans-serif;
                border: 1px solid #dadce0;
                text-transform: capitalize;
            }

            .user-group-badge.admin {
                background-color: #fce8e6;
                color: #d33b2c;
                border-color: #fce8e6;
            }

            .user-group-badge.manager {
                background-color: #e6f4ea;
                color: #137333;
                border-color: #e6f4ea;
            }

            .user-group-badge.user {
                background-color: #e8f0fe;
                color: #1a73e8;
                border-color: #e8f0fe;
            }

            /* Danger Zone Styles */
            .danger-zone {
                background-color: #fafafa;
                border-top: 2px solid #ff4757;
            }

            .danger-title {
                color: #ff4757;
                font-weight: 700;
            }

            .danger-actions {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .danger-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 12px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background-color: white;
            }

            .danger-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .danger-action-title {
                font-size: 14px;
                font-weight: 600;
                color: #202124;
            }

            .danger-action-desc {
                font-size: 12px;
                color: #5f6368;
            }

            .danger-btn {
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid;
                white-space: nowrap;
            }

            .danger-btn.secondary {
                background-color: white;
                color: #5f6368;
                border-color: #d0d7de;
            }

            .danger-btn.secondary:hover {
                background-color: #f6f8fa;
                border-color: #8c959f;
            }

            .danger-btn.primary,
            #danger-confirm-btn {
                background-color: #ff4757;
                color: white;
                border-color: #ff4757;
            }

            .danger-btn.primary:hover,
            #danger-confirm-btn:hover {
                background-color: #e63946;
                border-color: #e63946;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .user-profile-content {
                    max-width: 95%;
                    margin: 5vh auto;
                }
                
                .profile-avatar-section {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }
                
                .profile-avatar {
                    width: 100px;
                    height: 100px;
                }
                
                .danger-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                
                .danger-btn {
                    width: 100%;
                }
                
                .detail-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .detail-value {
                    max-width: 100%;
                    text-align: left;
                    font-size: 13px;
                }
                
                .user-groups-container {
                    justify-content: flex-start;
                }
                
                .profile-header {
                    padding: 20px 20px 12px 20px;
                }
                
                .profile-section {
                    padding: 16px 20px;
                }
            }
            
            @media (max-width: 480px) {
                .user-profile-content {
                    max-width: 98%;
                    max-height: 95vh;
                }
                
                .profile-name {
                    font-size: 18px;
                }
                
                .section-title {
                    font-size: 15px;
                }
                
                .detail-value {
                    word-break: break-all;
                    font-size: 12px;
                }
            }
            
            /* Danger Zone Popup Styles */
            .danger-confirmation-popup,
            .change-password-popup,
            .delete-account-popup {
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

            .danger-confirmation-popup.active,
            .change-password-popup.active,
            .delete-account-popup.active {
                display: flex;
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.9);
                -webkit-backdrop-filter: blur(5px);
                backdrop-filter: blur(5px);
            }

            .danger-confirmation-popup.closing,
            .change-password-popup.closing,
            .delete-account-popup.closing {
                opacity: 0;
                background-color: rgba(255, 255, 255, 0);
                -webkit-backdrop-filter: blur(0px);
                backdrop-filter: blur(0px);
            }

            .danger-confirmation-content,
            .change-password-content,
            .delete-account-content {
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

            @keyframes danger-fade-in {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .danger-confirmation-content.closing,
            .change-password-content.closing,
            .delete-account-content.closing {
                animation: danger-fade-out 0.3s ease forwards;
            }

            @keyframes danger-fade-out {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(20px);
                    opacity: 0;
                }
            }

            .close-danger-popup {
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

            .close-danger-popup:hover {
                background: rgba(255, 71, 87, 0.2);
            }

            /* Confirmation Popup Specific Styles */
            .danger-confirmation-header {
                padding: 24px 24px 0px 24px;
                text-align: center;
            }

            .danger-confirmation-title {
                margin: 0 0 8px 0;
                font-size: 20px;
                font-weight: 600;
                color: #202124;
                font-family: 'Inter', sans-serif;
            }

            .danger-confirmation-message {
                margin: 0;
                font-size: 14px;
                color: #5f6368;
                font-family: 'Inter', sans-serif;
                line-height: 1.5;
            }

            .danger-confirmation-actions {
                padding: 16px 24px 12px 24px;
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            /* Change Password Popup Specific Styles */
            .change-password-header {
                padding: 24px 24px 16px 24px;
                border-bottom: 1px solid #f0f0f0;
            }

            .change-password-title {
                margin: 0 0 4px 0;
                font-size: 20px;
                font-weight: 600;
                color: #202124;
                font-family: 'Inter', sans-serif;
            }

            .change-password-subtitle {
                margin: 0;
                font-size: 14px;
                color: #5f6368;
                font-family: 'Inter', sans-serif;
            }

            .change-password-body {
                padding: 24px;
            }

            .change-password-form {
                display: flex;
                flex-direction: column;
            }

            .change-password-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 8px;
            }

            /* Delete Account Popup Specific Styles */
            .delete-account-header {
                padding: 24px 24px 16px 24px;
                border-bottom: 1px solid #f0f0f0;
            }

            .delete-account-title {
                margin: 0 0 4px 0;
                font-size: 20px;
                font-weight: 600;
                color: #ff4757;
                font-family: 'Inter', sans-serif;
            }

            .delete-account-subtitle {
                margin: 0;
                font-size: 14px;
                color: #5f6368;
                font-family: 'Inter', sans-serif;
                line-height: 1.5;
            }

            .delete-account-body {
                padding: 24px;
            }

            .delete-account-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .delete-account-warning {
                padding: 16px;
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                color: #856404;
                font-size: 14px;
                line-height: 1.5;
            }

            .delete-account-warning p {
                margin: 0;
            }

            .delete-account-warning strong {
                font-weight: 600;
                color: #6f5500;
            }

            .delete-account-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 8px;
            }

            /* Button disabled state */
            .danger-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                pointer-events: none;
            }

            /* Responsive Design for Danger Popups */
            @media (max-width: 768px) {
                .danger-confirmation-content,
                .change-password-content,
                .delete-account-content {
                    max-width: 95%;
                    margin: 5vh auto;
                }
                
                .danger-confirmation-actions,
                .change-password-actions,
                .delete-account-actions {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .danger-btn {
                    width: 100%;
                }
            }
            
            @media (max-width: 480px) {
                .danger-confirmation-header,
                .change-password-header,
                .delete-account-header {
                    padding: 20px 20px 12px 20px;
                }
                
                .change-password-body,
                .delete-account-body {
                    padding: 20px;
                }
                
                .danger-confirmation-actions {
                    padding: 16px 20px 20px 20px;
                }
                
                .danger-confirmation-title,
                .change-password-title,
                .delete-account-title {
                    font-size: 18px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * SECTION: Authentication Actions
     */
    async function handleLogout() {
        try {
            await window.authAPI.logout();
            hideUserProfile(); // Close the profile popup
            toast.info('Signed Out', 'You have been successfully signed out');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout Error', 'An error occurred during logout');
            // Still close popup and update UI even if API call fails
            hideUserProfile();
        }
    }

    async function handleLogoutAll() {
        try {
            await window.authAPI.logout(true); // Pass true to logout from all devices
            hideUserProfile(); // Close the profile popup
            toast.info('Signed Out from All Devices', 'You have been signed out from all devices');
        } catch (error) {
            console.error('Logout all error:', error);
            toast.error('Logout Error', 'An error occurred during logout');
            // Still close popup and update UI even if API call fails
            hideUserProfile();
        }
    }

    /**
     * SECTION: Danger Zone Confirmation Popups
     */
    
    // Create confirmation popup HTML
    function createConfirmationPopupHTML() {
        const confirmationHTML = `
            <div class="danger-confirmation-popup" id="danger-confirmation-popup">
                <div class="danger-confirmation-content">
                    <button class="close-danger-popup" id="close-danger-confirmation" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="danger-confirmation-header">
                        <h2 class="danger-confirmation-title" id="danger-confirmation-title">Confirm Action</h2>
                        <p class="danger-confirmation-message" id="danger-confirmation-message">Are you sure you want to perform this action?</p>
                    </div>
                    
                    <div class="danger-confirmation-actions">
                        <button class="danger-btn secondary" id="danger-cancel-btn">Cancel</button>
                        <button class="danger-btn primary" id="danger-confirm-btn">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    }
    
    // Create change password popup HTML
    function createChangePasswordPopupHTML() {
        const changePasswordHTML = `
            <div class="change-password-popup" id="change-password-popup">
                <div class="change-password-content">
                    <button class="close-danger-popup" id="close-change-password" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="change-password-header">
                        <h2 class="change-password-title">Change Password</h2>
                        <p class="change-password-subtitle">Enter your current password and choose a new one</p>
                    </div>
                    
                    <div class="change-password-body">
                        <form class="change-password-form" id="change-password-form" novalidate>
                            <div class="auth-input-group">
                                <input type="password" class="auth-input" id="current-password" 
                                       required="required" placeholder="current password">
                                <span class="auth-span">Current Password</span>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="password" class="auth-input" id="new-password" 
                                       required="required" placeholder="new password">
                                <span class="auth-span">New Password</span>
                            </div>
                            
                            <div class="change-password-actions">
                                <button type="button" class="danger-btn secondary" id="cancel-password-change">Cancel</button>
                                <button type="submit" class="danger-btn primary" id="confirm-password-change">Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', changePasswordHTML);
    }
    
    // Create delete account popup HTML
    function createDeleteAccountPopupHTML() {
        const deleteAccountHTML = `
            <div class="delete-account-popup" id="delete-account-popup">
                <div class="delete-account-content">
                    <button class="close-danger-popup" id="close-delete-account" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="delete-account-header">
                        <h2 class="delete-account-title">Delete Account</h2>
                        <p class="delete-account-subtitle">This action cannot be undone. This will permanently delete your account and all associated data.</p>
                    </div>
                    
                    <div class="delete-account-body">
                        <form class="delete-account-form" id="delete-account-form" novalidate>
                            <div class="delete-account-warning">
                                <p>Please type <strong>delete my own account: <span id="delete-username-display"></span></strong> to confirm:</p>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="text" class="auth-input" id="delete-confirmation-input" 
                                       required="required" placeholder="delete my own account: your-username">
                                <span class="auth-span">Type confirmation text</span>
                            </div>
                            
                            <div class="delete-account-actions">
                                <button type="button" class="danger-btn secondary" id="cancel-account-deletion">Cancel</button>
                                <button type="submit" class="danger-btn primary" id="confirm-account-deletion" disabled>Delete Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', deleteAccountHTML);
    }
    
    /**
     * SECTION: Popup Display Functions
     */
    
    // Show confirmation popup
    function showConfirmationPopup({ title, message, confirmText, confirmClass, onConfirm }) {
        const popup = document.getElementById('danger-confirmation-popup');
        const titleEl = document.getElementById('danger-confirmation-title');
        const messageEl = document.getElementById('danger-confirmation-message');
        const confirmBtn = document.getElementById('danger-confirm-btn');
        const cancelBtn = document.getElementById('danger-cancel-btn');
        const closeBtn = document.getElementById('close-danger-confirmation');
        
        // Set content
        titleEl.textContent = title;
        messageEl.textContent = message;
        confirmBtn.textContent = confirmText;
        confirmBtn.className = confirmClass;
        
        // Show popup
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Event handlers
        const handleConfirm = async () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';
            
            try {
                await onConfirm();
                hideConfirmationPopup();
            } catch (error) {
                console.error('Action failed:', error);
                toast.error('Error', error.message || 'Action failed');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = confirmText;
            }
        };
        
        const handleCancel = () => hideConfirmationPopup();
        const handleClose = () => hideConfirmationPopup();
        const handleEscape = (e) => {
            if (e.key === 'Escape') hideConfirmationPopup();
        };
        const handleClickOutside = (e) => {
            if (e.target === popup) hideConfirmationPopup();
        };
        
        // Add event listeners
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleClose);
        document.addEventListener('keydown', handleEscape);
        popup.addEventListener('click', handleClickOutside);
        
        // Store cleanup function
        popup._cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleClose);
            document.removeEventListener('keydown', handleEscape);
            popup.removeEventListener('click', handleClickOutside);
        };
    }
    
    // Hide confirmation popup
    function hideConfirmationPopup() {
        const popup = document.getElementById('danger-confirmation-popup');
        const content = popup.querySelector('.danger-confirmation-content');
        
        content.classList.add('closing');
        popup.classList.add('closing');
        
        setTimeout(() => {
            popup.classList.remove('active', 'closing');
            content.classList.remove('closing');
            document.body.style.overflow = '';
            
            // Cleanup event listeners
            if (popup._cleanup) {
                popup._cleanup();
                delete popup._cleanup;
            }
        }, 300);
    }
    
    // Show change password popup
    function showChangePasswordPopup() {
        const popup = document.getElementById('change-password-popup');
        const form = document.getElementById('change-password-form');
        const closeBtn = document.getElementById('close-change-password');
        const cancelBtn = document.getElementById('cancel-password-change');
        
        // Clear form
        form.reset();
        clearPasswordErrors();
        
        // Show popup
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('current-password').focus();
        }, 300);
        
        // Event handlers
        const handleClose = () => hideChangePasswordPopup();
        const handleCancel = () => hideChangePasswordPopup();
        const handleSubmit = (e) => {
            e.preventDefault();
            handlePasswordChange();
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') hideChangePasswordPopup();
        };
        const handleClickOutside = (e) => {
            if (e.target === popup) hideChangePasswordPopup();
        };
        
        // Add event listeners
        closeBtn.addEventListener('click', handleClose);
        cancelBtn.addEventListener('click', handleCancel);
        form.addEventListener('submit', handleSubmit);
        document.addEventListener('keydown', handleEscape);
        popup.addEventListener('click', handleClickOutside);
        
        // Setup input validation
        setupPasswordInputValidation();
        
        // Store cleanup function
        popup._cleanup = () => {
            closeBtn.removeEventListener('click', handleClose);
            cancelBtn.removeEventListener('click', handleCancel);
            form.removeEventListener('submit', handleSubmit);
            document.removeEventListener('keydown', handleEscape);
            popup.removeEventListener('click', handleClickOutside);
        };
    }
    
    // Hide change password popup
    function hideChangePasswordPopup() {
        const popup = document.getElementById('change-password-popup');
        const content = popup.querySelector('.change-password-content');
        
        content.classList.add('closing');
        popup.classList.add('closing');
        
        setTimeout(() => {
            popup.classList.remove('active', 'closing');
            content.classList.remove('closing');
            document.body.style.overflow = '';
            
            // Cleanup event listeners
            if (popup._cleanup) {
                popup._cleanup();
                delete popup._cleanup;
            }
        }, 300);
    }
    
    // Show delete account popup
    function showDeleteAccountPopup() {
        const popup = document.getElementById('delete-account-popup');
        const form = document.getElementById('delete-account-form');
        const closeBtn = document.getElementById('close-delete-account');
        const cancelBtn = document.getElementById('cancel-account-deletion');
        const confirmBtn = document.getElementById('confirm-account-deletion');
        const input = document.getElementById('delete-confirmation-input');
        const usernameDisplay = document.getElementById('delete-username-display');
        
        // Get current username
        const profile = window.authAPI?.getCurrentProfile();
        const username = profile?.username || 'unknown';
        const requiredText = `delete my own account: ${username}`;
        
        // Set username in display
        usernameDisplay.textContent = username;
        
        // Clear form
        form.reset();
        clearDeleteErrors();
        confirmBtn.disabled = true;
        
        // Show popup
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus input
        setTimeout(() => {
            input.focus();
        }, 300);
        
        // Event handlers
        const handleClose = () => hideDeleteAccountPopup();
        const handleCancel = () => hideDeleteAccountPopup();
        const handleSubmit = (e) => {
            e.preventDefault();
            handleAccountDeletion();
        };
        const handleInput = () => {
            const inputValue = input.value.trim();
            confirmBtn.disabled = inputValue !== requiredText;
            
            // Clear errors when user types
            if (input.classList.contains('input-error')) {
                removeDeleteError(input);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') hideDeleteAccountPopup();
        };
        const handleClickOutside = (e) => {
            if (e.target === popup) hideDeleteAccountPopup();
        };
        
        // Add event listeners
        closeBtn.addEventListener('click', handleClose);
        cancelBtn.addEventListener('click', handleCancel);
        form.addEventListener('submit', handleSubmit);
        input.addEventListener('input', handleInput);
        document.addEventListener('keydown', handleEscape);
        popup.addEventListener('click', handleClickOutside);
        
        // Store cleanup function
        popup._cleanup = () => {
            closeBtn.removeEventListener('click', handleClose);
            cancelBtn.removeEventListener('click', handleCancel);
            form.removeEventListener('submit', handleSubmit);
            input.removeEventListener('input', handleInput);
            document.removeEventListener('keydown', handleEscape);
            popup.removeEventListener('click', handleClickOutside);
        };
    }
    
    // Hide delete account popup
    function hideDeleteAccountPopup() {
        const popup = document.getElementById('delete-account-popup');
        const content = popup.querySelector('.delete-account-content');
        
        content.classList.add('closing');
        popup.classList.add('closing');
        
        setTimeout(() => {
            popup.classList.remove('active', 'closing');
            content.classList.remove('closing');
            document.body.style.overflow = '';
            
            // Cleanup event listeners
            if (popup._cleanup) {
                popup._cleanup();
                delete popup._cleanup;
            }
        }, 300);
    }
    
    /**
     * SECTION: Form Handling Functions
     */
    
    // Handle password change
    async function handlePasswordChange() {
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const submitBtn = document.getElementById('confirm-password-change');
        
        // Validate inputs
        if (!validatePasswordForm()) {
            return;
        }
        
        // Add loading state with spinner (similar to authPopup login button)
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite; margin-right: 8px;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="31.416" stroke-dashoffset="31.416" opacity="0.3"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
            </svg>
            Changing Password...
        `;
        
        // Setup one-time event listener for password update completion
        const handlePasswordUpdateResult = (event) => {
            const { type, isAuthenticated, profile } = event.detail;
            
            if (type === 'profile-updated' && !isAuthenticated) {
                // Password update successful - user has been logged out
                window.removeEventListener('api-event', handlePasswordUpdateResult);
                
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Change Password';
                
                // Close popups
                hideChangePasswordPopup();
                hideUserProfile();
                
                toast.success('Password Changed', 'Your password has been successfully updated. You have been signed out from all devices.');
            }
        };
        
        // Add the event listener
        window.addEventListener('api-event', handlePasswordUpdateResult);
        
        try {
            // Use the new AuthAPI updatePassword method
            await window.authAPI.updatePassword(currentPassword, newPassword);
            
            // Success case is now handled by the event listener above
            // The AuthAPI will emit 'profile-updated' event with isAuthenticated: false
            
        } catch (error) {
            // Remove the event listener since we're handling the error here
            window.removeEventListener('api-event', handlePasswordUpdateResult);
            
            console.error('Password change error:', error);
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Change Password';

            // Show specific error on current password field if it's authentication error
            if (error.status === 401 || error.status === 403 || error.message.includes('原密码错误') || error.message.includes('current password')) {
                showPasswordError(document.getElementById('current-password'), 'Current password is incorrect', "Password Change Failed");
            }
        }
    }
    
    // Handle account deletion
    async function handleAccountDeletion() {
        const input = document.getElementById('delete-confirmation-input');
        const submitBtn = document.getElementById('confirm-account-deletion');
        const profile = window.authAPI?.getCurrentProfile();
        const username = profile?.username || 'unknown';
        const requiredText = `delete my own account: ${username}`;
        
        // Final validation
        if (input.value.trim() !== requiredText) {
            showDeleteError(input, 'Confirmation text does not match');
            return;
        }
        
        // Add loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Deleting Account...';
        
        try {
            await window.authAPI.makeRequest('/api/delete-user', {
                method: 'DELETE'
            }, true);
            toast.info('Account Deleted', 'Your account has been permanently deleted');
            
            // Account deleted, user will be logged out automatically
            hideDeleteAccountPopup();
            hideUserProfile();
            
        } catch (error) {
            console.error('Account deletion error:', error);
            toast.error('Account Deletion Failed', error.message || 'Failed to delete account');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Delete Account';
        }
    }
    
    /**
     * SECTION: Validation Functions
     */
    
    // Validate password form
    function validatePasswordForm() {
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        let isValid = true;
        
        // Clear previous errors
        clearPasswordErrors();
        
        // Validate current password
        if (!currentPassword) {
            showPasswordError(document.getElementById('current-password'), 'Current password is required', "Password Change Failed");
            isValid = false;
        }
        
        // Validate new password
        if (!newPassword) {
            showPasswordError(document.getElementById('new-password'), 'New password is required', "Password Change Failed");
            isValid = false;
        } else if (newPassword.length < 6) {
            showPasswordError(document.getElementById('new-password'), 'Password must be at least 6 characters', "Password Change Failed");
            isValid = false;
        }
        
        // Check if new password is different from current
        if (currentPassword && newPassword && currentPassword === newPassword) {
            showPasswordError(document.getElementById('new-password'), 'New password must be different from current password', "Password Change Failed");
            isValid = false;
        }
        
        return isValid;
    }
    
    // Setup password input validation
    function setupPasswordInputValidation() {
        const inputs = document.querySelectorAll('#change-password-popup .auth-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (input.classList.contains('input-error')) {
                    removePasswordError(input);
                }
            });
        });
    }
    
    // Show password error
    function showPasswordError(input, message, messageTitle) {
        const inputGroup = input.closest('.auth-input-group');
        const span = inputGroup.querySelector('.auth-span');
        
        // Clear any existing fade-out timer
        if (span._fadeTimer) {
            clearTimeout(span._fadeTimer);
            delete span._fadeTimer;
        }
        
        // Add error style and shake animation to input
        input.classList.add('input-error');

        toast.error(messageTitle, message);
        
        // Remove and reapply animation
        setTimeout(() => {
            input.classList.remove('input-error');
        }, 500);
        
        // Change label content to error message
        span.textContent = message;
        span.style.color = '#ff0000';
        span.classList.add('error');
    }
    
    // Remove password error
    function removePasswordError(input) {
        const inputGroup = input.closest('.auth-input-group');
        const span = inputGroup.querySelector('.auth-span');
        
        // Reset to original label content
        if (span.classList.contains('error')) {
            span.classList.remove('error');
            span.style.color = '';
            
            // Restore original text based on input ID
            const originalTexts = {
                'current-password': 'Current Password',
                'new-password': 'New Password'
            };
            
            span.textContent = originalTexts[input.id] || 'Password';
        }
    }
    
    // Clear all password errors
    function clearPasswordErrors() {
        const inputs = document.querySelectorAll('#change-password-popup .auth-input');
        inputs.forEach(input => {
            input.classList.remove('input-error');
            removePasswordError(input);
        });
    }
    
    // Show delete error
    function showDeleteError(input, message) {
        const inputGroup = input.closest('.auth-input-group');
        const span = inputGroup.querySelector('.auth-span');
        
        // Clear any existing fade-out timer
        if (span._fadeTimer) {
            clearTimeout(span._fadeTimer);
            delete span._fadeTimer;
        }
        
        // Add error style and shake animation to input
        input.classList.add('input-error');
        
        // Remove and reapply animation
        setTimeout(() => {
            input.classList.remove('input-error');
        }, 500);
        
        // Change label content to error message
        span.textContent = message;
        span.style.color = '#ff0000';
        span.classList.add('error');
    }
    
    // Remove delete error
    function removeDeleteError(input) {
        const inputGroup = input.closest('.auth-input-group');
        const span = inputGroup.querySelector('.auth-span');
        
        // Reset to original label content
        if (span.classList.contains('error')) {
            span.classList.remove('error');
            span.style.color = '';
            span.textContent = 'Type confirmation text';
        }
    }
    
    // Clear delete errors
    function clearDeleteErrors() {
        const input = document.getElementById('delete-confirmation-input');
        if (input) {
            input.classList.remove('input-error');
            removeDeleteError(input);
        }
    }

    /**
     * SECTION: Add Error Animation Styles for Danger Popups
     */
    function addDangerPopupErrorStyles() {
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
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .auth-input.input-error {
                animation: inputShake 0.4s;
                border-color: #ff0000 !important;
            }
            
            .auth-span.error {
                color: #ff0000 !important;
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
    }

    /**
     * SECTION: Event Listeners Setup
     */
    function initProfileEventListeners() {
        const profilePopup = document.getElementById('user-profile-popup');
        const closeBtn = document.getElementById('close-profile-popup');
        
        // Close popup handlers
        closeBtn.addEventListener('click', hideUserProfile);
        
        // Close popup when clicking outside
        profilePopup.addEventListener('click', function(e) {
            if (e.target === profilePopup) {
                hideUserProfile();
            }
        });
        
        // ESC key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && profilePopup.classList.contains('active')) {
                hideUserProfile();
            }
        });
        
        // Danger zone button handlers
        document.getElementById('change-password-btn').addEventListener('click', function() {
            showChangePasswordPopup();
        });
        
        document.getElementById('logout-btn').addEventListener('click', function() {
            showConfirmationPopup({
                title: 'Sign Out',
                message: 'Are you sure you want to sign out from this device?',
                confirmText: 'Sign Out',
                confirmClass: 'danger-btn secondary',
                onConfirm: handleLogout
            });
        });
        
        document.getElementById('logout-all-btn').addEventListener('click', function() {
            showConfirmationPopup({
                title: 'Sign Out from All Devices',
                message: 'Are you sure you want to sign out from all devices and sessions?',
                confirmText: 'Sign Out from All',
                confirmClass: 'danger-btn secondary',
                onConfirm: handleLogoutAll
            });
        });
        
        document.getElementById('delete-account-btn').addEventListener('click', function() {
            showDeleteAccountPopup();
        });
    }
    
    /**
     * SECTION: Popup Display Functions
     */
    async function showUserProfile() {
        const profilePopup = document.getElementById('user-profile-popup');
        
        // 首先显示弹窗并加载缓存的数据
        profilePopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 立即从 AuthAPI 缓存加载现有数据
        loadCachedProfileData();
        
        // 然后在后台刷新数据
        await refreshProfileData();
    }
    
    function hideUserProfile() {
        const profilePopup = document.getElementById('user-profile-popup');
        const profileContent = profilePopup.querySelector('.user-profile-content');
        
        // Add closing animation
        profileContent.classList.add('closing');
        
        // Wait for animation to complete
        setTimeout(() => {
            profilePopup.classList.remove('active');
            profileContent.classList.remove('closing');
            document.body.style.overflow = '';
        }, 300);
    }
    
    /**
     * SECTION: Data Loading Functions
     */
    function loadCachedProfileData() {
        // 立即从AuthAPI缓存加载现有数据，不等待网络请求
        if (!window.authAPI || !window.authAPI.isAuthenticated()) {
            showProfileError("User not authenticated. Please log in.");
            return;
        }

        const cachedProfile = window.authAPI.getCurrentProfile();
        if (cachedProfile) {
            updateProfileDisplay(cachedProfile);
        } else {
            // 显示加载状态
            updateProfileDisplay({
                name: 'Loading...',
                username: 'loading',
                user_id: 'Loading...',
                email: 'Loading...',
                user_group: [] // 空数组，会显示默认的 user 徽章
            });
        }
    }

    async function refreshProfileData() {
        // 在后台刷新数据
        if (!window.authAPI || !window.authAPI.isAuthenticated()) {
            return;
        }

        try {
            // 触发 profile 刷新，但不等待结果
            // AuthAPI 会发送 profile-updated 事件，我们通过事件监听器更新 UI
            await window.authAPI.getProfile();
        } catch (error) {
            console.warn('Background profile refresh failed:', error);
            // 不显示错误，因为我们已经有缓存数据了
        }
    }

    function updateProfileDisplay(data) {
        // Update textual information
        document.getElementById('profile-name').textContent = data.name || 'N/A';
        document.getElementById('profile-username').textContent = data.username ? `@${data.username}` : 'N/A';
        document.getElementById('profile-user-id').textContent = data.user_id || 'N/A';
        document.getElementById('profile-email').textContent = data.email || 'N/A';
        // Mock some data as it's not in the typical profile response from authAPI
        document.getElementById('profile-account-status').innerHTML = `<span class="status-icon activated">✓</span> Activated`;
        document.getElementById('profile-last-active').textContent = data.last_active || new Date().toLocaleString();

        // Update user groups
        updateUserGroups(data.user_group);

        // Update avatar using AuthAPI cache
        updateProfileAvatar(data);
    }

    function updateUserGroups(userGroups) {
        const userGroupsContainer = document.querySelector('#profile-user-groups .user-groups-container');
        
        if (!userGroupsContainer) {
            console.warn('User groups container not found');
            return;
        }

        // Clear existing badges
        userGroupsContainer.innerHTML = '';

        if (Array.isArray(userGroups) && userGroups.length > 0) {
            // Create badges for each user group
            userGroups.forEach(group => {
                const badge = document.createElement('span');
                badge.className = `user-group-badge ${group.toLowerCase()}`;
                badge.textContent = group;
                userGroupsContainer.appendChild(badge);
            });
            console.log('User groups updated:', userGroups);
        } else {
            // No groups or invalid data, show default
            const badge = document.createElement('span');
            badge.className = 'user-group-badge user';
            badge.textContent = 'user';
            userGroupsContainer.appendChild(badge);
            console.log('No user groups found, showing default "user" group');
        }
    }

    function updateProfileAvatar(data) {
        const profileAvatarDiv = document.getElementById('profile-avatar');
        const userId = data.user_id || data.id || data.username;
        
        if (!profileAvatarDiv) return;
        
        if (userId && userId !== 'Loading...' && window.authAPI) {
            const cachedAvatar = window.authAPI.getAvatar(userId);
            if (cachedAvatar) {
                profileAvatarDiv.innerHTML = cachedAvatar;
            } else {
                // 头像不在缓存中，显示占位符
                profileAvatarDiv.innerHTML = '<svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ccc"/></svg>';
                console.log('Avatar not in cache for user:', userId);
            }
        } else {
            // 显示加载占位符
            profileAvatarDiv.innerHTML = '<svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ddd"/></svg>';
        }
    }


    function showProfileError(message = "Could not load profile.") {
        // Show error state or fallback data
        console.error('Profile error:', message);
        updateProfileDisplay({
            name: 'Error',
            username: 'error',
            user_id: 'Error loading profile',
            email: 'Error',
            user_group: [] // 空数组，会显示默认的 user 徽章
        });
    }

    /**
     * SECTION: Event Listeners for Profile Updates
     */
    function setupProfileEventListeners() {
        // 监听 AuthAPI 的 profile-updated 事件
        window.addEventListener('api-event', function(event) {
            const { type, isAuthenticated, profile, success, error, message } = event.detail;
            
            if (type === 'profile-updated') {
                // 检查 profile 弹窗是否打开
                const profilePopup = document.getElementById('user-profile-popup');
                if (profilePopup && profilePopup.classList.contains('active')) {
                    if (isAuthenticated && profile) {
                        // 更新显示的 profile 数据
                        updateProfileDisplay(profile);
                    } else {
                        // 认证失败或登出，关闭弹窗
                        hideUserProfile();
                    }
                }
            }
        });
    }
    
    /**
     * SECTION: Public API
     * Expose functions for external use
     */
    window.userProfile = {
        show: showUserProfile,
        hide: hideUserProfile,
        refreshProfile: refreshProfileData
    };
});
