#!/bin/bash
# =====================================================================
# aios 一键部署（需要 root）
#   1) 备份线上站点 / Caddyfile / Node API
#   2) 同步 SSO-free 站点到 /var/www/aios
#   3) 切换 3001 为无 SSO 的 game-api（游客模式）
#   4) 安装并启动 21点 Go 后端 systemd 服务（8081）
#   5) 重写 Caddy 8443 站点块（/api + /ws 同源路由 + 后端数据保护）
#   6) 校验并 reload Caddy，输出验证信息
# =====================================================================
set -euo pipefail

SRC=/home/ubuntu/apps/aios-src
WEB=/var/www/aios
API=/home/ubuntu/apps/aios-api
STAMP=$(date +%Y%m%d-%H%M%S)
BK=/home/ubuntu/backups/deploy-$STAMP

[ "$(id -u)" = "0" ] || { echo "!! 需要 root 权限"; exit 1; }
mkdir -p "$BK"
echo "== 备份目录: $BK =="

# ---------------------------------------------------------------- 1) 备份
tar czf "$BK/www-aios.tar.gz" -C /var/www aios
cp -a /etc/caddy/Caddyfile            "$BK/Caddyfile"
cp -a "$API/server.js"                "$BK/aios-api-server.js"
cp -a "$API/.env"                     "$BK/aios-api.env"
cp -a /etc/systemd/system/aios-api.service "$BK/" 2>/dev/null || true
echo "   备份完成"

# ------------------------------------------------- 2) 停掉手工启动的 21 点进程
systemctl stop blackjack.service 2>/dev/null || true
pkill -f 'blackjack-linux-amd64' 2>/dev/null || true
sleep 1

# ------------------------------------- 2.5) 静态校验（防止把坏页面推上线）
# 历史教训：按行号删 SSO 代码曾删坏 21点大厅页（残留孤立 `}` + 未闭合 div），
# HTTP 仍然 200，只有真实浏览器打开才会发现整页按钮失效。
if [ -f "$SRC/deploy/check-static.py" ]; then
  python3 "$SRC/deploy/check-static.py" "$SRC" || { echo "!! 静态校验未通过，已中止部署（线上未被改动）"; exit 1; }
fi

# ---------------------------------------------------------------- 3) 同步站点
rsync -a --delete \
  --exclude 'deploy/' \
  --exclude '.git*' --exclude '.vscode/' --exclude '.htaccess' --exclude '.user.ini' \
  --exclude 'node_modules/' --exclude 'game-api/' --exclude '__pycache__/' --exclude '*.pyc' \
  --exclude '*.log' --exclude '*.tar.gz' --exclude '*.zip' --exclude '*.orig' --exclude '*.bak' \
  --exclude '3d-home/src/' --exclude '3d-home/public/' --exclude '3d-home/node_modules/' \
  --exclude '3d-home/*.html' --exclude '3d-home/style.css' \
  --exclude '3d-home/package.json' --exclude '3d-home/package-lock.json' \
  --exclude '3d-home/vite.config.js' --exclude '3d-home/README.md' --exclude '3d-home/.gitignore' \
  --exclude '3d-home/build.log' --exclude '3d-home/rebuild2.log' \
  --exclude '3d-home/*.py' --exclude '3d-home/*.pre-sso-strip.bak' \
  --exclude 'games/21dian/backend/build/server.log' --exclude 'games/21dian/backend/build/server.pid' \
  --exclude 'games/21dian/backend/*.go' --exclude 'games/21dian/backend/go.mod' \
  --exclude 'games/21dian/backend/go.sum' --exclude 'games/21dian/backend/build.sh' \
  --exclude 'games/21dian/backend/build.bat' --exclude 'games/21dian/backend/deploy/' \
  --exclude 'games/21dian/backend/README.md' --exclude 'games/21dian/backend/编译说明.md' \
  "$SRC"/ "$WEB"/
echo "   站点同步完成"

# 后端 Go 源码不应存在于 web 根目录（历史遗留），删除以缩小暴露面
rm -f  "$WEB"/games/21dian/backend/*.go "$WEB"/games/21dian/backend/go.mod \
       "$WEB"/games/21dian/backend/go.sum "$WEB"/games/21dian/backend/build.sh \
       "$WEB"/games/21dian/backend/build.bat "$WEB"/games/21dian/backend/README.md \
       "$WEB"/games/21dian/backend/编译说明.md
rm -rf "$WEB"/games/21dian/backend/deploy
rm -f  "$WEB"/games/21dian/backend/build/server.log "$WEB"/games/21dian/backend/build/server.pid

chown -R www-data:www-data "$WEB"
# 编译产物已不再入库：干净克隆需先在 games/21dian/backend 下执行 ./build.sh
if [ -f "$WEB/games/21dian/backend/build/blackjack-linux-amd64" ]; then
  chmod +x "$WEB/games/21dian/backend/build/blackjack-linux-amd64"
else
  echo "   !! 缺少 blackjack-linux-amd64（请先运行 games/21dian/backend/build.sh），21点后端将无法启动" >&2
fi
echo "   权限/可执行位已修正"

# --------------------------------------------- 4) Node API 切换为无 SSO 版本
install -o ubuntu -g ubuntu -m 644 "$SRC/game-api/server.js" "$API/server.js"
printf 'PORT=3001\n' > "$API/.env"
chown ubuntu:ubuntu "$API/.env"
cat > /etc/systemd/system/aios-api.service <<'UNIT'
[Unit]
Description=aios Game API (SQLite, guest mode, no SSO)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/apps/aios-api
EnvironmentFile=/home/ubuntu/apps/aios-api/.env
ExecStart=/home/ubuntu/.local/node/bin/node server.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
UNIT
echo "   Node API 已切换（无 SSO 游客模式）"

# --------------------------------------------- 5) 21点 Go 后端 systemd 服务
install -o root -g root -m 644 "$SRC/deploy/blackjack.service" /etc/systemd/system/blackjack.service
echo "   21点服务单元已安装"

# ------------------------- 6) aios 站点独立 Caddy 实例（与面板 Caddy 分离）
#  面板 Caddy：/etc/caddy/Caddyfile        -> :80, :16991（本脚本不再修改它）
#  本实例    ：/etc/caddy/aios.Caddyfile   -> :443(域名), :8443(IP 旧入口)
install -o root -g root -m 644 "$SRC/deploy/aios.Caddyfile" /etc/caddy/aios.Caddyfile
install -o root -g root -m 644 "$SRC/deploy/aios-caddy.service" /etc/systemd/system/aios-caddy.service

# 独立的数据目录；首次部署时迁移面板实例已有的证书/ACME 账号，避免重新签发
install -d -o caddy -g caddy -m 750 /var/lib/caddy-aios /var/lib/caddy-aios/data /var/lib/caddy-aios/config
if [ ! -d /var/lib/caddy-aios/data/caddy ] && [ -d /var/lib/caddy/.local/share/caddy ]; then
  cp -a /var/lib/caddy/.local/share/caddy /var/lib/caddy-aios/data/caddy
  chown -R caddy:caddy /var/lib/caddy-aios
  echo "   已迁移既有证书/ACME 账号到独立存储"
fi

# 日志目录与文件必须先归 caddy 所有：否则 caddy 起不来
install -d -o caddy -g caddy -m 755 /var/log/caddy
for f in aios-access.log aios-domain-access.log; do
  [ -f "/var/log/caddy/$f" ] || install -o caddy -g caddy -m 644 /dev/null "/var/log/caddy/$f"
  chown caddy:caddy "/var/log/caddy/$f"; chmod 644 "/var/log/caddy/$f"
done

# 以 caddy 身份校验，避免 root 抢先创建 root 属主的日志文件（曾导致服务起不来）
runuser -u caddy -- env XDG_DATA_HOME=/var/lib/caddy-aios/data XDG_CONFIG_HOME=/var/lib/caddy-aios/config \
  /usr/bin/caddy validate --config /etc/caddy/aios.Caddyfile >/dev/null
echo "   独立 Caddy 配置校验通过"

# 面板 Caddyfile 里若残留旧的 aios 段（会与 :8443 冲突），清理掉；没有则完全不动面板
python3 - <<'PY'
MARKERS = ("# ==== aios 站点 BEGIN", "https://124.222.183.43:8443 {")
p = "/etc/caddy/Caddyfile"
cur = open(p, encoding="utf-8").read()
idx = min([i for i in (cur.find(m) for m in MARKERS) if i != -1], default=-1)
if idx == -1:
    print("   面板 Caddyfile 无 aios 残留，保持不动")
else:
    lines = cur[:idx].rstrip().split("\n")
    while lines and (lines[-1].lstrip().startswith("#") or lines[-1].strip() == ""):
        lines.pop()
    open(p, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("   已从面板 Caddyfile 移除 aios 段（端口归还给独立实例）")
    open("/tmp/.aios_panel_changed", "w").write("1")
PY
if [ -f /tmp/.aios_panel_changed ]; then
  rm -f /tmp/.aios_panel_changed
  systemctl reload caddy 2>/dev/null || systemctl restart caddy
  echo "   面板 Caddy 已重新加载（仅清理残留）"
fi

# ---------------------------------------------------------------- 7) 生效
systemctl daemon-reload
systemctl restart aios-api.service
systemctl enable blackjack.service
systemctl restart blackjack.service
systemctl enable aios-caddy.service
systemctl restart aios-caddy.service
sleep 2
systemctl is-active --quiet aios-caddy || { echo "!! aios-caddy 未运行"; systemctl status aios-caddy --no-pager | tail -20; exit 1; }
echo "   aios-caddy 已启动"

# ---------------------------------------------------------------- 8) 验证
sleep 2
echo
echo "== 监听端口 =="
ss -ltnp | grep -E ':(80|443|3001|8081|8443|16991)\b' || true
echo
echo "== 服务状态 =="
systemctl is-active aios-caddy.service caddy.service aios-api.service blackjack.service
echo
echo "== 本地自检 =="
curl -s -o /dev/null -w "  Node /api/game/data      -> %{http_code}\n" "http://127.0.0.1:3001/api/game/data?game_id=21dian" || true
curl -s -o /dev/null -w "  Go   /api/leaderboard    -> %{http_code}\n" "http://127.0.0.1:8081/api/leaderboard" || true
curl -s -o /dev/null -w "  Go   POST /api/room/create -> %{http_code}\n" -X POST "http://127.0.0.1:8081/api/room/create" || true
echo
echo "== 备份: $BK =="
echo "部署完成"
