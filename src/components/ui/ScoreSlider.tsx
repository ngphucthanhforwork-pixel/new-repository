interface ScoreSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
}

export function ScoreSlider({ label, value, onChange, hint }: ScoreSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <label
          className="font-mono tracking-widest uppercase"
          style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)' }}
        >
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums" style={{ color: '#e8a045' }}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-px appearance-none outline-none cursor-pointer"
        style={{ background: `linear-gradient(to right, rgba(232,160,69,0.7) ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%)` }}
      />
      {hint && (
        <p className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  )
}
