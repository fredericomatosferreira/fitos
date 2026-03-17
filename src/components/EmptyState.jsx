export default function EmptyState({ message = 'No data yet', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      {Icon && <Icon className="w-10 h-10 mb-3 opacity-40" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}
