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

            // 提取字体样式
            const { fontFamily, fontSize } = getFontStyles(element);
            
            // 设置 canvas 上下文的字体
            ctx.font = `${fontSize} ${fontFamily}`; // 动态设置字体

            const textWidth = ctx.measureText(text).width; // 使用canvas测量文本宽度
            const scaleValue = textWidth > maxWidth ? maxWidth / textWidth : 1; // 计算scaleX值
            
            // 获取现有的transform属性（包括CSS定义的部分）
            let currentTransform = getCurrentTransform(element);

            if(scaleYList.includes(className)) {
                currentTransform = currentTransform === 'none'? `scaleY(${scaleValue})` : `${currentTransform} scaleY(${scaleValue})`;
            } else {
                currentTransform = currentTransform === 'none'? `scaleX(${scaleValue})` : `${currentTransform} scaleX(${scaleValue})`;
            }
            
            // 更新 transform 属性
            element.style.transform = currentTransform;
        });
    });
}