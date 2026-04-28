import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { Users, Building2, IndianRupee, Target, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/hooks/useApi'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

/** Format rupees compactly */
function formatINR(val: number) {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`
  return `₹${val.toLocaleString('en-IN')}`
}

function SkeletonChart() {
  return <div className="h-72 bg-slate-100 rounded-lg animate-pulse" />
}

export default function CrmAnalytics() {
  // Dashboard-level KPIs
  const [kpis, setKpis] = useState<any>(null)
  // Lead analytics
  const [leadData, setLeadData] = useState<any>(null)
  // Property analytics
  const [propData, setPropData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dash, leads, props] = await Promise.all([
        api.getDashboardStats(),
        api.getLeadAnalytics(),
        api.getPropertyStats()
      ])
      setKpis(dash)
      setLeadData(leads)
      setPropData(props)
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // --- Derived data from API ---
  const conversionRate = kpis
    ? ((kpis.leads.byStatus.find((s: any) => s.status === 'closed_won')?.count ?? 0) / Math.max(kpis.leads.total, 1) * 100).toFixed(1)
    : '0'

  const funnelData = leadData?.funnel?.map((f: any) => ({
    stage: f.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    count: Number(f.count)
  })) ?? []

  const sourceChartData = leadData?.sourcePerformance?.map((s: any) => ({
    name: s.source.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    total: Number(s.total),
    converted: Number(s.converted)
  })) ?? []

  const leadTrendData = leadData?.leadTrend?.map((t: any) => ({
    month: t.month,
    leads: Number(t.count)
  })) ?? []

  const propTypeData = kpis?.properties?.byType?.map((t: any) => ({
    name: t.property_type.replace(/\b\w/g, (c: string) => c.toUpperCase()),
    value: Number(t.count)
  })) ?? []

  const priceDistData = propData?.priceDistribution?.map((p: any) => ({
    range: p.range_label,
    count: Number(p.count)
  })) ?? []

  const cityData = propData?.topCities?.map((c: any) => ({
    city: c.city,
    count: Number(c.count)
  })) ?? []

  const kpiCards = kpis ? [
    {
      title: 'Total Portfolio Value',
      value: formatINR(kpis.properties.totalValue),
      sub: `Avg ${formatINR(kpis.properties.avgPrice)}`,
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Active Listings',
      value: kpis.properties.active,
      sub: `${kpis.properties.total} total`,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Leads',
      value: kpis.leads.total,
      sub: `+${kpis.leads.newThisMonth} this month`,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      sub: 'Closed Won / Total',
      icon: Target,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <Button variant="outline" size="sm" className="gap-1" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button size="sm" variant="outline" className="ml-auto border-red-300 text-red-700 hover:bg-red-100" onClick={fetchAll}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                <div className="h-7 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            </CardContent></Card>
          ))
          : kpiCards.map(card => (
            <Card key={card.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    <p className="text-xs text-emerald-600 mt-1">{card.sub}</p>
                  </div>
                  <div className={`h-10 w-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="properties">Property Analytics</TabsTrigger>
        </TabsList>

        {/* ── LEAD ANALYTICS ── */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Monthly Lead Trend */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4" />Monthly Lead Trend</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : leadTrendData.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No trend data available.</p>
                  : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={leadTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="New Leads" />
                      </LineChart>
                    </ResponsiveContainer>
                  )
                }
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Lead Conversion Funnel</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : funnelData.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No funnel data.</p>
                  : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={funnelData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                        <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Leads" />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }
              </CardContent>
            </Card>

            {/* Source Performance */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Leads by Source</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : sourceChartData.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No source data.</p>
                  : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={sourceChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                        <Bar dataKey="converted" fill="#10b981" radius={[4, 4, 0, 0]} name="Converted" />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }
              </CardContent>
            </Card>

            {/* Pipeline Status */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Pipeline by Status</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : (kpis?.leads?.byStatus ?? []).length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No status data.</p>
                  : (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={kpis.leads.byStatus.map((s: any) => ({ name: s.status.replace(/_/g, ' '), value: Number(s.count) }))}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={90}
                            paddingAngle={4} dataKey="value"
                          >
                            {kpis.leads.byStatus.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {kpis.leads.byStatus.map((s: any, i: number) => (
                          <div key={s.status} className="flex items-center gap-1 text-xs">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-slate-600 capitalize">{s.status.replace(/_/g, ' ')} ({s.count})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                }
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PROPERTY ANALYTICS ── */}
        <TabsContent value="properties" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Property Types */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Properties by Type</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : propTypeData.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No data.</p>
                  : (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={propTypeData} cx="50%" cy="50%" outerRadius={95} dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {propTypeData.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {propTypeData.map((t: any, i: number) => (
                          <div key={t.name} className="flex items-center gap-1 text-xs">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-slate-600">{t.name} ({t.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                }
              </CardContent>
            </Card>

            {/* Price Distribution (INR) */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Price Distribution (₹)</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : priceDistData.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No price data.</p>
                  : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={priceDistData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Properties" />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Top Cities by Listings</CardTitle></CardHeader>
              <CardContent>
                {loading ? <SkeletonChart /> : cityData.length === 0
                  ? <p className="text-slate-400 text-sm text-center py-16">No city data.</p>
                  : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={cityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="city" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Listings" />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
