/**
 * Horizontal Card Switcher System
 * 
 * Author: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * Date: 2024-05-21
 * Copyright (c) 2025 NPL ITP Infrastructure (Development) Group
 * All rights reserved.
 * Distributed under the MIT License.
 * 
 * This script implements a responsive horizontal card switching system with the following features:
 * - Touch-based navigation for mobile devices with horizontal swipe detection
 * - Mouse wheel vertical scrolling mapped to horizontal card navigation
 * - Navigation through UI elements (nav items and indicator dots)
 * - URL state management to maintain card position on page refresh
 * - Handles SVG object touch events
 * - Responsive layout adjustments on window resize
 */

document.addEventListener('DOMContentLoaded', function () {
    /**
     * SECTION: Define Global Variables
     */
    // Define state variables
    let isDragging = false;
    let currentIndex = 0;

    /**
     * SECTION: DOM Element Selection
     */
    // Get DOM elements
    const scroller = document.getElementById('scroller');
    const cards = document.querySelectorAll('.scroller-card');
    const navItems = document.querySelectorAll('.nav-item');
    const indicatorDots = document.querySelectorAll('.indicator-dot');
    
    // Get SVG object element
    const svgObject = document.getElementById('home-animation-svg');
    
    /**
     * SECTION: SVG Touch Layer
     * Add transparent overlay to SVG object to capture touch events
     */
    if (svgObject) {
        const overlayDiv = document.createElement('div');
        overlayDiv.style.position = 'absolute';
        overlayDiv.style.top = '0';
        overlayDiv.style.left = '0';
        overlayDiv.style.width = '100%';
        overlayDiv.style.height = '100%';
        overlayDiv.style.zIndex = '2';
        overlayDiv.id = 'svg-touch-overlay';
        svgObject.parentNode.style.position = 'relative';
        svgObject.parentNode.insertBefore(overlayDiv, svgObject.nextSibling);
        
        // Add touch event listeners to overlay
        addTouchEvents(overlayDiv);
    }

    /**
     * SECTION: Event Listeners Setup
     */
    // Add touch event listeners
    addTouchEvents(scroller);
    
    // Wheel event for horizontal scrolling
    scroller.addEventListener('wheel', handleWheel, { passive: false });    

    // Nav items click
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => goToCard(index));
    });

    // Indicator dots click
    indicatorDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index === 2 && !isLoggedIn) {
                toggleLogin();
                return;
            }
            goToCard(index);
        });
    });
    
    // Helper function: Add touch events
    function addTouchEvents(element) {
        element.addEventListener('touchstart', touchStart, { passive: false });
        element.addEventListener('touchmove', touchMove, { passive: false });
        element.addEventListener('touchend', touchEnd, { passive: false });
    }

    /**
     * SECTION: Card Navigation and UI Update Functions
     */
    function goToCard(index) {
        if (index < 0 || index >= cards.length) return;

        currentIndex = index;
        updateActiveCard();
        updateActiveNav();
        updateActiveIndicator();
        
        // Update URL to maintain state on page refresh using urlParamsManager
        urlParamsManager.updateCardParam(index);

        // Smooth scroll to the selected card
        cards[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }

    /**
     * Update active states for UI elements
     */
    function updateActiveCard() {
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === currentIndex);
        });
    }

    function updateActiveNav() {
        navItems.forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });
    }

    function updateActiveIndicator() {
        indicatorDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    /**
     * SECTION: Touch Screen Event Handling
     */
    function touchStart(e) {        
        // Initialize touch state
        touchStartTime = new Date().getTime();
        touchMoveCount = 0;
        isHorizontalSwipe = false;
        isScrolling = false;
        
        // Record starting position
        if (e.type === 'mousedown') {
            startPosX = e.clientX;
            startPosY = e.clientY;
        } else {
            startPosX = e.touches[0].clientX;
            startPosY = e.touches[0].clientY;
        }
    }

    function touchMove(e) {              
        // Get current touch position
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        // Calculate horizontal and vertical movement distance
        diffX = currentX - startPosX;
        diffY = currentY - startPosY;
        
        // If vertical scrolling is already determined, let the browser handle it
        if (isScrolling) return;

        // Determine swipe direction
        if (touchMoveCount < 3 && !isHorizontalSwipe && !isScrolling) {
            touchMoveCount++;
            // Determine user intent by comparing horizontal and vertical movement
            if (Math.abs(diffX) > Math.abs(diffY) * 1.5) {
                // User intent is horizontal swipe (card switching)
                isHorizontalSwipe = true;
                e.preventDefault();
            } else if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
                // User intent is vertical scrolling
                isScrolling = true;
                return;
            }
            return;
        }
        
        // Handle horizontal swipe
        if (isHorizontalSwipe) {
            e.preventDefault();
            if (!isDragging) {
                prevTranslate = scroller.scrollLeft;
                isDragging = true;
            }
            scroller.scrollLeft = prevTranslate - diffX;
        }
    }

    function touchEnd(e) {        
        // Calculate touch duration
        const touchDuration = new Date().getTime() - touchStartTime;
        // Handle click events
        if (touchDuration < 200 && touchMoveCount < 3 && !isHorizontalSwipe && !isScrolling) {
            return; } // Let browser handle the click
        // If vertical scrolling or not horizontal swiping, don't process
        if (isScrolling || (!isDragging && !isHorizontalSwipe)) return;
        
        e.preventDefault();
        isDragging = false;
        isHorizontalSwipe = false;
        isScrolling = false;
        
        // Switch cards based on swipe direction
        if (diffX < 0 && currentIndex < cards.length - 1) {
            goToCard(currentIndex + 1); // Left swipe
        } else if (diffX > 0 && currentIndex > 0) {
            goToCard(currentIndex - 1); // Right swipe
        }
    }

    /**
     * Multiple Scrollable Parents Detection and Handling Logics
     */
    function findScrollableParent(element) {
        while (element && element !== scroller) {
            const style = window.getComputedStyle(element);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                style.overflowX === 'auto' || style.overflowX === 'scroll') {
                if (element.scrollHeight > element.clientHeight ||
                    element.scrollWidth > element.clientWidth) {
                    return element;
                }
            }
            element = element.parentElement;
        }
        return null;
    }

    function isAtScrollBoundary(element) {
        return {
            top: element.scrollTop === 0,
            bottom: Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
        };
    }

    /**
     * SECTION: Desktop Wheel Event Handling
     * Maps vertical wheel scrolling to horizontal card navigation
     */
    function handleWheel(e) {
        const scrollableElement = findScrollableParent(e.target);
        if (scrollableElement && scrollableElement !== scroller) {
            const boundaries = isAtScrollBoundary(scrollableElement);
            // Only allow page switching if:
            // 1. At top and scrolling up
            // 2. At bottom and scrolling down
            // 3. Not in a scrollable element
            if (!((boundaries.top && e.deltaY < 0) ||
                (boundaries.bottom && e.deltaY > 0))) {
                return;
            }
        }
        
        e.preventDefault();
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
        if (e.deltaY > 0 && currentIndex < cards.length - 1) {
            // Scroll down - move right
            goToCard(currentIndex + 1);
        } else if (e.deltaY < 0 && currentIndex > 0) {
            // Scroll up - move left
            goToCard(currentIndex - 1);
        }
    }
    
    // Initialize card navigation based on URL parameters
    goToCard(urlParamsManager.getCardFromURL());
    
    // Handle window size changes
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeSwitcher);
        window.resizeSwitcher = setTimeout(() => goToCard(currentIndex), 500);
    });
});