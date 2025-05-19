// 视图切换功能
document.addEventListener('DOMContentLoaded', function () {
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const adminViewBtn = document.getElementById('tags-view-btn');
    const sortStreamsBtn = document.getElementById('sort-streams-btn');
    const streamList = document.getElementById('public-streams');
    
    // 加载保存的视图首选项
    const savedView = localStorage.getItem('streamView') || 'grid';
    const isTagsView = localStorage.getItem('tagsView') === 'true';
    const savedSortMethod = localStorage.getItem('streamSort') || 'time-desc'; // 默认为时间降序（最新优先）
    
    // 初始化视图
    setActiveView(savedView);
    setTagsView(isTagsView);
    setSortMethod(savedSortMethod);
    
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
    
    sortStreamsBtn.addEventListener('click', function() {
        cycleSortMethod();
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
    
    // 排序相关功能
    
    // 设置当前排序方式
    function setSortMethod(method) {
        // 获取排序图标元素
        const sortIcon = document.getElementById('sort-icon');
        
        // 始终保持按钮激活状态
        sortStreamsBtn.classList.add('active');
        
        // 根据排序方式更新图标
        switch(method) {
            case 'title-asc':
                sortStreamsBtn.title = '标题升序 (A-Z)';
                sortIcon.src = './assets/images/arrow-up-a-z.svg';
                break;
            case 'title-desc':
                sortStreamsBtn.title = '标题降序 (Z-A)';
                sortIcon.src = './assets/images/arrow-down-a-z.svg';
                break;
            case 'time-asc':
                sortStreamsBtn.title = '开始时间 (最早优先)';
                sortIcon.src = './assets/images/arrow-up-1-9.svg';
                break;
            case 'time-desc':
                sortStreamsBtn.title = '开始时间 (最新优先)';
                sortIcon.src = './assets/images/arrow-down-1-9.svg';
                break;
            default:
                // 如果传入意外的值，默认使用时间降序
                method = 'time-desc';
                sortStreamsBtn.title = '开始时间 (最新优先)';
                sortIcon.src = './assets/images/arrow-down-1-9.svg';
                break;
        }
        
        // 执行排序
        sortStreamItems(method);
        
        // 保存用户偏好
        localStorage.setItem('streamSort', method);
    }
    
    // 循环切换排序方式
    function cycleSortMethod() {
        const currentMethod = localStorage.getItem('streamSort') || 'time-desc';
        
        // 只在四种排序方式间循环: title-asc -> title-desc -> time-asc -> time-desc -> title-asc
        let nextMethod;
        
        switch(currentMethod) {
            case 'title-asc':
                nextMethod = 'title-desc';
                break;
            case 'title-desc':
                nextMethod = 'time-asc';
                break;
            case 'time-asc':
                nextMethod = 'time-desc';
                break;
            case 'time-desc':
                nextMethod = 'title-asc';
                break;
            default:
                nextMethod = 'time-desc'; // 确保有默认值
        }
        
        setSortMethod(nextMethod);
    }
    
    // 排序直播项目
    function sortStreamItems(method) {
        const streamItems = Array.from(streamList.querySelectorAll('.stream-item'));
        
        if (streamItems.length === 0) {
            return; // 没有流项目，不需要排序
        }
        
        streamItems.sort((a, b) => {
            switch(method) {
                case 'title-asc': // 标题升序
                    const titleA = a.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                    const titleB = b.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                    return titleA.localeCompare(titleB);
                
                case 'title-desc': // 标题降序
                    const titleDescA = a.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                    const titleDescB = b.querySelector('.stream-info h3').textContent.trim().toLowerCase();
                    return titleDescB.localeCompare(titleDescA);
                
                case 'time-asc': // 时间升序（最早优先）
                    const timeA = new Date(a.getAttribute('data-time'));
                    const timeB = new Date(b.getAttribute('data-time'));
                    return timeA - timeB;
                
                case 'time-desc': // 时间降序（最新优先）
                    const timeDescA = new Date(a.getAttribute('data-time'));
                    const timeDescB = new Date(b.getAttribute('data-time'));
                    return timeDescB - timeDescA;
                
                default:
                    return 0;
            }
        });
        
        // 重排DOM元素
        streamItems.forEach(item => {
            streamList.appendChild(item);
        });
    }
    
    // 将排序方法暴露给其他脚本
    window.applySorting = function() {
        const currentMethod = localStorage.getItem('streamSort') || 'time-desc';
        sortStreamItems(currentMethod);
    };
});
