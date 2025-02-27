#!/usr/bin/env python3
import json

pyetgr_path = '../NanJiao.pyetgr'
line_path = './data/line.json'
save_path = './data/train.json'

def getcolor(train_id):
    identifier = train_id[:3]
    if identifier[0] == 'E':
        return '#A60000', '#DF6060'
    elif identifier[0] == 'R':
        return '#132E8E', '#5292EF'
    elif identifier == 'L06':
        return '#06964B', '#1CC669'
    elif identifier == 'LS6':
        return '#DAA5F9', '#E6C8FC'
    elif identifier == 'LR4':
        return '#5292EF', '#8CBDF9'
    elif identifier == 'L04':
        return '#530AC6', '#8D54FC'
    elif identifier == 'LR9':
        return '#EA8C11', '#EFD61D'
    else:
        return '#000000', '#808080'

def split_train(train_id, pre_train):
    def parser(train, parse_rule):
        res = []
        cur_parse = []
        cur_line = 'UNDEF'
        for station in train:
            if station['station'] not in parse_rule:
                cur_parse.append(station)
                continue
            if parse_rule[station['station']] == cur_line:
                cur_parse.append(station)
                continue
            if len(cur_parse) != 0:
                res.append({
                    'line': cur_line,
                    'dir': '2',
                    'plan': cur_parse.copy()
                })
            cur_parse.clear()
            cur_line = parse_rule[station['station']]
            cur_parse.append(station)
        if len(cur_parse) != 0:
            res.append({
                'line': cur_line,
                'dir': '2',
                'plan': cur_parse.copy()
            })
        return res
            
    identifier = train_id[:3]
    
    if identifier == 'EWL':
        parse_rule = {
            '00032': 'S6',
            '00009': '6',
        }
    elif identifier == 'RWL':
        parse_rule = {
            '00032': 'S6',
            '00009': '6',
        }
    elif identifier == 'RGX':
        parse_rule = {
            '00032': 'S6',
            '00019': 'R4',
        }
    elif identifier == 'RXF':
        parse_rule = {
            '00072': 'R9',
            '00011': '6',
        }
    elif identifier == 'RJC':
        parse_rule = {
            '00017': '6',
            '00003': '4',
        }
    elif identifier == 'L06':
        parse_rule = {
            '00011': '6',
            '00017': '6',
        }
    elif identifier == 'LS6':
        parse_rule = {
            '00032': 'S6',
            '00023': 'S6',
        }
    elif identifier == 'LR4':
        parse_rule = {
            '00019': 'R4',
            '00011': 'R4',
        }
    elif identifier == 'LR9':
        parse_rule = {
            '00072': 'R9',
        }
    else:
        parse_rule = {}
    
    return parser(pre_train, parse_rule)

def get_platform(train_id, station_id):
    sideline_rules = {
    # L6
        # LYJC
        ('00017', 'L06') : '2',
        ('00017', 'RJC') : '1',
        # ZP
        ('00016', 'L06') : '1',
        ('00016', 'LR9') : '2',
        # NJZZ
        ('00011', 'L06') : '1',
        ('00011', 'RJC') : '2',
        ('00011', 'RXF') : '2',
        # NJZX
        ('00009', 'L06') : '1',
        ('00009', 'RJC') : '2',
        ('00009', 'RXF') : '2',
        ('00009', 'RWL') : '2',
        ('00009', 'EWL') : '2',
        ('00009', 'LS6') : '3',
        # NSH
        ('00006', 'L06') : '1',
        ('00006', 'RJC') : '2',
        ('00006', 'RXF') : '2',
        ('00006', 'RWL') : '2',
        # HN
        ('00004', 'L06') : '1',
        ('00004', 'RJC') : '2',
        ('00004', 'RXF') : '2',
        ('00004', 'RWL') : '2',
        
    # R4
        # GDL
        ('00055', 'LR4') : '1',
        ('00055', 'RGX') : '2',
        # QB
        ('00019', 'LS6') : '1',
        ('00019', 'RWL') : '1',
        ('00019', 'EWL') : '2',
        ('00019', 'LR4') : '2',
        ('00019', 'RGX') : '2',
        
    # S6
        # WLZ
        ('00032', 'LS6') : '1',
        ('00032', 'RGX') : '2',
        ('00032', 'RWL') : '1',
        ('00032', 'EWL') : '1',
        # HSDD
        ('00025', 'LS6') : '1',
        ('00025', 'RGX') : '2',
        ('00025', 'RWL') : '2',
        # HS
        ('00023', 'LS6') : '1',
        ('00023', 'RGX') : '2',
        ('00023', 'RWL') : '2',
        ('00023', 'EWL') : '2',
    
    # R9
        # no stations left
    
    # L4
        # no stations left
    }
    special_rules = {
        # HS
        ('00023', 'EWL0004') : '1',
    }
    
    plat = '1'
    if (station_id, train_id[:3]) in sideline_rules:
        plat = sideline_rules[(station_id, train_id[:3])]
    if (station_id, train_id) in special_rules:
        plat = special_rules[(station_id, train_id)]
    
    return plat

def main():
    # read data
    global train_data, line_data, station_data
    train_data, line_data, station_data = [], [], []

    with open(pyetgr_path, 'r') as pyetgr_file:
        ori_data = json.load(pyetgr_file)
    with open(line_path, 'r') as line_file:
        line_data = json.load(line_file)
    station_data = line_data['station']
    station_data_by_id = {}
    station_data_by_name = {}
    for station in station_data:
        station_data_by_id[station['id']] = station
        station_data_by_name[station['name-ZH']] = station
    
    # constructor
    all_data = []
    for train in ori_data['trains']:
        cur_data = {
            'id': train['checi'][0],
            'color': 'UNDEF',
            'subcolor': 'UNDEF',
            'train': []        
        }
        cur_data['color'], cur_data['subcolor'] = getcolor(cur_data['id'])
        pre_train = []
        for station_info in train['timetable']:
            t1 = station_info['ddsj'].replace(':', '')
            t2 = station_info['cfsj'].replace(':', '')
            if t1 != t2:
                station_id = station_data_by_name[station_info['zhanming']]['id']
                pre_train.append({
                    'station': station_id,
                    't1': t1,
                    't2': t2,
                    'platform': get_platform(cur_data['id'], station_id)
                })
        cur_data['train'] = split_train(cur_data['id'], pre_train)
        all_data.append(cur_data)
    
    # save
    with open(save_path, 'w') as save_file:
        json.dump(all_data, save_file, indent=4, ensure_ascii=False)
        

if __name__ == '__main__':
    main()