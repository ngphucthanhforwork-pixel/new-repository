interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-white/50 tracking-widest uppercase">
        {label}
        {required && <span className="text-amber ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs font-mono text-white/25">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white ' +
  'placeholder-white/20 outline-none focus:border-amber/50 transition-colors'

export const textareaClass =
  inputClass + ' resize-none'
