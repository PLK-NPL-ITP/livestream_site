/**
 * Stream Details Popup Functionality
 * 处理直播详情弹窗的显示和交互
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const popup = document.getElementById('stream-details-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const viewStreamBtn = document.getElementById('btn-view-stream');
    const streamList = document.getElementById('public-streams');
    
    // 弹窗内容元素
    const popupThumbnail = document.getElementById('popup-thumbnail');
    const popupQuality = document.getElementById('popup-quality');
    const popupTitle = document.getElementById('popup-title');
    const popupAuthor = document.getElementById('popup-author');
    const popupMeta = document.getElementById('popup-meta');
    const popupVisibility = document.getElementById('popup-visibility');
    const popupTags = document.getElementById('popup-tags');
    const popupDescription = document.getElementById('popup-description');
    
    // 当前直播ID和元素
    let currentStreamId = '';
    let currentStreamElement = null;
    
    // 初始化事件监听器
    initEventListeners();
    
    /**
     * 初始化所有事件监听器
     */
    function initEventListeners() {
        // 监听直播列表的点击事件
        if (streamList) {
            streamList.addEventListener('click', function(event) {
                // 查找最近的直播项元素
                const streamItem = event.target.closest('.stream-item');
                if (streamItem) {
                    showStreamDetails(streamItem);
                }
            });
        }
        
        // 关闭弹窗按钮
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', hidePopup);
        }
        
        // 点击弹窗外部区域关闭弹窗
        if (popup) {
            popup.addEventListener('click', function(event) {
                if (event.target === popup) {
                    hidePopup();
                }
            });
        }
        
        // 观看直播按钮
        if (viewStreamBtn) {
            viewStreamBtn.addEventListener('click', function() {
                if (currentStreamId) {
                    viewStream(currentStreamId);
                }
            });
        }
        
        // 支持ESC键关闭弹窗
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && popup.classList.contains('active')) {
                hidePopup();
            }
        });
    }
    
    /**
     * 显示直播详情弹窗
     * @param {HTMLElement} streamItem - 直播项DOM元素
     */
    function showStreamDetails(streamItem) {
        if (!streamItem || !popup) return;
        
        // 保存当前直播项引用和ID
        currentStreamElement = streamItem;
        currentStreamId = streamItem.getAttribute('data-id') || '';
        
        // 获取直播项的详细信息
        const thumbnailSrc = streamItem.querySelector('.stream-thumbnail img')?.src || '';
        const qualityInfo = streamItem.querySelector('.quality-info')?.textContent || '';
        const title = streamItem.querySelector('h3')?.textContent || '';
        const author = streamItem.querySelector('.stream-author')?.textContent || '';
        const meta = streamItem.querySelector('.stream-meta')?.textContent || '';
        const visibility = streamItem.getAttribute('data-visibility') || 'public';
        const visibilityText = visibility === 'private' ? 'Private' : 'Public';
        const description = streamItem.querySelector('.stream-description')?.textContent || '没有提供描述信息';
        
        // 获取标签
        const tagsStr = streamItem.getAttribute('data-tags') || '';
        const tags = tagsStr.split(',').filter(tag => tag.trim() !== '');
        
        // 填充弹窗内容
        popupThumbnail.src = thumbnailSrc;
        popupQuality.textContent = qualityInfo;
        popupTitle.textContent = title;
        popupAuthor.textContent = author;
        popupMeta.textContent = meta;
        
        // 设置可见性标签
        popupVisibility.textContent = visibilityText;
        popupVisibility.className = 'stream-visibility' + (visibility === 'private' ? ' private' : '');
        
        // 生成标签HTML
        popupTags.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'stream-tag';
            tagElement.textContent = tag;
            popupTags.appendChild(tagElement);
        });
        
        // 设置描述
        popupDescription.textContent = description;
        
        // 显示弹窗
        popup.classList.add('active');
        
        // 确保模糊效果渐变显示
        requestAnimationFrame(() => {
            popup.style.backdropFilter = 'blur(5px)';
            popup.style.webkitBackdropFilter = 'blur(5px)';
            popup.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        });
        
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    /**
     * 隐藏弹窗
     */
    function hidePopup() {
        if (popup) {
            // 首先开始背景模糊的过渡动画
            popup.style.backdropFilter = 'blur(0px)';
            popup.style.webkitBackdropFilter = 'blur(0px)';
            popup.style.backgroundColor = 'rgba(255, 255, 255, 0)';
            
            // 添加关闭动画
            const popupContent = popup.querySelector('.popup-content');
            if (popupContent) {
                popupContent.classList.add('closing');
                
                // 等待动画完成后再隐藏弹窗
                setTimeout(() => {
                    popup.classList.remove('active');
                    popupContent.classList.remove('closing');
                    document.body.style.overflow = ''; // 恢复滚动
                    
                    // 重置当前直播引用
                    currentStreamId = '';
                    currentStreamElement = null;
                    
                    // 重置背景样式，为下次显示做准备
                    setTimeout(() => {
                        popup.style.backdropFilter = '';
                        popup.style.webkitBackdropFilter = '';
                        popup.style.backgroundColor = '';
                    }, 50);
                }, 300); // 动画持续时间
            } else {
                popup.classList.remove('active');
                document.body.style.overflow = ''; // 恢复滚动
                
                // 重置当前直播引用
                currentStreamId = '';
                currentStreamElement = null;
            }
        }
    }
    
    /**
     * 观看指定ID的直播
     * @param {string} streamId - 直播ID
     */
    function viewStream(streamId) {
        if (!streamId) return;
        
        console.log(`Opening stream with ID: ${streamId}`);
        
        // 获取直播标题（如果可用）
        let streamTitle = '直播';
        if (currentStreamElement) {
            streamTitle = currentStreamElement.querySelector('h3')?.textContent || '直播';
        }
        
        // 显示成功toast消息
        toast.success('正在连接', `即将观看: ${streamTitle}`);
        
        // 关闭弹窗
        hidePopup();
        
        // 使用延迟处理实际跳转，让用户能看到toast消息
        setTimeout(() => {
            // 实际实现会跳转到直播观看页面
            // window.location.href = `./stream-viewer.html?id=${streamId}`;
            console.log(`即将跳转到直播观看页面，直播ID: ${streamId}`);
        }, 1500);
    }
});
