import { Link, useLocation, Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard, Building2, Users, BarChart3, Settings, LogOut,
  Menu, X, ChevronRight, Home
} from 'lucide-react'
import { useState } from 'react'

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const menuItems = [
    { path: '/crm', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/crm/leads', label: 'Leads', icon: Users },
    { path: '/crm/listings', label: 'Listings', icon: Building2 },
    { path: '/crm/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/crm/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/crm') return location.pathname === '/crm'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-slate-800">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.webp" alt="Vidhaata Ventures" className="h-10 w-auto" />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-3"
          >
            <Home className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">Back to Site</span>}
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-slate-900 text-white flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
              <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.webp" alt="Vidhaata Ventures" className="h-10 w-auto" />
            </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={logout} className="flex items-center gap-3 text-red-400 w-full">
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <Link to="/crm" className="hover:text-emerald-600">CRM</Link>
              {location.pathname !== '/crm' && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-slate-900 font-medium capitalize">
                    {location.pathname.split('/').pop()?.replace('-', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
