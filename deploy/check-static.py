#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""部署前静态校验：抓出「页面 JS 语法错误」「HTML 标签不闭合」这两类会让整页失效的问题。

背景：上一轮 SSO 剥离用「按行号删除」的方式改 HTML，删掉了账号弹窗的 DOM 却留下
未闭合的 <div>，还在脚本里留下一个孤立的 `}` —— 结果是 21点大厅页整段内联脚本
语法错误、所有按钮失效，而 HTTP 仍是 200，只看状态码根本发现不了。

用法：
    python3 deploy/check-static.py <源码目录>        # 有严重问题时退出码 1
    python3 deploy/check-static.py /var/www/aios     # 也可校验线上目录
"""
import os
import re
import subprocess
import sys
import tempfile
from html.parser import HTMLParser

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}

NODE = None
for cand in ("/home/ubuntu/.local/node/bin/node", "node"):
    try:
        subprocess.run([cand, "--version"], capture_output=True, check=True)
        NODE = cand
        break
    except Exception:
        continue


def check_js(code, label, problems):
    if NODE is None or not code.strip():
        return
    with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False, encoding="utf-8") as f:
        f.write(code)
        tmp = f.name
    r = subprocess.run([NODE, "--check", tmp], capture_output=True, text=True)
    os.unlink(tmp)
    if r.returncode != 0:
        msg = next((l for l in r.stderr.split("\n") if "Error" in l), r.stderr.strip()[:120])
        problems.append(f"{label}: JS 语法错误 -> {msg.strip()}")


class Balance(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.orphan = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            self.orphan.append((tag, self.getpos()[0]))


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "/home/ubuntu/apps/aios-src"
    problems, warnings = [], []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git", ".vscode")]
        for fn in sorted(filenames):
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, root)
            if fn.endswith(".js"):
                check_js(open(path, encoding="utf-8", errors="ignore").read(), rel, problems)
            elif fn.endswith(".html"):
                html = open(path, encoding="utf-8", errors="ignore").read()
                for i, m in enumerate(re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.S)):
                    check_js(m.group(1), f"{rel} [inline#{i+1}]", problems)
                bal = Balance()
                bal.feed(html)
                if bal.stack:
                    problems.append(f"{rel}: 标签未闭合 {[f'{t}(行{l})' for t, l in bal.stack][:5]}")
                if bal.orphan:
                    problems.append(f"{rel}: 多余闭合标签 {bal.orphan[:5]}")

    print(f"静态校验 {root}")
    if problems:
        print(f"\n严重问题 {len(problems)} 处：")
        for p in problems:
            print("  ✗ " + p)
        return 1
    print("  ✓ 未发现 JS 语法错误 / HTML 标签不闭合")
    for w in warnings:
        print("  · " + w)
    return 0


if __name__ == "__main__":
    sys.exit(main())
