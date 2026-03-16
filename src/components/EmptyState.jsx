export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="card flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-border flex items-center justify-center mb-5">
        <div className="w-6 h-0.5 bg-gray-300 rounded-full" />
      </div>
      <p className="text-text-secondary text-[15px] mb-5 max-w-[280px]">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors duration-150 shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
