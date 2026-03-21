import { BattlefieldCanvas } from './BattlefieldCanvas'
import { ZoneLayer } from './ZoneLayer'
import { ArrowLayer } from './ArrowLayer'
import { PiecesLayer } from './PiecesLayer'
import { MissionPanel } from './MissionPanel'
import { useBetStore } from '@/store/useBetStore'
import { useHabitStore } from '@/store/useHabitStore'

export function BattlefieldView() {
  const { bets } = useBetStore()
  const { habits } = useHabitStore()

  const hasContent = bets.length > 0 || habits.length > 0

  return (
    <div className="relative w-full h-full overflow-hidden">
      <BattlefieldCanvas>
        <ZoneLayer />
        <ArrowLayer />
        <PiecesLayer />
      </BattlefieldCanvas>

      <MissionPanel />

      {/* Empty state overlay */}
      {!hasContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <span className="text-5xl opacity-10">♚</span>
          <p className="text-xs font-mono text-white/20 text-center max-w-xs">
            No bets on the battlefield yet.<br />Go to Capture and place your first bet.
          </p>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/15 pointer-events-none leading-relaxed">
        scroll to zoom · drag background to pan · click piece to inspect
      </div>
    </div>
  )
}
