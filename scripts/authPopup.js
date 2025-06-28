/**
 * Authentication Popup System
 * 
 * Author: GitHub Copilot
 * Date: 2025-06-13
 * 
 * This module provides a comprehensive authentication popup system with support for both
 * login and registration forms. Key features include:
 * 
 * - Glassmorphism design with backdrop blur effects
 * - Smooth transitions between login and register forms
 * - Form validation and accessibility features
 * - Modern UI with responsive design
 * - Integration with existing site design patterns
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * SECTION: Initialize Authentication Popup System
     */
    initAuthPopupSystem();
    
    function initAuthPopupSystem() {
        // Create the popup HTML structure
        createAuthPopupHTML();
        
        // Add error animation styles
        addAuthErrorStyles();
        
        // Initialize event listeners
        initAuthEventListeners();
        
        // Add auth buttons to navbar if they don't exist
        setupAuthButtons();
        
        // Initialize label content storage
        initLabelStorage();
        
        // Listen for auth events from authAPI instead of checking directly
        setupAuthEventListeners();
    }
    
    // Store original label content for restoration
    const originalAuthLabels = new Map();
    
    /**
     * SECTION: Label Storage System (Similar to main page)
     */
    function initLabelStorage() {
        // Wait for DOM to be ready, then save original labels
        setTimeout(() => {
            saveOriginalAuthLabels();
        }, 100);
    }
    
    function saveOriginalAuthLabels() {
        document.querySelectorAll('.auth-input-group').forEach(group => {
            const input = group.querySelector('.auth-input');
            const span = group.querySelector('.auth-span');
            if (input && span) {
                originalAuthLabels.set(input.id, span.textContent);
            }
        });
    }
    
    /**
     * SECTION: Add Error Animation Styles (Same as formValidation.js)
     */
    function addAuthErrorStyles() {
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
     * SECTION: Create Popup HTML Structure
     */
    function createAuthPopupHTML() {
        const authPopupHTML = `
            <div class="auth-popup" id="auth-popup">
                <div class="auth-popup-content">
                    <button class="auth-close-popup" id="auth-close-popup" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    
                    <div class="auth-header">
                        <h2 class="auth-title">Welcome to IntraStream</h2>
                        <p class="auth-subtitle">Sign in to access your streaming portal</p>
                        
                        <div class="auth-tabs">
                            <button class="auth-tab active" id="login-tab" data-form="login">Sign In</button>
                            <button class="auth-tab" id="register-tab" data-form="register">Sign Up</button>
                        </div>
                    </div>
                    
                    <div class="auth-body">
                        <!-- Login Form -->
                        <form class="auth-form active" id="login-form" novalidate>
                            <div class="auth-input-group">
                                <input type="text" class="auth-input" id="login-username" 
                                       required="required" placeholder="user@example.com">
                                <span class="auth-span">Username or Email</span>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="password" class="auth-input" id="login-password" 
                                       required="required" placeholder="password">
                                <span class="auth-span">Password</span>
                            </div>
                            
                            <div class="auth-checkbox-group">
                                <input type="checkbox" class="auth-checkbox" id="remember-me">
                                <label for="remember-me" class="auth-checkbox-label">Remember me</label>
                            </div>
                            
                            <button type="submit" class="auth-submit-btn">Sign In</button>
                        </form>
                        
                        <!-- Register Form -->
                        <form class="auth-form" id="register-form" novalidate>
                            <div class="auth-input-group">
                                <input type="text" class="auth-input" id="register-username" 
                                       required="required" placeholder="username123">
                                <span class="auth-span">Username</span>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="text" class="auth-input" id="register-name" 
                                       required="required" placeholder="John Doe">
                                <span class="auth-span">Full Name</span>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="text" class="auth-input" id="register-email"
                                       required="required" placeholder="user@example.com">
                                <span class="auth-span">Email (Optional)</span>
                            </div>
                            
                            <div class="auth-input-group">
                                <input type="password" class="auth-input" id="register-password" 
                                       required="required" placeholder="password">
                                <span class="auth-span">Password</span>
                            </div>
                            
                            <button type="submit" class="auth-submit-btn">Create Account</button>
                        </form>
                    </div>
                    
                    <div class="auth-footer">
                        <p class="auth-footer-text">
                            <span id="auth-footer-question">Don't have an account?</span>
                            <a href="#" class="auth-footer-link" id="auth-footer-link">Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add the popup to the body
        document.body.insertAdjacentHTML('beforeend', authPopupHTML);
    }
    
    /**
     * SECTION: Setup Authentication Buttons in Navbar
     */
    function setupAuthButtons() {
        const authSection = document.querySelector('.auth-section');
        if (authSection && !authSection.querySelector('.auth-login-btn')) {
            const authButtonsHTML = `
                <button class="auth-login-btn" id="auth-login-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H3" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Sign In
                </button>
            `;
            authSection.innerHTML = authButtonsHTML;
            
            // Add styles for auth button
            addAuthButtonStyles();
        }
    }
    
    /**
     * SECTION: Add Auth Button Styles
     */
    function addAuthButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .auth-login-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'Inter', sans-serif;
            }
            
            .auth-login-btn:hover {
                background-color: #e63946;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
            }
            
            .auth-login-btn svg {
                width: 16px;
                height: 16px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * SECTION: Event Listeners Setup
     */
    function initAuthEventListeners() {
        // Get DOM elements
        const authPopup = document.getElementById('auth-popup');
        const authCloseBtn = document.getElementById('auth-close-popup');
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authFooterLink = document.getElementById('auth-footer-link');
        const authFooterQuestion = document.getElementById('auth-footer-question');
        
        // Login button click handler
        document.addEventListener('click', function(e) {
            if (e.target.closest('#auth-login-btn')) {
                showAuthPopup('login');
            }
        });
        
        // Close popup handlers
        authCloseBtn.addEventListener('click', hideAuthPopup);
        
        // Close popup when clicking outside
        authPopup.addEventListener('click', function(e) {
            if (e.target === authPopup) {
                hideAuthPopup();
            }
        });
        
        // ESC key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && authPopup.classList.contains('active')) {
                hideAuthPopup();
            }
        });
        
        // Tab switching
        loginTab.addEventListener('click', () => switchAuthForm('login'));
        registerTab.addEventListener('click', () => switchAuthForm('register'));
        
        // Footer link handler
        authFooterLink.addEventListener('click', function(e) {
            e.preventDefault();
            const currentForm = document.querySelector('.auth-form.active').id;
            if (currentForm === 'login-form') {
                switchAuthForm('register');
            } else {
                switchAuthForm('login');
            }
        });
        
        // Form submission handlers - prevent default HTML5 validation
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default to avoid HTML5 validation
            handleLoginSubmit(e);
        });
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default to avoid HTML5 validation
            handleRegisterSubmit(e);
        });
        
        // Disable HTML5 validation on all auth inputs
        document.querySelectorAll('.auth-input').forEach(input => {
            input.setAttribute('novalidate', '');
            input.addEventListener('invalid', function(e) {
                e.preventDefault(); // Prevent HTML5 validation bubbles
            });
        });
        
        // Input validation handlers (copied from formValidation.js)
        setupAuthInputValidation();
    }
    
    /**
     * SECTION: Popup Display Functions
     */
    function showAuthPopup(formType = 'login') {
        const authPopup = document.getElementById('auth-popup');
        authPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Switch to the specified form
        switchAuthForm(formType);
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.querySelector('.auth-form.active .auth-input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }
    
    function hideAuthPopup() {
        const authPopup = document.getElementById('auth-popup');
        const authPopupContent = authPopup.querySelector('.auth-popup-content');
        
        // 同时添加背景和内容的退场动画类
        authPopup.classList.add('closing');
        authPopupContent.classList.add('closing');
        
        // 等待动画完成后再隐藏弹窗
        setTimeout(() => {
            authPopup.classList.remove('active', 'closing');
            document.body.style.overflow = '';
            
            // 移除动画类为下次显示做准备
            authPopupContent.classList.remove('closing');
            
            // Clear form data
            clearForms();
        }, 300); // 与 CSS 动画时间一致 (0.3s)
    }
    
    /**
     * SECTION: Form Switching Functions
     */
    function switchAuthForm(formType) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authFooterQuestion = document.getElementById('auth-footer-question');
        const authFooterLink = document.getElementById('auth-footer-link');
        const authSubtitle = document.querySelector('.auth-subtitle');
        const authTabs = document.querySelector('.auth-tabs');
        
        // Clear previous states
        [loginTab, registerTab].forEach(tab => tab.classList.remove('active'));
        [loginForm, registerForm].forEach(form => {
            form.classList.remove('active', 'auth-form-enter', 'auth-form-exit');
        });
        
        if (formType === 'login') {
            loginTab.classList.add('active');
            loginForm.classList.add('active', 'auth-form-enter');
            authSubtitle.textContent = 'Sign in to access your streaming portal';
            authFooterQuestion.textContent = "Don't have an account?";
            authFooterLink.textContent = 'Sign up';
            // 移除register状态类，滑块回到左侧
            authTabs.classList.remove('register-active');
        } else {
            registerTab.classList.add('active');
            registerForm.classList.add('active', 'auth-form-enter');
            authSubtitle.textContent = 'Create your account to get started';
            authFooterQuestion.textContent = 'Already have an account?';
            authFooterLink.textContent = 'Sign in';
            // 添加register状态类，滑块移动到右侧
            authTabs.classList.add('register-active');
        }
        
        // Clear form data when switching
        clearForms();
        
        // Re-save original labels after form switch
        setTimeout(() => {
            saveOriginalAuthLabels();
        }, 100);
    }
    
    /**
     * SECTION: Form Handling Functions
     */
    async function handleLoginSubmit(e) {
        // e.preventDefault() already called in event listener
        
        const submitBtn = e.target.querySelector('.auth-submit-btn');
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Validate all inputs using the same pattern as formValidation.js
        const validationResult = validateAuthForm('login');
        if (!validationResult.isValid) {
            // Show validation errors with toast messages (same as formValidation.js)
            if (validationResult.errors.length > 0) {
                validationResult.errors.forEach((error, index) => {
                    setTimeout(() => {
                        toast.error(`${error.field} Validation Failed`, error.error.replace('Error: ', ''));
                    }, index * 300);
                });
            }
            return;
        }
        
        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Signing In...';
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Make actual API call using new AuthAPI
        try {
            await window.authAPI.login(username, password, rememberMe);
            // Success will be handled by the profile-updated event listener
            hideAuthPopup();
            toast.success('Welcome Back!', 'Successfully signed in');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login Failed', error.message || 'An unexpected error occurred');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Sign In';
        }
    }
    
    async function handleRegisterSubmit(e) {
        // e.preventDefault() already called in event listener
        
        const submitBtn = e.target.querySelector('.auth-submit-btn');
        const usernameInput = document.getElementById('register-username');
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        
        // Validate all inputs using the same pattern as formValidation.js
        const validationResult = validateAuthForm('register');
        if (!validationResult.isValid) {
            // Show validation errors with toast messages (same as formValidation.js)
            if (validationResult.errors.length > 0) {
                validationResult.errors.forEach((error, index) => {
                    setTimeout(() => {
                        toast.error(`${error.field} Validation Failed`, error.error.replace('Error: ', ''));
                    }, index * 300);
                });
            }
            return;
        }
        
        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating Account...';
        
        const username = usernameInput.value.trim();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Make actual API call using makeRequest directly
        try {
            const registerData = {
                username: username,
                name: name,
                password: password
            };
            
            // Only include email if it's not empty
            if (email) {
                registerData.email = email;
            }
            
            const result = await window.authAPI.makeRequest('/api/register', {
                method: 'POST',
                body: registerData
            }, false); // No auth required for registration
            
            if (result.success) {
                toast.success('Account Created', result.message || `Welcome to IntraStream, ${name}!`);
                
                // Clear the registration form
                clearForms();
                
                // Switch to login form instead of auto-login for security
                setTimeout(() => {
                    switchAuthForm('login');
                    
                    // Pre-fill username in login form for convenience
                    const loginUsernameInput = document.getElementById('login-username');
                    if (loginUsernameInput) {
                        loginUsernameInput.value = username;
                    }
                    
                    // Show success message encouraging manual login
                    toast.info('Please Sign In', 'Your account has been created successfully. Please sign in with your credentials.');
                }, 500);
                
            } else {
                const errorMessage = result.message || 'Registration failed';
                toast.error('Registration Failed', errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration Failed', 'An unexpected error occurred');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Create Account';
        }
    }
    
    /**
     * SECTION: Validation Functions (Exact copy from formValidation.js)
     */
    // Copy exact form validation logic from formValidation.js
    function validateAuthForm(formType) {
        let isAllValid = true;
        const errors = [];
        
        if (formType === 'login') {
            // Validate login form (similar to formValidation.js structure)
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');
            
            // Validate username/email field
            const usernameResult = validateAuthInput(usernameInput, function(value) {
                // Can be either username or email, so check both formats
                if (validators.username(value) === true || validators.email(value) === true) {
                    return true;
                } else {
                    return "Error: Must be a valid username or email address";
                }
            });
            
            if (!usernameResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getAuthFieldDisplayName(usernameInput),
                    error: usernameResult.error
                });
            }
            
            // Validate password field
            const passwordResult = validateAuthInput(passwordInput, function(value) {
                return value.length >= 6 ? true : "Error: Password must be at least 6 characters";
            });
            
            if (!passwordResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getAuthFieldDisplayName(passwordInput),
                    error: passwordResult.error
                });
            }
            
        } else if (formType === 'register') {
            // Validate register form (similar to formValidation.js structure)
            const usernameInput = document.getElementById('register-username');
            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const passwordInput = document.getElementById('register-password');
            
            // Validate username
            const usernameResult = validateAuthInput(usernameInput, validators.username);
            if (!usernameResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getAuthFieldDisplayName(usernameInput),
                    error: usernameResult.error
                });
            }
            
            // Validate full name
            const nameResult = validateAuthInput(nameInput, function(value) {
                return value.length >= 2 ? true : "Error: Full name must be at least 2 characters";
            });
            if (!nameResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getAuthFieldDisplayName(nameInput),
                    error: nameResult.error
                });
            }
            
            // Validate email (optional but if provided must be valid) - special handling like formValidation.js
            const emailValue = emailInput.value.trim();
            if (emailValue) {
                // Only validate if email is provided
                const emailResult = validateAuthInput(emailInput, validators.email);
                if (!emailResult.isValid) {
                    isAllValid = false;
                    errors.push({
                        field: getAuthFieldDisplayName(emailInput),
                        error: emailResult.error
                    });
                }
            } else {
                // Clear any existing errors if email is empty (since it's optional)
                removeAuthError(emailInput);
            }
            
            // Validate password
            const passwordResult = validateAuthInput(passwordInput, function(value) {
                return value.length >= 6 ? true : "Error: Password must be at least 6 characters";
            });
            if (!passwordResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getAuthFieldDisplayName(passwordInput),
                    error: passwordResult.error
                });
            }
        }
        
        return { isValid: isAllValid, errors: errors };
    }
    
    // Copy exact validation logic from formValidation.js
    function validateAuthInput(input, validatorFn) {
        const value = input.value.trim();
        
        // If input is empty, show "Field required" message (same as formValidation.js)
        if (!value) {
            showAuthError(input, "Error: This field is required");
            return { isValid: false, error: "This field cannot be empty" };
        }
        
        // Run validator function (same as formValidation.js)
        const result = validatorFn(value);
        
        if (result !== true) {
            showAuthError(input, result);
            return { isValid: false, error: result };
        }
        
        removeAuthError(input);
        return { isValid: true };
    }
    
    // Function to get display name for input fields (same pattern as formValidation.js)
    function getAuthFieldDisplayName(input) {
        switch(input.id) {
            case 'login-username':
                return 'Username/Email';
            case 'login-password':
                return 'Password';
            case 'register-username':
                return 'Username';
            case 'register-name':
                return 'Full Name';
            case 'register-email':
                return 'Email';
            case 'register-password':
                return 'Password';
            default:
                return 'Input Field';
        }
    }
    
    // Copy exact error handling logic from formValidation.js
    function showAuthError(input, message) {
        // Get the corresponding span tag (same as formValidation.js)
        const inputGroup = input.closest('.auth-input-group');
        const span = inputGroup.querySelector('.auth-span');
        
        // Clear any existing fade-out timer (same as formValidation.js)
        if (span._fadeTimer) {
            clearTimeout(span._fadeTimer);
            delete span._fadeTimer;
        }
        
        // Add error style and shake animation to input (same as formValidation.js)
        input.classList.add('input-error');
        
        // Remove and reapply animation (same as formValidation.js)
        setTimeout(() => {
            input.classList.remove('input-error');
            setTimeout(() => {
                if (span.classList.contains('error')) {
                    input.classList.add('input-error');
                }
            }, 10);
        }, 500);
        
        // Change label content to error message (same as formValidation.js)
        span.textContent = message;
        span.style.color = '#ff0000';
        span.classList.add('error');
    }
    
    function removeAuthError(input) {
        // Get the corresponding span tag (same as formValidation.js)
        const inputGroup = input.closest('.auth-input-group');
        const span = inputGroup.querySelector('.auth-span');
        
        // Reset to original label content (same as formValidation.js)
        if (span.classList.contains('error')) {
            span.textContent = originalAuthLabels.get(input.id) || '';
            span.style.color = '';
            span.classList.remove('error');
            input.classList.remove('input-error');
        }
    }
    
    function clearForms() {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.reset();
            // Clear any error states
            form.querySelectorAll('.auth-input').forEach(input => {
                removeAuthError(input);
            });
        });
    }
    
    // Setup input validation handlers (same pattern as formValidation.js)
    function setupAuthInputValidation() {
        // Only keep input listeners for clearing errors when user types (similar to formValidation.js)
        const inputs = document.querySelectorAll('.auth-input');
        
        inputs.forEach(input => {
            // Remove error indicators when input field content changes (same as formValidation.js)
            input.addEventListener('input', function() {
                // Only clear errors when user types, don't validate (same as formValidation.js)
                removeAuthError(this);
            });
            
            // Add Enter key event listener similar to formValidation.js
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent default form submission
                    
                    // Trigger form submission based on which form is active
                    const activeForm = document.querySelector('.auth-form.active');
                    if (activeForm) {
                        const submitBtn = activeForm.querySelector('.auth-submit-btn');
                        if (submitBtn) {
                            submitBtn.click();
                        }
                    }
                }
            });
        });
    }
    
    let currentUserData = null;
    
    function updateAuthState(isLoggedIn, username = '', userData = null) {
        console.log('updateAuthState called with:', isLoggedIn, username, userData);
        const authSection = document.querySelector('.auth-section');
        
        if (isLoggedIn && userData) {
            currentUserData = userData;
            
            // Create profile button HTML
            authSection.innerHTML = `
                <button class="user-profile-btn" id="user-profile-btn" title="User Profile">
                    <div class="user-avatar" id="navbar-user-avatar">
                        <!-- Avatar will be loaded here -->
                    </div>
                    <span class="user-name">${username}</span>
                    <svg class="chevron-down" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `;

            // Get avatar from AuthAPI cache
            const avatarContainer = document.getElementById('navbar-user-avatar');
            const userId = userData.user_id || userData.id || userData.username;
            
            if (avatarContainer && userId && window.authAPI) {
                const cachedAvatar = window.authAPI.getAvatar(userId);
                if (cachedAvatar) {
                    avatarContainer.innerHTML = cachedAvatar;
                } else {
                    // 头像不在缓存中，显示占位符
                    avatarContainer.innerHTML = '<svg width="32" height="32" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ccc"/></svg>';
                    console.log('Avatar not in cache for user:', userId);
                }
            } else if (avatarContainer) {
                // 显示加载占位符
                avatarContainer.innerHTML = '<svg width="32" height="32" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ddd"/></svg>';
                console.log('No userId or authAPI available');
            }
            
            // Add click handler for profile popup
            document.getElementById('user-profile-btn').addEventListener('click', function() {
                if (window.userProfile && window.userProfile.show) {
                    window.userProfile.show();
                } else {
                    console.error('User profile module not loaded');
                }
            });
            
            addUserProfileButtonStyles();
        } else {
            currentUserData = null;
            setupAuthButtons();
        }
    }
    
    function addUserProfileButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .user-profile-btn {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 1rem;
                background-color: white;
                color: var(--dark-color);
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                font-weight: 500;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'Inter', sans-serif;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .user-profile-btn:hover {
                background-color: #f8f9fa;
                border-color: #d0d7de;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                overflow: hidden;
                background: #f0f0f0; /* Minimal background for loading state */
            }
            
            .user-avatar svg {
                width: 100%;
                height: 100%;
                display: block;
                border-radius: 50%;
            }
            
            .user-avatar .avatar-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            .user-name {
                max-width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .chevron-down {
                transition: transform 0.2s ease;
                color: #5f6368;
            }
            
            .user-profile-btn:hover .chevron-down {
                transform: translateY(1px);
            }
            
            @media (max-width: 768px) {
                .user-name {
                    display: none;
                }
                
                .user-profile-btn {
                    padding: 0.5rem;
                    gap: 0;
                }
                
                .chevron-down {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * SECTION: Auth Event Listeners
     */
    function setupAuthEventListeners() {
        // Listen for authentication events from authAPI (now simplified to use only profile-updated)
        window.addEventListener('api-event', function(event) {
            const { type, isAuthenticated, profile, error } = event.detail;
            
            console.log('Auth event received:', { type, isAuthenticated, profile, error });
            
            if (type === 'profile-updated') {
                if (isAuthenticated && profile) {
                    // Login successful - update UI with profile data
                    const displayName = profile.name || profile.username || 'User';
                    updateAuthState(true, displayName, profile);
                } else {
                    // Login failed or logout - show login button
                    updateAuthState(false);
                    if (error) {
                        console.warn('Auth event profile-updated with error:', error);
                    }
                }
            }
        });
    }
    
    /**
     * SECTION: Public API
     * Expose functions for external use
     */
    window.authPopup = {
        show: showAuthPopup,
        hide: hideAuthPopup,
        switchForm: switchAuthForm,
        updateAuthState: updateAuthState,
        getCurrentUserData: () => currentUserData
    };
});
