interface ScoreSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
}

export function ScoreSlider({ label, value, onChange, hint }: ScoreSliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-mono text-white/50 tracking-widest uppercase">{label}</label>
        <span className="text-xs font-mono text-amber tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 appearance-none bg-white/10 rounded-full outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber"
      />
      {hint && <p className="text-xs font-mono text-white/25">{hint}</p>}
    </div>
  )
}
