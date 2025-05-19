/**
 * 表单验证功能
 * 处理直播码和高级连接设置的验证
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const streamCodeInput = document.getElementById('stream-code');
    const streamIpInput = document.getElementById('stream-ip');
    const streamPortInput = document.getElementById('stream-port');
    const streamSchemaInput = document.getElementById('stream-schema');
    const streamVhostInput = document.getElementById('stream-vhost');
    const enterButton = document.querySelector('.btn-enter');
    const advancedSettings = document.getElementById('advanced-settings');
    
    // 存储原始的标签内容，用于恢复
    const originalLabels = new Map();
    
    // 定义CSS样式用于错误抖动动画和错误消失动画
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
        
        .input-error {
            animation: inputShake 0.4s;
            border-color: #ff0000 !important;
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
    
    // 初始化时保存所有标签的原始内容
    function saveOriginalLabels() {
        document.querySelectorAll('.input-box').forEach(box => {
            const input = box.querySelector('input');
            const span = box.querySelector('.code-span');
            if (input && span) {
                originalLabels.set(input.id, span.textContent);
            }
        });
    }
    
    // 页面加载时保存原始标签
    saveOriginalLabels();
    
    // 定义验证规则
    const validators = {
        // Stream-code只包含小写字母和数字和中间一个横杠，符合格式"xxx-xxxx"
        streamCode: function(value) {
            const regex = /^[a-z0-9]{3}-[a-z0-9]{4}$/;
            return regex.test(value) ? true : "Error: Format should be xxx-xxxx (lowercase letters or numbers)";
        },
        
        // server network location：支持域名、IPv4和IPv6
        serverLocation: function(value) {
            // 域名格式
            const domainRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
            
            // IPv4格式
            const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
            
            // IPv6格式 (简化版，支持常见IPv6格式)
            const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
            
            if (domainRegex.test(value)) return true;
            
            if (ipv4Regex.test(value)) {
                // 验证IPv4地址范围
                const parts = value.split('.');
                for (let i = 0; i < 4; i++) {
                    const part = parseInt(parts[i]);
                    if (part < 0 || part > 255) return "Error: IPv4 address segments should be between 0-255";
                }
                return true;
            }
            
            if (ipv6Regex.test(value)) return true;
            
            return "Error: Should be a valid domain, IPv4 or IPv6 address";
        },
        
        // port number：就是正常的端口判断:1-65535
        portNumber: function(value) {
            if (!/^\d+$/.test(value)) return "Error: Port number should be digits only";
            const port = parseInt(value);
            return (port >= 1 && port <= 65535) ? true : "Error: Port number range is 1-65535";
        },
        
        // SCHEMA：只接受HTTP和HTTPS
        schema: function(value) {
            const upperValue = value.toUpperCase();
            return (upperValue === 'HTTP' || upperValue === 'HTTPS') ? true : "Error: Only HTTP or HTTPS are allowed";
        },
        
        // VHOST：任意内容但不能有空格
        vhost: function(value) {
            return (/\s/.test(value)) ? "Error: Cannot contain spaces" : true;
        }
    };
    
    // 显示错误信息的函数
    function showError(input, message) {
        // 获取对应的span标签
        const inputBox = input.closest('.input-box');
        const span = inputBox.querySelector('.code-span');
        
        // 清除可能已存在的淡出计时器
        if (span._fadeTimer) {
            clearTimeout(span._fadeTimer);
            delete span._fadeTimer;
        }
        
        // 为输入框添加错误样式和抖动动画
        input.classList.add('input-error');
        
        // 移除动画后重新应用（如果用户多次提交错误）
        setTimeout(() => {
            input.classList.remove('input-error');
            setTimeout(() => {
                if (span.classList.contains('error')) {
                    input.classList.add('input-error');
                }
            }, 10);
        }, 500);
        
        // 修改标签内容为错误信息
        span.textContent = message;
        span.style.color = '#ff0000';
        span.classList.add('error');
    }
    
    // 移除错误信息的函数
    function removeError(input) {
        // 获取对应的span标签
        const inputBox = input.closest('.input-box');
        const span = inputBox.querySelector('.code-span');
        
        // 重置为原始标签内容
        if (span.classList.contains('error')) {
            span.textContent = originalLabels.get(input.id) || '';
            span.style.color = '';
            span.classList.remove('error');
            input.classList.remove('input-error');
        }
    }
    
    // 验证单个输入的函数
    function validateInput(input, validatorFn) {
        const value = input.value.trim();
        
        // 如果输入为空，显示"请输入内容"提示
        if (!value) {
            showError(input, "Error: This field is required");
            return false;
        }
        
        const result = validatorFn(value);
        
        if (result !== true) {
            showError(input, result);
            return false;
        }
        
        removeError(input);
        return true;
    }
    
    // 验证所有输入的函数
    function validateAllInputs() {
        // 首先检查是否显示高级设置
        const isAdvancedVisible = (advancedSettings.style.display === 'flex');
        
        // 先验证直播码
        let isValid = validateInput(streamCodeInput, validators.streamCode);
        
        // 如果高级设置可见，则验证所有字段
        if (isAdvancedVisible) {
            isValid = validateInput(streamIpInput, validators.serverLocation) && isValid;
            isValid = validateInput(streamPortInput, validators.portNumber) && isValid;
            isValid = validateInput(streamSchemaInput, validators.schema) && isValid;
            isValid = validateInput(streamVhostInput, validators.vhost) && isValid;
        }
        
        return isValid;
    }
    
    // 为Enter按钮添加点击事件
    enterButton.addEventListener('click', function(e) {
        // 阻止默认行为
        e.preventDefault();
        
        // 验证表单
        if (validateAllInputs()) {
            // 验证通过，执行加入直播流的操作
            const streamCode = streamCodeInput.value.trim();
            alert(`Success! Joining stream: ${streamCode}`);
            // 这里可以添加跳转代码
            // window.location.href = `/stream/${streamCode}`;
        }
    });
    
    // 输入框内容变化时移除错误提示
    [streamCodeInput, streamIpInput, streamPortInput, streamSchemaInput, streamVhostInput].forEach(input => {
        input.addEventListener('input', function() {
            removeError(this);
        });
    });
    
    // 为Stream Code输入框添加回车键事件监听
    streamCodeInput.addEventListener('keydown', function(e) {
        // 如果按下的是Enter键
        if (e.key === 'Enter') {
            // 阻止默认行为
            e.preventDefault();
            
            // 如果高级选项未展开，则模拟点击Enter按钮
            if (advancedSettings.style.display !== 'flex') {
                enterButton.click();
            }
        }
    });
});
