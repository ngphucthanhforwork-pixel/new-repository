import { useAppStore } from '@/store/useAppStore'
import { CaptureView } from './capture/CaptureView'
import type { PlanStage } from '@/lib/types'

const STAGES: { id: PlanStage; label: string }[] = [
  { id: 'capture', label: 'CAPTURE' },
  { id: 'battlefield', label: 'BATTLEFIELD' },
  { id: 'campaign', label: 'CAMPAIGN' },
]

export function PlanView() {
  const { planStage, setPlanStage } = useAppStore()

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Stage tabs */}
      <div className="flex items-center gap-px px-6 pt-4 pb-0 shrink-0">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setPlanStage(s.id)}
            className={[
              'px-4 py-2 text-xs font-mono tracking-widest border-t border-x transition-all',
              planStage === s.id
                ? 'bg-surface border-white/10 text-amber'
                : 'bg-transparent border-transparent text-white/25 hover:text-white/50',
            ].join(' ')}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {/* Stage content */}
      <div className="flex-1 border-t border-white/10 overflow-hidden">
        {planStage === 'capture' && <CaptureView />}
        {planStage === 'battlefield' && <StageStub label="BATTLEFIELD" description="See your bets as pieces on a living map." sprint="Sprint 2" />}
        {planStage === 'campaign' && <StageStub label="CAMPAIGN" description="Build your queue. Schedule what matters." sprint="Sprint 3" />}
      </div>
    </div>
  )
}

function StageStub({ label, description, sprint }: { label: string; description: string; sprint: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <span className="text-xs font-mono tracking-widest text-white/20">{label}</span>
      <p className="text-sm font-mono text-white/40 max-w-xs">{description}</p>
      <span className="text-xs font-mono text-white/15 mt-4">{sprint}</span>
    </div>
  )
}
