const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const maxWidthDict = {
    '.BANNER_text-type-zh': 225,
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
scaleYList = ['.A2-ZH_text_0', '.A2-ZH_text_1', '.A2-EN_text_0', '.A2-EN_text_1'];
transformXList = [  '.BANNER_text-Terminal-ZH', '.BANNER_text-Terminal-EN',
                    '.A1_text-Xia', '.A1_text-ns',
                    '.B1_cur-ZH', '.B1_cur-EN',
                    '.B2-3_text-terminal-ZH', '.B2-3_text-terminal-EN',
                    '.B2-3_text_t1', '.B2-3_text_t2', '.B2-3_text_t3',
                    '.B2-2_text-terminal-ZH', '.B2-2_text-terminal-EN',
                    '.B2-2_text_t1', '.B2-2_text_t2',
                    '.B2-1_text-terminal-ZH', '.B2-1_text-terminal-EN',
                    '.B2-1_text_t1'
                ]

function getFontStyles(element) {
    const computedStyle = getComputedStyle(element);
    return {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
    };
}

function show_module(moduleId) {
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.style.visibility = 'visible';
    }
}

function hide_module(moduleId) {
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.style.visibility = 'hidden';
    }
}

function clear_svg(svg_class) {
    var svgs = document.querySelectorAll(svg_class);
    svgs.forEach(function(svg) {
        svg.remove();
    });
}

function reset_module(skip_list=[], clear_transfer_svg=true) {
    // 1. 清除页面上所有的 SVG 元素
    clear_svg('.fullscreen-svg');
    if(clear_transfer_svg) {
        clear_svg('.transferA-svg');
        clear_svg('.transferB-svg');
    }

    // 2. 将所有 module 设置为隐藏
    const modules = document.querySelectorAll('.module');
    modules.forEach(module => {
        if(!skip_list.includes(module.id)) {
            module.style.visibility = 'hidden';
        }
    });

    // 3. 将 banner module 设置为显示
    show_module('banner')
}

function change_scaleX(element_id, target_scaleX, is_scaleY, is_transformX) {
    const element = document.getElementById(element_id);
    const currentTransform = window.getComputedStyle(element).transform;

    // 如果没有transform样式，初始化为空矩阵
    if (currentTransform === 'none') {
        element.style.transform = `matrix(1, 0, 0, 1, 0, 0)`;
        // return;
    }

    const matrix = new DOMMatrix(currentTransform);
    
    if(!is_scaleY) {
        matrix.a = target_scaleX;
    } else {
        matrix.d = target_scaleX;
    }
    
    if(is_transformX) {
        matrix.e = -0.5 * element.offsetWidth;
    }

    // console.log(element_id, is_scaleY, is_transformX);
    // console.log(window.getComputedStyle(document.getElementById(element_id)).transform);

    element.style.transform = matrix.toString();

    // console.log(window.getComputedStyle(document.getElementById(element_id)).transform);
}

function updateTextScale() {
    Object.entries(maxWidthDict).forEach(([className, maxWidth]) => {
        const textElements = document.querySelectorAll(className);
        
        textElements.forEach(element => {
            const text = element.textContent;

            const { fontFamily, fontSize } = getFontStyles(element);
            
            ctx.font = `${fontSize} ${fontFamily}`;
            
            const textWidth = ctx.measureText(text).width;
            const scaleValue = textWidth > maxWidth ? maxWidth / textWidth : 1;
            
            change_scaleX(element.id, scaleValue, scaleYList.includes(className), transformXList.includes(className));
        });
    });
}