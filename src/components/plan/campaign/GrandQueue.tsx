import { useBetStore } from '@/store/useBetStore'
import { useCampaignStore } from '@/store/useCampaignStore'
import { computeChessRank, computeCumulativeScore } from '@/lib/scoring'

export function GrandQueue() {
  const { bets } = useBetStore()
  const { grandQueue, addToGrand, removeFromGrand, moveInGrand } = useCampaignStore()

  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')
  const queued = grandQueue
    .map(id => activeBets.find(b => b.id === id))
    .filter(Boolean) as typeof activeBets

  const available = activeBets
    .filter(b => !grandQueue.includes(b.id))
    .sort((a, b) => computeCumulativeScore(b, bets) - computeCumulativeScore(a, bets))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 shrink-0">
        <div className="text-[10px] font-mono text-white/30 tracking-widest mb-0.5">GRAND QUEUE</div>
        <div className="text-[10px] font-mono text-white/15">Bets to focus on this week</div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Queued bets */}
        <div className="px-4 py-3 flex flex-col gap-1.5 shrink-0">
          {queued.length === 0 && (
            <p className="text-[10px] font-mono text-white/20 py-3 text-center">
              No bets queued — add from below
            </p>
          )}
          {queued.map((bet, i) => {
            const rank = computeChessRank(bet, bets)
            const score = computeCumulativeScore(bet, bets)
            return (
              <div
                key={bet.id}
                className="flex items-center gap-2 px-3 py-2 bg-amber/5 border border-amber/15 group"
              >
                <span className="text-white/20 font-mono text-[10px] w-4 text-right shrink-0">{i + 1}</span>
                <span className="text-base shrink-0">{rank}</span>
                <span className="text-xs font-mono text-white/80 flex-1 truncate">{bet.title}</span>
                <span className="text-[10px] font-mono text-amber/50 tabular-nums shrink-0">{score.toFixed(3)}</span>
                {/* Reorder */}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    disabled={i === 0}
                    onClick={() => moveInGrand(i, i - 1)}
                    className="w-5 h-5 text-white/30 hover:text-white/70 disabled:opacity-20 font-mono text-xs flex items-center justify-center transition-colors"
                  >↑</button>
                  <button
                    disabled={i === queued.length - 1}
                    onClick={() => moveInGrand(i, i + 1)}
                    className="w-5 h-5 text-white/30 hover:text-white/70 disabled:opacity-20 font-mono text-xs flex items-center justify-center transition-colors"
                  >↓</button>
                </div>
                <button
                  onClick={() => removeFromGrand(bet.id)}
                  className="text-white/20 hover:text-white/60 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >✕</button>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        {available.length > 0 && (
          <div className="px-4 pb-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] font-mono text-white/20 tracking-widest">AVAILABLE</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          </div>
        )}

        {/* Available bets */}
        <div className="px-4 pb-4 flex flex-col gap-1">
          {available.map(bet => {
            const rank = computeChessRank(bet, bets)
            const score = computeCumulativeScore(bet, bets)
            return (
              <div
                key={bet.id}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/5 hover:border-white/10 group transition-colors"
              >
                <span className="text-base shrink-0">{rank}</span>
                <span className="text-xs font-mono text-white/50 flex-1 truncate">{bet.title}</span>
                <span className="text-[10px] font-mono text-white/25 tabular-nums shrink-0">{score.toFixed(3)}</span>
                <button
                  onClick={() => addToGrand(bet.id)}
                  className="text-[10px] font-mono text-amber/50 hover:text-amber transition-colors opacity-0 group-hover:opacity-100 shrink-0 px-1.5 py-0.5 border border-amber/20 hover:border-amber/50"
                >+ ADD</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
