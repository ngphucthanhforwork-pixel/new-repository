// 01-inspect.js — Đọc cấu trúc dữ liệu Base Task / Base Request (CHỈ ĐỌC)
//
// Chạy lần lượt trên https://task.base.com.vn và https://requests.base.com.vn
// (F12 → Console → dán toàn bộ → Enter). Không tạo / sửa / xoá gì:
//   1. /auth/me: kiểm tra user cho persona, liệt kê service / group / workspace hiện có
//   2. POST các endpoint chỉ đọc (list, info, page) để biết tham số và dạng dữ liệu
//   3. Trích đoạn code trong JS bundle quanh các endpoint ghi + quét đường dẫn ghép động
// Kết quả: tự tải inspect-<app>.json (+ copy vào clipboard).

(async () => {
  const APP = location.host.startsWith('task') ? 'task' : location.host.startsWith('request') ? 'request' : location.host.split('.')[0];
  const PERSONAS = { admin1: 'Hoàng Đức Minh (GĐ)', baonguyen03: 'Lý Gia Bảo (KTS)', pharevu: 'Trịnh Mai Anh',
    thanhnguyen10: 'Ngô Tuấn Kiệt', thanhnguyen08: 'Bùi Thị Lan (QS)', hungphan: 'Lâm Chí Thanh (PM)',
    hatran02: 'Hồ Văn Tài', hatran03: 'Châu Minh Đạt', linhnguyensoe: 'Kế toán' };
  const out = { app: APP, at: new Date().toISOString(), me: {}, personas: {}, existing: {}, shapes: {}, posts: {}, payload_hints: {}, dynamic_paths: [] };

  const shrink = (v, d = 0) => {
    if (d > 5) return '…';
    if (Array.isArray(v)) return { _len: v.length, sample: v.slice(0, 2).map(x => shrink(x, d + 1)) };
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).slice(0, 50).map(([k, x]) => [k, shrink(x, d + 1)]));
    if (typeof v === 'string' && v.length > 160) return v.slice(0, 160) + '…';
    return v;
  };
  const pick = (o, re) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => re.test(k)));
  const ID_KEYS = /^(id|username|name|display_name|full_name|title|type|type_key|key|group_id|workspace_id|parent_id|team_id|metatype)$/;

  // 1. /auth/me
  const me = await (await fetch('/auth/me', { credentials: 'include' })).json();
  const CSRF = me.csrfToken;
  out.me = { user: pick(me.user, ID_KEYS), isAdmin: me.isAdmin, demoEnabled: me.demoEnabled,
             counts: Object.fromEntries(Object.entries(me).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length])) };
  const users = me.users || [];
  out.shapes.user = shrink(users[0]);
  for (const [u, label] of Object.entries(PERSONAS)) {
    const hit = users.find(x => Object.values(x || {}).some(v => v === u));
    out.personas[u] = hit ? { label, ...pick(hit, ID_KEYS) } : { label, found: false };
  }
  for (const k of ['services', 'service_groups', 'workspaces', 'workspace_teams', 'workloadServices', 'orgUnits', 'serviceModels', 'user_groups']) {
    if (Array.isArray(me[k])) { out.existing[k] = me[k].map(x => pick(x, ID_KEYS)); out.shapes[k] = shrink(me[k][0]); }
  }
  for (const k of ['directService', 'appConfig', 'demoPersonas']) if (me[k] !== undefined) out.shapes[k] = shrink(me[k]);

  // 2. POST endpoint chỉ đọc
  const post = async (path, body) => {
    try {
      const r = await fetch(path, { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF, Accept: 'application/json' }, body: JSON.stringify(body) });
      const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t.slice(0, 300); }
      return { status: r.status, body: j };
    } catch (e) { return { error: String(e) }; }
  };
  const rec = async (path, body = {}) => { const r = await post(path, body); out.posts[`${path} ${JSON.stringify(body)}`] = { status: r.status ?? r.error, shape: shrink(r.body) }; return r; };
  const firstItem = (b) => { if (!b || typeof b !== 'object') return null; const arr = Array.isArray(b) ? b : Object.values(b).find(Array.isArray); return arr && arr[0]; };

  const sid = (me.services || [])[0]?.id;
  await rec('/api/position/list'); await rec('/api/orgunit/list'); await rec('/api/field/list-all');
  if (APP === 'task') {
    await rec('/api/service/list'); await rec('/api/pages/org/workspace'); await rec('/api/workload/list');
    await rec('/api/plan/list'); await rec('/api/dashboard/list');
    if (sid) {
      await rec('/api/service/info', { id: sid }); await rec('/api/service/stages', { id: sid });
      await rec('/api/field/list', { service_id: sid }); await rec('/api/end-reason/list', { service_id: sid });
      await rec('/api/schedule/list', { service_id: sid });
      const wr = await rec('/api/work-request/list', { service_id: sid });
      const f = firstItem(wr.body);
      if (f?.id) { await rec('/api/work-request/info', { id: f.id }); await rec('/api/task/list', { work_request_id: f.id }); await rec('/api/work-session/list', { work_request_id: f.id }); }
      await rec('/api/pages/service/requests-list', { service_id: sid }); await rec('/api/pages/service/workloads', { service_id: sid });
    }
  } else {
    await rec('/api/service/list-all'); await rec('/api/page/home'); await rec('/api/page/my-requests');
    await rec('/api/page/inbox'); await rec('/api/report/sidebar'); await rec('/api/task-flow/flow/list-all');
    await rec('/api/dataset-ref/datasets'); await rec('/api/service-ref/services');
    if (sid) {
      await rec('/api/service/stages', { id: sid }); await rec('/api/field/list', { service_id: sid });
      await rec('/api/report/service', { service_id: sid });
    }
  }

  // 3. Bundle: đoạn code quanh endpoint ghi + đường dẫn ghép động
  const TARGETS = APP === 'task'
    ? ['/api/service/create', '/api/service/update', '/api/service/update-input-model', '/api/service-group', '/api/field/create',
       '/api/end-reason/create', '/api/work-request/create', '/api/work-request/update', '/api/task/complete', '/api/workload/create',
       '/api/work-session/start', '/api/work-session/stop', '/api/work-session/edit', '/api/schedule/create', '/api/orgunit/create',
       '/api/team/update', '/api/output/create', '/api/service/info', '/api/work-request/list']
    : ['/api/service/update', '/api/service/update-input-model', '/api/field/create', '/api/task-flow/flow/create',
       '/api/task-flow/flow/save-definition', '/api/advance-table/rows', '/api/page/my-requests', '/api/page/inbox', '/api/draft/remove'];
  const bundle = [...document.scripts].map(s => s.src).find(s => /\/assets\/index-.*\.js/.test(s));
  if (bundle) {
    const js = await (await fetch(bundle)).text();
    for (const t of TARGETS) {
      const sn = []; let i = -1;
      while ((i = js.indexOf(`"${t}"`, i + 1)) !== -1 && sn.length < 2) sn.push(js.slice(Math.max(0, i - 500), i + 400));
      out.payload_hints[t] = sn;
    }
    // Đường dẫn ghép động: `/api/${...}`, "request/create", "service/create"...
    const dyn = new Set(); let m;
    const reTpl = /`\/api\/[^`]{0,80}`/g;
    while ((m = reTpl.exec(js))) dyn.add(m[0]);
    const reLoose = /["'`]([a-z][a-z0-9-]*\/(?:[a-z0-9-]+\/)?(?:create|approve|reject|decide|submit|resubmit|cancel|recall|update|info|list|remove|forward|comment|direct)[a-z0-9-]*)["'`]/g;
    while ((m = reLoose.exec(js))) dyn.add(m[1]);
    out.dynamic_paths = [...dyn].sort();
    // Ngữ cảnh quanh các từ khoá duyệt
    for (const kw of ['approve', 'reject', 'directService', 'predicted', 'conditional']) {
      const sn = []; let i = -1;
      while ((i = js.indexOf(kw, i + 1)) !== -1 && sn.length < 3) { sn.push(js.slice(Math.max(0, i - 250), i + 250)); i += 2000; }
      out.payload_hints[`kw:${kw}`] = sn;
    }
  }

  const json = JSON.stringify(out, null, 2);
  try { copy(json); } catch {}
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = `inspect-${APP}.json`; a.click();
  console.log(`INSPECT XONG (${APP}) — đã tải inspect-${APP}.json`); console.table(out.personas);
})();
