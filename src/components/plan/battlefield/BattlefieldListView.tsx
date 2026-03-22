import { useState, useRef } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useBetStore } from '@/store/useBetStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'
import type { Task } from '@/lib/types'

// ─── Status config (same palette as TaskCard) ────────────────────────────────

const STATUS_CFG = {
  backlog:    { label: 'Backlog',    dot: 'rgba(255,255,255,0.25)', text: 'rgba(255,255,255,0.35)' },
  locked:     { label: 'Locked',    dot: 'rgba(160,140,255,0.8)',  text: 'rgba(160,140,255,0.8)'  },
  queued:     { label: 'Queued',    dot: 'rgba(232,160,69,0.8)',   text: 'rgba(232,160,69,0.8)'   },
  scheduled:  { label: 'Scheduled', dot: 'rgba(74,184,200,0.8)',   text: 'rgba(74,184,200,0.8)'   },
  executing:  { label: 'Executing', dot: '#e8a045',                text: '#e8a045'                },
  done:       { label: 'Done',      dot: 'rgba(74,184,176,0.8)',   text: 'rgba(74,184,176,0.8)'   },
} as const

type TaskStatus = Task['status']

const ALL_STATUSES = Object.keys(STATUS_CFG) as TaskStatus[]

const FILTER_TABS: { id: TaskStatus | 'all'; label: string }[] = [
  { id: 'all',       label: 'All'       },
  { id: 'backlog',   label: 'Backlog'   },
  { id: 'queued',    label: 'Queued'    },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'executing', label: 'Executing' },
  { id: 'done',      label: 'Done'      },
]

type SortKey = 'title' | 'status' | 'priority' | 'due_date' | 'estimated_time'

// ─── Helper ──────────────────────────────────────────────────────────────────

function isoToDisplay(iso?: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

function displayToIso(s: string) {
  const [d, m, y] = s.split('/')
  if (!d || !m || !y) return ''
  const year = y.length === 2 ? '20' + y : y
  return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
}

// ─── Inline cell types ───────────────────────────────────────────────────────

type EditCell = { taskId: string; col: 'title' | 'due' | 'time' | 'status' }

// ─── Component ───────────────────────────────────────────────────────────────

export function BattlefieldListView() {
  const { tasks, updateTask } = useTaskStore()
  const { bets } = useBetStore()
  const { openTaskCard } = useAppStore()

  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortAsc, setSortAsc] = useState(false)
  const [editing, setEditing] = useState<EditCell | null>(null)
  const [editVal, setEditVal] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // Filter
  const visible = tasks
    .filter(t => !t.unprocessed)
    .filter(t => filter === 'all' || t.status === filter)

  // Sort
  const sorted = [...visible].sort((a, b) => {
    let av: string | number = 0
    let bv: string | number = 0
    if (sortKey === 'priority') {
      av = computeTaskCumulativeScore(a, bets)
      bv = computeTaskCumulativeScore(b, bets)
    } else if (sortKey === 'title') {
      av = a.title.toLowerCase(); bv = b.title.toLowerCase()
    } else if (sortKey === 'status') {
      av = ALL_STATUSES.indexOf(a.status); bv = ALL_STATUSES.indexOf(b.status)
    } else if (sortKey === 'due_date') {
      av = a.due_date ?? 'zzzz'; bv = b.due_date ?? 'zzzz'
    } else if (sortKey === 'estimated_time') {
      av = a.estimated_time; bv = b.estimated_time
    }
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ? 1 : -1
    return 0
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(key === 'title') }
  }

  function startEdit(taskId: string, col: EditCell['col'], initial: string) {
    setEditing({ taskId, col })
    setEditVal(initial)
    setTimeout(() => inputRef.current?.select(), 10)
  }

  function commitEdit() {
    if (!editing) return
    const { taskId, col } = editing
    if (col === 'title') {
      if (editVal.trim()) updateTask(taskId, { title: editVal.trim() })
    } else if (col === 'due') {
      const iso = displayToIso(editVal)
      updateTask(taskId, { due_date: iso || undefined })
    } else if (col === 'time') {
      const v = parseInt(editVal)
      if (!isNaN(v) && v > 0) updateTask(taskId, { estimated_time: v })
    }
    setEditing(null)
  }

  function setStatus(taskId: string, s: TaskStatus) {
    updateTask(taskId, { status: s })
    setEditing(null)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map(t => t.id)))
  }

  const allSelected = sorted.length > 0 && selected.size === sorted.length

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ color: 'rgba(255,255,255,0.12)', marginLeft: 4 }}>↕</span>
    return <span style={{ color: 'rgba(232,160,69,0.7)', marginLeft: 4 }}>{sortAsc ? '↑' : '↓'}</span>
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ background: '#060a10' }}>

      {/* ── Top bar: filter tabs + count ─────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: 44 }}
      >
        {/* Status filter tabs */}
        <div className="flex items-center gap-0">
          {FILTER_TABS.map(tab => {
            const count = tab.id === 'all'
              ? tasks.filter(t => !t.unprocessed).length
              : tasks.filter(t => !t.unprocessed && t.status === tab.id).length
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] transition-colors"
                style={{
                  color: active ? '#e8a045' : 'rgba(255,255,255,0.28)',
                  borderBottom: active ? '1px solid #e8a045' : '1px solid transparent',
                  marginBottom: -1,
                }}
              >
                {tab.label}
                <span
                  className="font-mono text-[10px] px-1"
                  style={{
                    background: active ? 'rgba(232,160,69,0.12)' : 'rgba(255,255,255,0.05)',
                    color: active ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selection info */}
        {selected.size > 0 && (
          <span className="font-mono text-[11px]" style={{ color: 'rgba(232,160,69,0.6)' }}>
            {selected.size} selected
          </span>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: 780 }}>

          {/* Column widths */}
          <colgroup>
            <col style={{ width: 36 }} />       {/* checkbox */}
            <col style={{ width: '35%' }} />    {/* title */}
            <col style={{ width: 110 }} />      {/* status */}
            <col style={{ width: '20%' }} />    {/* bet */}
            <col style={{ width: 80 }} />       {/* priority */}
            <col style={{ width: 90 }} />       {/* due */}
            <col style={{ width: 70 }} />       {/* time */}
            <col style={{ width: 52 }} />       {/* actions */}
          </colgroup>

          {/* Sticky header */}
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th className="px-3 py-2 text-left" style={{ background: '#060a10', position: 'sticky', top: 0, zIndex: 10 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="cursor-pointer"
                  style={{ accentColor: '#e8a045', width: 13, height: 13 }}
                />
              </th>
              {([
                ['title', 'TASK'],
                ['status', 'STATUS'],
                [null, 'BET'],
                ['priority', 'PRIORITY'],
                ['due_date', 'DUE'],
                ['estimated_time', 'TIME'],
              ] as [SortKey | null, string][]).map(([key, label]) => (
                <th
                  key={label}
                  className="px-3 py-2 text-left font-mono text-[10px] tracking-widest select-none"
                  style={{
                    background: '#060a10',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    color: 'rgba(255,255,255,0.25)',
                    cursor: key ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => key && toggleSort(key)}
                >
                  {label}{key && <SortIcon col={key} />}
                </th>
              ))}
              <th style={{ background: '#060a10', position: 'sticky', top: 0, zIndex: 10 }} />
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center font-mono text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  No tasks in this view.
                </td>
              </tr>
            )}
            {sorted.map(task => {
              const score = computeTaskCumulativeScore(task, bets)
              const parentBet = bets.find(b => b.id === task.bet_id)
              const cfg = STATUS_CFG[task.status]
              const isHovered = hoveredId === task.id
              const isSelected = selected.has(task.id)
              const isEditingTitle = editing?.taskId === task.id && editing.col === 'title'
              const isEditingDue   = editing?.taskId === task.id && editing.col === 'due'
              const isEditingTime  = editing?.taskId === task.id && editing.col === 'time'
              const isEditingStatus = editing?.taskId === task.id && editing.col === 'status'

              return (
                <tr
                  key={task.id}
                  onMouseEnter={() => setHoveredId(task.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected
                      ? 'rgba(232,160,69,0.05)'
                      : isHovered
                      ? 'rgba(255,255,255,0.025)'
                      : 'transparent',
                    borderLeft: isHovered || isSelected
                      ? '2px solid rgba(232,160,69,0.4)'
                      : '2px solid transparent',
                  }}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(task.id)}
                      className="cursor-pointer"
                      style={{ accentColor: '#e8a045', width: 13, height: 13 }}
                    />
                  </td>

                  {/* Title */}
                  <td className="px-3 py-2.5">
                    {isEditingTitle ? (
                      <input
                        ref={inputRef}
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                        className="w-full bg-transparent outline-none font-mono text-xs"
                        style={{ color: 'rgba(255,255,255,0.88)', caretColor: '#e8a045', borderBottom: '1px solid rgba(232,160,69,0.4)' }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="font-mono text-xs block truncate cursor-pointer transition-colors"
                        style={{ color: 'rgba(255,255,255,0.82)' }}
                        onClick={() => openTaskCard(task.id)}
                        onDoubleClick={() => startEdit(task.id, 'title', task.title)}
                        title="Click to open · double-click to rename"
                      >
                        {task.title}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5 relative">
                    <button
                      onClick={() => {
                        if (isEditingStatus) setEditing(null)
                        else startEdit(task.id, 'status', task.status)
                      }}
                      className="flex items-center gap-1.5 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                      <span className="font-mono text-[11px]" style={{ color: cfg.text }}>{cfg.label}</span>
                    </button>

                    {/* Status dropdown */}
                    {isEditingStatus && (
                      <div
                        className="absolute left-2 top-full mt-1 z-50 py-1"
                        style={{
                          background: '#0d1525',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          minWidth: 130,
                        }}
                      >
                        {ALL_STATUSES.map(s => {
                          const c = STATUS_CFG[s]
                          return (
                            <button
                              key={s}
                              onClick={() => setStatus(task.id, s)}
                              className="flex items-center gap-2 w-full px-3 py-1.5 font-mono text-[11px] transition-colors text-left"
                              style={{ color: c.text }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
                              {c.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </td>

                  {/* Parent Bet */}
                  <td className="px-3 py-2.5">
                    <span
                      className="font-mono text-[11px] truncate block"
                      style={{ color: parentBet ? 'rgba(232,160,69,0.5)' : 'rgba(255,255,255,0.12)' }}
                    >
                      {parentBet ? `⬦ ${parentBet.title}` : '—'}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] tabular-nums" style={{ color: 'rgba(232,160,69,0.65)' }}>
                      {score.toFixed(3)}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="px-3 py-2.5">
                    {isEditingDue ? (
                      <input
                        ref={inputRef}
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                        placeholder="dd/mm/yy"
                        maxLength={8}
                        className="w-full bg-transparent outline-none font-mono text-[11px]"
                        style={{ color: 'rgba(232,160,69,0.8)', caretColor: '#e8a045', borderBottom: '1px solid rgba(232,160,69,0.4)', width: 70 }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="font-mono text-[11px] cursor-text"
                        style={{ color: task.due_date ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)' }}
                        onDoubleClick={() => startEdit(task.id, 'due', isoToDisplay(task.due_date))}
                        title="Double-click to edit"
                      >
                        {task.due_date ? isoToDisplay(task.due_date) : '—'}
                      </span>
                    )}
                  </td>

                  {/* Est. time */}
                  <td className="px-3 py-2.5">
                    {isEditingTime ? (
                      <input
                        ref={inputRef}
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                        type="number"
                        min={5}
                        className="bg-transparent outline-none font-mono text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.7)', caretColor: '#e8a045', borderBottom: '1px solid rgba(232,160,69,0.4)', width: 48 }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="font-mono text-[11px] cursor-text"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onDoubleClick={() => startEdit(task.id, 'time', String(task.estimated_time))}
                        title="Double-click to edit"
                      >
                        {task.estimated_time}m
                      </span>
                    )}
                  </td>

                  {/* Row action */}
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => openTaskCard(task.id)}
                      className="font-mono text-[10px] px-2 py-0.5 transition-all"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        color: 'rgba(232,160,69,0.7)',
                        border: '1px solid rgba(232,160,69,0.25)',
                        background: 'rgba(232,160,69,0.06)',
                      }}
                    >
                      OPEN
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center px-5 py-2 gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {sorted.length} task{sorted.length !== 1 ? 's' : ''}
        </span>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
          click to open · double-click to edit
        </span>
      </div>
    </div>
  )
}
