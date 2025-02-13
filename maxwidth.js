// 创建一个离屏 canvas，用于测量文本宽度
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 根据CSS类名字典，为每个类名设置最大宽度
const maxWidthDict = {
    '.BANNER_text-type-zh': 230,
    '.BANNER_text-type-en': 218,
    '.BANNER_text-Terminal-ZH': 360,
    '.BANNER_text-Terminal-EN': 360,
    '.A1_text-Xia': 300,
    '.A1_text-ns': 300,
    '.A2-ZH_text_0': 190,
    '.A2-ZH_text_1': 190,
    '.A2-EN_text_0': 180,
    '.A2-EN_text_1': 180,
    '.A2-LINE_text': 62,
    '.B1_cur-ZH': 700,
    '.B1_cur-EN': 700,
    '.B2-3_text-type-zh': 230,
    '.B2-3_text-type-en': 220,
    '.B2-3_text-terminal-ZH': 240,
    '.B2-3_text-terminal-EN': 240,
    '.B2-3_text_t1': 128,
    '.B2-3_text_t2': 128,
    '.B2-3_text_t3': 128,
    '.B2-2_text-type-zh': 230,
    '.B2-2_text-type-en': 220,
    '.B2-2_text-terminal-ZH': 240,
    '.B2-2_text-terminal-EN': 240,
    '.B2-2_text_t1': 128,
    '.B2-2_text_t2': 128,
    '.B2-1_text-type-zh': 230,
    '.B2-1_text-type-en': 220,
    '.B2-1_text-terminal-ZH': 240,
    '.B2-1_text-terminal-EN': 240,
    '.B2-1_text_t1': 128,
};
scaleYList = ['.A2-ZH_text_0', '.A2-ZH_text_1'];

// 提取现有 transform 中的 scaleX
function getCurrentScaleX(transform) {
    const scaleXRegex = /scaleX\(([^)]+)\)/;
    const match = transform.match(scaleXRegex);
    return match ? match[1] : null;
}

// 提取元素的字体样式
function getFontStyles(element) {
    const computedStyle = getComputedStyle(element);
    return {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
    };
}

// 获取元素的当前transform（从computed style）
function getCurrentTransform(element) {
    const computedStyle = getComputedStyle(element);
    return computedStyle.transform;
}

// 更新transform并设置scaleX
function updateTextScale() {
    Object.entries(maxWidthDict).forEach(([className, maxWidth]) => {
        
        // 获取所有需要应用scaleX的元素
        const textElements = document.querySelectorAll(className);
        
        textElements.forEach(element => {
            const text = element.textContent; // 获取文本内容

            console.error(text)
            console.error(element.style.transform)

            // 提取字体样式
            const { fontFamily, fontSize } = getFontStyles(element);
            
            // 设置 canvas 上下文的字体
            ctx.font = `${fontSize} ${fontFamily}`; // 动态设置字体

            const textWidth = ctx.measureText(text).width; // 使用canvas测量文本宽度
            const scaleValue = textWidth > maxWidth ? maxWidth / textWidth : 1; // 计算scaleX值
            
            // 获取现有的transform属性（包括CSS定义的部分）
            let currentTransform = element.style.transform; //getCurrentTransform(element);
            console.error(">>>", currentTransform)

            if(scaleYList.includes(className)) {
                currentTransform = currentTransform === 'none'? `scaleY(${scaleValue})` : `${currentTransform} scaleY(${scaleValue})`;
            } else {
                currentTransform = currentTransform === 'none'? `scaleX(${scaleValue})` : `${currentTransform} scaleX(${scaleValue})`;
            }
            
            // 更新 transform 属性
            console.error(element.style.transform)
            console.error(">>>", currentTransform)
            element.style.transform = currentTransform;
            console.error(element.style.transform)
        });
    });
}

// function updateTextScale() {
//     Object.entries(maxWidthDict).forEach(([className, maxWidth]) => {
//         // 获取所有需要应用scaleX的元素，包括iframe中的元素
//         const textElements = document.querySelectorAll(className);
        
//         textElements.forEach(element => {
//             const text = element.textContent; // 获取文本内容

//             console.error(text)
//             console.error(element.style.transform)

//             // 提取字体样式
//             const { fontFamily, fontSize } = getFontStyles(element);
            
//             // 设置 canvas 上下文的字体
//             ctx.font = `${fontSize} ${fontFamily}`; // 动态设置字体
            
//             const textWidth = ctx.measureText(text).width; // 使用canvas测量文本宽度
//             const scaleValue = textWidth > maxWidth ? maxWidth / textWidth : 1; // 计算scaleX值
            
//             // 获取现有的transform属性（包括CSS定义的部分）
//             let currentTransform = getCurrentTransform(element);

//             if (scaleYList.includes(className)) {
//                 currentTransform = currentTransform === 'none' ? `scaleY(${scaleValue})` : `${currentTransform} scaleY(${scaleValue})`;
//             } else {
//                 currentTransform = currentTransform === 'none' ? `scaleX(${scaleValue})` : `${currentTransform} scaleX(${scaleValue})`;
//             }
            
//             // 更新 transform 属性
//             console.error(element.style.transform)
//             element.style.transform = currentTransform;
//             console.error(element.style.transform)
//         });

//         // 处理 iframe 内的内容
//         const iframes = document.querySelectorAll('iframe');
//         iframes.forEach(iframe => {
//             const iframeDocument = iframe.contentWindow.document;

//             // 查找 iframe 内部的相应元素
//             const iframeTextElements = iframeDocument.querySelectorAll(className);
//             iframeTextElements.forEach(element => {
//                 const text = element.textContent;
//                 const { fontFamily, fontSize } = getFontStyles(element);

//                 ctx.font = `${fontSize} ${fontFamily}`;
//                 const textWidth = ctx.measureText(text).width;
//                 const scaleValue = textWidth > maxWidth ? maxWidth / textWidth : 1;

//                 let currentTransform = getCurrentTransform(element);

//                 if (scaleYList.includes(className)) {
//                     currentTransform = currentTransform === 'none' ? `scaleY(${scaleValue})` : `${currentTransform} scaleY(${scaleValue})`;
//                 } else {
//                     currentTransform = currentTransform === 'none' ? `scaleX(${scaleValue})` : `${currentTransform} scaleX(${scaleValue})`;
//                 }

//                 element.style.transform = currentTransform;
//             });
//         });
//     });
// }


// // 显示指定的 iframe
// function show_iframe(iframe_name) {
//     var iframe = document.getElementById(iframe_name);
//     if (iframe) {
//         iframe.style.display = 'block';  // 显示 iframe
//     }
// }

// // 隐藏指定的 iframe
// function hide_iframe(iframe_name) {
//     var iframe = document.getElementById(iframe_name);
//     if (iframe) {
//         iframe.style.display = 'none';  // 隐藏 iframe
//     }
// }

// 显示指定的 iframe
function show_iframe(iframe_name) {
    var iframe = document.getElementById(iframe_name);
    if (iframe) {
        // 确保 iframe 可见
        iframe.style.visibility = 'visible';

        // 等待 iframe 加载完成，使用 onload 确保内容完全加载
        iframe.onload = function() {
            // 获取 iframe 的尺寸
            var iframeWidth = iframe.offsetWidth;
            var iframeHeight = iframe.offsetHeight;

            // 获取窗口的宽度和高度
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            // 计算偏移量以居中显示
            var offsetX = (windowWidth - iframeWidth) / 2;
            var offsetY = (windowHeight - iframeHeight) / 2;

            // 设置 transform 来确保居中
            iframe.style.transform = `translate(${offsetX}px, ${offsetY}px)`;  // 动态居中
            iframe.updateTextScale();
        };
    }
}

// 隐藏指定的 iframe
function hide_iframe(iframe_name) {
    var iframe = document.getElementById(iframe_name);
    if (iframe) {
        iframe.style.visibility = 'hidden'; // 隐藏 iframe
    }
}

// 重置函数：清除所有 SVG 元素，隐藏所有 iframe，显示 banner
function reset_iframe() {
    // 1. 清除页面上所有的 SVG 元素
    var svgs = document.querySelectorAll('.fullscreen-svg');
    svgs.forEach(function(svg) {
        svg.remove();  // 删除每一个 svg 元素
    });

    // 2. 将所有 iframe 设置为隐藏
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(iframe) {
        iframe.style.visibility = 'hidden';  // 隐藏 iframe
    });

    // 3. 将 banner iframe 设置为显示
    var banner = document.getElementById('banner');
    if (banner) {
        banner.style.visibility = 'visible';  // 显示 banner iframe
    }
}