import { Trophy } from 'lucide-react'

export default function PBBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 bg-accent/15 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded">
      <Trophy className="w-3 h-3" />
      PB
    </span>
  )
}
