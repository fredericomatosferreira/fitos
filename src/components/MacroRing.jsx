import { formatNumber } from '../lib/utils'

export default function MacroRing({ label, value, goal, color = 'var(--color-accent)', size = 130, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0
  const offset = circumference - pct * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            opacity={0.6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-text font-bold tabular-nums leading-none" style={{ fontSize: size * 0.24 }}>
            {formatNumber(value, 0)}
          </span>
          <span className="text-text-secondary text-[11px] tabular-nums mt-1.5 font-medium">
            / {formatNumber(goal, 0)}{label === 'Calories' ? 'kcal' : 'g'}
          </span>
        </div>
      </div>
      <p className="text-text-secondary text-[13px] font-semibold">{label}</p>
    </div>
  )
}
