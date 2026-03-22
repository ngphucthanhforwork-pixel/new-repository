// ─── Shared panel primitives used by all entity card / side-panel components ──
//
//   PanelHeader   — coloured top strip with type badge + editable title + close
//   PanelSection  — labelled section block with border separator
//   ActionBtn     — uniform action button (primary / default / danger)
//   ENTITY_CFG    — per-entity-type colour & icon config
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode, KeyboardEvent } from 'react'

// ── Entity type config ────────────────────────────────────────────────────────

export type EntityType = 'task' | 'bet' | 'habit' | 'area'

export const ENTITY_CFG: Record<EntityType, {
  headerBg: string      // header strip background
  headerText: string    // header text / icon colour
  accent: string        // primary accent colour (rgba)
  icon: string
  badge: string         // short label shown in badge
}> = {
  task: {
    headerBg: '#c47a1a',
    headerText: 'rgba(0,0,0,0.75)',
    accent: 'rgba(232,160,69,0.8)',
    icon: '◈',
    badge: 'TASK',
  },
  bet: {
    headerBg: '#c47a1a',
    headerText: 'rgba(0,0,0,0.75)',
    accent: 'rgba(232,160,69,0.8)',
    icon: '♚',
    badge: 'BET',
  },
  habit: {
    headerBg: '#0d2a2a',
    headerText: 'rgba(74,184,184,0.9)',
    accent: 'rgba(74,184,184,0.8)',
    icon: '↻',
    badge: 'HABIT',
  },
  area: {
    headerBg: '#0d1520',
    headerText: 'rgba(255,255,255,0.45)',
    accent: 'rgba(255,255,255,0.4)',
    icon: '▦',
    badge: 'AREA',
  },
}

// ── PanelHeader ───────────────────────────────────────────────────────────────

interface PanelHeaderProps {
  type: EntityType
  title: string
  badge?: string                       // override default badge text
  editableTitle?: boolean
  onTitleChange?: (v: string) => void
  onTitleBlur?: () => void
  onClose?: () => void
  left?: ReactNode                     // slot for back-button etc.
  right?: ReactNode                    // slot for extra controls
}

export function PanelHeader({
  type, title, badge, editableTitle, onTitleChange, onTitleBlur,
  onClose, left, right,
}: PanelHeaderProps) {
  const cfg = ENTITY_CFG[type]
  const displayBadge = badge ?? cfg.badge

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{ background: cfg.headerBg }}
    >
      {/* Top bar: back/left slot + badge + close */}
      <div
        className="flex items-center justify-between px-5 pt-3 pb-1"
        style={{ minHeight: 36 }}
      >
        <div className="flex items-center gap-3">
          {left}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <span
            className="shrink-0 font-mono text-[10px] tracking-widest px-2 py-0.5"
            style={{ background: 'rgba(0,0,0,0.18)', color: cfg.headerText, opacity: 0.9 }}
          >
            {displayBadge}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="font-mono text-[11px] transition-opacity hover:opacity-70"
              style={{ color: cfg.headerText }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      {editableTitle ? (
        <input
          className="w-full bg-transparent outline-none font-mono font-semibold px-5 pb-3"
          style={{ fontSize: 22, color: '#ffffff', caretColor: 'rgba(255,255,255,0.6)' }}
          value={title}
          onChange={e => onTitleChange?.(e.target.value)}
          onBlur={onTitleBlur}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          placeholder="Title..."
        />
      ) : (
        <div
          className="font-mono font-semibold px-5 pb-3 leading-snug"
          style={{ fontSize: 20, color: '#ffffff' }}
        >
          {title}
        </div>
      )}
    </div>
  )
}

// ── PanelSection ──────────────────────────────────────────────────────────────

interface PanelSectionProps {
  label?: string
  children: ReactNode
  className?: string
  noBorder?: boolean
}

export function PanelSection({ label, children, className = '', noBorder }: PanelSectionProps) {
  return (
    <div
      className={`px-5 py-4 ${className}`}
      style={noBorder ? undefined : { borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {label && (
        <div
          className="font-mono text-[10px] tracking-widest mb-3"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

// ── ActionBtn ─────────────────────────────────────────────────────────────────

interface ActionBtnProps {
  label: string
  onClick: () => void
  primary?: boolean
  danger?: boolean
  highlight?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

export function ActionBtn({ label, onClick, primary, danger, highlight, disabled, fullWidth = true }: ActionBtnProps) {
  const base = `${fullWidth ? 'w-full' : ''} py-2 text-xs font-mono tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed`

  const variant = danger
    ? 'border-red-500/20 text-red-400/50 hover:text-red-400/80 hover:border-red-500/40'
    : primary
    ? 'border-amber/60 text-amber bg-amber/10 hover:bg-amber/20'
    : highlight
    ? 'border-amber/40 text-amber bg-amber/5 hover:bg-amber/15'
    : 'border-white/8 text-white/35 hover:text-white/60 hover:border-white/15'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variant}`}
    >
      {label}
    </button>
  )
}
