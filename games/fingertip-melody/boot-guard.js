// 启动守卫：普通脚本，不依赖 ES 模块，所以老内核也一定能执行。
// 页面用原生 ESM 直接 import，并用到 JSON 模块（import ... with { type: 'json' }）
// 等新语法；Chrome < 123 会在解析阶段就中断整张依赖图，表现为「白页、没有歌曲」，
// 且不会发出任何接口请求。模块入口解析成功后调用 window.melodyBooted()，
// 超时仍未调用则说明内核太旧或模块加载失败，这里给出可读的提示。
(function () {
  var REQUIRE = 'Chrome / Edge 123+、Firefox 138+、Safari 17.2+（iOS 17.2+）';
  var TIMEOUT = 8000;
  var booted = false;
  var notice = null;

  function remove() { if (notice && notice.parentNode) notice.parentNode.removeChild(notice); notice = null; }

  window.melodyBooted = function () {
    booted = true;
    remove();
  };

  function show() {
    if (booted || notice) return;
    var host = document.body || document.documentElement;
    if (!host) { setTimeout(show, 500); return; }
    notice = document.createElement('div');
    notice.setAttribute('role', 'alert');
    notice.style.cssText = [
      'position:fixed', 'inset:auto 12px calc(12px + env(safe-area-inset-bottom)) 12px',
      'z-index:2147483647', 'max-width:520px', 'margin:0 auto', 'padding:16px 18px',
      'border-radius:14px', 'background:#1d1b26', 'color:#f5f2ff',
      'font:14px/1.6 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif',
      'box-shadow:0 12px 32px rgba(0,0,0,.38)', 'border:1px solid rgba(255,255,255,.14)'
    ].join(';');
    var title = document.createElement('strong');
    title.textContent = '浏览器版本过低，游戏无法启动';
    title.style.cssText = 'display:block;font-size:15px;margin-bottom:6px';
    var body = document.createElement('p');
    body.textContent = '页面需要支持 ES 模块新语法的现代浏览器，例如 ' + REQUIRE + '。当前内核会在解析脚本时中断，所以曲库不会加载。请升级浏览器或用其他浏览器打开。';
    body.style.cssText = 'margin:0 0 10px';
    var ua = document.createElement('p');
    ua.textContent = '当前浏览器：' + navigator.userAgent;
    ua.style.cssText = 'margin:0 0 12px;font-size:12px;opacity:.62;word-break:break-all';
    var reload = document.createElement('button');
    reload.type = 'button';
    reload.textContent = '重新加载';
    reload.style.cssText = 'padding:8px 16px;border-radius:9px;border:0;background:#8f7bff;color:#fff;font:inherit;cursor:pointer';
    reload.onclick = function () { location.reload(); };
    notice.appendChild(title); notice.appendChild(body); notice.appendChild(ua); notice.appendChild(reload);
    host.appendChild(notice);
  }

  setTimeout(function () { if (!booted) show(); }, TIMEOUT);
})();
