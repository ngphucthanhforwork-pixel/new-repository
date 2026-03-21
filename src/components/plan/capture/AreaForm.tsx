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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label="Area" required hint="A non-bet floor — minimum standards to maintain.">
        <input
          className={inputClass}
          placeholder="e.g. Health, Sleep, Finance"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      <FormField label="Description">
        <textarea
          className={textareaClass}
          rows={3}
          placeholder="What does maintaining this area look like?"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </FormField>

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-2 w-full py-2 text-xs font-mono tracking-widest bg-white/5 border border-white/15
          text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ADD AREA
      </button>
    </form>
  )
}
