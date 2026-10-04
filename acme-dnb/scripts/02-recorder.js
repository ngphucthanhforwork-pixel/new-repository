// 02-recorder.js — Ghi lại payload API khi thao tác tay trên giao diện Base Task / Base Request
//
// Script này KHÔNG tự gửi request ghi nào. Nó chỉ "nghe" các lệnh ghi
// (create / update / approve…) mà giao diện gửi đi khi anh bấm nút, rồi lưu lại.
// Dùng để biết chính xác payload, rồi Claude viết script bơm hàng loạt.
//
// Cách dùng:
//   1. Mở trang app → F12 → Console → dán toàn bộ → Enter (thấy "[REC] đang ghi")
//   2. Thao tác trên giao diện theo checklist. Mỗi lệnh ghi hiện một dòng [REC] màu xanh.
//      Ghi lại được cả khi chuyển trang trong app; nếu tải lại trang (F5) thì dán lại script.
//   3. Xong: gõ  dnbDump()  → tải file rec-<app>.json, gửi cho Claude.
//      Gõ dnbClear() để xoá bản ghi cũ trước khi ghi lượt mới.

(async () => {
  const APP = location.host.startsWith('task') ? 'task' : location.host.startsWith('request') ? 'request' : location.host.split('.')[0];
  const KEY = '__dnb_rec';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const save = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {} };
  const shrink = (v, d = 0) => {
    if (d > 7) return '…';
    if (Array.isArray(v)) return v.length > 4 ? { _len: v.length, sample: v.slice(0, 4).map(x => shrink(x, d + 1)) } : v.map(x => shrink(x, d + 1));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shrink(x, d + 1)]));
    if (typeof v === 'string' && v.length > 400) return v.slice(0, 400) + '…';
    return v;
  };
  const parse = (s) => { try { return JSON.parse(s); } catch { return s; } };
  const bodyOf = (b) => {
    if (b == null) return null;
    if (typeof b === 'string') return parse(b);
    if (b instanceof FormData) {
      const o = {};
      for (const [k, v] of b.entries()) o[k] = v instanceof File ? `<file ${v.name} ${v.size}B>` : parse(v);
      return { __formdata: o };
    }
    if (b instanceof URLSearchParams) return { __urlencoded: Object.fromEntries(b) };
    return String(b);
  };
  // Chỉ ghi lệnh ghi; bỏ qua lệnh đọc / tiện ích
  const READ = /\/(list|list-all|info|stages|rows|compute|facets|schema|records-search|records-enrich|fields|datasets|services|dataset-fields|role-options|validate|preview|applied)$/;
  const NOISE = /\/api\/(beacon|copilot|me\/|language|giphy|search|pages?\/|react|saves|comment\/count|report\/)/;
  const want = (url, method) => /\/api\//.test(url) && method !== 'GET' && !READ.test(url.split('?')[0]) && !NOISE.test(url);
  const log = (e) => { const a = load(); a.push(e); save(a); console.log('%c[REC]', 'color:#059669;font-weight:bold', e.method, e.url, e.status); };

  if (!window.__dnbFetch) {
    window.__dnbFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
      const url = (typeof input === 'string' ? input : input.url).replace(location.origin, '');
      const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
      const res = await window.__dnbFetch.apply(this, arguments);
      if (want(url, method)) {
        let out = null; try { out = await res.clone().json(); } catch {}
        log({ t: new Date().toISOString(), via: 'fetch', method, url, status: res.status, req: shrink(bodyOf(init.body)), res: shrink(out) });
      }
      return res;
    };
    const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__dnb = { method: String(m).toUpperCase(), url: String(u).replace(location.origin, '') }; return open.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function (body) {
      const meta = this.__dnb;
      if (meta && want(meta.url, meta.method)) {
        this.addEventListener('loadend', () => log({ t: new Date().toISOString(), via: 'xhr', ...meta, status: this.status, req: shrink(bodyOf(body)), res: shrink(parse(this.responseText)) }));
      }
      return send.apply(this, arguments);
    };
  }

  window.dnbDump = () => {
    const json = JSON.stringify({ app: APP, at: new Date().toISOString(), calls: load() }, null, 2);
    try { copy(json); } catch {}
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = `rec-${APP}.json`; a.click();
    console.log(`Đã tải rec-${APP}.json (${load().length} lệnh)`);
  };
  window.dnbClear = () => { localStorage.removeItem(KEY); console.log('Đã xoá bản ghi'); };

  // Request: in tên các dataset hiện có (để biết đã có "Danh mục công trình" chưa) — chỉ đọc
  if (APP === 'request') {
    try {
      const me = await (await window.__dnbFetch('/auth/me', { credentials: 'include' })).json();
      const r = await window.__dnbFetch('/api/dataset-ref/datasets', { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': me.csrfToken }, body: '{}' });
      const j = await r.json();
      console.table((j.datasets || []).map(d => ({ id: d.id, name: d.name })));
    } catch {}
  }
  console.log(`%c[REC] đang ghi (${APP}) — ${load().length} lệnh đã có. Xong gõ dnbDump()`, 'color:#059669;font-weight:bold');
})();
