import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Layers, BookOpen, Sparkles, BarChart2, Users, Settings, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/review', icon: BookOpen, label: 'Review' },
  { to: '/decks', icon: Layers, label: 'Decks' },
  { to: '/generate', icon: Sparkles, label: 'Generate' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/statistics', icon: BarChart2, label: 'Statistics' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
        isActive
          ? 'bg-[var(--color-border-subtle)] text-[var(--color-text-primary)] font-medium'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]'
      )}
    >
      <Icon size={15} strokeWidth={1.75} />
      {label}
    </NavLink>
  )
}

export function AppLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-4 py-5 border-b border-[var(--color-border)]">
          <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">Flashcards</span>
        </div>

        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="px-2 py-4 border-t border-[var(--color-border)] flex flex-col gap-0.5">
          <NavItem to="/settings" icon={Settings} label="Settings" />
          <NavItem to="/profile" icon={User} label="Profile" />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors w-full"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Flashcards</span>
        <button onClick={() => setMobileOpen(v => !v)} className="text-[var(--color-text-secondary)]">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-56 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col pt-12">
            <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
              {navItems.map(item => <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />)}
            </nav>
            <div className="px-2 py-4 border-t border-[var(--color-border)] flex flex-col gap-0.5">
              <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setMobileOpen(false)} />
              <NavItem to="/profile" icon={User} label="Profile" onClick={() => setMobileOpen(false)} />
              <button onClick={handleSignOut} className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors w-full">
                <LogOut size={15} strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-12">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
