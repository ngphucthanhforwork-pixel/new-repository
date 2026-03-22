import { GrandQueue } from './GrandQueue'
import { MicroQueue } from './MicroQueue'

export function CampaignView() {
  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#080d14' }}>
      {/* Grand Queue — left half */}
      <div className="flex-1 border-r border-white/8 overflow-hidden flex flex-col">
        <GrandQueue />
      </div>

      {/* Micro Queue — right half */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MicroQueue />
      </div>
    </div>
  )
}
