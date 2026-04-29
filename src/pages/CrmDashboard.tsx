import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2, Users, TrendingUp, Eye, ArrowUpRight,
  Calendar, Mail, MapPin, RefreshCw, AlertCircle, CalendarCheck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { api } from '@/hooks/useApi'

interface DashboardStats {
  properties: {
    total: number
    active: number
    sold: number
    totalValue: number
    avgPrice: number
    byType: { property_type: string; count: number }[]
    byStatus: { status: string; count: number }[]
  }
  leads: {
    total: number
    newThisMonth: number
    byStatus: { status: string; count: number }[]
    trend: { month: string; count: number }[]
  }
  recent: {
    properties: {
      id: number
      title: string
      price: number
      status: string
      city?: string
      created_at: string
    }[]
    leads: {
      id: number
      first_name: string
      last_name: string
      email: string
      status: string
      created_at: string
    }[]
  }
  todayVisits: number
}

const emptyStats: DashboardStats = {
  properties: { total: 0, active: 0, sold: 0, totalValue: 0, avgPrice: 0, byType: [], byStatus: [] },
  leads: { total: 0, newThisMonth: 0, byStatus: [], trend: [] },
  recent: { properties: [], leads: [] },
  todayVisits: 0
}

/** Format number as Indian Rupees */
function formatINR(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)} L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`
  return `₹${value.toLocaleString('en-IN')}`
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="space-y-2">
        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
    </div>
  )
}

export default function CrmDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await api.getDashboardStats()
      setStats(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  // Clickable stat cards — each with unique gradient & accent
  const statCards = [
    {
      title: 'Total Properties',
      value: stats.properties.total.toLocaleString('en-IN'),
      icon: Building2,
      gradient: 'from-blue-500 to-blue-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      hover: 'hover:shadow-blue-200',
      href: '/crm/listings'
    },
    {
      title: 'Active Listings',
      value: stats.properties.active.toLocaleString('en-IN'),
      icon: Eye,
      gradient: 'from-emerald-500 to-emerald-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      hover: 'hover:shadow-emerald-200',
      href: '/crm/listings'
    },
    {
      title: 'Total Leads',
      value: stats.leads.total.toLocaleString('en-IN'),
      icon: Users,
      gradient: 'from-violet-500 to-purple-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      hover: 'hover:shadow-purple-200',
      href: '/crm/leads'
    },
    {
      title: 'Properties Sold',
      value: stats.properties.sold.toLocaleString('en-IN'),
      icon: TrendingUp,
      gradient: 'from-orange-400 to-orange-600',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      hover: 'hover:shadow-orange-200',
      href: '/crm/listings?status=sold'
    },
    {
      title: "Today's Visits",
      value: stats.todayVisits.toLocaleString('en-IN'),
      icon: CalendarCheck,
      gradient: 'from-teal-500 to-cyan-600',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      hover: 'hover:shadow-teal-200',
      href: '/crm/leads?filter=today_visits'
    },
    {
      title: 'New Leads (Month)',
      value: stats.leads.newThisMonth.toLocaleString('en-IN'),
      icon: Calendar,
      gradient: 'from-sky-500 to-indigo-600',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      hover: 'hover:shadow-sky-200',
      href: '/crm/leads?filter=month_leads'
    },
  ]

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-purple-100 text-purple-700',
      proposal: 'bg-orange-100 text-orange-700',
      visit: 'bg-indigo-100 text-indigo-700',
      negotiation: 'bg-pink-100 text-pink-700',
      closed_won: 'bg-emerald-100 text-emerald-700',
      closed_lost: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  const getPropertyStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      for_sale: 'bg-emerald-100 text-emerald-700',
      for_rent: 'bg-blue-100 text-blue-700',
      sold: 'bg-slate-100 text-slate-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Link to="/crm/listings">
            <Button variant="outline" size="sm" className="gap-1">
              <Building2 className="h-4 w-4" /> Manage Listings
            </Button>
          </Link>
          <Link to="/crm/leads">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
              <Users className="h-4 w-4" /> View Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => fetchStats(true)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stat Cards — clickable, colored gradient cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(card => (
            <div
              key={card.title}
              onClick={() => navigate(card.href)}
              className={`
                relative cursor-pointer rounded-2xl bg-gradient-to-br ${card.gradient}
                p-5 flex flex-col justify-between min-h-[130px]
                shadow-md ${card.hover} hover:shadow-xl
                hover:-translate-y-1 active:scale-95
                transition-all duration-200 overflow-hidden
                group
              `}
            >
              {/* Decorative circle */}
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 group-hover:bg-white/15 transition-all duration-200" />
              <div className="absolute -bottom-6 -left-4 h-16 w-16 rounded-full bg-white/10" />

              {/* Top row: title + icon */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-white/80 leading-tight">{card.title}</p>
                <div className={`flex-shrink-0 h-9 w-9 ${card.iconBg} rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>

              {/* Bottom: big value */}
              <p className="text-3xl font-extrabold text-white tracking-tight mt-3">{card.value}</p>
            </div>
          ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="properties">
            <TabsList className="mb-4">
              <TabsTrigger value="properties">Recent Properties</TabsTrigger>
              <TabsTrigger value="leads">Recent Leads</TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recently Added Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                      : stats.recent.properties.length === 0
                      ? <p className="text-sm text-slate-400 py-4 text-center">No properties found.</p>
                      : stats.recent.properties.map(prop => (
                        <div key={prop.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{prop.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                              {prop.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{prop.city}
                                </span>
                              )}
                              <span className="font-semibold text-emerald-600">
                                {formatINR(Number(prop.price))}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{formatDate(prop.created_at)}
                              </span>
                            </div>
                          </div>
                          <Badge className={getPropertyStatusBadge(prop.status)}>
                            {prop.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                  <Link to="/crm/listings" className="mt-4 inline-flex items-center text-sm text-emerald-600 hover:underline">
                    View all properties <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                      : stats.recent.leads.length === 0
                      ? <p className="text-sm text-slate-400 py-4 text-center">No leads found.</p>
                      : stats.recent.leads.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{lead.first_name} {lead.last_name}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />{lead.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{formatDate(lead.created_at)}
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(lead.status)}>
                            {lead.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                  <Link to="/crm/leads" className="mt-4 inline-flex items-center text-sm text-emerald-600 hover:underline">
                    View all leads <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                    </div>
                  ))
                  : stats.leads.byStatus.length === 0
                  ? <p className="text-sm text-slate-400 text-center py-2">No data</p>
                  : stats.leads.byStatus.map(item => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusBadge(item.status).split(' ')[0]}`} />
                        <span className="text-sm capitalize text-slate-600">{item.status.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    </div>
                  ))
                }
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">New this month</span>
                  <span className="font-semibold text-emerald-600">
                    {loading ? '—' : stats.leads.newThisMonth}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))
                : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Value</span>
                      <span className="font-semibold text-slate-900">{formatINR(stats.properties.totalValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Avg Price</span>
                      <span className="font-semibold text-slate-900">{formatINR(stats.properties.avgPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Active / Total</span>
                      <span className="font-semibold text-slate-900">
                        {stats.properties.active} / {stats.properties.total}
                      </span>
                    </div>
                    {stats.properties.byStatus.map(s => (
                      <div key={s.status} className="flex justify-between text-sm">
                        <span className="text-slate-500 capitalize">{s.status.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-slate-700">{s.count}</span>
                      </div>
                    ))}
                  </>
                )
              }
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/crm/listings">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4" /> Add New Property
                </Button>
              </Link>
              <Link to="/crm/leads">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" /> Manage Leads
                </Button>
              </Link>
              <Link to="/crm/analytics">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" /> View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
