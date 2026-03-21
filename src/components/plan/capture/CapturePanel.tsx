import { useState } from 'react'
import { BetForm } from './BetForm'
import { TaskForm } from './TaskForm'
import { HabitForm } from './HabitForm'
import { AreaForm } from './AreaForm'

type EntityType = 'bet' | 'task' | 'habit' | 'area'

const TYPES: { id: EntityType; label: string; description: string; color: string }[] = [
  { id: 'bet', label: 'BET', description: 'A hypothesis to test', color: 'text-amber border-amber/30 bg-amber/5' },
  { id: 'task', label: 'TASK', description: 'One-time action', color: 'text-white/70 border-white/15 bg-white/5' },
  { id: 'habit', label: 'HABIT', description: 'Recurring practice', color: 'text-teal border-teal/30 bg-teal/5' },
  { id: 'area', label: 'AREA', description: 'Minimum standard', color: 'text-white/40 border-white/10 bg-white/3' },
]

interface CapturePanelProps {
  open: boolean
  onClose: () => void
}

export function CapturePanel({ open, onClose }: CapturePanelProps) {
  const [activeType, setActiveType] = useState<EntityType>('bet')

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-96 bg-surface border-l border-white/10
        z-50 flex flex-col transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <span className="text-xs font-mono tracking-widest text-white/60">CAPTURE</span>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 text-xs font-mono transition-colors"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-4 gap-1 px-5 py-3 border-b border-white/10 shrink-0">
          {TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex flex-col items-center py-2 px-1 border rounded text-center transition-all ${
                activeType === t.id ? t.color : 'text-white/20 border-transparent hover:text-white/40'
              }`}
            >
              <span className="text-xs font-mono tracking-widest">{t.label}</span>
              <span className="text-[10px] font-mono text-inherit opacity-60 mt-0.5">{t.description}</span>
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {activeType === 'bet' && <BetForm onDone={onClose} />}
          {activeType === 'task' && <TaskForm onDone={onClose} />}
          {activeType === 'habit' && <HabitForm onDone={onClose} />}
          {activeType === 'area' && <AreaForm onDone={onClose} />}
        </div>
      </div>
    </>
  )
}
