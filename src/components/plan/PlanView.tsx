import { useAppStore } from '@/store/useAppStore'
import { CaptureView } from './capture/CaptureView'
import { BattlefieldView } from './battlefield/BattlefieldView'
import { CampaignView } from './campaign/CampaignView'
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
        {planStage === 'battlefield' && <BattlefieldView />}
        {planStage === 'campaign' && <CampaignView />}
      </div>
    </div>
  )
}
