const lineJsonFile = "line.json";
const trainJsonFile = "train.json";
const curTrainId = getTrainId();

var lineData, trainData, curTrainPre, curTrain;
var stationDataById = {}, lineDataById = {}, trainDataById = {};
var curLines;

function getTime() {
    // return "021300";
    // return "083" + new Date().toISOString().slice(11, 19).replace(":", "");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return hours + minutes + seconds;
}
function getInterval(t1, t2) {
    return 3600 * (parseInt(t2.substring(0, 2)) - parseInt(t1.substring(0, 2))) + 
           60 * (parseInt(t2.substring(2, 4)) - parseInt(t1.substring(2, 4))) + 
           (parseInt(t2.substring(4, 6)) - parseInt(t1.substring(4, 6)));
}
function show(name) {
    updateTextScale();
    show_module(`${name}`);
}
function hide(name) {
    hide_module(`${name}`);
}
function reset(name = 'banner', skipList = [], clearTransferSvg = true) {
    reset_module(skipList, clearTransferSvg);
    show(name);
}
async function display(name, skipList = [], sleepTime = 0, targetTime = "999999", clearTransferSvg = true) {
    reset(name, skipList, clearTransferSvg);
    if (sleepTime !== 0) {
        await sleep(Math.min(sleepTime, getInterval(getTime(), targetTime)));
    }
}
function addFullScreenSvg(svgName, svgId) {
    const addFullScreenSvgCode = `
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '${svgName}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('fullscreen-svg');
    svgObject.setAttribute('id', '${svgId}');
    document.body.appendChild(svgObject);
    `;
    eval(addFullScreenSvgCode);
}
function addTransferASvg(svgName, svgId, moduleName, top, left, scale = 1) {
    const addSvgCode = `
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '${svgName}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('transferA-svg');
    svgObject.setAttribute('id', '${svgId}');
    svgObject.style.top = '${top}px';
    svgObject.style.left = '${left}px';
    svgObject.style.transform = 'scale(${scale})';
    document.getElementById('${moduleName}').appendChild(svgObject);
    `;
    eval(addSvgCode);
}
function addTransferBSvg(svgName, svgId, moduleName, top, left, scale = 1) {
    const addSvgCode = `
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '${svgName}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('transferB-svg');
    svgObject.setAttribute('id', '${svgId}');
    svgObject.style.top = '${top}px';
    svgObject.style.left = '${left}px';
    svgObject.style.transform = 'scale(${scale})';
    document.getElementById('${moduleName}').appendChild(svgObject);
    `;
    eval(addSvgCode);
}
function addDotSvg(mapPos) {
    const addSvgCode = `
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', 'A1-dot.svg');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('dot-svg');
    svgObject.setAttribute('id', 'dot-svg');
    svgObject.style.top = '${mapPos[0] - 54 / 2}px';
    svgObject.style.left = '${mapPos[1] - 54 / 2}px';
    svgObject.style.transform = 'scale(0.75)';
    svgObject.style.transformOrigin = '50% 50%';
    svgObject.style.zIndex = 9999;
    document.getElementById('A1').appendChild(svgObject);
    `;
    eval(addSvgCode);
}
function addInnerShadowSvg(svgName, svgId, top, left, width, height, moduleName, isConst) {
    const svgClass = isConst ? "inner-shadow-svg-const" : "inner-shadow-svg";
    const addInnerShadowSvgCode = `
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '${svgName}.svg');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('${svgClass}');
    svgObject.setAttribute('id', '${svgId}');
    svgObject.style.top = '${top}px';
    svgObject.style.left = '${left}px';
    svgObject.style.width = '${width}px';
    svgObject.style.height = '${height}px';
    svgObject.style.zIndex = 9999;
    document.getElementById('${moduleName}').appendChild(svgObject);
    `;
    eval(addInnerShadowSvgCode);
}
function delByClass(className) {
    const delbyclassCode = `
    const elements = document.querySelectorAll('.${className}');
    elements.forEach(element => element.remove());
    `;
    eval(delbyclassCode);
}
function delById(idName) {
    const delbyidCode = `const element = document.getElementById('${idName}');` + `
    if (element) { element.remove(); }
    `;
    eval(delbyidCode);
}
function showById(idName) {
    const showbyidCode = `document.getElementById("${idName}").style.display = "block";`;
    eval(showbyidCode);
}
function hideById(idName) {
    const hidebyidCode = `document.getElementById("${idName}").style.display = "none";`;
    eval(hidebyidCode);
}
function changeAttribute(idName, attributeName, content) {
    const changeCode = `document.getElementById("${idName}").${attributeName} = "${content}";`;
    eval(changeCode);
}
function changeContent(idName, content) {
    changeAttribute(idName, "textContent", content);
}
function changeClass(idName, className) {
    changeAttribute(idName, "className", className);
}
function changeBg(idName, background) {
    changeAttribute(idName, "style.background", background);
}
function changeBgImg(className, background) {
    document.querySelector(`${className}`).style.backgroundImage = `${background}`;
}
function getStatus(curTime) {
    for (let idx = 0; idx < curTrain.length; idx++) {
        const plan = curTrain[idx];
        if (curTime < plan.t1) {
            return [idx, "A"];
        } else if (curTime < plan.t2) {
            return [idx, "B"];
        }
    }
    return [curTrain.length, "C"];
}
function getStationInfo(stationId) {
    for (let i = 0; i < lineData.station.length; i++) {
        const station = lineData.station[i];
        if (station.id === stationId) {
            return station;
        }
    }
    return {
        id: stationId,
        "name-ZH": `${stationId}号站`,
        "name-EN": `Station ID ${stationId}`,
        "lines": []
    };
}
function getTrainName(trainId) {
    const header = trainId[0];
    const identifier = trainId.slice(1, 3);
    
    if (header === "L") {
        if (identifier === "06") {
            return ["6号线", "Line 6 Local"];
        } else if (identifier === "S6") {
            return ["S6号线", "Line S6 Local"];
        } else if (identifier === "R4") {
            return ["R4号线", "Line R4 Local"];
        } else if (identifier === "R9") {
            return ["R9号线", "Line R9 Local"];
        } else if (identifier === "04") {
            return ["4号线", "Line 4 Local"];
        }
    } else if (header === "R") {
        if (identifier === "XF") {
            return ["新发快速", "XINFA Rapid"];
        } else if (identifier === "JC") {
            return ["机场快速", "Airport Rapid"];
        } else if (identifier === "WL") {
            return ["卧龙快速", "WOLONG Rapid"];
        } else if (identifier === "GX") {
            return ["高新快速", "High-Tech Zone Rapid"];
        }
    } else if (header === "E") {
        if (identifier === "WL") {
            return ["卧龙特快", "WOLONG Express"];
        }
    }
}
function getSvgName(trainId) {
    if (trainId.slice(0, 3) === "L06") {
        return "A1-LOCAL6";
    } else if (trainId.slice(0, 3) === "LS6") {
        return "A1-LOCALS6";
    } else if (trainId.slice(0, 3) === "LR9") {
        return "A1-LOCALR9";
    } else if (trainId.slice(0, 3) === "LR4") {
        const trainData = trainDataById[trainId]["train"];
        const station = trainData[0]["plan"][0]["station"];
        const lastStation = trainData[trainData.length - 1]["plan"][trainData[trainData.length - 1]["plan"].length - 1]["station"];
        if (station === "00019" || lastStation === "00019") {
            return "A1-LOCALR4";
        } else {
            return "A1-LOCALR4short";
        }
    } else if (trainId.slice(0, 3) === "RJC") {
        return "A1-RAPID46";
    } else if (trainId.slice(0, 3) === "RXF") {
        return "A1-RAPID6R9";
    } else if (trainId.slice(0, 3) === "RGX") {
        return "A1-RAPIDS6R4";
    } else if (trainId.slice(0, 3) === "RWL") {
        return "A1-RAPID6S6";
    } else if (trainId.slice(0, 3) === "EWL") {
        return "A1-RAPID6S6";
    }
}
function getA2SvgATransform(num) {
    let transform = [];
    if (num === 1) {
        transform.push({
            "top": 453 - 41 / 2,
            "left": 63 - 41 / 2,
            "scale": 1
        });
    } else if (num === 2) {
        transform.push({
            "top": 453 - 41 / 2,
            "left": 63 - 41 / 2 - 23,
            "scale": 1
        });
        transform.push({
            "top": 453 - 41 / 2,
            "left": 63 - 41 / 2 + 23,
            "scale": 1
        });
    } else {
        let upperNum = Math.floor(num / 2);
        let lowerNum = num - upperNum;
        for (let i = 0; i < upperNum; i++) {
            transform.push({
                "top": 453 - 41 / 2 - 12,
                "left": 63 - 41 / 2 - 25 * (upperNum - 1) / 2 + 25 * i,
                "scale": 0.6
            });
        }
        for (let i = 0; i < lowerNum; i++) {
            transform.push({
                "top": 453 - 41 / 2 + 13,
                "left": 63 - 41 / 2 - 25 * (lowerNum - 1) / 2 + 25 * i,
                "scale": 0.6
            });
        }
    }
    return transform;
}
function getB1SvgTransform(num) {
    let transform = [];
    for (let i = 0; i < num; i++) {
        transform.push([{
            "top": 410,
            "left": 400 - 30 - 185 * (num - 1) / 2 + 185 * i - 35,
            "scale": 1.5
        }, {
            "top": 410,
            "left": 400 - 30 - 185 * (num - 1) / 2 + 185 * i + 35,
            "scale": 1.5
        }]);
    }
    return transform;
}
function displayBanner() {
    let [trainNameZH, trainNameEN] = getTrainName(curTrainPre["id"]);
    addInnerShadowSvg("banner-inner-shadow", "BANNER_inner-shadow",
                     24, 20, 250, 106,
                     "banner", true);
    changeContent("BANNER_text-type-zh", trainNameZH);
    changeContent("BANNER_text-type-en", trainNameEN);
    // changeContent("BANNER_text-Terminal-ZH", stationDataById[curTrain[curTrain.length - 1]["id"]]["name-ZH"]);
    // changeContent("BANNER_text-Terminal-EN", "To " + stationDataById[curTrain[curTrain.length - 1]["id"]]["name-EN"]);
    changeBg("BANNER_frame-ZH", curTrainPre["color"]);
    changeBg("BANNER_frame-EN", curTrainPre["color"]);
    changeBg("BANNER_frame-ti", curTrainPre["color"]);
    let col = curTrainPre["subcolor"];
    let colr = parseInt(col.substring(1, 3), 16) / 255;
    let colg = parseInt(col.substring(3, 5), 16) / 255;
    let colb = parseInt(col.substring(5, 7), 16) / 255;
    changeBgImg(".BANNER_banner", `linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(${Math.floor(238 + colr * 17)}, ${Math.floor(238 + colg * 17)}, ${Math.floor(238 + colb * 17)}, 1) 2.13%, rgba(${Math.floor(183 + colr * 72)}, ${Math.floor(183 + colg * 72)}, ${Math.floor(183 + colb * 72)}, 1) 9.75%, rgba(${Math.floor(134 + colr * 121)}, ${Math.floor(134 + colg * 121)}, ${Math.floor(134 + colb * 121)}, 1) 17.63%, rgba(${Math.floor(93 + colr * 162)}, ${Math.floor(93 + colg * 162)}, ${Math.floor(93 + colb * 162)}, 1) 25.6%, rgba(${Math.floor(59 + colr * 196)}, ${Math.floor(59 + colg * 196)}, ${Math.floor(59 + colb * 196)}, 1) 33.68%, rgba(${Math.floor(33 + colr * 222)}, ${Math.floor(33 + colg * 222)}, ${Math.floor(33 + colb * 222)}, 1) 41.9%, rgba(${Math.floor(15 + colr * 240)}, ${Math.floor(15 + colg * 240)}, ${Math.floor(15 + colb * 240)}, 1) 50.33%, rgba(${Math.floor(4 + colr * 251)}, ${Math.floor(4 + colg * 251)}, ${Math.floor(4 + colb * 251)}, 1) 59.09%, rgba(${Math.floor(colr * 255)}, ${Math.floor(colg * 255)}, ${Math.floor(colb * 255)}, 1) 68.72%)`);
    show("banner");
}
function updateBanner(nextZH, nextEN, terminal=false) {
    if (terminal) {
        changeContent("BANNER_text-Terminal-ZH", nextZH);
        changeContent("BANNER_text-Terminal-EN", nextEN);
    } else {
        changeContent("BANNER_text-Terminal-ZH", "下一站 " + nextZH);
        changeContent("BANNER_text-Terminal-EN", "Next Station: " + nextEN);
    }
}
async function displayA1(plan, sleepTime=0, targetTime="999999") {
    reset("A1");
    if (sleepTime !== 0) {
        await sleep(Math.min(sleepTime, getInterval(getTime(), targetTime)));
    }
}
async function displayA2(pastStations, futureStations, targetTime) {
    let beginColor = curTrainPre["color"];
    let endColorFlag = false;
    changeBg("A2-LINE_seg_7", beginColor);
    
    if (futureStations.length > 6) {
        futureStations = futureStations.slice(0, 6);
        endColorFlag = true;
    }
    if (pastStations.length > 7 - futureStations.length) {
        if (pastStations.length > 8 - futureStations.length) {
            let beginStation = pastStations[pastStations.length - (8 - futureStations.length)];
            beginColor = lineDataById[beginStation["line"]]["color"];
        }
        pastStations = pastStations.slice(pastStations.length - (7 - futureStations.length));
    }
    
    let displayStations = [];
    for (let i = 0; i < (7 - futureStations.length - pastStations.length); i++) {
        displayStations.push({
            "type": 0,
            "name-ZH": "",
            "name-EN": "",
            "t1": "000000",
            "line": "0",
            "color": "#ADADAD",
            "transfer": []
        });
    }

    pastStations.forEach(station => {
        displayStations.push({
            "type": 1,
            "name-ZH": stationDataById[station["id"]]["name-ZH"],
            "name-EN": stationDataById[station["id"]]["name-EN"],
            "t1": station["t1"],
            "line": lineDataById[station["line"]]["id"],
            "color": lineDataById[station["line"]]["color"],
            "transfer": stationDataById[station["id"]]["lines"]
        });
    });

    futureStations.forEach(station => {
        displayStations.push({
            "type": 2,
            "name-ZH": stationDataById[station["id"]]["name-ZH"],
            "name-EN": stationDataById[station["id"]]["name-EN"],
            "t1": station["t1"],
            "line": lineDataById[station["line"]]["id"],
            "color": lineDataById[station["line"]]["color"],
            "transfer": stationDataById[station["id"]]["lines"]
        });
    });

    displayStations.forEach((station, i) => {
        // above line
        if (station["type"] === 0 || station["type"] === 1) {
            changeClass(`A2-LINE_frame_${i}`, "A2-LINE_frame_t0");
            changeClass(`A2-EN_block_${i}`, "A2-EN_text_0");
            changeClass(`A2-ZH_block_${i}`, "A2-ZH_text_0");
            changeContent(`A2-LINE_t${i}`, "");
        } else {
            changeClass(`A2-LINE_frame_${i}`, "A2-LINE_frame_t1");
            changeClass(`A2-EN_block_${i}`, "A2-EN_text_1");
            changeClass(`A2-ZH_block_${i}`, "A2-ZH_text_1");
            let timeInterval = Math.ceil(getInterval(getTime(), station["t1"]) / 60);
            if (timeInterval < 0 || timeInterval > 999) {
                changeContent(`A2-LINE_t${i}`, "--");
            } else {
                changeContent(`A2-LINE_t${i}`, `${timeInterval}`);
            }
        }

        // line
        changeContent(`A2-ZH_block_${i}`, station["name-ZH"]);
        changeContent(`A2-EN_block_${i}`, station["name-EN"]);
        if (i !== 6 || (i === 6 && endColorFlag)) {
            changeBg(`A2-LINE_seg_${i + 1}`, station["color"]);
        }

        // below line
        if (station["type"] !== 0) {
            let transfer = station["transfer"].filter(line => !curLines.includes(line));
            if (transfer.length === 0) {
                return;
            }
            let transform = getA2SvgATransform(transfer.length);
            transfer.forEach((line, lineIdx) => {
                addTransferASvg(`${line}-1.svg`, `A2-transferA-${i}-${lineIdx}`, "A2-line",
                                 transform[lineIdx]["top"], transform[lineIdx]["left"] + 100 * i, transform[lineIdx]["scale"]);
            });
        }
    });

    changeBg("A2-LINE_seg_0", beginColor);
    if (curTrainPre["id"][0] === "L") {
        for (let i = 0; i < 8; i++) {
            changeBg(`A2-LINE_seg_${i}`, curTrainPre["subcolor"]);
        }
    }

    let color = curTrainPre["color"];
    document.getElementById("A2-line-svg").getElementsByTagName("polygon")[0].setAttribute("fill", color);
    reset("A2-line", [], false);
    await display("A2-ZH", ["A2-line"], 10, targetTime, false);
    await display("A2-EN", ["A2-line"], 10, targetTime, false);
}
async function displayB1(station, showTime, targetTime) {
    changeContent("B1_cur-ZH", station["name-ZH"]);
    changeContent("B1_cur-EN", station["name-EN"]);
    
    let transfer = station["lines"].filter(line => !curLines.includes(line));
    let transform = getB1SvgTransform(transfer.length);

    if (transfer.length === 0) {
        document.getElementById('B1_cur-ZH').style.top = '180px';
        document.getElementById('B1_cur-EN').style.top = '350px';
        document.getElementById('B1-transfershadow').style.display = 'none';
    } else {
        document.getElementById('B1_cur-ZH').style.top = '140px';
        document.getElementById('B1_cur-EN').style.top = '300px';
        document.getElementById('B1-transfershadow').style.display = 'block';
    }

    reset("B1");

    transfer.forEach((line, lineIdx) => {
        addTransferASvg(`${line}-1.svg`, `B1-transferA-${lineIdx}`, "B1", 
                        transform[lineIdx][0]["top"], transform[lineIdx][0]["left"], transform[lineIdx][0]["scale"]);
        addTransferBSvg(`${line}-2.svg`, `B1-transferB-${lineIdx}`, "B1", 
                        transform[lineIdx][1]["top"], transform[lineIdx][1]["left"], transform[lineIdx][1]["scale"]);
    });

    let interval = getInterval(getTime(), targetTime);
    await sleep(Math.min(showTime, interval));
}
function prepareB2(stationId, curDir, curTime) {
    let candidateDict = {};
    let curType = curTrainPre["id"].slice(0, 3);
    
    trainData.forEach((train) => {
        let trainType = train["id"].slice(0, 3);
        if (trainType === curType) {
            return;
        }
        
        let traint2 = "";
        let flagt2 = false;
        for (let planIdx = 0; planIdx < train["train"].length; planIdx++) {
            let plan = train["train"][planIdx];
            if (plan["dir"] !== curDir) {
                continue;
            }
            for (let stationIdx = 0; stationIdx < plan["plan"].length; stationIdx++) {
                let station = plan["plan"][stationIdx];
                if (planIdx === train["train"].length - 1 && stationIdx === plan["plan"].length - 1) {
                    continue;
                }
                if (station["station"] === stationId && station["t2"] >= curTime) {
                    traint2 = station["t2"];
                    flagt2 = true;
                    break;
                }
            }
            if (flagt2) {
                break;
            }
        }
        if (!flagt2) {
            return;
        }

        candidateDict[trainType] = {
            "id": train["id"],
            "terminal": train["train"][train["train"].length - 1]["plan"][train["train"][train["train"].length - 1]["plan"].length - 1]["station"],
            "t2": traint2,
            "color": train["color"],
            "subcolor": train["subcolor"],
            "platform": train["train"][0]["plan"][0]["platform"]
        };
    });
    
    let candidateList = Object.entries(candidateDict).sort((a, b) => a[1]["t2"] - b[1]["t2"]);
    candidateList = candidateList.filter(candidate => getInterval(getTime(), candidate[1]["t2"]) <= 20 * 60);

    if (candidateList.length > 3) {
        candidateList = candidateList.slice(0, 3);
    }

    return candidateList;
}
async function displayB2(B2List, targetTime) {
    let l = B2List.length;
    let curTime = getTime();
    B2List.forEach((trans, idx) => {
        let i = idx + 1;
        let [trainNameZH, trainNameEN] = getTrainName(trans[1]["id"]);
        changeContent(`B2-${l}_type${i}-ZH`, trainNameZH);
        changeContent(`B2-${l}_type${i}-EN`, trainNameEN);
        let terminalStation = stationDataById[trans[1]["terminal"]];
        changeContent(`B2-${l}_text-terminal${i}-ZH`, terminalStation["name-ZH"]);
        changeContent(`B2-${l}_text-terminal${i}-EN`, terminalStation["name-EN"]);
        changeContent(`B2-${l}_text-t${i}`, Math.floor(getInterval(curTime, trans[1]["t2"]) / 60));
        changeContent(`B2-${l}_text-p${i}`, trans[1]["platform"]);
        changeBg(`B2-${l}_type${i}-ZH-frame`, trans[1]["color"]);
        changeBg(`B2-${l}_type${i}-EN-frame`, trans[1]["color"]);
    });

    reset(`B2-${l}`, [], true);
    if (l === 1) {
        addInnerShadowSvg("B2-inner-shadow", "B2-1_inner-shadow-1", 301, 14, 136, 69.5, "B2-1", false);
    } else if (l === 2) {
        addInnerShadowSvg("B2-inner-shadow", "B2-2_inner-shadow-1", 260, 14, 136, 69.5, "B2-2", false);
        addInnerShadowSvg("B2-inner-shadow", "B2-2_inner-shadow-2", 351, 14, 136, 69.5, "B2-2", false);
    } else if (l === 3) {
        addInnerShadowSvg("B2-inner-shadow", "B2-3_inner-shadow-1", 210, 14, 136, 69.5, "B2-3", false);
        addInnerShadowSvg("B2-inner-shadow", "B2-3_inner-shadow-2", 301, 14, 136, 69.5, "B2-3", false);
        addInnerShadowSvg("B2-inner-shadow", "B2-3_inner-shadow-3", 392, 14, 136, 69.5, "B2-3", false);
    }

    await sleep(Math.min(4 + 3 * l, getInterval(getTime(), targetTime)));
}

async function mainLoop() {

    // banner
    displayBanner();
    changeContent("A1_text-ZH", stationDataById[curTrain[curTrain.length - 1]["id"]]["name-ZH"]);
    changeContent("A1_text-EN", stationDataById[curTrain[curTrain.length - 1]["id"]]["name-EN"]);
    
    while (true) {
        let statusList = getStatus(getTime());
        let stationIdx = statusList[0];
        let status = statusList[1];
        if (status === "A") {
            let station = stationDataById[curTrain[stationIdx]["id"]];
            updateBanner(station["name-ZH"], station["name-EN"]);
            let targetTime = curTrain[stationIdx]["t1"];
            while (getTime() < targetTime) {
                // A1
                await displayA1(curTrain[stationIdx], 0, targetTime);
                // map-svg
                addFullScreenSvg("A1-map.svg", "A1-map-svg");
                let svgName = getSvgName(curTrainPre["id"]);
                // dot-svg
                addDotSvg(station["mappos"]);
                
                await sleep(0.5);
                addFullScreenSvg(`${svgName}.svg`, `${svgName}-svg`);
                for (let i = 0; i < 10; i++) {
                    showById(`${svgName}-svg`);
                    await sleep(0.5);
                    hideById(`${svgName}-svg`);
                    await sleep(0.5);
                    if (getTime() >= targetTime) {
                        break;
                    }
                }
                // A2
                if (getTime() >= targetTime) {
                    break;
                }
                let pastStations = curTrain.slice(0, stationIdx);
                let futureStations = curTrain.slice(stationIdx);
                await displayA2(pastStations, futureStations, targetTime);
            }
        } else if (status === "B") {
            let station = stationDataById[curTrain[stationIdx]["id"]];
            if (curTrain.length === stationIdx + 1) {
                updateBanner("终点站", "Terminal Station", 1);
            } else {
                updateBanner(stationDataById[curTrain[stationIdx + 1]["id"]]["name-ZH"], stationDataById[curTrain[stationIdx + 1]["id"]]["name-EN"]);
            }
            let targetTime = curTrain[stationIdx]["t2"];
            
            while (getTime() < targetTime) {
                let B2List = prepareB2(curTrain[stationIdx]["id"], curTrain[stationIdx]["dir"], curTrain[stationIdx]["t1"]);
                if (B2List.length === 0) {
                    // B1
                    await displayB1(station, 999999, targetTime);
                } else {
                    // B1
                    await displayB1(station, 6, targetTime);
                    B2List = prepareB2(curTrain[stationIdx]["id"], curTrain[stationIdx]["dir"], curTrain[stationIdx]["t1"]);
                    // B2
                    await displayB2(B2List, targetTime);
                }
            }
        } else {
            console.log("END OF THE TRAIN.");
            return;
        }
    }
}
async function showPrepare() {
    // prepare

    fetch(lineJsonFile)
        .then(response => response.json())
        .then(data => {
            lineData = data;

            fetch(trainJsonFile)
                .then(response => response.json())
                .then(data => {
                    trainData = data;

                    lineData["station"].forEach(station => {
                        stationDataById[station["id"]] = station;
                    });

                    lineData["line"].forEach(line => {
                        lineDataById[line["id"]] = line;
                    });

                    trainData.forEach(train => {
                        trainDataById[train["id"]] = train;
                    });

                    // input and choose

                    let curTrainList = [];
                    trainData.forEach(train => {
                        if (train["id"].startsWith(curTrainId)) {
                            let curTime = getTime();
                            if (train["train"][0]["plan"][0]["t1"] <= curTime && train["train"][train["train"].length - 1]["plan"][train["train"][train["train"].length - 1]["plan"].length - 1]["t2"] >= curTime) {
                                curTrainList.push(train);
                            }
                        }
                    });

                    if (curTrainList.length === 0) {
                        console.log(`Train with ID ${curTrainId} as prefix not found or not in service.`);
                        return;
                    }
                    curTrainPre = curTrainList[Math.floor(Math.random() * curTrainList.length)];

                    console.log(curTrainPre["id"]);

                    // construct
                    curTrain = [];
                    curTrainPre["train"].forEach(train => {
                        train["plan"].forEach(plan => {
                            curTrain.push({
                                "id": plan["station"],
                                "t1": plan["t1"],
                                "t2": plan["t2"],
                                "line": train["line"],
                                "dir": train["dir"]
                            });
                        });
                    });

                    curLines = [];
                    curTrainPre["train"].forEach(train => {
                        curLines.push(train["line"]);
                    });
                })
                .catch(err => console.error('Error loading train data:', err));
        })
        .catch(err => console.error('Error loading line data:', err));
}

async function coreMain() {
    await showPrepare();
    await sleep(0.5);
    if(curTrain) {
        await mainLoop();
    }
}