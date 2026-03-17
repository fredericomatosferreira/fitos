import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isToday } from 'date-fns'

export default function DateSelector({ date, onChange }) {
  const prev = () => onChange(new Date(date.getTime() - 86400000))
  const next = () => onChange(new Date(date.getTime() + 86400000))

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      <span className="text-sm font-semibold text-foreground min-w-[90px] text-center tabular-nums">
        {isToday(date) ? 'Today' : format(date, 'MMM dd, yyyy')}
      </span>
      <button onClick={next} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}
