/**
 * Preloader 演示脚本
 * 
 * 作者: Jason Yang Jiepeng, NPL ITP Infrastructure (Development) Group
 * 日期: 2025-05-22
 * 
 * 这个脚本演示了如何使用preloaderControl功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 添加测试按钮到页面
    function addTestButtons() {
        const homeCard = document.querySelector('#card-home');
        if (!homeCard) return;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'preloader-test-buttons';
        buttonContainer.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;';
        
        const showButton = document.createElement('button');
        showButton.textContent = '显示Preloader';
        showButton.style.cssText = 'padding: 8px 16px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer;';
        showButton.onclick = function() {
            window.preloaderControl.show();
            
            // 5秒后自动隐藏（演示用）
            setTimeout(() => {
                window.preloaderControl.hide();
            }, 5000);
        };
        
        const hideButton = document.createElement('button');
        hideButton.textContent = '隐藏Preloader';
        hideButton.style.cssText = 'padding: 8px 16px; background: #34a853; color: white; border: none; border-radius: 4px; cursor: pointer;';
        hideButton.onclick = function() {
            window.preloaderControl.hide();
        };
        
        const customTextButton = document.createElement('button');
        customTextButton.textContent = '自定义加载文本';
        customTextButton.style.cssText = 'padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;';
        customTextButton.onclick = function() {
            window.preloaderControl.show('数据加载中...');
            
            // 5秒后自动隐藏（演示用）
            setTimeout(() => {
                window.preloaderControl.hide();
            }, 5000);
        };
        
        buttonContainer.appendChild(showButton);
        buttonContainer.appendChild(hideButton);
        buttonContainer.appendChild(customTextButton);
        
        // 添加到页面上适当的位置
        const targetElement = homeCard.querySelector('.home-main');
        if (targetElement) {
            targetElement.appendChild(buttonContainer);
        }
    }
    
    // 添加测试按钮
    setTimeout(addTestButtons, 500); // 稍微延迟以确保其他DOM已加载
});
