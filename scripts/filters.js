document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const publicStreams = document.getElementById('public-streams');
    const visibilityFilter = document.getElementById('visibility-filter');
    const tagsDropdownBtn = document.getElementById('tags-dropdown-btn');
    const tagsDropdownContent = document.getElementById('tags-dropdown-content');
    
    // 存储所有直播项和已筛选的标签
    let allStreamItems = [];
    let selectedTags = [];
    
    // 初始化
    initializeFilters();
    
    // 初始化筛选器
    function initializeFilters() {
        // 获取所有直播项
        refreshStreamItems();
        
        // 收集所有唯一标签
        const allTags = collectAllTags();
        
        // 生成标签复选框
        generateTagCheckboxes(allTags);
        
        // 设置事件监听器
        setupEventListeners();
        
        // 初次应用筛选
        applyFilters();
    }
    
    // 刷新直播项列表
    function refreshStreamItems() {
        allStreamItems = Array.from(publicStreams.querySelectorAll('.stream-item'));
    }
    
    
    // 从所有直播项中收集唯一标签
    function collectAllTags() {
        const tagsSet = new Set();
        
        allStreamItems.forEach(item => {
            const tagsData = item.getAttribute('data-tags');
            if (tagsData) {
                const tags = tagsData.split(',');
                tags.forEach(tag => tagsSet.add(tag.trim()));
            }
        });
        
        return Array.from(tagsSet).sort();
    }
    
    // 生成标签复选框
    function generateTagCheckboxes(tags) {
        tagsDropdownContent.innerHTML = '';
        
        tags.forEach(tag => {
            const label = document.createElement('label');
            label.className = 'tag-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    addSelectedTag(tag);
                } else {
                    removeSelectedTag(tag);
                }
                applyFilters();
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(tag));
            tagsDropdownContent.appendChild(label);
        });
    }
    
    // 添加选中的标签
    function addSelectedTag(tag) {
        if (!selectedTags.includes(tag)) {
            selectedTags.push(tag);
            updateDropdownButton();
        }
    }
    
    // 移除选中的标签
    function removeSelectedTag(tag) {
        const index = selectedTags.indexOf(tag);
        if (index !== -1) {
            selectedTags.splice(index, 1);
            updateDropdownButton();
        }
    }
    
    // 更新下拉按钮文本
    function updateDropdownButton() {
        if (selectedTags.length > 0) {
            tagsDropdownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                标签筛选 (${selectedTags.length})
            `;
        } else {
            tagsDropdownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                标签筛选
            `;
        }
    }
    
    // 应用筛选器
    function applyFilters() {
        // 刷新直播项列表，确保包含新添加的项目
        refreshStreamItems();
        
        const visibility = visibilityFilter.value;
        
        allStreamItems.forEach(item => {
            const itemVisibility = item.getAttribute('data-visibility');
            const itemTags = item.getAttribute('data-tags')?.split(',').map(tag => tag.trim()) || [];
            
            // 可见性筛选
            const visibilityMatch = 
                visibility === 'all' || 
                (visibility === 'public' && itemVisibility === 'public') || 
                (visibility === 'private' && itemVisibility === 'private');
            
            // 标签筛选（使用 OR 逻辑，只要包含任一选中标签即可）
            const tagsMatch = 
                selectedTags.length === 0 || 
                selectedTags.some(tag => itemTags.includes(tag));
            
            // 如果两种筛选都匹配，则显示此条目
            if (visibilityMatch && tagsMatch) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 可见性筛选器变化
        visibilityFilter.addEventListener('change', applyFilters);
        
        // 标签下拉菜单点击切换
        tagsDropdownBtn.addEventListener('click', function() {
            tagsDropdownContent.classList.toggle('show');
            this.setAttribute('aria-expanded', tagsDropdownContent.classList.contains('show'));
        });
        
        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.tags-dropdown') && tagsDropdownContent.classList.contains('show')) {
                tagsDropdownContent.classList.remove('show');
                tagsDropdownBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // 公开用于其他脚本的函数
    window.applyFilters = function() {
        // 刷新标签列表
        const allTags = collectAllTags();
        generateTagCheckboxes(allTags);
        
        // 应用过滤器
        applyFilters();
    };
});
