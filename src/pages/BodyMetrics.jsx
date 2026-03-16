import { useState, useMemo } from 'react'
import { useBodyMetrics } from '../hooks/useBodyMetrics'
import { formatNumber } from '../lib/utils'
import MetricCard from '../components/MetricCard'
import EmptyState from '../components/EmptyState'
import { Plus, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const chartTooltipStyle = { background: '#FFFFFF', border: '1px solid #E2E5EB', borderRadius: 10, fontSize: 13, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export default function BodyMetrics() {
  const { metrics, addMetric, deleteMetric } = useBodyMetrics()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight_kg: '',
    body_fat_pct: '',
    muscle_mass_kg: '',
    notes: '',
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addMetric({
      date: form.date,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : null,
      muscle_mass_kg: form.muscle_mass_kg ? Number(form.muscle_mass_kg) : null,
      notes: form.notes || null,
    })
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), weight_kg: '', body_fat_pct: '', muscle_mass_kg: '', notes: '' })
    setShowForm(false)
  }

  const stats = useMemo(() => {
    if (metrics.length === 0) return null
    const first = metrics[0]
    const last = metrics[metrics.length - 1]
    const weightChange = (first.weight_kg && last.weight_kg) ? last.weight_kg - first.weight_kg : null
    const bfChange = (first.body_fat_pct && last.body_fat_pct) ? last.body_fat_pct - first.body_fat_pct : null
    const muscleChange = (first.muscle_mass_kg && last.muscle_mass_kg) ? last.muscle_mass_kg - first.muscle_mass_kg : null
    const days = Math.round((new Date() - new Date(first.date)) / 86400000)
    return { current: last, starting: first, weightChange, bfChange, muscleChange, count: metrics.length, days }
  }, [metrics])

  const weightData = metrics.filter(m => m.weight_kg != null).map(m => ({ date: format(new Date(m.date), 'MMM d'), weight: Number(m.weight_kg) }))
  const bfData = metrics.filter(m => m.body_fat_pct != null).map(m => ({ date: format(new Date(m.date), 'MMM d'), bf: Number(m.body_fat_pct) }))

  const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-[14px] text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-[26px] text-text leading-tight">Body Metrics</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">Track your body composition</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Log Entry
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Current Weight" value={stats.current.weight_kg ? formatNumber(stats.current.weight_kg) : '—'} unit="kg" trend={stats.weightChange} />
          <MetricCard label="Body Fat" value={stats.current.body_fat_pct ? formatNumber(stats.current.body_fat_pct) : '—'} unit="%" trend={stats.bfChange} />
          <MetricCard label="Muscle Mass" value={stats.current.muscle_mass_kg ? formatNumber(stats.current.muscle_mass_kg) : '—'} unit="kg" trend={stats.muscleChange} />
          <MetricCard label="Entries" value={stats.count} subtitle={`— ${stats.days} days`} />
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-text font-bold text-[16px] mb-5">New Entry</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <label className="block">
                <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Date</span>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required className={inputClass} />
              </label>
              <label className="block">
                <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Weight (kg)</span>
                <input type="number" step="any" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Body Fat %</span>
                <input type="number" step="any" value={form.body_fat_pct} onChange={e => set('body_fat_pct', e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Muscle Mass (kg)</span>
                <input type="number" step="any" value={form.muscle_mass_kg} onChange={e => set('muscle_mass_kg', e.target.value)} className={inputClass} />
              </label>
            </div>
            <label className="block mb-5">
              <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Notes (optional)</span>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 bg-surface border border-border rounded-xl text-[14px] text-text font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Charts */}
      {weightData.length >= 2 && (
        <div className="space-y-6 mb-6">
          <div className="card p-6">
            <p className="section-header mb-5">Weight Over Time</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={45} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10B981' }} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {bfData.length >= 2 && (
            <div className="card p-6">
              <p className="section-header mb-5">Body Fat % Over Time</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bfData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={42} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="bf" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6366F1' }} name="Body Fat %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History table */}
      {metrics.length === 0 ? (
        <EmptyState message="No body metrics logged yet" actionLabel="+ Log your first entry" onAction={() => setShowForm(true)} />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <p className="section-header">History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Weight</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Body Fat</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Muscle</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3.5 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...metrics].reverse().map(m => (
                  <tr key={m.id} className="group hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 text-text text-[14px] font-medium">{format(new Date(m.date), 'MMM d, yyyy')}</td>
                    <td className="px-5 py-4 text-right text-text tabular-nums text-[14px] font-medium">{m.weight_kg ? `${formatNumber(m.weight_kg)} kg` : '—'}</td>
                    <td className="px-5 py-4 text-right text-text tabular-nums text-[14px]">{m.body_fat_pct ? `${formatNumber(m.body_fat_pct)}%` : '—'}</td>
                    <td className="px-5 py-4 text-right text-text tabular-nums text-[14px]">{m.muscle_mass_kg ? `${formatNumber(m.muscle_mass_kg)} kg` : '—'}</td>
                    <td className="px-5 py-4 text-text-secondary text-[13px] truncate max-w-[200px]">{m.notes || '—'}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => deleteMetric(m.id)}
                        className="p-2 rounded-lg text-text-secondary/20 hover:text-danger hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
