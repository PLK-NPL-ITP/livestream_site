document.addEventListener('DOMContentLoaded', function () {
    let isDragging = false;
    let startPosX = 0;
    let startPosY = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    // let animationID = 0;
    let isHorizontalSwipe = false;
    let isScrolling = false;
    let touchStartTime = 0;
    let touchMoveCount = 0;

    const scroller = document.getElementById('scroller');
    const cards = document.querySelectorAll('.scroller-card');
    const navItems = document.querySelectorAll('.nav-item');
    const indicatorDots = document.querySelectorAll('.indicator-dot');
    
    // 获取SVG object元素
    const svgObject = document.getElementById('home-animation-svg');
    
    // 为SVG object添加透明覆盖层，以便捕获触摸事件
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
        
        // 为覆盖层添加触摸事件监听器
        overlayDiv.addEventListener('touchstart', touchStart, { passive: false });
        overlayDiv.addEventListener('touchmove', touchMove, { passive: false });
        overlayDiv.addEventListener('touchend', touchEnd, { passive: false });
        // overlayDiv.addEventListener('mousedown', touchStart);
        // overlayDiv.addEventListener('mousemove', touchMove);
        // overlayDiv.addEventListener('mouseup', touchEnd);
        
        console.log('已为SVG object添加触摸事件覆盖层');
    }

    // Touch events for mobile
    scroller.addEventListener('touchstart', touchStart);
    scroller.addEventListener('touchmove', touchMove);
    scroller.addEventListener('touchend', touchEnd);
    
    // // Mouse events for desktop
    // scroller.addEventListener('mousedown', touchStart);
    // scroller.addEventListener('mousemove', touchMove);
    // scroller.addEventListener('mouseup', touchEnd);
    // scroller.addEventListener('mouseleave', touchEnd);

    // Wheel event for horizontal scrolling
    scroller.addEventListener('wheel', handleWheel, { passive: false });    

    // Nav items click
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            goToCard(index);
        });
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

    function goToCard(index) {
        if (index < 0 || index >= cards.length) return;

        currentIndex = index;
        updateActiveCard();
        updateActiveNav();
        updateActiveIndicator();
        
        const url = new URL(window.location.href);
        url.searchParams.set('card', index.toString());
        window.history.replaceState({}, '', url);

        cards[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }

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

    function isAtScrollBoundary(element) {
        return {
            top: element.scrollTop === 0,
            bottom: Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
        };
    }

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

    function touchStart(e) {
        // 检查事件是否来自SVG或其覆盖层
        const isSvgEvent = e.target === svgObject || 
                           e.target.id === 'svg-touch-overlay' || 
                           (e.target.closest && e.target.closest('#home-animation-svg'));
        
        if (isSvgEvent) {
            // 对于SVG触发的事件，总是阻止默认行为
            e.preventDefault();
            console.log('从SVG触发了touchStart');
        }
        
        // 记录触控开始时间，用于区分点击和滑动
        touchStartTime = new Date().getTime();
        touchMoveCount = 0;
        isHorizontalSwipe = false;
        isScrolling = false;
        
        console.log('Touch start');

        if (e.type === 'mousedown') {
            startPosX = e.clientX;
            startPosY = e.clientY;
        } else {
            startPosX = e.touches[0].clientX;
            startPosY = e.touches[0].clientY;
        }
        prevTranslate = 0;
        // cancelAnimationFrame(animationID);
    }

    function touchMove(e) {
        // 检查事件是否来自SVG或其覆盖层
        const isSvgEvent = e.target === svgObject || 
                           e.target.id === 'svg-touch-overlay' || 
                           (e.target.closest && e.target.closest('#home-animation-svg'));
        
        if (isSvgEvent) {
            // 对于SVG触发的事件，总是阻止默认行为
            e.preventDefault();
            console.log('从SVG触发了touchMove');
        }
        
        touchMoveCount++;
        
        // 获取当前触摸位置
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        // 计算水平和垂直移动距离
        diffX = currentX - startPosX;
        diffY = currentY - startPosY;
        
        // 如果这是首次移动或尚未确定滑动方向
        console.log('Touch move', touchMoveCount, diffX, diffY);
        if (touchMoveCount < 3 && !isHorizontalSwipe && !isScrolling) {
            // 通过比较水平和垂直移动距离来确定用户意图
            if (Math.abs(diffX) > Math.abs(diffY) * 1.5) {
                // 用户意图是水平滑动（切换卡片）
                isHorizontalSwipe = true;
                e.preventDefault(); // 阻止默认的垂直滚动
            } else if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
                // 用户意图是垂直滚动
                isScrolling = true;
                return; // 让浏览器处理默认的垂直滚动
            }
            // 如果方向不明确，继续等待更多移动数据
            return;
        }
        
        // 如果已确定是垂直滚动，让浏览器处理
        if (isScrolling) return;
        
        // 如果是横向滑动，则继续处理卡片切换逻辑
        if (isHorizontalSwipe) {
            e.preventDefault(); // 阻止默认行为
            
            // // 应用阻尼效果
            currentTranslate = prevTranslate + diffX * 0.7;

            // 在边界应用橡皮筋效果
            if (currentTranslate > 0) {
                currentTranslate = Math.log(1 + Math.abs(diffX) * 0.01) * 50;
            } else if (currentTranslate < 0) {
                currentTranslate = -Math.log(1 + Math.abs(diffX) * 0.01) * 50;
            }

            // 实际应用位移效果
            scroller.style.transform = `translateX(${currentTranslate}px)`;
            isDragging = true;
            console.log('Touch move', currentTranslate, prevTranslate);
        }
    }

    function touchEnd(e) {
        // 检查事件是否来自SVG或其覆盖层
        const isSvgEvent = e.target === svgObject || 
                           e.target.id === 'svg-touch-overlay' || 
                           (e.target.closest && e.target.closest('#home-animation-svg'));
        
        if (isSvgEvent) {
            // 对于SVG触发的事件，根据状态决定是否阻止默认行为
            console.log('从SVG触发了touchEnd');
            
            if (isHorizontalSwipe || isDragging) {
                e.preventDefault();
            }
        }
        
        // 计算触摸持续时间
        const touchDuration = new Date().getTime() - touchStartTime;
        
        // 如果是快速点击（少于200ms）且几乎没有移动（移动次数少于3次），则视为点击事件
        if (touchDuration < 200 && touchMoveCount < 3 && !isHorizontalSwipe && !isScrolling) {
            // 这是点击事件，不做任何处理，让浏览器处理默认的点击行为
            console.log('Click detected');
            return;
        }
        
        // 如果已确定是垂直滚动，不处理卡片切换
        if (isScrolling) return;
        
        // 如果不是拖动状态或不是水平滑动，则不处理
        if (!isDragging && !isHorizontalSwipe) return;
        
        // 重置滑动状态
        // scroller.style.transform = `translateX(0)`;
        isDragging = false;
        isHorizontalSwipe = false;
        isScrolling = false;
        
        // 计算移动距离
        const movedBy = currentTranslate - prevTranslate;
        console.log('Touch end', movedBy);
        
        // 判断滑动距离和方向，决定是否切换卡片
        if (diffX < 0 && currentIndex < cards.length - 1) {
            // 向左滑动
            goToCard(currentIndex + 1);
        } else if (diffX > 0 && currentIndex > 0) {
            // 向右滑动
            goToCard(currentIndex - 1); 
        }
        
        // 重置变换
        scroller.style.transform = `translateX(0)`;
    }

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
    
    // 从URL参数中获取card参数，切换到指定卡片
    function getInitialCardFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const cardParam = urlParams.get('card');
        
        // 检查card参数是否存在且为0-3之间的数字
        if (cardParam !== null && /^[0-3]$/.test(cardParam)) {
            const cardIndex = parseInt(cardParam, 10);
            return cardIndex;
        }
        
        // 默认返回0
        return 0;
    }

    // 初始化时获取并切换到指定卡片
    const initialCard = getInitialCardFromURL();
    
    // 根据URL参数初始化卡片
    goToCard(initialCard);

    // Handle window resize
    window.addEventListener('resize', () => {
        setTimeout(() => {
            goToCard(currentIndex);
        }, 500);
    });
    
    // 为SVG对象添加事件处理
    if (svgObject) {
        // 监听SVG对象加载完成事件
        svgObject.addEventListener('load', function() {
            console.log('SVG对象加载完成');
            
            try {
                // 获取SVG文档
                const svgDoc = svgObject.contentDocument;
                if (svgDoc) {
                    // 为SVG文档添加触摸事件监听器
                    svgDoc.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        console.log('SVG内部touchstart触发');
                        
                        // 将事件传递给我们的touchStart处理函数
                        const touch = e.touches[0];
                        const newEvent = new TouchEvent('touchstart', {
                            touches: e.touches,
                            targetTouches: e.targetTouches,
                            changedTouches: e.changedTouches,
                            bubbles: true
                        });
                        
                        touchStart(newEvent);
                    }, { passive: false });
                    
                    svgDoc.addEventListener('touchmove', function(e) {
                        e.preventDefault();
                        console.log('SVG内部touchmove触发');
                        
                        // 将事件传递给我们的touchMove处理函数
                        touchMove(e);
                    }, { passive: false });
                    
                    svgDoc.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        console.log('SVG内部touchend触发');
                        
                        // 将事件传递给我们的touchEnd处理函数
                        touchEnd(e);
                    }, { passive: false });
                    
                    console.log('已为SVG内容添加触摸事件监听器');
                }
            } catch (error) {
                console.error('添加SVG触摸事件时出错:', error);
            }
        });
    }
});