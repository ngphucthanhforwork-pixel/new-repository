import { useState } from 'react'
import { create } from 'zustand'
import { loadState, saveState } from '@/lib/storage'
import type { Area } from '@/lib/types'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'

// Inline area store (areas are simple; no need for a separate file)
interface AreaStore {
  areas: Area[]
  addArea: (data: Omit<Area, 'id'>) => Area
}

const generateId = () => crypto.randomUUID()
const initial = loadState()

export const useAreaStore = create<AreaStore>((set) => ({
  areas: initial.areas,
  addArea: (data) => {
    const area: Area = { ...data, id: generateId() }
    set((s) => {
      const areas = [...s.areas, area]
      saveState({ ...loadState(), areas })
      return { areas }
    })
    return area
  },
}))

interface AreaFormProps {
  onDone: () => void
}

export function AreaForm({ onDone }: AreaFormProps) {
  const { addArea } = useAreaStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addArea({ title: title.trim(), description: description.trim() || undefined })
    onDone()
  }

  const sep = <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginLeft: -20, marginRight: -20 }} />

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <FormField label="Area" required hint="A non-bet floor — minimum standards to maintain.">
        <input
          className={inputClass}
          style={{ caretColor: 'rgba(255,255,255,0.5)' }}
          placeholder="e.g. Health, Sleep, Finance"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      {sep}

      <FormField label="Description" hint="What does maintaining this area look like?">
        <textarea
          className={textareaClass}
          style={{ caretColor: 'rgba(255,255,255,0.5)', minHeight: 72 }}
          placeholder="Minimum standards, non-negotiables..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </FormField>

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-1 w-full py-2.5 font-mono text-xs tracking-widest transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.5)',
        }}
        onMouseEnter={e => { if (title.trim()) e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      >
        ADD AREA
      </button>
    </form>
  )
}
