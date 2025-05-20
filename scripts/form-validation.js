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
    
    // 从URL参数中读取并填充表单字段
    function populateFormFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL Parameters:', urlParams.toString());

        // 映射参数名称到对应的输入字段和验证器
        const paramMap = {
            'stream-code': { input: streamCodeInput, validator: validators.streamCode },
            'server': { input: streamIpInput, validator: validators.serverLocation },
            'port': { input: streamPortInput, validator: validators.portNumber },
            'schema': { input: streamSchemaInput, validator: validators.schema },
            'vhost': { input: streamVhostInput, validator: validators.vhost },
            // 兼容别名
            'app': { input: streamVhostInput, validator: validators.vhost }
        };
        
        // 遍历参数映射
        let hasAdvancedParams = false;
        
        for (const [param, config] of Object.entries(paramMap)) {
            if (urlParams.has(param)) {
                const value = urlParams.get(param);
                
                // 验证参数值是否合法
                if (value && config.validator(value) === true) {
                    config.input.value = value;
                    
                    // 如果是高级设置参数，标记需要显示高级设置
                    if (param !== 'stream-code') {
                        hasAdvancedParams = true;
                    }
                }
            }
        }
        
        // 如果有高级参数，显示高级设置面板
        if (hasAdvancedParams) {
            const settings = document.getElementById('advanced-settings');
            const section = document.getElementsByClassName('code-section')[0];
            const toggle = document.getElementById('advanced-toggle');
            
            settings.style.display = 'flex';
            section.classList.toggle('expand');
            toggle.textContent = 'Click to hide advanced Connection Settings';
        }
    }
    
    // 在页面加载时调用，填充表单
    populateFormFromURL();
    
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
            return { isValid: false, error: "此字段不能为空" };
        }
        
        const result = validatorFn(value);
        
        if (result !== true) {
            showError(input, result);
            return { isValid: false, error: result };
        }
        
        removeError(input);
        return { isValid: true };
    }
    
    // 获取输入字段的显示名称
    function getFieldDisplayName(input) {
        switch(input.id) {
            case 'stream-code':
                return '直播码';
            case 'stream-ip':
                return '服务器地址';
            case 'stream-port':
                return '端口号';
            case 'stream-schema':
                return '协议';
            case 'stream-vhost':
                return 'VHost';
            default:
                return '输入字段';
        }
    }
    
    // 验证所有输入的函数
    function validateAllInputs() {
        // 首先检查是否显示高级设置
        const isAdvancedVisible = (advancedSettings.style.display === 'flex');
        
        let isAllValid = true;
        const errors = [];
        
        // 先验证直播码
        const streamCodeResult = validateInput(streamCodeInput, validators.streamCode);
        if (!streamCodeResult.isValid) {
            isAllValid = false;
            errors.push({
                field: getFieldDisplayName(streamCodeInput),
                error: streamCodeResult.error
            });
        }
        
        // 如果高级设置可见，则验证所有字段
        if (isAdvancedVisible) {
            // 验证服务器地址
            const ipResult = validateInput(streamIpInput, validators.serverLocation);
            if (!ipResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getFieldDisplayName(streamIpInput),
                    error: ipResult.error
                });
            }
            
            // 验证端口号
            const portResult = validateInput(streamPortInput, validators.portNumber);
            if (!portResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getFieldDisplayName(streamPortInput),
                    error: portResult.error
                });
            }
            
            // 验证协议
            const schemaResult = validateInput(streamSchemaInput, validators.schema);
            if (!schemaResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getFieldDisplayName(streamSchemaInput),
                    error: schemaResult.error
                });
            }
            
            // 验证VHost
            const vhostResult = validateInput(streamVhostInput, validators.vhost);
            if (!vhostResult.isValid) {
                isAllValid = false;
                errors.push({
                    field: getFieldDisplayName(streamVhostInput),
                    error: vhostResult.error
                });
            }
        }
        
        return { isValid: isAllValid, errors: errors };
    }
    
    // 为Enter按钮添加点击事件
    enterButton.addEventListener('click', function(e) {
        // 阻止默认行为
        e.preventDefault();
        
        // 验证表单
        const validationResult = validateAllInputs();
        if (validationResult.isValid) {
            // 确保URL参数已更新
            updateURLParams();
            
            // 验证通过，执行加入直播流的操作
            const streamCode = streamCodeInput.value.trim();
            
            // 显示成功toast消息
            toast.success('连接成功', `正在加入直播: ${streamCode}`);
            
            // 这里可以添加跳转代码 - 延迟一下让用户看到toast消息
            setTimeout(() => {
                // window.location.href = `/stream/${streamCode}`;
                console.log(`即将跳转至直播: ${streamCode}`);
            }, 1500);
        } else {
            // 验证失败，显示具体错误消息
            if (validationResult.errors.length > 0) {
                // 分别显示每个字段的错误
                validationResult.errors.forEach((error, index) => {
                    // 错误消息之间稍微间隔显示，提高用户体验
                    setTimeout(() => {
                        toast.error(`${error.field}验证失败`, error.error.replace('Error: ', ''));
                    }, index * 300); // 每个消息间隔300毫秒
                });
            } else {
                // 如果没有具体错误（不应该发生），显示通用错误消息
                toast.error('验证失败', '请检查所有输入字段是否正确');
            }
        }
    });
    
    // 更新URL参数的函数
    function updateURLParams() {
        // 获取所有输入框的值
        const streamCode = streamCodeInput.value.trim();
        const server = streamIpInput.value.trim();
        const port = streamPortInput.value.trim();
        const schema = streamSchemaInput.value.trim();
        const vhost = streamVhostInput.value.trim();
        
        // 创建URL对象
        const url = new URL(window.location.href);
        
        // 清除旧参数
        url.searchParams.delete('stream-code');
        url.searchParams.delete('server');
        url.searchParams.delete('port');
        url.searchParams.delete('schema');
        url.searchParams.delete('vhost');
        
        // 添加有效的参数
        if (streamCode) url.searchParams.set('stream-code', streamCode);
        if (server) url.searchParams.set('server', server);
        if (port) url.searchParams.set('port', port);
        if (schema) url.searchParams.set('schema', schema);
        if (vhost) url.searchParams.set('vhost', vhost);
        
        // 保留card参数
        const cardParam = new URLSearchParams(window.location.search).get('card');
        if (cardParam !== null && /^[0-3]$/.test(cardParam)) {
            url.searchParams.set('card', cardParam);
        }
        
        // 更新URL，不刷新页面
        window.history.replaceState({}, '', url);
    }
    
    // 延迟更新URL的函数，防止频繁更新
    function debounceUpdateURL(callback, delay) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(callback, delay);
        };
    }
    
    // 创建防抖动的URL更新函数
    const debouncedUpdateURL = debounceUpdateURL(updateURLParams, 500);
    
    // 为实时验证设置防抖函数
    function debounceValidation(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }
    
    // 防抖后的验证函数，以减少对用户体验的影响
    const debouncedValidate = debounceValidation((input, validator) => {
        const value = input.value.trim();
        if (!value) return; // 不验证空值
        
        const result = validator(value);
        const fieldName = getFieldDisplayName(input);
        
        if (result === true) {
            // 验证成功时不总是显示toast，只在一些关键字段上显示
            if (input === streamCodeInput) {
                toast.success(`${fieldName}格式正确`, '格式有效', { duration: 1500 });
            }
        } else {
            // 验证失败时显示友好的错误提示
            const errorMsg = result.replace('Error: ', '');
            toast.warning(`${fieldName}格式有误`, errorMsg, { duration: 2000 });
        }
    }, 800); // 800ms的防抖延迟
    
    // 输入框内容变化时移除错误提示并更新URL
    [streamCodeInput, streamIpInput, streamPortInput, streamSchemaInput, streamVhostInput].forEach(input => {
        input.addEventListener('input', function() {
            removeError(this);
            debouncedUpdateURL();
            
            // 实时验证 - 但使用防抖以避免频繁触发
            if (this.value.trim().length > 0) {
                // 根据不同字段使用不同的验证器
                let validator;
                switch(this.id) {
                    case 'stream-code':
                        validator = validators.streamCode;
                        break;
                    case 'stream-ip':
                        validator = validators.serverLocation;
                        break;
                    case 'stream-port':
                        validator = validators.portNumber;
                        break;
                    case 'stream-schema':
                        validator = validators.schema;
                        break;
                    case 'stream-vhost':
                        validator = validators.vhost;
                        break;
                }
            }
        });
    });
    
    // 为Stream Code输入框添加回车键事件监听
    streamCodeInput.addEventListener('keydown', function(e) {
        // 如果按下的是Enter键
        if (e.key === 'Enter') {
            // 阻止默认行为
            e.preventDefault();
            
            // 立即更新URL
            updateURLParams();
            
            // 如果高级选项未展开，则模拟点击Enter按钮
            if (advancedSettings.style.display !== 'flex') {
                enterButton.click();
            }
        }
    });
});
