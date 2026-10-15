#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复 21点大厅页 games/21dian/index.html 被之前 SSO 剥离改坏的地方：

1. 账号弹窗的 DOM 被整块删掉，导致 <div class="modal-overlay/login-modal"> 与
   <div class="modal-content"> 一直不闭合 —— 整页内容都被塞进了那个隐藏弹窗里。
   这里补回「本地账号 + 游客」的账号中心内容（与 Go 后端 /api/auth/login 对应）。
2. 脚本里残留一个孤立的 `}`，让整段内联脚本语法错误、页面上所有函数都失效。
3. 补回被删掉的 showLoginModal()（顶部 👤 按钮的 onclick 在调用它）。
4. loadStoredAccount() 恢复读取本地已登录账号（ACCOUNT_KEY 原本就为此存在）。
"""
import sys

PATH = "games/21dian/index.html"
raw = open(PATH, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in raw else "\n"
lines = raw.split(nl)
if lines[-1] == "":
    lines.pop()

assert lines[399].strip().startswith("<!-- 账号中心"), lines[399]
assert 'id="login-modal"' in lines[400], lines[400]
assert lines[405].startswith("  <script src="), lines[405]
assert lines[485].strip() == "}", lines[485]
assert lines[418].strip().startswith("async function loadStoredAccount"), lines[418]

# ---------------------------------------------------------- 1) 账号弹窗 DOM
modal = """      <div style="display:flex; align-items:center; gap:8px; margin:0 0 14px;">
        <span style="color: var(--text-muted); font-size:0.85rem;">当前身份</span>
        <strong id="account-name" style="color: var(--gold); font-size:1rem;">游客</strong>
      </div>

      <div class="form-group">
        <label class="form-label" for="nickname-input">账号名称</label>
        <input type="text" id="nickname-input" placeholder="输入账号名称（新账号将自动注册）" autocomplete="username"
          spellcheck="false">
      </div>
      <div class="form-group">
        <label class="form-label" for="password-input">密码</label>
        <input type="password" id="password-input" placeholder="输入密码" autocomplete="current-password">
      </div>

      <div class="modal-actions">
        <button class="btn-ghost" style="flex:1" onclick="hideLoginModal()">以游客身份继续</button>
        <button class="btn-primary" style="flex:1" id="login-btn" onclick="loginAccount()">登录 / 注册</button>
      </div>
    </div>
  </div>""".split("\n") + [""]
lines[399:405] = ["  <!-- 账号中心（本地账号 + 游客，无 SSO） -->"] + lines[400:404] + modal

# --------------------------------------------- 2) 去掉孤立大括号 + 补 showLoginModal
idx = None
for i, ln in enumerate(lines):
    if ln.strip() == "}" and lines[i - 1].strip() == "" and lines[i + 1].strip() == "" \
       and "hideLoginModal" in lines[i + 2]:
        idx = i
        break
if idx is None:
    sys.exit("!! 未找到孤立的 }")
lines[idx:idx + 1] = [
    "    function showLoginModal() {",
    "      document.getElementById('login-modal').classList.remove('hidden');",
    "    }",
]

# ------------------------------------------------- 3) 恢复本地账号 + 游客兜底
start = next(i for i, ln in enumerate(lines) if "async function loadStoredAccount" in ln)
assert lines[start + 3].strip() == "}", lines[start + 3]
lines[start:start + 4] = [
    "    async function loadStoredAccount() {",
    "      // 本地账号（无 SSO）：有存档则恢复，否则用游客身份",
    "      try {",
    "        const saved = localStorage.getItem(ACCOUNT_KEY);",
    "        if (saved) {",
    "          const acc = JSON.parse(saved);",
    "          if (acc && acc.username) currentAccount = acc;",
    "        }",
    "      } catch (e) {",
    "        console.error(e);",
    "      }",
    "      if (!currentAccount) currentAccount = createGuestAccount();",
    "      updateAccountUI();",
    "    }",
]

# ---------------------------------------- 4) 账号中心显示当前身份（配合新增 DOM）
ui_start = next(i for i, ln in enumerate(lines) if "function updateAccountUI()" in ln)
ui_end = next(i for i in range(ui_start, len(lines)) if lines[i] == "    }")
lines[ui_end:ui_end] = [
    "      const nameEl = document.getElementById('account-name');",
    "      if (nameEl) nameEl.textContent = currentAccount ? currentAccount.username : '游客';",
]

open(PATH, "w", encoding="utf-8", newline="").write(nl.join(lines) + nl)
print(f"{PATH}: {raw.count(nl)+1} 行 -> {len(lines)+1} 行")
