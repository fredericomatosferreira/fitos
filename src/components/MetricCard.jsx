export default function MetricCard({ label, value, unit, icon: Icon, trend, subtitle }) {
  return (
    <div className="card p-5">
      <p className="text-text-secondary text-[13px] font-medium mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-text font-bold text-[24px] tabular-nums leading-none">{value}</span>
        {unit && <span className="text-text-secondary text-[14px] font-medium">{unit}</span>}
      </div>
      {trend != null && trend !== 0 && (
        <div className={`flex items-center gap-1.5 mt-2.5 text-[13px] font-semibold ${trend > 0 ? 'text-accent' : trend < 0 ? 'text-accent' : 'text-text-secondary'}`}>
          <span className="text-[14px]">{trend > 0 ? '↗' : '↘'}</span>
          <span className="tabular-nums">{trend > 0 ? '+' : ''}{Number(trend).toFixed(1)} {unit}</span>
        </div>
      )}
      {subtitle && <p className="text-text-secondary text-[12px] mt-2">{subtitle}</p>}
    </div>
  )
}
