import { useRef, useState } from 'react'
import { useBetStore } from '@/store/useBetStore'
import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { computeChessRank, computeCumulativeScore } from '@/lib/scoring'
import { getBetDecayState, decayOpacity } from '@/lib/decay'
import { pieceSize, defaultPosition } from '@/lib/battlefield'
import { ArcRing } from './ArcRing'
import { useBattlefieldCtx } from './BattlefieldCanvas'

interface BetPieceProps {
  betId: string
  index: number
}

export function BetPiece({ betId, index }: BetPieceProps) {
  const { bets, updateBet } = useBetStore()
  const { positions, setPosition, selectPiece, selectedId } = useBattlefieldStore()
  const { zoom } = useBattlefieldCtx()
  const [hovered, setHovered] = useState(false)

  const bet = bets.find(b => b.id === betId)
  if (!bet || bet.status === 'killed' || bet.status === 'completed') return null

  const pos = positions[betId] ?? defaultPosition(index)
  const score = computeCumulativeScore(bet, bets)
  const rank = computeChessRank(bet, bets)
  const size = pieceSize(score)
  const decay = getBetDecayState(bet)
  const opacity = bet.status === 'paused' ? 0.5 : decayOpacity(decay)
  const isSelected = selectedId === betId
  const isPaused = bet.status === 'paused'
  const isLocked = bet.locked === true

  // Drag state
  const isDragging = useRef(false)
  const dragStart = useRef({ px: 0, py: 0, wx: 0, wy: 0 })

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as SVGElement).closest('circle[style*="cursor"]')) return
    e.stopPropagation()
    isDragging.current = false
    dragStart.current = { px: e.clientX, py: e.clientY, wx: pos.x, wy: pos.y }
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    if (!isDragging.current && Math.abs(dx) + Math.abs(dy) > 4) {
      isDragging.current = true
    }
    if (!isDragging.current) return
    e.stopPropagation()
    setPosition(betId, dragStart.current.wx + dx / zoom, dragStart.current.wy + dy / zoom)
  }

  function onPointerUp(e: React.PointerEvent) {
    e.stopPropagation()
    if (!isDragging.current) {
      selectPiece(betId)
    }
    isDragging.current = false
  }

  // Border style — locked trumps selected trumps normal
  const borderColor = isPaused
    ? 'rgba(255,255,255,0.2)'
    : isLocked
    ? '#e8a045'
    : isSelected
    ? '#e8a045'
    : 'rgba(232,160,69,0.5)'
  const borderWidth = isLocked || isSelected ? 2 : 1
  const borderStyle = isPaused ? 'dashed' : 'solid'

  return (
    <div
      data-piece
      style={{
        position: 'absolute',
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        width: size + 40,   // extra space for arc ring
        height: size + 40,
        opacity,
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* SVG for arc ring (centered around piece) */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
      >
        <ArcRing
          cx={size / 2 + 20}
          cy={size / 2 + 20}
          radius={size / 2}
          intrinsicImpact={bet.intrinsic_impact}
          visible={hovered || isSelected}
          onUpdate={(v) => updateBet(betId, { intrinsic_impact: v, last_active_at: new Date().toISOString() })}
        />
      </svg>

      {/* Piece circle */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#0d1520',
          border: `${borderWidth}px ${borderStyle} ${borderColor}`,
          boxShadow: isSelected ? `0 0 12px rgba(232,160,69,0.3)` : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span style={{ fontSize: Math.max(14, size * 0.35), lineHeight: 1 }}>{rank}</span>
        <span style={{
          fontSize: 9,
          fontFamily: 'IBM Plex Mono, monospace',
          color: 'rgba(232,160,69,0.7)',
          letterSpacing: 1,
        }}>
          {score.toFixed(2)}
        </span>
        {isLocked && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 6,
            fontSize: 9,
            opacity: 0.7,
          }}>🔒</span>
        )}
      </div>

      {/* Bet title below piece */}
      <div style={{
        position: 'absolute',
        left: 20,
        top: 20 + size + 4,
        width: size,
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'IBM Plex Mono, monospace',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.5,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        pointerEvents: 'none',
      }}>
        {bet.title}
      </div>
    </div>
  )
}
