import { useRef, useState } from 'react'
import { differenceInMinutes } from 'date-fns'
import { useHabitStore } from '@/store/useHabitStore'
import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { defaultPosition } from '@/lib/battlefield'
import { useBattlefieldCtx } from './BattlefieldCanvas'

interface HabitPieceProps {
  habitId: string
  index: number
}

function formatCountdown(nextDue: string): string {
  const mins = differenceInMinutes(new Date(nextDue), new Date())
  if (mins <= 0) return 'DUE'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function HabitPiece({ habitId, index }: HabitPieceProps) {
  const { habits } = useHabitStore()
  const { positions, setPosition, selectPiece } = useBattlefieldStore()
  const { zoom } = useBattlefieldCtx()
  const [hovered, setHovered] = useState(false)

  const habit = habits.find(h => h.id === habitId)
  if (!habit || habit.status === 'paused') return null

  // Use offset index to avoid collision with bet positions
  const pos = positions[habitId] ?? defaultPosition(index + 20)
  const size = 48
  const isDue = new Date(habit.next_due_at) <= new Date()
  const isDimmed = habit.status === 'dimmed'
  const opacity = isDimmed && !isDue ? 0.35 : 1.0

  const isDragging = useRef(false)
  const dragStart = useRef({ px: 0, py: 0, wx: 0, wy: 0 })

  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    isDragging.current = false
    dragStart.current = { px: e.clientX, py: e.clientY, wx: pos.x, wy: pos.y }
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    if (!isDragging.current && Math.abs(dx) + Math.abs(dy) > 4) isDragging.current = true
    if (!isDragging.current) return
    e.stopPropagation()
    setPosition(habitId, dragStart.current.wx + dx / zoom, dragStart.current.wy + dy / zoom)
  }

  function onPointerUp(e: React.PointerEvent) {
    e.stopPropagation()
    if (!isDragging.current) selectPiece(habitId)
    isDragging.current = false
  }

  const borderColor = isDue ? '#4ab8b0' : hovered ? 'rgba(74,184,176,0.5)' : 'rgba(74,184,176,0.25)'

  return (
    <div
      data-piece
      style={{
        position: 'absolute',
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        width: size,
        height: size + 16,
        opacity,
        cursor: 'grab',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#0d1520',
        border: `1px solid ${borderColor}`,
        boxShadow: isDue ? '0 0 10px rgba(74,184,176,0.3)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}>
        <span style={{ fontSize: 16 }}>◈</span>
        {isDimmed && !isDue && (
          <span style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', color: 'rgba(74,184,176,0.6)' }}>
            {formatCountdown(habit.next_due_at)}
          </span>
        )}
        {isDue && (
          <span style={{ fontSize: 7, fontFamily: 'IBM Plex Mono', color: '#4ab8b0', letterSpacing: 1 }}>
            DUE
          </span>
        )}
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'IBM Plex Mono',
        color: 'rgba(74,184,176,0.5)',
        marginTop: 3,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: size,
      }}>
        {habit.title}
      </div>
    </div>
  )
}
