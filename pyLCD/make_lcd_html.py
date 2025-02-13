def readfile(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

html_base = readfile('base.html')
html_banner = readfile('banner.html')
html_A1 = readfile('A1.html')
html_A2_line = readfile('A2-line.html')
html_A2_ZH = readfile('A2-ZH.html')
html_A2_EN = readfile('A2-EN.html')
html_B1 = readfile('B1.html')
html_B2_1 = readfile('B2-1.html')
html_B2_2 = readfile('B2-2.html')
html_B2_3 = readfile('B2-3.html')
css = readfile('lcd.css')
js = readfile('maxwidth.js')

html_base = html_base.replace("##STYLE##", css)
html_base = html_base.replace("##SCRIPT##", js)
html_base = html_base.replace("##BODY##", html_banner + "\n##BODY##")


def make_svg(svg_path, svg_class):
    def strip_first_line(s):
        return "\n".join(s.split("\n")[1:])
    svg = strip_first_line(readfile(svg_path))
    svg = svg.replace("<svg ", f"<svg class={svg_class} ")
    return svg
    # return f"""\n<img src="file:///home/iad/zt/LCD/{svg_path}" alt="SVG Image" class="{svg_class}">"""

def make_html_A1_1():
    return html_base.replace("##BODY##",    html_A1 +
                                            make_svg('SVG/A1-map.svg', 'fullscreen-svg'))

def make_html_A1_2():
    return html_base.replace("##BODY##",    html_A1 +
                                            make_svg('SVG/A1-map.svg', 'fullscreen-svg') +
                                            make_svg('SVG/A1-RAPID6S6.svg', 'fullscreen-svg'))

def make_html_A2_1():
    return html_base.replace("##BODY##",    html_A2_line + html_A2_ZH)

def make_html_A2_2():
    return html_base.replace("##BODY##",    html_A2_line + html_A2_EN)

def make_html_B1():
    return html_base.replace("##BODY##",    html_B1)

def make_html_B2():
    return html_base.replace("##BODY##",    html_B2_3)