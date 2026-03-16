import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Utensils, Dumbbell, Activity, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nutrition', icon: Utensils, label: 'Nutrition', sub: [{ to: '/nutrition/foods', label: 'Food Library' }] },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts', sub: [{ to: '/workouts/exercises', label: 'Exercises' }] },
  { to: '/body', icon: Activity, label: 'Body' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function SidebarLink({ to, icon: Icon, label, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
          isActive
            ? 'bg-accent/10 text-accent shadow-sm'
            : 'text-text-secondary hover:text-text hover:bg-gray-50'
        }`
      }
    >
      {Icon && <Icon size={20} strokeWidth={1.7} className="shrink-0" />}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

function SubLink({ to, label, collapsed }) {
  if (collapsed) return null
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 pl-11 pr-3 py-2 text-[13px] rounded-lg transition-colors duration-150 ${
          isActive ? 'text-accent font-medium' : 'text-text-secondary hover:text-text'
        }`
      }
    >
      <ChevronRight size={12} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Layout() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 72 : 240

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col border-r border-border bg-surface fixed h-screen z-30 transition-all duration-200 shadow-[1px_0_0_rgba(0,0,0,0.02)]"
        style={{ width: sidebarWidth }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-[16px] shrink-0 shadow-sm">
            F
          </div>
          {!collapsed && <span className="font-bold text-[17px] text-text tracking-tight">FitOS</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isSection = location.pathname.startsWith(item.to) && item.to !== '/'
            return (
              <div key={item.to}>
                <SidebarLink to={item.to} icon={item.icon} label={item.label} end={item.to === '/' || !!item.sub} collapsed={collapsed} />
                {item.sub && isSection && item.sub.map(s => (
                  <SubLink key={s.to} to={s.to} label={s.label} collapsed={collapsed} />
                ))}
              </div>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-text-secondary hover:text-danger hover:bg-red-50 transition-all duration-150 w-full font-medium"
          >
            <LogOut size={18} strokeWidth={1.7} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-1.5 rounded-lg text-text-secondary/40 hover:text-text-secondary hover:bg-gray-50 transition-all duration-150"
          >
            <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-8 transition-all duration-200 hidden-sidebar-margin" style={{ '--sidebar-w': `${sidebarWidth}px` }}>
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 lg:px-10 py-8 page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around py-2.5 px-2 z-40 shadow-[0_-1px_4px_rgba(0,0,0,0.04)]">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors duration-150 ${
                isActive ? 'text-accent' : 'text-text-secondary'
              }`
            }
          >
            <item.icon size={22} strokeWidth={1.7} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
