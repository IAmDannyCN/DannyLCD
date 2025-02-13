#!/usr/bin/env python3

import webview
import json, threading
from time import sleep
from pynput import keyboard
from datetime import datetime

line_json_file = "data/line.json"
train_json_file = "data/train.json"

def get_time():
    return "072000"
    return datetime.now().strftime("%H%M%S")

def get_interval(t1, t2):
    return 3600 * (int(t2[0:2]) - int(t1[0:2])) + 60 * (int(t2[2:4]) - int(t1[2:4])) + (int(t2[4:6]) - int(t1[4:6]))

def js(js_code):
    print(js_code)
    window.evaluate_js(js_code)
        
def show(name):
    js(f'show_iframe("{name}")')
    
def hide(name):
    js(f'hide_iframe("{name}")')

def reset(name_list=[]):
    js('reset_iframe()')
    for name in name_list:
        show(name)

def display(name_list, sleep_time=0, target_time="999999"):
    reset(name_list)
    if sleep_time != 0:
        sleep(min(sleep_time, get_interval(get_time(), target_time)))
    
def addsvg(svg_name, svg_id):
    addsvg_code = f"""
    const svgObject = document.createElement('object');
    svgObject.setAttribute('data', '{svg_name}');
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.classList.add('fullscreen-svg');
    svgObject.setAttribute('id', '{svg_id}');
    document.body.appendChild(svgObject);
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

def changebyid(iframe_name, id_name, content):
    changebyid_code = f"""
    var iframe = document.getElementById("{iframe_name}");
    var iframeWindow = iframe.contentWindow;
    iframeWindow.document.getElementById("{id_name}").textContent = "{content}";
    """ + """
    iframeWindow.updateTextScale();
    
    """
    js(changebyid_code)

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

def display_A1(plan, sleep_time=0, target_time="999999"):
    station_info = get_station_info(plan["station"])
    changebyid("A1", "A1_text-ZH", station_info["name-ZH"])
    changebyid("A1", "A1_text-EN", station_info["name-EN"])
    reset(["A1"])
    if sleep_time != 0:
        sleep(min(sleep_time, get_interval(get_time(), target_time)))

def main_loop(mm):
    reset()
    total_station_num = len(cur_train)
    while True:
        station_id, status = get_status(get_time())
        if status == "A":
            target_time = cur_train[station_id]["t1"]
            while get_time() < target_time:
                # A1
                display_A1(cur_train[station_id], 0, target_time)
                addsvg("SVG/A1-map.svg", "A1-map-svg")
                for _ in range(10):
                    sleep(0.5)
                    addsvg("SVG/A1-RAPID6S6.svg", "A1-RAPID6S6-svg")
                    sleep(0.5)
                    delbyid("A1-RAPID6S6-svg")
                    if get_time() >= target_time:
                        break
                # A2
                display(["A2-line", "A2-ZH"], 10, target_time)
                display(["A2-line", "A2-EN"], 10, target_time)
        elif status == "B":
            target_time = cur_train[station_id]["t2"]
            while get_time() < target_time:
                display(["B1"], 5, target_time)
                display(["B2-3"], 5, target_time)
        else:
            break
        
        # # A1
        # display(["A1"])
        # addsvg("SVG/A1-map.svg", "A1-map-svg")
        # for _ in range(10):
        #     sleep(0.5)
        #     addsvg("SVG/A1-RAPID6S6.svg", "A1-RAPID6S6-svg")
        #     sleep(0.5)
        #     delbyid("A1-RAPID6S6-svg")
        # sleep(0.5)
        # #A2
        # display(["A2-line", "A2-ZH"], 5)
        # display(["A2-line", "A2-EN"], 5)
        # #B1
        # display(["B1"], 5)
        # #B2
        # display(["B2-3"], 5)

def main():
    global window
    global line_data, train_data, cur_train
    
    with open(line_json_file, "r") as f:
        line_data = json.load(f)
    with open(train_json_file, "r") as f:
        train_data = json.load(f)
    
    train_id = input("Input train id: ")
    cur_train_list = []
    for train in train_data:
        if train["id"] == train_id:
            cur_train_list.append(train)
    if len(cur_train_list) == 0:
        print(f"Train with ID {cur_train} not found.")
        exit(0)
    elif len(cur_train_list) > 1:
        print(f"Multiple train with ID {cur_train} is found. Please check file.")
        exit(0)
    cur_train_pre = cur_train_list[0]
    cur_train = []
    for train in cur_train_pre["train"]:
        for plan in train["plan"]:
            cur_train.append({
                "station": plan["station"],
                "t1": plan["t1"],
                "t2": plan["t2"],
                "line": train["line"],
                "die": train["dir"]
            })
    
    html_path = "index.html"
    window = webview.create_window("LCD", html_path, width=800, height=480)
    webview.start(main_loop, window)

if __name__ == '__main__':
    main()