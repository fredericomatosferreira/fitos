import { format, addDays, subDays, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DateSelector({ date, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(subDays(date, 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-gray-100 transition-all duration-150 border border-transparent hover:border-border"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-text font-semibold text-[14px] min-w-[90px] text-center tabular-nums">
        {isToday(date) ? 'Today' : format(date, 'MMM d')}
      </span>
      <button
        onClick={() => onChange(addDays(date, 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-gray-100 transition-all duration-150 border border-transparent hover:border-border"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
