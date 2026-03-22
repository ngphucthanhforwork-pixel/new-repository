import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useBetStore } from '@/store/useBetStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'
import type { Task } from '@/lib/types'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  backlog:    { label: 'Backlog',    dot: 'rgba(255,255,255,0.3)',  text: 'rgba(255,255,255,0.4)'  },
  locked:     { label: 'Locked',    dot: 'rgba(160,140,255,0.85)', text: 'rgba(160,140,255,0.85)' },
  queued:     { label: 'Queued',    dot: 'rgba(232,160,69,0.85)',  text: 'rgba(232,160,69,0.85)'  },
  scheduled:  { label: 'Scheduled', dot: 'rgba(74,184,200,0.85)',  text: 'rgba(74,184,200,0.85)'  },
  executing:  { label: 'Executing', dot: '#e8a045',                text: '#e8a045'                },
  done:       { label: 'Done',      dot: 'rgba(74,184,176,0.85)',  text: 'rgba(74,184,176,0.85)'  },
} as const

type TaskStatus = Task['status']
const ALL_STATUSES = Object.keys(STATUS_CFG) as TaskStatus[]

type SortKey = 'title' | 'status' | 'bet' | 'priority' | 'due_date' | 'estimated_time'
type GroupKey = 'none' | 'status' | 'bet'
type FilterKey = TaskStatus | 'all'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function isoToDisplay(iso?: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

function displayToIso(s: string) {
  const [d, m, y] = s.split('/')
  if (!d || !m || !y) return ''
  const year = y.length === 2 ? '20' + y : y
  if (isNaN(+d) || isNaN(+m) || isNaN(+year)) return ''
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// ─── Inline editing state ─────────────────────────────────────────────────────

type ActiveEdit = { taskId: string; col: 'title' | 'due' | 'time' | 'status' | 'bet' }

// ─── Toolbar select ───────────────────────────────────────────────────────────

function ToolbarSelect({ label, value, options, onChange }: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent font-mono text-[11px] outline-none cursor-pointer"
        style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#0d1525', color: '#e8e8e8' }}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BattlefieldListView() {
  const { tasks, updateTask } = useTaskStore()
  const { bets } = useBetStore()
  const { openTaskCard } = useAppStore()

  const [filter, setFilter] = useState<FilterKey>('all')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortAsc, setSortAsc] = useState(false)
  const [groupKey, setGroupKey] = useState<GroupKey>('none')
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null)
  const [editVal, setEditVal] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeEdit) inputRef.current?.focus()
  }, [activeEdit])

  // ── Data pipeline ──────────────────────────────────────────────────────────

  const base = tasks.filter(t => !t.unprocessed)
  const filtered = base.filter(t => filter === 'all' || t.status === filter)

  function getScore(t: Task) { return computeTaskCumulativeScore(t, bets) }
  function getBetTitle(t: Task) { return bets.find(b => b.id === t.bet_id)?.title ?? '' }

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = 0, bv: string | number = 0
    switch (sortKey) {
      case 'priority':       av = getScore(a);                          bv = getScore(b);        break
      case 'title':          av = a.title.toLowerCase();                bv = b.title.toLowerCase(); break
      case 'status':         av = ALL_STATUSES.indexOf(a.status);       bv = ALL_STATUSES.indexOf(b.status); break
      case 'bet':            av = getBetTitle(a).toLowerCase();         bv = getBetTitle(b).toLowerCase(); break
      case 'due_date':       av = a.due_date ?? 'zzzz';                 bv = b.due_date ?? 'zzzz'; break
      case 'estimated_time': av = a.estimated_time;                     bv = b.estimated_time;   break
    }
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ? 1 : -1
    return 0
  })

  // Group the sorted list
  type Group = { key: string; label: string; tasks: Task[] }

  function buildGroups(): Group[] {
    if (groupKey === 'none') return [{ key: '__all', label: '', tasks: sorted }]
    if (groupKey === 'status') {
      return ALL_STATUSES
        .map(s => ({ key: s, label: STATUS_CFG[s].label, tasks: sorted.filter(t => t.status === s) }))
        .filter(g => g.tasks.length > 0)
    }
    if (groupKey === 'bet') {
      const withBet = bets
        .filter(b => sorted.some(t => t.bet_id === b.id))
        .map(b => ({ key: b.id, label: b.title, tasks: sorted.filter(t => t.bet_id === b.id) }))
      const noBet = sorted.filter(t => !t.bet_id)
      return [...withBet, ...(noBet.length ? [{ key: '__none', label: 'No parent bet', tasks: noBet }] : [])]
    }
    return [{ key: '__all', label: '', tasks: sorted }]
  }

  const groups = buildGroups()

  // ── Edit helpers ───────────────────────────────────────────────────────────

  function startEdit(taskId: string, col: ActiveEdit['col'], initial: string) {
    setActiveEdit({ taskId, col })
    setEditVal(initial)
  }

  function commitEdit() {
    if (!activeEdit) return
    const { taskId, col } = activeEdit
    if (col === 'title' && editVal.trim()) updateTask(taskId, { title: editVal.trim() })
    else if (col === 'due') { const iso = displayToIso(editVal); updateTask(taskId, { due_date: iso || undefined }) }
    else if (col === 'time') { const v = parseInt(editVal); if (!isNaN(v) && v > 0) updateTask(taskId, { estimated_time: v }) }
    setActiveEdit(null)
  }

  function applyStatus(taskId: string, s: TaskStatus) {
    updateTask(taskId, { status: s })
    setActiveEdit(null)
  }

  function applyBet(taskId: string, betId: string) {
    updateTask(taskId, { bet_id: betId || undefined })
    setActiveEdit(null)
  }

  // ── Sort toggle ────────────────────────────────────────────────────────────

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortAsc(a => !a)
    else { setSortKey(col); setSortAsc(col === 'title' || col === 'bet') }
  }

  // ── Select helpers ─────────────────────────────────────────────────────────

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleAll() {
    setSelected(prev => prev.size === sorted.length ? new Set() : new Set(sorted.map(t => t.id)))
  }

  function toggleCollapse(key: string) {
    setCollapsed(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  // ── Dismiss dropdowns on outside click ───────────────────────────────────

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (activeEdit?.col === 'status' || activeEdit?.col === 'bet') {
        const target = e.target as HTMLElement
        if (!target.closest('[data-dropdown]')) setActiveEdit(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [activeEdit])

  // ── Column header ─────────────────────────────────────────────────────────

  function ColHeader({ col, label, sortable = true }: { col: SortKey; label: string; sortable?: boolean }) {
    const active = sortKey === col
    return (
      <th
        className="px-3 py-2 text-left font-mono text-[10px] tracking-widest select-none"
        style={{
          background: '#060a10', position: 'sticky', top: 0, zIndex: 10,
          color: active ? 'rgba(232,160,69,0.7)' : 'rgba(255,255,255,0.22)',
          cursor: sortable ? 'pointer' : 'default',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          whiteSpace: 'nowrap',
        }}
        onClick={() => sortable && toggleSort(col)}
      >
        {label}
        {sortable && (
          <span style={{ marginLeft: 3 }}>
            {active ? (sortAsc ? ' ↑' : ' ↓') : <span style={{ opacity: 0.25 }}> ↕</span>}
          </span>
        )}
      </th>
    )
  }

  // ── Filter tabs ────────────────────────────────────────────────────────────

  const filterTabs: { id: FilterKey; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'locked', label: 'Locked' },
    { id: 'queued', label: 'Queued' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'executing', label: 'Executing' },
    { id: 'done', label: 'Done' },
  ]

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#060a10' }}
      onClick={e => {
        // Dismiss edit when clicking outside any editable area
        if (activeEdit && !(e.target as HTMLElement).closest('[data-cell]')) setActiveEdit(null)
      }}
    >

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-4 gap-4 flex-wrap"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 44 }}
      >
        {/* Filter tabs */}
        <div className="flex items-center gap-0 overflow-x-auto">
          {filterTabs.map(tab => {
            const count = tab.id === 'all'
              ? base.length
              : base.filter(t => t.status === tab.id).length
            if (tab.id !== 'all' && count === 0) return null
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] transition-colors whitespace-nowrap"
                style={{
                  color: active ? '#e8a045' : 'rgba(255,255,255,0.28)',
                  borderBottom: active ? '2px solid #e8a045' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {tab.label}
                <span className="font-mono text-[10px] px-1" style={{
                  background: active ? 'rgba(232,160,69,0.12)' : 'rgba(255,255,255,0.05)',
                  color: active ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.2)',
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sort + Group controls */}
        <div className="flex items-center gap-3 shrink-0">
          <ToolbarSelect
            label="GROUP"
            value={groupKey}
            onChange={v => setGroupKey(v as GroupKey)}
            options={[
              { value: 'none', label: 'None' },
              { value: 'status', label: 'Status' },
              { value: 'bet', label: 'Parent bet' },
            ]}
          />
          <ToolbarSelect
            label="SORT"
            value={sortKey}
            onChange={v => { setSortKey(v as SortKey); setSortAsc(v === 'title' || v === 'bet') }}
            options={[
              { value: 'priority', label: 'Priority' },
              { value: 'title', label: 'Title' },
              { value: 'status', label: 'Status' },
              { value: 'bet', label: 'Parent bet' },
              { value: 'due_date', label: 'Due date' },
              { value: 'estimated_time', label: 'Est. time' },
            ]}
          />
          <button
            onClick={() => setSortAsc(a => !a)}
            className="font-mono text-[11px] px-2 py-0.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
            title={sortAsc ? 'Ascending' : 'Descending'}
          >
            {sortAsc ? '↑ ASC' : '↓ DESC'}
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto" onClick={e => e.stopPropagation()}>
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: 820 }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: '36%' }} />
            <col style={{ width: 115 }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 88 }} />
            <col style={{ width: 68 }} />
            <col style={{ width: 48 }} />
          </colgroup>

          <thead>
            <tr>
              <th style={{ background: '#060a10', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', width: 36 }}>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={sorted.length > 0 && selected.size === sorted.length}
                    onChange={toggleAll}
                    style={{ accentColor: '#e8a045', width: 13, height: 13, cursor: 'pointer' }}
                  />
                </div>
              </th>
              <ColHeader col="title" label="TASK" />
              <ColHeader col="status" label="STATUS" />
              <ColHeader col="bet" label="PARENT BET" />
              <ColHeader col="priority" label="PRIORITY" />
              <ColHeader col="due_date" label="DUE" />
              <ColHeader col="estimated_time" label="TIME" />
              <th style={{ background: '#060a10', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }} />
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center font-mono text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  No tasks. Capture one to get started.
                </td>
              </tr>
            )}

            {groups.map(group => {
              const isCollapsed = collapsed.has(group.key)
              return (
                <>
                  {/* Group header */}
                  {groupKey !== 'none' && (
                    <tr key={`hdr-${group.key}`}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <button
                          onClick={() => toggleCollapse(group.key)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left font-mono text-[10px] tracking-widest transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.025)',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.4)',
                          }}
                        >
                          <span style={{ fontSize: 8, opacity: 0.5 }}>{isCollapsed ? '▶' : '▼'}</span>
                          {groupKey === 'status' && group.key !== '__none' && (
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STATUS_CFG[group.key as TaskStatus]?.dot }} />
                          )}
                          {group.label.toUpperCase()}
                          <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 4 }}>{group.tasks.length}</span>
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Rows */}
                  {!isCollapsed && group.tasks.map(task => {
                    const score = computeTaskCumulativeScore(task, bets)
                    const parentBet = bets.find(b => b.id === task.bet_id)
                    const cfg = STATUS_CFG[task.status]
                    const isSelected = selected.has(task.id)
                    const ae = activeEdit

                    return (
                      <tr
                        key={task.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isSelected ? 'rgba(232,160,69,0.05)' : 'transparent',
                          borderLeft: isSelected ? '2px solid rgba(232,160,69,0.5)' : '2px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.022)' }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                      >
                        {/* Checkbox */}
                        <td className="px-0 py-2.5" style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(task.id)}
                            style={{ accentColor: '#e8a045', width: 13, height: 13, cursor: 'pointer' }}
                          />
                        </td>

                        {/* ── TITLE ── */}
                        <td className="px-3 py-0" data-cell>
                          {ae?.taskId === task.id && ae.col === 'title' ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setActiveEdit(null) }}
                              className="w-full bg-transparent outline-none font-mono text-xs py-2.5"
                              style={{ color: '#fff', caretColor: '#e8a045', borderBottom: '1px solid rgba(232,160,69,0.5)' }}
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 py-2.5">
                              <span
                                className="font-mono text-xs flex-1 truncate cursor-pointer"
                                style={{ color: 'rgba(255,255,255,0.82)' }}
                                onClick={() => openTaskCard(task.id)}
                                title="Open task"
                              >
                                {task.title}
                              </span>
                              <button
                                onClick={() => startEdit(task.id, 'title', task.title)}
                                className="shrink-0 font-mono text-[9px] opacity-0 group-hover:opacity-100 transition-opacity px-1"
                                style={{ color: 'rgba(255,255,255,0.25)' }}
                                title="Rename"
                              >
                                ✎
                              </button>
                            </div>
                          )}
                        </td>

                        {/* ── STATUS ── */}
                        <td className="px-3 py-2.5 relative" data-cell data-dropdown={ae?.taskId === task.id && ae.col === 'status' ? 'true' : undefined}>
                          <button
                            onClick={() => {
                              if (ae?.taskId === task.id && ae.col === 'status') setActiveEdit(null)
                              else startEdit(task.id, 'status', task.status)
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                            <span className="font-mono text-[11px]" style={{ color: cfg.text }}>{cfg.label}</span>
                            <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>▾</span>
                          </button>
                          {ae?.taskId === task.id && ae.col === 'status' && (
                            <div
                              data-dropdown
                              className="absolute left-2 mt-1 z-50 py-1"
                              style={{
                                top: '100%',
                                background: '#0d1525',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                minWidth: 130,
                              }}
                              onMouseDown={e => e.stopPropagation()}
                            >
                              {ALL_STATUSES.map(s => {
                                const c = STATUS_CFG[s]
                                return (
                                  <button
                                    key={s}
                                    onClick={() => applyStatus(task.id, s)}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 font-mono text-[11px] text-left"
                                    style={{ color: c.text, background: task.status === s ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = task.status === s ? 'rgba(255,255,255,0.06)' : 'transparent')}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
                                    {c.label}
                                    {task.status === s && <span className="ml-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>✓</span>}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </td>

                        {/* ── PARENT BET ── */}
                        <td className="px-3 py-2.5 relative" data-cell data-dropdown={ae?.taskId === task.id && ae.col === 'bet' ? 'true' : undefined}>
                          <button
                            onClick={() => {
                              if (ae?.taskId === task.id && ae.col === 'bet') setActiveEdit(null)
                              else startEdit(task.id, 'bet', task.bet_id ?? '')
                            }}
                            className="flex items-center gap-1 w-full min-w-0"
                          >
                            <span
                              className="font-mono text-[11px] truncate flex-1 text-left"
                              style={{ color: parentBet ? 'rgba(232,160,69,0.6)' : 'rgba(255,255,255,0.18)' }}
                            >
                              {parentBet ? parentBet.title : '— assign bet'}
                            </span>
                            <span className="font-mono text-[9px] shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>▾</span>
                          </button>
                          {ae?.taskId === task.id && ae.col === 'bet' && (
                            <div
                              data-dropdown
                              className="absolute left-0 mt-1 z-50 py-1"
                              style={{
                                top: '100%',
                                background: '#0d1525',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                minWidth: 200,
                                maxHeight: 240,
                                overflowY: 'auto',
                              }}
                              onMouseDown={e => e.stopPropagation()}
                            >
                              <button
                                onClick={() => applyBet(task.id, '')}
                                className="flex items-center w-full px-3 py-1.5 font-mono text-[11px] text-left"
                                style={{ color: 'rgba(255,255,255,0.3)', background: !task.bet_id ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                                onMouseLeave={e => (e.currentTarget.style.background = !task.bet_id ? 'rgba(255,255,255,0.06)' : 'transparent')}
                              >
                                — No parent bet
                                {!task.bet_id && <span className="ml-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>✓</span>}
                              </button>
                              {bets.filter(b => b.status === 'active' || b.status === 'paused').map(b => (
                                <button
                                  key={b.id}
                                  onClick={() => applyBet(task.id, b.id)}
                                  className="flex items-center gap-2 w-full px-3 py-1.5 font-mono text-[11px] text-left"
                                  style={{ color: 'rgba(232,160,69,0.75)', background: task.bet_id === b.id ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = task.bet_id === b.id ? 'rgba(255,255,255,0.06)' : 'transparent')}
                                >
                                  <span style={{ opacity: 0.4 }}>⬦</span>
                                  <span className="truncate">{b.title}</span>
                                  {task.bet_id === b.id && <span className="ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* ── PRIORITY ── */}
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-[11px] tabular-nums" style={{ color: 'rgba(232,160,69,0.65)' }}>
                            {score.toFixed(3)}
                          </span>
                        </td>

                        {/* ── DUE DATE ── */}
                        <td className="px-3 py-2.5" data-cell>
                          {ae?.taskId === task.id && ae.col === 'due' ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setActiveEdit(null) }}
                              placeholder="dd/mm/yy"
                              maxLength={8}
                              className="bg-transparent outline-none font-mono text-[11px]"
                              style={{ color: '#e8a045', caretColor: '#e8a045', borderBottom: '1px solid rgba(232,160,69,0.4)', width: 72 }}
                            />
                          ) : (
                            <span
                              className="font-mono text-[11px] cursor-pointer"
                              style={{ color: task.due_date ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)' }}
                              onClick={() => startEdit(task.id, 'due', isoToDisplay(task.due_date))}
                              title="Click to edit"
                            >
                              {task.due_date ? isoToDisplay(task.due_date) : '+ add date'}
                            </span>
                          )}
                        </td>

                        {/* ── EST TIME ── */}
                        <td className="px-3 py-2.5" data-cell>
                          {ae?.taskId === task.id && ae.col === 'time' ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setActiveEdit(null) }}
                              type="number"
                              min={5}
                              className="bg-transparent outline-none font-mono text-[11px]"
                              style={{ color: '#e8a045', caretColor: '#e8a045', borderBottom: '1px solid rgba(232,160,69,0.4)', width: 52 }}
                            />
                          ) : (
                            <span
                              className="font-mono text-[11px] cursor-pointer"
                              style={{ color: 'rgba(255,255,255,0.4)' }}
                              onClick={() => startEdit(task.id, 'time', String(task.estimated_time))}
                              title="Click to edit"
                            >
                              {task.estimated_time}m
                            </span>
                          )}
                        </td>

                        {/* ── OPEN BUTTON ── */}
                        <td className="px-1 py-2.5">
                          <button
                            onClick={() => openTaskCard(task.id)}
                            className="font-mono text-[10px] px-1.5 py-0.5 opacity-0 transition-opacity"
                            style={{
                              color: 'rgba(232,160,69,0.6)',
                              border: '1px solid rgba(232,160,69,0.2)',
                              background: 'rgba(232,160,69,0.05)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          >
                            ↗
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {sorted.length} task{sorted.length !== 1 ? 's' : ''}
          </span>
          {selected.size > 0 && (
            <span className="font-mono text-[10px]" style={{ color: 'rgba(232,160,69,0.6)' }}>
              {selected.size} selected
            </span>
          )}
        </div>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.1)' }}>
          click title to open · click cell to edit · esc to cancel
        </span>
      </div>
    </div>
  )
}
