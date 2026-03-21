import { useAppStore } from '@/store/useAppStore'
import type { AppMode } from '@/lib/types'

const MODES: { id: AppMode; label: string }[] = [
  { id: 'plan', label: 'PLAN' },
  { id: 'execute', label: 'EXECUTE' },
  { id: 'break', label: 'BREAK' },
  { id: 'review', label: 'REVIEW' },
  { id: 'heatmap', label: 'HEATMAP' },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { mode, setMode } = useAppStore()

  return (
    <div className="flex flex-col h-screen bg-canvas text-white">
      {/* Top nav */}
      <nav className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-surface-2 shrink-0">
        <span className="font-mono text-xs text-amber mr-6 tracking-widest">TBD</span>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={[
              'px-3 py-1 text-xs font-mono tracking-widest transition-all',
              mode === m.id
                ? 'text-amber border-b border-amber'
                : 'text-white/30 hover:text-white/60',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
