// 视图切换功能
document.addEventListener('DOMContentLoaded', function () {
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const adminViewBtn = document.getElementById('tags-view-btn');
    const streamList = document.getElementById('public-streams');
    
    // 加载保存的视图首选项
    const savedView = localStorage.getItem('streamView') || 'grid';
    const isTagsView = localStorage.getItem('tagsView') === 'true';
    
    // 初始化视图
    setActiveView(savedView);
    setTagsView(isTagsView);
    
    // 绑定点击事件
    gridViewBtn.addEventListener('click', function() {
        setActiveView('grid');
    });
    
    listViewBtn.addEventListener('click', function() {
        setActiveView('list');
    });
    
    adminViewBtn.addEventListener('click', function() {
        setTagsView(!streamList.classList.contains('tags-view'));
    });
    
    // 设置当前活动视图
    function setActiveView(viewType) {
        if (viewType === 'grid') {
            streamList.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            streamList.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            
            // 处理描述文本
            processStreamDescriptions();
        }
        
        // 保存用户偏好
        localStorage.setItem('streamView', viewType);
    }
    
    // 设置标签视图
    function setTagsView(isTagsView) {
        if (isTagsView) {
            streamList.classList.add('tags-view');
            adminViewBtn.classList.add('active');
        } else {
            streamList.classList.remove('tags-view');
            adminViewBtn.classList.remove('active');
        }
        
        // 保存用户偏好
        localStorage.setItem('tagsView', isTagsView);
    }
    
    // 处理流描述文本
    function processStreamDescriptions() {
        const streamItems = document.querySelectorAll('.stream-item');
        
        streamItems.forEach(streamItem => {
            // 获取描述元素
            const descriptionEl = streamItem.querySelector('.stream-description');
            
            // 如果已经处理过，则跳过
            if (streamItem.hasAttribute('data-processed')) {
                return;
            }
            
            // 为streamItem添加标记，避免重复处理
            streamItem.setAttribute('data-processed', 'true');
            
            // 获取描述文本
            const descriptionText = descriptionEl.textContent.trim();
            
            // 处理空描述
            if (!descriptionText) {
                descriptionEl.textContent = "The streamer seems provide a empty description...... Let's have a guess or just click in to view now!";
                descriptionEl.classList.add('empty-description');
            }
        });
    }

    
    // 初始加载时处理描述
    if (savedView === 'list') {
        processStreamDescriptions();
    }
    
    // 将processStreamDescriptions函数公开，使其他脚本可以调用
    window.processStreamDescriptions = processStreamDescriptions;
});
