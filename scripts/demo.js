document.addEventListener('DOMContentLoaded', function() {
    // 添加"重置演示"按钮
    const streamsHeader = document.querySelector('.streams-header-left');
    if (streamsHeader) {
        const resetButton = document.createElement('button');
        resetButton.textContent = '重置演示';
        resetButton.className = 'reset-demo-btn';
        resetButton.style.marginLeft = '15px';
        resetButton.style.padding = '5px 10px';
        resetButton.style.borderRadius = '4px';
        resetButton.style.border = 'none';
        resetButton.style.backgroundColor = '#f44336';
        resetButton.style.color = 'white';
        resetButton.style.cursor = 'pointer';
        
        resetButton.addEventListener('click', function() {
            // 清除现有直播项并添加示例
            window.addExampleStreamItems();
            
            // 创建一个通知
            const notification = document.createElement('div');
            notification.textContent = '演示数据已重置！';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '4px';
            notification.style.zIndex = '1000';
            
            document.body.appendChild(notification);
            
            // 2秒后移除通知
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 2000);
        });
        
        streamsHeader.appendChild(resetButton);
    }
    
    // 添加"添加自定义直播"按钮
    if (streamsHeader) {
        const addButton = document.createElement('button');
        addButton.textContent = '添加自定义直播';
        addButton.className = 'add-custom-btn';
        addButton.style.marginLeft = '10px';
        addButton.style.padding = '5px 10px';
        addButton.style.borderRadius = '4px';
        addButton.style.border = 'none';
        addButton.style.backgroundColor = '#4CAF50';
        addButton.style.color = 'white';
        addButton.style.cursor = 'pointer';
        
        addButton.addEventListener('click', function() {
            // 创建自定义直播
            const customTitle = `自定义直播 ${new Date().toLocaleTimeString()}`;
            const randomViewers = Math.floor(Math.random() * 100) + 5;
            
            window.addStreamItem({
                thumbnailSrc: 'assets/images/stream1.jpg',
                qualityInfo: '1080p • 30fps',
                title: customTitle,
                author: '当前用户',
                startTime: new Date(),
                viewers: randomViewers,
                visibility: Math.random() > 0.7 ? 'private' : 'public',
                tags: ['自定义', '演示', Math.random() > 0.5 ? 'API' : 'Testing'],
                description: '这是一个动态创建的自定义直播演示。您可以随时添加更多自定义直播或重置回默认示例。'
            });
            
            // 创建一个通知
            const notification = document.createElement('div');
            notification.textContent = '已添加自定义直播！';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '4px';
            notification.style.zIndex = '1000';
            
            document.body.appendChild(notification);
            
            // 2秒后移除通知
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 2000);
        });
        
        streamsHeader.appendChild(addButton);
    }
});
