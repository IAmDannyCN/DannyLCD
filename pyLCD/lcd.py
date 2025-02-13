#!/usr/bin/env python3

from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineProfile, QWebEngineSettings
from PyQt5.QtCore import QUrl, QThread, pyqtSignal, Qt
import sys
import time
import threading

from make_lcd_html import *

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

class HtmlWorker(QThread):
    # 定义一个信号用于向主线程发送HTML内容
    update_html_signal = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.current_index = 0  # 当前HTML内容的索引

    def switch_html(self, html_text):
        self.update_html_signal.emit(html_text) # 发射信号更新HTML内容

class HtmlWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HTML Display")
        self.setGeometry(100, 100, 820, 500)

        # 创建WebEngineView以显示HTML内容
        self.web_view = QWebEngineView(self)
        self.setCentralWidget(self.web_view)

        # 创建一个HtmlWorker实例来处理HTML切换
        self.worker = HtmlWorker()
        self.worker.update_html_signal.connect(self.show_html)
        self.worker.start()  # 启动后台线程

    def show_html(self, html_text):
        self.web_view.setHtml(html_text)


def user_loop(window):
    while True:
        # A1
        for _ in range(5):
            window.worker.switch_html(make_html_A1_1())
            time.sleep(0.5)
            window.worker.switch_html(make_html_A1_2())
            time.sleep(1)
        # A2
        window.worker.switch_html(make_html_A2_1())
        time.sleep(5)
        window.worker.switch_html(make_html_A2_2())
        time.sleep(5)
        #B1
        window.worker.switch_html(make_html_B1())
        time.sleep(5)
        window.worker.switch_html(make_html_B2())
        time.sleep(5)

def lcd_main():
    app = QApplication(sys.argv)
    window = HtmlWindow()
    window.show()

    # 启动外部输入循环，使用线程来接收输入
    input_thread = threading.Thread(target=user_loop, args=(window,))
    input_thread.daemon = True  # 确保主程序退出时线程也会退出
    input_thread.start()

    sys.exit(app.exec_())

if __name__ == "__main__":
    lcd_main()
