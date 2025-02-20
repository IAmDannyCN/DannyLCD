#!/usr/bin/env python3

import webview, os
import json, threading, math
from time import sleep
from pynput import keyboard
from datetime import datetime

line_json_file = "data/line.json"
train_json_file = "data/train.json"

def get_time():
    # return "070800"
    return "07" + datetime.now().strftime("%H%M%S")[2:]
    return datetime.now().strftime("%H%M%S")

def get_interval(t1, t2):
    return 3600 * (int(t2[0:2]) - int(t1[0:2])) + 60 * (int(t2[2:4]) - int(t1[2:4])) + (int(t2[4:6]) - int(t1[4:6]))

def js(js_code):
    # print(js_code)
    window.evaluate_js(js_code)
        
def show(name):
    js("updateTextScale();")
    js(f'show_module("{name}")')
    
def hide(name):
    js(f'hide_module("{name}")')

def reset(name='banner', skip_list=[], clear_transfer_svg=True):
    js(f'reset_module({skip_list}, {int(clear_transfer_svg)})')
    show(name)

def display(name, skip_list=[], sleep_time=0, target_time="999999", clear_transfer_svg=True):
    reset(name, skip_list, clear_transfer_svg)
    if sleep_time != 0:
        sleep(min(sleep_time, get_interval(get_time(), target_time)))
    
def addfullscreensvg(svg_name, svg_id):
    addfullscreensvg_code = f"""
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '{svg_name}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('fullscreen-svg');
    svgObject.setAttribute('id', '{svg_id}');
    document.body.appendChild(svgObject);
    """
    js(addfullscreensvg_code)

def addtransferAsvg(svg_name, svg_id, module_name, top, left, scale=1): 
    addsvg_code = f"""
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '{svg_name}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('transferA-svg'); 
    svgObject.setAttribute('id', '{svg_id}');
    svgObject.style.top = '{top}px';
    svgObject.style.left = '{left}px';
    svgObject.style.transform = 'scale({scale})';
    document.getElementById('{module_name}').appendChild(svgObject);
    """
    js(addsvg_code)

def addtransferBsvg(svg_name, svg_id, module_name, top, left, scale=1): 
    addsvg_code = f"""
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '{svg_name}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('transferB-svg'); 
    svgObject.setAttribute('id', '{svg_id}');
    svgObject.style.top = '{top}px';
    svgObject.style.left = '{left}px';
    svgObject.style.transform = 'scale({scale})';
    document.getElementById('{module_name}').appendChild(svgObject);
    """
    js(addsvg_code)

def delbyclass(class_name):
    delbyclass_code = f"""
    const elements = document.querySelectorAll('.{class_name}');
    elements.forEach(element => element.remove());
    """
    js(delbyclass_code)

def delbyid(id_name):
    delbyid_code = f"""const element = document.getElementById('{id_name}');""" + """
    if (element) { element.remove(); }
    """
    js(delbyid_code)

def change_attribute(id_name, attribute_name, content):
    change_code = f"""document.getElementById("{id_name}").{attribute_name} = "{content}";"""
    js(change_code)

def change_content(id_name, content):
    change_attribute(id_name, "textContent", content)
def change_class(id_name, class_name):
    change_attribute(id_name, "className", class_name)
def change_bg(id_name, background):
    change_attribute(id_name, "style.background", background)
def change_bgimg(class_name, background):
    change_code = f"""document.querySelector("{class_name}").style.backgroundImage = "{background}"; """
    js(change_code)


def get_status(cur_time):
    for idx, plan in enumerate(cur_train):
        if cur_time < plan["t1"]:
            return idx, "A"
        elif cur_time < plan["t2"]:
            return idx, "B"
    return len(cur_train), "C"

def get_station_info(station_id):
    for station in line_data["station"]:
        if station["id"] == station_id:
            return station
    return {"id": station_id, "name-ZH": f"{id}号站", "name-EN": f"Station ID {id}", "lines": []}

def get_train_name(train_id):
    header = train_id[0]
    identifier = train_id[1:3]
    if header == "L":
        if identifier == "06":
            return "6号线", "Line 6 Local"
        elif identifier == "S6":
            return "S6号线", "Line S6 Local"
    elif header == "R":
        if identifier == "XF":
            return "新发快速", "XINFA Rapid"
        elif identifier == "JC":
            return "机场快速", "Airport Rapid"
        elif identifier == "WL":
            return "卧龙快速", "WOLONG Rapid"
        elif identifier == "GX":
            return "高新快速", "High-Tech Zone Rapid"
    elif header == "E":
        if identifier == "WL":
            return "卧龙特快", "WOLONG Express"

def get_svg_name(train_id):
    if train_id[0:3] == "L06":
        return "A1-LOCAL6"
    elif train_id[0:3] == "LS6":
        return "A1-LOCALS6"
    elif train_id[0:3] == "RJC":
        return "A1-RAPID46"
    elif train_id[0:3] == "RXF":
        return "A1-RAPID6R9"
    elif train_id[0:3] == "RGX":
        return "A1-RAPIDS6R4"
    elif train_id[0:3] == "RWL":
        return "A1-RAPID6S6"
    elif train_id[0:3] == "EWL":
        return "A1-RAPID6S6"

def get_A2svgA_transform(num):
    transform = []
    if num == 1:
        transform.append({
            "top": 453-41/2,
            "left": 63-41/2,
            "scale": 1
        })
    elif num == 2:
        transform.append({
            "top": 453-41/2,
            "left": 63-41/2-23,
            "scale": 1
        })
        transform.append({
            "top": 453-41/2,
            "left": 63-41/2+23,
            "scale": 1
        })
    # elif num == 3:
    #     transform.append({
    #         "top": 453-41/2,
    #         "left": 63-41/2-30,
    #         "scale": 0.7
    #     })
    #     transform.append({
    #         "top": 453-41/2,
    #         "left": 63-41/2,
    #         "scale": 0.7
    #     })
    #     transform.append({
    #         "top": 453-41/2,
    #         "left": 63-41/2+30,
    #         "scale": 0.7
    #     })
    else:
        upper_num = num // 2
        lower_num = num - upper_num
        for i in range(upper_num):
            transform.append({
                "top": 453-41/2-12,
                "left": 63-41/2-25*(upper_num-1)/2+25*i,
                "scale": 0.6
            })
        for i in range(lower_num):
            transform.append({
                "top": 453-41/2+13,
                "left": 63-41/2-25*(lower_num-1)/2+25*i,
                "scale": 0.6
            })
    return transform

def get_B1svg_transform(num):
    transform = []
    for i in range(num):
        transform.append(({
            "top": 410,
            "left": 400-30-185*(num-1)/2+185*i-35,
            "scale": 1.5
        }, {
            "top": 410,
            "left": 400-30-185*(num-1)/2+185*i+35,
            "scale": 1.5
        }))
    return transform

def display_banner():
    train_name_ZH, train_name_EN = get_train_name(cur_train_pre["id"])
    change_content("BANNER_text-type-zh", train_name_ZH)
    change_content("BANNER_text-type-en", train_name_EN)
    change_content("BANNER_text-Terminal-ZH", station_data_by_id[cur_train[-1]["id"]]["name-ZH"])
    change_content("BANNER_text-Terminal-EN", "To " + station_data_by_id[cur_train[-1]["id"]]["name-EN"])
    change_bg("BANNER_frame-ZH", cur_train_pre["color"])
    change_bg("BANNER_frame-EN", cur_train_pre["color"])
    col = cur_train_pre["subcolor"]
    colr = int(col[1:3], 16) / 255
    colg = int(col[3:5], 16) / 255
    colb = int(col[5:7], 16) / 255
    change_bgimg(".BANNER_banner", f"linear-gradient(0deg, rgba({int(255)}, {int(255)}, {int(255)}, 1) 0%, rgba({int(238+colr*17)}, {int(238+colg*17)}, {int(238+colb*17)}, 1) 2.13%, rgba({int(183+colr*72)}, {int(183+colg*72)}, {int(183+colb*72)}, 1) 9.75%, rgba({int(134+colr*121)}, {int(134+colg*121)}, {int(134+colb*121)}, 1) 17.63%, rgba({int(93+colr*162)}, {int(93+colg*162)}, {int(93+colb*162)}, 1) 25.6%, rgba({int(59+colr*196)}, {int(59+colg*196)}, {int(59+colb*196)}, 1) 33.68%, rgba({int(33+colr*222)}, {int(33+colg*222)}, {int(33+colb*222)}, 1) 41.9%, rgba({int(15+colr*240)}, {int(15+colg*240)}, {int(15+colb*240)}, 1) 50.33%, rgba({int(4+colr*251)}, {int(4+colg*251)}, {int(4+colb*251)}, 1) 59.09%, rgba({int(colr*255)}, {int(colg*255)}, {int(colb*255)}, 1) 68.72%)")

def display_A1(plan, sleep_time=0, target_time="999999"):
    station_info = get_station_info(plan["id"])
    change_content("A1_text-ZH", station_info["name-ZH"])
    change_content("A1_text-EN", station_info["name-EN"])
    reset("A1")
    if sleep_time != 0:
        sleep(min(sleep_time, get_interval(get_time(), target_time)))

def display_A2(past_stations, future_stations, target_time):
    begin_color = cur_train_pre["color"]
    end_color_flag = False
    change_bg("A2-LINE_seg_7", begin_color)
    
    if len(future_stations) > 6:
        future_stations = future_stations[:6]
        end_color_flag = True
    if len(past_stations) > 7 - len(future_stations):
        if len(past_stations) > 8 - len(future_stations):
            begin_station = past_stations[len(past_stations) - (8 - len(future_stations))]
            begin_color = line_data_by_id[begin_station["line"]]["color"]
        past_stations = past_stations[len(past_stations) - (7 - len(future_stations)):]
    
    display_stations = []
    for _ in range(7 - len(future_stations) - len(past_stations)):
        display_stations.append({
            "type": 0,
            "name-ZH": "",
            "name-EN": "",
            "t1": "000000",
            "line": "0",
            "color": "#ADADAD",
            "transfer": []
        })
    for station in past_stations:
        display_stations.append({
            "type": 1,
            "name-ZH": station_data_by_id[station["id"]]["name-ZH"],
            "name-EN": station_data_by_id[station["id"]]["name-EN"],
            "t1": station["t1"],
            "line": line_data_by_id[station["line"]]["id"],
            "color": line_data_by_id[station["line"]]["color"],
            "transfer": station_data_by_id[station["id"]]["lines"]
        })
    for station in future_stations:
        display_stations.append({
            "type": 2,
            "name-ZH": station_data_by_id[station["id"]]["name-ZH"],
            "name-EN": station_data_by_id[station["id"]]["name-EN"],
            "t1": station["t1"],
            "line": line_data_by_id[station["line"]]["id"],
            "color": line_data_by_id[station["line"]]["color"],
            "transfer": station_data_by_id[station["id"]]["lines"]
        })
    
    for i in range(7):
        station = display_stations[i]
        # above line
        if station["type"] == 0 or station["type"] == 1:
            change_class(f"A2-LINE_frame_{i}", "A2-LINE_frame_t0")
            change_class(f"A2-EN_block_{i}", "A2-EN_text_0")
            change_class(f"A2-ZH_block_{i}", "A2-ZH_text_0")
            change_content(f"A2-LINE_t{i}", "")
        else:
            change_class(f"A2-LINE_frame_{i}", "A2-LINE_frame_t1")
            change_class(f"A2-EN_block_{i}", "A2-EN_text_1")
            change_class(f"A2-ZH_block_{i}", "A2-ZH_text_1")
            time_interval = math.ceil(get_interval(get_time(), station["t1"]) / 60)
            if time_interval < 0 or time_interval > 999:
                change_content(f"A2-LINE_t{i}", "--")
            else:
                change_content(f"A2-LINE_t{i}", f"{time_interval}")
        
        # line
        change_content(f"A2-ZH_block_{i}", station["name-ZH"])
        change_content(f"A2-EN_block_{i}", station["name-EN"])
        if i != 6 or (i == 6 and end_color_flag):
            change_bg(f"A2-LINE_seg_{i+1}", station["color"])
        
        # below line
        if station["type"] != 0:
            transfer = [line for line in station["transfer"] if line not in cur_lines]
            if len(transfer) == 0:
                continue
            transform = get_A2svgA_transform(len(transfer))
            for line_idx, line in enumerate(transfer):
                addtransferAsvg(f"SVG/{line}-1.svg", f"A2-transferA-{i}-{line_idx}", module_name="A2-line",
                                top=transform[line_idx]["top"],
                                left=transform[line_idx]["left"] + 100 * i,
                                scale=transform[line_idx]["scale"])
    
    change_bg("A2-LINE_seg_0", begin_color)
    if cur_train_pre["id"][0] == "L":
        for i in range(8):
            change_bg(f"A2-LINE_seg_{i}", cur_train_pre["subcolor"])
    
    color = cur_train_pre["color"]
    js(f"document.getElementById(\"A2-line-svg\").getElementsByTagName(\"polygon\")[0].setAttribute(\"fill\", \"{color}\");")
    reset("A2-line", clear_transfer_svg=False)
    display("A2-ZH", ["A2-line"], 10, target_time, clear_transfer_svg=False)
    display("A2-EN", ["A2-line"], 10, target_time, clear_transfer_svg=False)

def display_B1(station, show_time, target_time):
    change_content("B1_cur-ZH", station["name-ZH"] + " 到了")
    change_content("B1_cur-EN", "Arriving at: " + station["name-EN"])
    
    transfer = [line for line in station["lines"] if line not in cur_lines]
    transform = get_B1svg_transform(len(transfer))
    if(len(transfer) == 0):
        js("document.getElementById('B1_cur-ZH').style.top = '180px';")
        js("document.getElementById('B1_cur-EN').style.top = '350px';")
    else:
        js("document.getElementById('B1_cur-ZH').style.top = '150px';")
        js("document.getElementById('B1_cur-EN').style.top = '320px';")
    reset("B1")
    for line_idx, line in enumerate(transfer):
        addtransferAsvg(f"SVG/{line}-1.svg", f"B1-transferA-{line_idx}", module_name="B1",
                        top=transform[line_idx][0]["top"],
                        left=transform[line_idx][0]["left"],
                        scale=transform[line_idx][0]["scale"])
        addtransferBsvg(f"SVG/{line}-2.svg", f"B1-transferB-{line_idx}", module_name="B1",
                        top=transform[line_idx][1]["top"],
                        left=transform[line_idx][1]["left"],
                        scale=transform[line_idx][1]["scale"])
    
    sleep(min(show_time, get_interval(get_time(), target_time)))

def prepare_B2(station_id, cur_dir, cur_time):
    candidate_dict = {}
    cur_type = cur_train_pre["id"][:3]
    
    for train in train_data:
        train_type = train["id"][:3]
        if train_type == cur_type:
            continue
        
        train_t2, flag_t2 = "", False
        for plan in train["train"]:
            if plan["dir"] != cur_dir:
                continue
            for station in plan["plan"]:
                if station["station"] == station_id and station["t2"] >= cur_time:
                    train_t2 = station["t2"]
                    flag_t2 = True
                    break
            if flag_t2:
                break
        if not flag_t2:
            continue
        candidate_dict[train_type] = {
            "id": train["id"],
            "terminal": train["train"][-1]["plan"][-1]["station"],
            "t2": train_t2,
            "color": train["color"],
            "subcolor": train["subcolor"]
        }
    
    candicate_list = sorted(candidate_dict.items(), key=lambda x: x[1]["t2"])
    if len(candicate_list) > 3:
        candicate_list = candicate_list[:3]
    
    return candicate_list

def display_B2(B2_list, target_time):
    def get_bg(col):
        colr = int(col[1:3], 16) / 255
        colg = int(col[3:5], 16) / 255
        colb = int(col[5:7], 16) / 255
        return f"linear-gradient(180deg, rgba({255}, {255}, {255}, 1) 0%, rgba({245+10*colr}, {245+10*colg}, {245+10*colb}, 1) 0.75%, rgba({195+60*colr}, {195+60*colg}, {195+60*colb}, 1) 5.13%, rgba({148+107*colr}, {148+107*colg}, {148+107*colb}, 1) 9.82%, rgba({108+147*colr}, {108+147*colg}, {108+147*colb}, 1) 14.72%, rgba({75+180*colr}, {75+180*colg}, {75+180*colb}, 1) 19.87%, rgba({47+208*colr}, {47+208*colg}, {47+208*colb}, 1) 25.35%, rgba({26+229*colr}, {26+229*colg}, {26+229*colb}, 1) 31.27%, rgba({11+244*colr}, {11+244*colg}, {11+244*colb}, 1) 37.85%, rgba({3+252*colr}, {3+252*colg}, {3+252*colb}, 1) 45.61%, rgba({255*colr}, {255*colg}, {255*colb}, 1) 57.54%)"
    
    l = len(B2_list)
    cur_time = get_time()
    for idx, trans in enumerate(B2_list):
        i = idx + 1
        train_name_ZH, train_name_EN = get_train_name(trans[1]["id"])
        change_content(f"B2-{l}_type{i}-ZH", train_name_ZH)
        change_content(f"B2-{l}_type{i}-EN", train_name_EN)
        terminal_station = station_data_by_id[trans[1]["terminal"]]
        change_content(f"B2-{l}_text-terminal{i}-ZH", "往 " + terminal_station["name-ZH"])
        change_content(f"B2-{l}_text-terminal{i}-EN", "To " + terminal_station["name-EN"])
        change_content(f"B2-{l}_text-t{i}", get_interval(cur_time, trans[1]["t2"]) // 60)
        change_bgimg(f".B2-{l}_frame-t{i}", get_bg(trans[1]["subcolor"]))
        change_bg(f"B2-{l}_type{i}-ZH-frame", trans[1]["color"])
        change_bg(f"B2-{l}_type{i}-EN-frame", trans[1]["color"])
    
    display(f"B2-{l}", [], 3 + 3 * l, target_time)
   
def main_loop(mm):
    total_station_num = len(cur_train)
    
    # banner
    display_banner()
    
    while True:
        station_idx, status = get_status(get_time())
        if status == "A":
            target_time = cur_train[station_idx]["t1"]
            while get_time() < target_time:
                # A1
                display_A1(cur_train[station_idx], 0, target_time)
                addfullscreensvg("SVG/A1-map.svg", "A1-map-svg")
                svg_name = get_svg_name(cur_train_pre["id"])
                sleep(0.5)
                for _ in range(10):
                    addfullscreensvg(f"SVG/{svg_name}.svg", f"{svg_name}-svg")
                    sleep(0.5)
                    delbyid(f"{svg_name}-svg")
                    sleep(0.5)
                    if get_time() >= target_time:
                        break
                # A2
                if get_time() >= target_time:
                    break
                past_stations = cur_train[:station_idx]
                future_stations = cur_train[station_idx:]
                display_A2(past_stations, future_stations, target_time)
            
        elif status == "B":
            target_time = cur_train[station_idx]["t2"]
            
            while get_time() < target_time:
                B2_list = prepare_B2(cur_train[station_idx]["id"], cur_train[station_idx]["dir"], cur_train[station_idx]["t1"])
                if len(B2_list) == 0:
                    # B1
                    display_B1(station_data_by_id[cur_train[station_idx]["id"]], 999999, target_time)
                else:
                    # B1
                    display_B1(station_data_by_id[cur_train[station_idx]["id"]], 10, target_time)
                    # B2
                    display_B2(B2_list, target_time)
        else:
            print("END OF THE TRAIN.")
            os._exit(0)

def main():
    global window
    global line_data, train_data, cur_train_pre, cur_train
    global station_data_by_id, line_data_by_id
    global cur_lines
    
    with open(line_json_file, "r") as f:
        line_data = json.load(f)
    with open(train_json_file, "r") as f:
        train_data = json.load(f)
    
    station_data_by_id = {}
    for station in line_data["station"]:
        station_data_by_id[station["id"]] = station
    
    line_data_by_id = {}
    for line in line_data["line"]:
        line_data_by_id[line["id"]] = line
    
    train_id = input("Input train id: ")
    cur_train_list = []
    for train in train_data:
        if train["id"] == train_id:
            cur_train_list.append(train)
    if len(cur_train_list) == 0:
        print(f"Train with ID {train_id} not found.")
        exit(0)
    elif len(cur_train_list) > 1:
        print(f"Multiple train with ID {train_id} is found. Please check file.")
        exit(0)
    cur_train_pre = cur_train_list[0]
    cur_train = []
    for train in cur_train_pre["train"]:
        for plan in train["plan"]:
            cur_train.append({
                "id": plan["station"],
                "t1": plan["t1"],
                "t2": plan["t2"],
                "line": train["line"],
                "dir": train["dir"]
            })
    
    cur_lines = []
    for train in cur_train_pre["train"]:
        cur_lines.append(train["line"])
    
    html_path = "index.html"
    window = webview.create_window("LCD", html_path, width=800, height=480)
    webview.start(main_loop, window)

if __name__ == '__main__':
    main()