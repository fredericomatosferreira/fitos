import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-modal)' }}>
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="text-text font-bold text-[17px]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-gray-100 transition-all duration-150"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
