import os
import re

def modify_svg_classes(svg_text, file_name):
    # Step 1: 找出所有符合 "class="cls-XXX"" 的类名并存入一个列表
    class_names = re.findall(r'class="(cls-\S+)"', svg_text)
    
    # Step 2: 逐个遍历 class_names，并将 "cls-XXX" 替换为 "cls-XXX-文件名"
    for class_name in class_names:
        svg_text = svg_text.replace(class_name, f'{class_name}-{file_name}')
    
    return svg_text

def process_svg_files_in_folder(folder_path):
    # 遍历文件夹内所有的SVG文件
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.svg'):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r', encoding='utf-8') as file:
                svg_text = file.read()

            # 修改类名
            modified_svg = modify_svg_classes(svg_text, file_name[:-4])  # 去掉文件扩展名

            # 保存修改后的SVG文件
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(modified_svg)
            print(f"Modified: {file_name}")

# 使用当前目录作为文件夹路径
process_svg_files_in_folder('.')
