import { useBattlefieldStore } from '@/store/useBattlefieldStore'

const WORLD_W = 2400
const WORLD_H = 1800

function polygonCentroid(points: [number, number][]): { x: number; y: number } {
  const x = points.reduce((s, p) => s + p[0], 0) / points.length
  const y = points.reduce((s, p) => s + p[1], 0) / points.length
  return { x, y }
}

export function ZoneLayer() {
  const { zones } = useBattlefieldStore()

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: WORLD_W, height: WORLD_H, pointerEvents: 'none' }}
    >
      {/* Subtle grid */}
      <defs>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(78,205,196,0.03)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={WORLD_W} height={WORLD_H} fill="url(#grid)" />

      {zones.map(zone => {
        const pointsStr = zone.points.map(p => p.join(',')).join(' ')
        const centroid = polygonCentroid(zone.points)
        return (
          <g key={zone.id}>
            <polygon
              points={pointsStr}
              fill={zone.color}
              fillOpacity={0.06}
              stroke={zone.color}
              strokeOpacity={0.2}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={centroid.x}
              y={centroid.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={zone.color}
              fillOpacity={0.4}
              fontSize={11}
              fontFamily="'IBM Plex Mono', monospace"
              letterSpacing={2}
            >
              {zone.title.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
