import os, json

def read_svg_files():
    svg_dict = {}
    for filename in os.listdir():
        if filename.endswith(".svg"):
            with open(filename, "r", encoding="utf-8") as file:
                content = file.read().replace("\n", "")  # 去除所有换行符
            svg_dict[f"SVG/{filename}"] = content
    return svg_dict

if __name__ == "__main__":
    getContent = read_svg_files()
    with open('./svgrollup.json', 'w') as file:
        json.dump(getContent, file, indent=4)
