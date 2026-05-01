import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Plus,
  Phone,
  Mail,
  Trash2,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  CircleDot,
  BadgeCheck,
  Handshake,
  Trophy,
  X,
  Upload,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/hooks/useApi'

interface LeadActivity {
  id: number
  activity_type: string
  description: string
  created_at: string
  follow_up_date?: string | null
  activity_property_title?: string | null
  activity_property_id?: number | null
  created_by_name?: string | null
}

interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  message: string | null
  source: string
  status: string
  property_title: string | null
  property_interest_id?: number | null
  assigned_agent_name: string | null
  assigned_agent_id?: number | null
  notes: string | null
  created_at: string
  activities: LeadActivity[]
}

interface PropertyOption {
  id: number
  title: string
}


const LEAD_STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'visit', 'negotiation', 'closed_won', 'closed_lost']
const LEAD_SOURCE_FILTER_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'walk_in', label: 'Walk-in' },
] as const

function formatLeadDate(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function cleanActivityDescription(description: string): string {
  // Remove Property Interest ID line from description
  return description.replace(/\s*Property Interest ID:\s*\d+\s*/g, '').trim()
}

export default function CrmLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSavingLead, setIsSavingLead] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null)
  const [followUpForm, setFollowUpForm] = useState({
    status: 'new',
    notes: '',
    followUpDate: '',
    propertyInterestId: 'none',
  })
  const [editLeadOpen, setEditLeadOpen] = useState(false)
  const [editLeadForm, setEditLeadForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    source: 'website',
    propertyInterestId: 'none',
    message: '',
    notes: '',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const loadLeads = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const params: Record<string, string> = {}
      if (filterParam) {
        params.filter = filterParam
      }
      const response = await api.listLeads(params)
      setLeads(Array.isArray(response?.leads) ? response.leads.map((lead: Lead) => ({
        ...lead,
        activities: Array.isArray(lead.activities) ? lead.activities : [],
      })) : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load leads')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const loadProperties = async () => {
    try {
      const response = await api.adminListProperties()
      setProperties(Array.isArray(response) ? response.map((property: { id: number; title: string }) => ({
        id: property.id,
        title: property.title,
      })) : [])
    } catch {
      setProperties([])
    }
  }

  useEffect(() => {
    void Promise.all([loadLeads(), loadProperties()])
  }, [filterParam])

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase()
      const matchesSearch = !search ||
        lead.first_name.toLowerCase().includes(q) ||
        lead.last_name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.property_title || '').toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter

      return matchesSearch && matchesStatus && matchesSource
    })
  }, [leads, search, statusFilter, sourceFilter])

  const pipelineCards = useMemo(() => {
    const count = (status: string) => leads.filter((lead) => lead.status === status).length
    return [
      { key: 'all', label: 'All Leads', count: leads.length, icon: Filter, tone: 'bg-slate-900 text-white border-slate-900' },
      { key: 'new', label: 'New', count: count('new'), icon: CircleDot, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
      { key: 'qualified', label: 'Qualified', count: count('qualified'), icon: BadgeCheck, tone: 'bg-purple-50 text-purple-700 border-purple-100' },
      { key: 'proposal', label: 'Proposal', count: count('proposal'), icon: Handshake, tone: 'bg-orange-50 text-orange-700 border-orange-100' },
      { key: 'closed_won', label: 'Won', count: count('closed_won'), icon: Trophy, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      { key: 'closed_lost', label: 'Lost', count: count('closed_lost'), icon: X, tone: 'bg-red-50 text-red-700 border-red-100' },
    ]
  }, [leads])

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-purple-100 text-purple-700',
      proposal: 'bg-orange-100 text-orange-700',
      visit: 'bg-teal-100 text-teal-700',
      negotiation: 'bg-pink-100 text-pink-700',
      closed_won: 'bg-emerald-100 text-emerald-700',
      closed_lost: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  const openLeadDetails = async (lead: Lead) => {
    try {
      const details = await api.getLead(lead.id)
      const hydratedLead = {
        ...details,
        activities: Array.isArray(details.activities) ? details.activities : [],
      }
      setSelectedLead(hydratedLead)
      setFollowUpForm({
        status: hydratedLead.status,
        notes: '',
        followUpDate: '',
        propertyInterestId: hydratedLead.property_interest_id ? String(hydratedLead.property_interest_id) : 'none',
      })
      setDetailOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load lead details')
    }
  }

  const handleDelete = async (leadId: number) => {
    try {
      await api.deleteLead(leadId)
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId))
      if (selectedLead?.id === leadId) {
        setSelectedLead(null)
        setDetailOpen(false)
      }
      toast.success('Lead deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lead')
    }
  }

  const handleFollowUpSave = async () => {
    if (!selectedLead) return

    if (!followUpForm.followUpDate) {
      toast.error('Follow-up date is required.')
      return
    }

    if (followUpForm.status === 'visit' && followUpForm.propertyInterestId === 'none') {
      toast.error('Select a property before marking this lead as visit.')
      return
    }

    setIsUpdatingStatus(selectedLead.id)
    try {
      const nextPropertyId = followUpForm.propertyInterestId === 'none' ? null : Number(followUpForm.propertyInterestId)

      await api.updateLead(selectedLead.id, {
        firstName: selectedLead.first_name,
        lastName: selectedLead.last_name,
        email: selectedLead.email || '',
        phone: selectedLead.phone || '',
        message: selectedLead.message || '',
        source: selectedLead.source,
        status: followUpForm.status,
        propertyInterestId: nextPropertyId,
        assignedAgentId: selectedLead.assigned_agent_id ?? null,
        notes: selectedLead.notes || '',
      })

      await api.addLeadActivity(selectedLead.id, {
        activityType: followUpForm.status === 'visit' ? 'meeting' : 'status_change',
        description: followUpForm.notes,
        followUpDate: followUpForm.followUpDate,
        propertyInterestId: nextPropertyId,
      })

      await loadLeads(true)
      await openLeadDetails({ ...selectedLead })
      toast.success('Lead follow-up updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead follow-up')
    } finally {
      setIsUpdatingStatus(null)
    }
  }


  const openEditDialog = () => {
    if (!selectedLead) return
    setEditLeadForm({
      firstName: selectedLead.first_name || '',
      lastName: selectedLead.last_name || '',
      phone: selectedLead.phone || '',
      email: selectedLead.email || '',
      source: selectedLead.source || 'website',
      propertyInterestId: selectedLead.property_interest_id ? String(selectedLead.property_interest_id) : 'none',
      message: selectedLead.message || '',
      notes: selectedLead.notes || '',
    })
    setEditLeadOpen(true)
  }

  const handleEditLeadSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return

    setIsSavingLead(true)
    try {
      await api.updateLead(selectedLead.id, {
        firstName: editLeadForm.firstName,
        lastName: editLeadForm.lastName,
        phone: editLeadForm.phone,
        email: editLeadForm.email,
        source: editLeadForm.source,
        status: selectedLead.status,
        propertyInterestId: editLeadForm.propertyInterestId === 'none' ? null : Number(editLeadForm.propertyInterestId),
        assignedAgentId: selectedLead.assigned_agent_id,
        message: editLeadForm.message,
        notes: editLeadForm.notes,
      })
      
      toast.success('Lead updated successfully')
      setEditLeadOpen(false)
      await loadLeads(true)
      
      const updatedLead = await api.getLead(selectedLead.id)
      setSelectedLead({
        ...updatedLead,
        activities: Array.isArray(updatedLead.activities) ? updatedLead.activities : []
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead')
    } finally {
      setIsSavingLead(false)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = "First Name,Last Name,Email,Phone,Source,Message,Notes\nJohn,Doe,john@example.com,9876543210,website,Looking for a 2BHK,Urgent requirement"
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "leads_import_template.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) {
      toast.error('Please select a CSV file to import')
      return
    }
    
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      
      const response = await api.importLeads(formData)
      toast.success(`Import completed: ${response.success_count} added, ${response.fail_count} failed`)
      
      setImportOpen(false)
      setImportFile(null)
      await loadLeads(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import leads')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track enquiries, move prospects through the pipeline, and keep the team focused on the leads that matter most.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={() => void loadLeads(true)} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Link to="/crm/leads/new">
              <Plus className="h-4 w-4" /> Add Lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {pipelineCards.map((card) => (
          <button
            key={card.key}
            onClick={() => setStatusFilter(card.key)}
            className={`rounded-2xl border p-4 text-left transition ${statusFilter === card.key ? 'ring-2 ring-emerald-500 border-emerald-200 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} `}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.count}</p>
              </div>
              <div className={`rounded-xl border px-3 py-2 ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {filterParam && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-100">
          <Filter className="h-4 w-4" />
          <span>
            Showing filtered leads: <strong>{filterParam === 'today_visits' ? "Today's Visits" : filterParam === 'month_leads' ? "New Leads (This Month)" : filterParam}</strong>
          </span>
          <Button variant="outline" size="sm" className="ml-auto h-8 border-emerald-200 bg-white hover:bg-emerald-100 hover:text-emerald-900" onClick={() => setSearchParams({})}>
            Clear Filter
          </Button>
        </div>
      )}

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, email, phone, or property..."
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LEAD_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {LEAD_SOURCE_FILTER_OPTIONS.map((source) => (
                  <SelectItem key={source.value} value={source.value} className="capitalize">
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b bg-slate-50/70 px-6 py-4">
          <CardTitle className="text-base font-semibold text-slate-900">
            {filtered.length} active lead{filtered.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-slate-500">Loading leads...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No leads match the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Lead</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Contact</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Property Interest</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Pipeline Status</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Source</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Created</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b align-top transition hover:bg-slate-50/80">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                            {lead.first_name?.[0] || 'L'}{lead.last_name?.[0] || ''}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{lead.first_name} {lead.last_name}</p>
                            <p className="text-xs text-slate-500">{lead.notes || 'No notes yet'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" /> {lead.email}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" /> {lead.phone || 'Not provided'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{lead.property_title || 'General enquiry'}</td>
                      <td className="p-4">
                        <Badge className={getStatusBadge(lead.status)}>{lead.status.replace('_', ' ')}</Badge>
                        <button
                          type="button"
                          onClick={() => void openLeadDetails(lead)}
                          className="mt-2 block text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Update follow-up
                        </button>
                      </td>
                      <td className="p-4 text-sm capitalize text-slate-600">{lead.source.replace('_', ' ')}</td>
                      <td className="p-4 text-sm text-slate-500">{formatLeadDate(lead.created_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void openLeadDetails(lead)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => void handleDelete(lead.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Edit Lead Dialog */}
      <Dialog open={editLeadOpen} onOpenChange={setEditLeadOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] p-0 overflow-hidden bg-slate-50">
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
              <DialogTitle className="text-xl font-bold text-slate-900">Edit Lead</DialogTitle>
              <p className="mt-1 text-sm text-slate-500">Update contact information and basic requirements.</p>
            </div>
            <form onSubmit={(e) => void handleEditLeadSave(e)} className="flex flex-col gap-6 p-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name <span className="text-red-500">*</span></Label>
                  <Input required value={editLeadForm.firstName} onChange={(e) => setEditLeadForm({...editLeadForm, firstName: e.target.value})} className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={editLeadForm.lastName} onChange={(e) => setEditLeadForm({...editLeadForm, lastName: e.target.value})} className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label>Phone <span className="text-red-500">*</span></Label>
                  <Input required type="tel" value={editLeadForm.phone} onChange={(e) => setEditLeadForm({...editLeadForm, phone: e.target.value})} className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={editLeadForm.email} onChange={(e) => setEditLeadForm({...editLeadForm, email: e.target.value})} className="bg-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={editLeadForm.source} onValueChange={(value) => setEditLeadForm({...editLeadForm, source: value})}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCE_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Linked Property</Label>
                  <Select value={editLeadForm.propertyInterestId} onValueChange={(value) => setEditLeadForm({...editLeadForm, propertyInterestId: value})}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General enquiry</SelectItem>
                      {properties.map((prop) => (
                        <SelectItem key={prop.id} value={String(prop.id)}>{prop.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Client Brief / Message</Label>
                <Textarea rows={4} value={editLeadForm.message} onChange={(e) => setEditLeadForm({...editLeadForm, message: e.target.value})} className="bg-white" />
              </div>
              
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea rows={3} value={editLeadForm.notes} onChange={(e) => setEditLeadForm({...editLeadForm, notes: e.target.value})} className="bg-white" />
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditLeadOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSavingLead}>
                  {isSavingLead ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {selectedLead.first_name?.[0] || 'L'}{selectedLead.last_name?.[0] || ''}
                  </div>
                  <div className="space-y-1">
                    <p>{selectedLead.first_name} {selectedLead.last_name}</p>
                    <Badge className={getStatusBadge(selectedLead.status)}>{selectedLead.status.replace('_', ' ')}</Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-200">
                    <CardContent className="space-y-3 p-4 text-sm">
                      <div>
                        <Label className="text-xs text-slate-500">Email</Label>
                        <p className="mt-1 flex items-center gap-1.5 text-slate-700"><Mail className="h-3.5 w-3.5" /> {selectedLead.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Phone</Label>
                        <p className="mt-1 flex items-center gap-1.5 text-slate-700"><Phone className="h-3.5 w-3.5" /> {selectedLead.phone || 'Not provided'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="space-y-3 p-4 text-sm">
                      <div>
                        <Label className="text-xs text-slate-500">Source</Label>
                        <p className="mt-1 capitalize text-slate-700">{selectedLead.source.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Property Interest</Label>
                        <p className="mt-1 text-slate-700">{selectedLead.property_title || 'General enquiry'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Message</Label>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {selectedLead.message || 'No message provided.'}
                  </div>
                </div>

                <Card className="border-slate-200 bg-slate-50/70">
                  <CardContent className="space-y-4 p-4">
                    <div>
                      <Label className="text-xs text-slate-500">Update Status</Label>
                      <Select value={followUpForm.status} onValueChange={(value) => setFollowUpForm({ ...followUpForm, status: value })}>
                        <SelectTrigger className="mt-1 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-500">Follow-up Date</Label>
                      <Input
                        type="datetime-local"
                        className="mt-1 bg-white"
                        value={followUpForm.followUpDate}
                        onChange={(event) => setFollowUpForm({ ...followUpForm, followUpDate: event.target.value })}
                      />
                    </div>

                    {followUpForm.status === 'visit' ? (
                      <div>
                        <Label className="text-xs text-slate-500">Visit Property</Label>
                        <Select
                          value={followUpForm.propertyInterestId}
                          onValueChange={(value) => setFollowUpForm({ ...followUpForm, propertyInterestId: value })}
                        >
                          <SelectTrigger className="mt-1 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select property</SelectItem>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={String(property.id)}>
                                {property.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div>
                      <Label className="text-xs text-slate-500">Follow-up Notes</Label>
                      <Textarea
                        rows={4}
                        className="mt-1 bg-white"
                        value={followUpForm.notes}
                        onChange={(event) => setFollowUpForm({ ...followUpForm, notes: event.target.value })}
                        placeholder="Call summary, objections, next step, visit agenda, or update context..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleFollowUpSave()} disabled={isUpdatingStatus === selectedLead.id}>
                        {isUpdatingStatus === selectedLead.id ? 'Saving...' : 'Save Follow-up'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {selectedLead.notes ? (
                  <div>
                    <Label className="text-xs text-slate-500">Internal Notes</Label>
                    <div className="mt-1 rounded-xl border border-yellow-100 bg-yellow-50 p-4 text-sm leading-6 text-slate-700">
                      {selectedLead.notes}
                    </div>
                  </div>
                ) : null}

                {selectedLead.activities.length > 0 ? (
                  <div>
                    <Label className="text-xs text-slate-500">Activity History</Label>
                    <div className="mt-2 space-y-3">
                      {selectedLead.activities.map((activity) => (
                        <div key={activity.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <Badge variant="outline" className="capitalize">{activity.activity_type}</Badge>
                            <span className="text-xs text-slate-500">{formatLeadDate(activity.created_at)}</span>
                          </div>
                          <p className="text-sm text-slate-700">{cleanActivityDescription(activity.description)}</p>
                          {(activity.follow_up_date || activity.activity_property_title) ? (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              {activity.follow_up_date ? <span className="text-xs text-slate-500">Follow-up: {formatLeadDate(activity.follow_up_date)}</span> : null}
                              {activity.activity_property_title ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-600 font-medium">{activity.activity_property_title}</span>
                                  {activity.activity_property_id && (
                                    <Button
                                      asChild
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                    >
                                      <a href={`/properties/${activity.activity_property_id}`}>
                                        View Property
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={!selectedLead.phone}>
                    <a href={selectedLead.phone ? `tel:${selectedLead.phone}` : undefined}>
                      <Phone className="h-4 w-4" /> Call Lead
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="gap-2" disabled={!selectedLead.email}>
                    <a href={selectedLead.email ? `mailto:${selectedLead.email}` : undefined}>
                      <Mail className="h-4 w-4" /> Send Email
                    </a>
                  </Button>
                  <Button variant="outline" className="ml-auto gap-2 text-slate-700 hover:text-emerald-600" onClick={openEditDialog}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600" onClick={() => void handleDelete(selectedLead.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Leads</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleImport} className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 mb-4">Upload a CSV file containing your leads.</p>
                <Input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="max-w-xs mx-auto cursor-pointer"
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg flex items-start justify-between border border-slate-100">
                <div className="text-sm">
                  <p className="font-medium text-slate-900">Need a template?</p>
                  <p className="text-slate-500 mt-1">Download our sample CSV to ensure your columns match exactly.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2 whitespace-nowrap ml-4">
                  <Download className="h-4 w-4" /> Download CSV
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!importFile || isImporting} className="bg-emerald-600 hover:bg-emerald-700">
                {isImporting ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
