import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

export default function MetricCard({ label, value, unit, change, positiveIsGood = true }) {
  const changeNum = parseFloat(change) || 0
  const isGood = positiveIsGood ? changeNum > 0 : changeNum < 0
  const isBad = positiveIsGood ? changeNum < 0 : changeNum > 0

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground mt-1">
        {value}{unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
          isGood ? 'text-chart-emerald' : isBad ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          {changeNum < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : changeNum > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}
