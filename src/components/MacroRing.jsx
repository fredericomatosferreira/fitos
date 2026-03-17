export default function MacroRing({ value = 0, goal = 100, label, color, size = 100, unit = 'g' }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / (goal || 1), 1)
  const offset = circumference * (1 - pct)

  // Scale inner text with ring size
  const valueFontSize = Math.round(size * 0.22)
  const goalFontSize = Math.round(size * 0.1)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(210 20% 94%)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-foreground tabular-nums leading-none" style={{ fontSize: valueFontSize }}>
            {Math.round(value)}
          </span>
          <span className="text-muted-foreground mt-1 tabular-nums" style={{ fontSize: goalFontSize }}>
            / {goal}{unit === 'kcal' ? 'kcal' : unit}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
