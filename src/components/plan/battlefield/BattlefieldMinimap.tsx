import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { useBetStore } from '@/store/useBetStore'
import { useHabitStore } from '@/store/useHabitStore'
import { computeChessRank } from '@/lib/scoring'

// Coordinate bounds — matches the default zone layout
const VIEW_X = 50
const VIEW_Y = 50
const VIEW_W = 1100
const VIEW_H = 850

export function BattlefieldMinimap() {
  const { zones, positions } = useBattlefieldStore()
  const { bets } = useBetStore()
  const { habits } = useHabitStore()

  const visibleBets = bets.filter(b => b.status === 'active' || b.status === 'paused')

  return (
    <div className="flex flex-col h-full">
      {/* Label */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <span className="text-[9px] font-mono text-white/20 tracking-widest">BATTLEFIELD</span>
      </div>

      {/* SVG map */}
      <div className="flex-1 px-3 pb-3 overflow-hidden">
        <svg
          viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          {/* Zones */}
          {zones.map(zone => {
            const xs = zone.points.map(p => p[0])
            const ys = zone.points.map(p => p[1])
            const cx = (Math.min(...xs) + Math.max(...xs)) / 2
            const cy = (Math.min(...ys) + Math.max(...ys)) / 2

            return (
              <g key={zone.id}>
                <polygon
                  points={zone.points.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill={zone.color}
                  fillOpacity={0.06}
                  stroke={zone.color}
                  strokeOpacity={0.18}
                  strokeWidth={1.5}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={20}
                  fontFamily="IBM Plex Mono, monospace"
                  fill={zone.color}
                  fillOpacity={0.25}
                  letterSpacing={3}
                >
                  {zone.title.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* Habit pieces — small teal dots */}
          {habits.filter(h => h.status !== 'paused').map((habit, i) => {
            const pos = positions[habit.id] ?? { x: 150 + i * 60, y: 250 }
            return (
              <g key={habit.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={10}
                  fill="#0a2020"
                  stroke="rgba(74,184,176,0.4)"
                  strokeWidth={1}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="rgba(74,184,176,0.7)"
                >
                  ◈
                </text>
              </g>
            )
          })}

          {/* Bet pieces */}
          {visibleBets.map((bet, i) => {
            const pos = positions[bet.id] ?? { x: 300 + (i % 4) * 160, y: 300 + Math.floor(i / 4) * 140 }
            const rank = computeChessRank(bet, bets)
            const isPaused = bet.status === 'paused'
            const isLocked = bet.locked === true

            return (
              <g key={bet.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={20}
                  fill="#0d1520"
                  fillOpacity={isPaused ? 0.5 : 1}
                  stroke={isLocked ? '#e8a045' : isPaused ? 'rgba(255,255,255,0.2)' : 'rgba(232,160,69,0.45)'}
                  strokeWidth={isLocked ? 2 : 1}
                  strokeDasharray={isPaused ? '4 3' : undefined}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={17}
                  opacity={isPaused ? 0.4 : 1}
                >
                  {rank}
                </text>
              </g>
            )
          })}

          {/* Empty hint */}
          {visibleBets.length === 0 && habits.length === 0 && (
            <text
              x={VIEW_X + VIEW_W / 2}
              y={VIEW_Y + VIEW_H / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={16}
              fontFamily="IBM Plex Mono, monospace"
              fill="rgba(255,255,255,0.1)"
            >
              battlefield empty
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}
