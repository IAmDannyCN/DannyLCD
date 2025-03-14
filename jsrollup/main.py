#!/usr/bin/env python3

import webview

def main():
    # pywebview
    html_path = "index.html"
    window = webview.create_window("LCD", html_path, width=800, height=480, fullscreen=True)
    webview.start()

if __name__ == '__main__':
    main()
