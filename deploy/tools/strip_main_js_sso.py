#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 3d-home/main.js 移除 SSO（统一登录）逻辑，改为游客模式 + 同源服务器路径。

main.js 是 3d 子场景（lobby/house/farm/pvp/lake/castle）的入口源码（非压缩）。
它加载的页面中不存在 sso-login-btn / sso-user-info / sso-sidebar 等 DOM，
因此 initSSO() 里的登录/侧边栏绑定对子场景是死代码；但其中两段与 SSO 无关的
功能必须保留：飘窗提示 window.showMockToast、Esc 键与移动端手势守卫。
存档/排行榜改为同源（不带 token）的游客模式。
"""
import sys

PATH = "main.js"

with open(PATH, encoding="utf-8", newline="") as f:
    raw = f.read()

nl = "\r\n" if "\r\n" in raw else "\n"
lines = raw.split(nl)
if lines[-1] == "":
    lines.pop()


def expect(idx, needle):
    if needle not in lines[idx - 1]:
        sys.exit(f"断言失败：第 {idx} 行不含 {needle!r}\n实际: {lines[idx-1]!r}")


expect(65, "this.initSSO();")
expect(70, "initSSO() {")
expect(108, "window.showMockToast = function(name) {")
expect(125, "};")
expect(285, "if (btnMapHouse) {")
expect(358, "window.addEventListener('keydown'")
expect(385, "}")
expect(399, "});")
expect(401, "禁用移动端左右滑动返回")
expect(411, "}")              # initSSO 结束
expect(413, "initEngine() {")
expect(968, "sso_access_token")
expect(1024, "sso_access_token")
expect(1066, "}")
expect(1316, "sso_access_token")
expect(1347, "}")

# ------------------------------------------------- 1) 排行榜：游客模式同源拉取
leaderboard_new = """    let list = [];
    let success = false;

    // 游客模式：同源拉取服务端排行榜（无需登录）
    try {
      const res = await fetch(`/api/game/leaderboard?game_id=${tab}`).then(r => r.json());
      if (res.success && res.leaderboard && res.leaderboard.length > 0) {
        list = res.leaderboard;
        success = true;
      }
    } catch (e) {
      console.error('加载服务端排行榜失败', e);
    }

    if (!success) {
      list = this.getMockLeaderboard(tab);
    }

    listView.innerHTML = '';

    // 游客模式下自己统一记为「您自己」
    const myName = '您自己';""".split("\n")

# ------------------------------------------------- 2) 存档上报：游客模式同源
save_new = """    // 游客模式：同源上报存档（服务端以 guest 记账，无需登录）
    try {
      await fetch('/api/game/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: '3d-home-all',
          score: this.gameData.level,
          save_data: this.gameData
        })
      });

      // 联合上报排行榜参数
      fetch('/api/game/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: 'pkPoints', score: this.gameData.pkPoints })
      }).catch(() => {});

      fetch('/api/game/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: 'coins', score: this.gameData.coins })
      }).catch(() => {});

      fetch('/api/game/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: 'level', score: this.gameData.level })
      }).catch(() => {});

    } catch (e) {
      console.error('云端存档同步失败', e);
    }""".split("\n")

# ------------------------------------------------- 3) 存档拉取：游客模式同源
load_new = """    // 游客模式：同源拉取服务端存档（无需登录）
    let loadedData = null;

    try {
      const response = await fetch('/api/game/data?game_id=3d-home-all');
      const res = await response.json();
      if (res.success && res.data && res.data.save_data) {
        loadedData = res.data.save_data;
      }
    } catch (e) {
      console.error('从云端加载存档失败，采用本地缓存', e);
    }""".split("\n")

# ------------------------------------------------- 4) initSSO() -> 两个非 SSO 方法
toast_lines = lines[107:125]                       # 原 108-125：showMockToast
mock_block = ["  // 飘窗提示：原定义在 initSSO() 内，去掉 SSO 后独立保留",
              "  initMockToast() {"]
mock_block += ["    " + ln[4:] if ln.startswith("    ") else "    " + ln for ln in toast_lines]
mock_block += ["  }", ""]

esc_lines = lines[357:385]                         # 原 358-385：Esc 键（保留非 SSO 分支）
guard_block = ["  // 全局键盘 / 手势守卫：原 initSSO() 内的非 SSO 部分",
               "  initGlobalGuards() {"]
guard_block += esc_lines + ["      }", "    });", ""]
guard_block += lines[400:410]                      # 原 401-410：移动端手势守卫
guard_block += ["  }"]

# ------------------------------------------------- 自下而上替换，避免行号偏移
lines[1316 - 1:1347] = leaderboard_new
lines[1024 - 1:1066] = save_new
lines[968 - 1:987] = load_new
lines[70 - 1:411] = mock_block + guard_block
lines[65 - 1] = "    this.initMockToast();" + nl + "    this.initGlobalGuards();"

out = nl.join(lines) + nl
with open(PATH, "w", encoding="utf-8", newline="") as f:
    f.write(out)

print(f"main.js: {raw.count(nl)+1} 行 -> {out.count(nl)+1} 行")
for token in ("sso_access_token", "sso_user", "initSSO", "sso-login-btn", "openSSOSidebar",
              "closeSidebar", "openSidebar", "localhost:3001", "127.0.0.1"):
    print(f"  剩余 {token!r}: {out.count(token)}")
