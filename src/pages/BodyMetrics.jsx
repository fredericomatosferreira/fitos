import { useState, useMemo } from 'react'
import { useBodyMetrics } from '../hooks/useBodyMetrics'
import { formatNumber } from '../lib/utils'
import MetricCard from '../components/MetricCard'
import Modal from '../components/Modal'
import { Plus, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

const tooltipStyle = {
  background: '#fff',
  border: '1px solid hsl(214 20% 90%)',
  borderRadius: 8,
  fontSize: 12,
  padding: '6px 10px',
}

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
    const weightChange = (first.weight_kg && last.weight_kg) ? (last.weight_kg - first.weight_kg).toFixed(1) : null
    const bfChange = (first.body_fat_pct && last.body_fat_pct) ? (last.body_fat_pct - first.body_fat_pct).toFixed(1) : null
    const muscleChange = (first.muscle_mass_kg && last.muscle_mass_kg) ? (last.muscle_mass_kg - first.muscle_mass_kg).toFixed(1) : null
    const days = Math.round((new Date() - new Date(first.date)) / 86400000)
    return { current: last, weightChange, bfChange, muscleChange, count: metrics.length, days }
  }, [metrics])

  const weightData = metrics.filter(m => m.weight_kg != null).map(m => ({ date: format(new Date(m.date), 'MMM d'), weight: Number(m.weight_kg) }))
  const bfData = metrics.filter(m => m.body_fat_pct != null).map(m => ({ date: format(new Date(m.date), 'MMM d'), bf: Number(m.body_fat_pct) }))

  const inputCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Body Metrics</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
        >
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Current Weight"
            value={stats.current.weight_kg ? formatNumber(stats.current.weight_kg) : '—'}
            unit="kg"
            change={stats.weightChange ? `${Number(stats.weightChange) > 0 ? '+' : ''}${stats.weightChange} kg` : undefined}
            positiveIsGood={false}
          />
          <MetricCard
            label="Body Fat"
            value={stats.current.body_fat_pct ? formatNumber(stats.current.body_fat_pct) : '—'}
            unit="%"
            change={stats.bfChange ? `${Number(stats.bfChange) > 0 ? '+' : ''}${stats.bfChange}%` : undefined}
            positiveIsGood={false}
          />
          <MetricCard
            label="Muscle Mass"
            value={stats.current.muscle_mass_kg ? formatNumber(stats.current.muscle_mass_kg) : '—'}
            unit="kg"
            change={stats.muscleChange ? `${Number(stats.muscleChange) > 0 ? '+' : ''}${stats.muscleChange} kg` : undefined}
            positiveIsGood={true}
          />
          <MetricCard
            label="Entries"
            value={stats.count}
            change={`— ${stats.days} days`}
          />
        </div>
      )}

      {/* Weight chart */}
      {weightData.length >= 2 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Weight Over Time</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke="hsl(160,84%,39%)" strokeWidth={2} dot={{ r: 2, fill: 'hsl(160,84%,39%)', strokeWidth: 0 }} activeDot={{ r: 4, fill: 'hsl(160,84%,39%)' }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Body fat chart */}
      {bfData.length >= 2 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Body Fat % Over Time</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="bf" stroke="hsl(239,84%,67%)" strokeWidth={2} dot={{ r: 2, fill: 'hsl(239,84%,67%)', strokeWidth: 0 }} activeDot={{ r: 4, fill: 'hsl(239,84%,67%)' }} name="Body Fat %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History table */}
      {metrics.length === 0 ? (
        <div className="bg-card rounded-lg border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No body metrics logged yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Weight</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Body Fat</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Muscle</th>
                  <th className="text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Notes</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {[...metrics].reverse().slice(0, 10).map((m, i) => (
                  <tr key={m.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{format(new Date(m.date), 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{m.weight_kg ? `${formatNumber(m.weight_kg)} kg` : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{m.body_fat_pct ? `${formatNumber(m.body_fat_pct)}%` : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{m.muscle_mass_kg ? `${formatNumber(m.muscle_mass_kg)} kg` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">{m.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteMetric(m.id)}
                        className="p-1 rounded-md text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log entry modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Log Body Metrics">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">Date</span>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required className={inputCls} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Weight (kg)</span>
              <input type="number" step="any" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Body Fat %</span>
              <input type="number" step="any" value={form.body_fat_pct} onChange={e => set('body_fat_pct', e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Muscle (kg)</span>
              <input type="number" step="any" value={form.muscle_mass_kg} onChange={e => set('muscle_mass_kg', e.target.value)} className={inputCls} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">Notes</span>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${inputCls} h-auto py-2 resize-none`} />
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press">
              Save Entry
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
