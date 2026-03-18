import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Dumbbell, Activity, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nutrition', icon: UtensilsCrossed, label: 'Nutrition', sub: [
    { to: '/nutrition/foods', label: 'Food Library' },
    { to: '/nutrition/meals', label: 'Saved Meals' },
  ]},
  { to: '/workouts', icon: Dumbbell, label: 'Workouts', sub: [
    { to: '/workouts/exercises', label: 'Exercise Library' },
    { to: '/workouts/templates', label: 'Saved Workouts' },
  ]},
  { to: '/body', icon: Activity, label: 'Body' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r border-border sticky top-0 h-screen z-30 transition-all duration-200 ease-out shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            F
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight text-foreground">FitOS</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isSection = item.to !== '/' && location.pathname.startsWith(item.to)
            return (
              <div key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/' || !!item.sub}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
                {/* Sub-navigation */}
                {!collapsed && item.sub && isSection && item.sub.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 pl-10 pr-3 py-2 rounded-lg text-[13px] transition-colors ${
                        isActive
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      }`
                    }
                  >
                    <ChevronRight className="w-3 h-3" />
                    <span>{sub.label}</span>
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        {/* Collapse toggle only */}
        <div className="h-12 flex items-center justify-center border-t border-border shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border h-16 flex items-center justify-around">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
