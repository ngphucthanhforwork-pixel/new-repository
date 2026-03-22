import type { ReactNode } from 'react'

// ─── Shared input styles ──────────────────────────────────────────────────────

export const inputClass =
  'w-full bg-transparent border-b font-mono text-xs text-white/80 placeholder-white/18 ' +
  'outline-none py-2 transition-colors ' +
  'focus:placeholder-white/10 ' +
  '[border-bottom-color:rgba(255,255,255,0.1)] [&:focus]:[border-bottom-color:rgba(232,160,69,0.45)]'

export const inputStyle: React.CSSProperties = {
  caretColor: '#e8a045',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
}

export const textareaClass =
  'w-full bg-transparent font-mono text-xs text-white/80 placeholder-white/18 ' +
  'outline-none py-2 resize-none transition-colors leading-relaxed ' +
  '[border-bottom-color:rgba(255,255,255,0.1)] [&:focus]:[border-bottom-color:rgba(232,160,69,0.45)]'

// ─── FormField ────────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string
  required?: boolean
  children: ReactNode
  hint?: string
}

export function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-mono tracking-widest uppercase"
        style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)' }}
      >
        {label}
        {required && <span style={{ color: '#e8a045', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  )
}
