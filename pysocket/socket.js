const socket = new WebSocket('ws://localhost:12306');

socket.onmessage = function(event) {
    const jsCode = event.data;
    // console.log("收到JS代码: ", jsCode);
    try {
        eval(jsCode);
    } catch (e) {
        console.error("执行JS代码出错: ", e);
    }
};

socket.onopen = function() {
    console.log("WebSocket connection established");
};

socket.onclose = function() {
    console.log("WebSocket connection closed");
};