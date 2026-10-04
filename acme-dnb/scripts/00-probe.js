// 00-probe.js — Dò API nội bộ của Base Task / Base Request (CHỈ ĐỌC, không ghi gì lên tenant)
//
// Cách chạy:
//   1. Đăng nhập, mở https://task.base.com.vn/home  (hoặc https://requests.base.com.vn/)
//   2. F12 → tab Console → dán toàn bộ file này → Enter
//   3. Chờ dòng "PROBE XONG". Kết quả tự copy vào clipboard + tải file probe-<app>.json
//   4. Dán (hoặc gửi file) kết quả lại cho Claude
//
// Script chỉ gửi request GET. Không có POST/PUT/DELETE.

(async () => {
  const APP = location.host.startsWith('task') ? 'task'
            : location.host.startsWith('request') ? 'request'
            : location.host.split('.')[0];
  const out = { app: APP, origin: location.origin, at: new Date().toISOString(), auth: {}, csrf: {}, bundles: [], endpoints: [], gets: {} };

  const tryGet = async (path) => {
    try {
      const r = await fetch(path, { credentials: 'include', headers: { Accept: 'application/json' } });
      const text = await r.text();
      let body; try { body = JSON.parse(text); } catch { body = text.slice(0, 300); }
      return { status: r.status, body };
    } catch (e) { return { error: String(e) }; }
  };

  // Rút gọn object: giữ cấu trúc/keys, cắt mảng dài và chuỗi dài (tránh lộ dữ liệu thừa)
  const shrink = (v, d = 0) => {
    if (d > 4) return '…';
    if (Array.isArray(v)) return { _len: v.length, sample: v.slice(0, 2).map(x => shrink(x, d + 1)) };
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).slice(0, 40).map(([k, x]) => [k, shrink(x, d + 1)]));
    if (typeof v === 'string' && v.length > 120) return v.slice(0, 120) + '…';
    return v;
  };

  // 1. Phiên đăng nhập + CSRF
  for (const p of ['/auth/me', '/api/auth/me', '/api/me', '/api/user/me']) {
    const r = await tryGet(p);
    out.auth[p] = r.status ?? r.error;
    if (r.status === 200 && typeof r.body === 'object') {
      out.auth.me_path = out.auth.me_path || p;
      out.auth.me_keys = out.auth.me_keys || Object.keys(r.body);
      const s = JSON.stringify(r.body);
      const m = s.match(/"(csrf[_a-z]*|_token|xsrf[_a-z]*)"\s*:\s*"([^"]+)"/i);
      if (m) out.csrf.from_me = { key: m[1], len: m[2].length };
    }
  }
  const meta = document.querySelector('meta[name*="csrf" i]');
  if (meta) out.csrf.meta = meta.getAttribute('name');
  out.csrf.cookie_names = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean);

  // 2. Quét JS bundle tìm endpoint
  const srcs = [...new Set([...document.scripts].map(s => s.src).filter(Boolean)
    .concat(performance.getEntriesByType('resource').map(e => e.name).filter(n => /\.js(\?|$)/.test(n))))];
  const found = new Set();
  const re = /["'`](\/?(?:api|ajax|auth)\/[a-zA-Z0-9_\/.\-{}$]+)["'`]/g;
  for (const src of srcs) {
    try {
      const js = await (await fetch(src)).text();
      let n = 0, m;
      while ((m = re.exec(js))) { found.add(m[1].startsWith('/') ? m[1] : '/' + m[1]); n++; }
      out.bundles.push({ src: src.replace(location.origin, ''), size: js.length, hits: n });
    } catch (e) { out.bundles.push({ src, error: String(e) }); }
  }
  out.endpoints = [...found].sort();

  // Nhóm endpoint theo từ khoá quan trọng của spec
  const KEYS = ['service', 'group', 'workspace', 'field', 'input', 'reason', 'label', 'counter', 'schedule', 'workload',
                'request', 'job', 'task', 'approv', 'flow', 'block', 'reject', 'template', 'print', 'dataset', 'user', 'dashboard', 'report'];
  out.by_keyword = Object.fromEntries(KEYS.map(k => [k, out.endpoints.filter(e => e.toLowerCase().includes(k))]).filter(([, v]) => v.length));

  // 3. Thử GET các endpoint liệt kê (không tham số động) để xem cấu trúc dữ liệu
  const listy = out.endpoints.filter(e => /(list|load|all|get|index|me)\b|\/(services|users|groups|workspaces)$/i.test(e) && !/[{$]/.test(e) && !/(save|update|create|delete|remove|add|set|approve|reject|submit|upload)/i.test(e)).slice(0, 25);
  for (const p of listy) {
    const r = await tryGet(p);
    out.gets[p] = r.status === 200 ? { status: 200, shape: shrink(r.body) } : (r.status ?? r.error);
  }

  // 4. Xuất kết quả
  const json = JSON.stringify(out, null, 2);
  try { copy(json); } catch {}
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = `probe-${APP}.json`; a.click();
  console.log(`PROBE XONG — ${out.endpoints.length} endpoint, ${out.bundles.length} bundle. Đã copy vào clipboard + tải probe-${APP}.json`);
  console.log(out.by_keyword);
})();
