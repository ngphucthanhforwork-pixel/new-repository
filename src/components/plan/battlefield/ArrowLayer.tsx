import { useBetStore } from '@/store/useBetStore'
import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { computeCumulativeScore } from '@/lib/scoring'
import { getRoadDecayState } from '@/lib/decay'
import { pieceSize, defaultPosition, arrowPath } from '@/lib/battlefield'

const WORLD_W = 2400
const WORLD_H = 1800

export function ArrowLayer() {
  const { bets } = useBetStore()
  const { positions } = useBattlefieldStore()

  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')
  const betsWithParent = activeBets.filter(b => b.parent_bet_id)

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: WORLD_W, height: WORLD_H, pointerEvents: 'none' }}
    >
      {betsWithParent.map((bet, i) => {
        const parent = bets.find(b => b.id === bet.parent_bet_id)
        if (!parent) return null

        const childIdx = activeBets.findIndex(b => b.id === bet.id)
        const parentIdx = activeBets.findIndex(b => b.id === parent.id)

        const childPos = positions[bet.id] ?? defaultPosition(childIdx)
        const parentPos = positions[parent.id] ?? defaultPosition(parentIdx)

        const parentSize = pieceSize(computeCumulativeScore(parent, bets))

        const from = { x: childPos.x, y: childPos.y }
        const to = { x: parentPos.x, y: parentPos.y }

        const roadState = getRoadDecayState(bet.last_active_at)
        if (roadState === 'dead') return null

        const strokeOpacity = roadState === 'fresh' ? 0.2 : 0.1
        const strokeDash = roadState === 'aging' ? '4 4' : undefined

        const path = arrowPath(from, to)

        // Arrowhead direction
        const dx = to.x - from.x
        const dy = to.y - from.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len
        const uy = dy / len
        // Place arrowhead at edge of parent circle
        const arrowX = to.x - ux * (parentSize / 2 + 2)
        const arrowY = to.y - uy * (parentSize / 2 + 2)
        const angle = Math.atan2(dy, dx) * 180 / Math.PI

        return (
          <g key={`${bet.id}-${i}`}>
            <path
              d={path}
              fill="none"
              stroke="rgba(255,255,255,1)"
              strokeOpacity={strokeOpacity}
              strokeWidth={1}
              strokeDasharray={strokeDash}
            />
            <polygon
              points="-5,-3 0,0 -5,3"
              fill={`rgba(255,255,255,${strokeOpacity})`}
              transform={`translate(${arrowX},${arrowY}) rotate(${angle})`}
            />
          </g>
        )
      })}
    </svg>
  )
}
