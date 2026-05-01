import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, IndianRupee, MapPinned, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/hooks/useApi'

interface PropertyOption {
  id: number
  title: string
}

type LeadFormState = {
  fullName: string
  phone: string
  email: string
  whatsappAvailable: boolean
  source: string
  sourceDetail: string
  leadType: 'buyer' | 'seller' | 'tenant'
  budgetMin: string
  budgetMax: string
  preferredLocations: string
  configurations: string[]
  propertyInterestId: string
  message: string
  notes: string
}

const LEAD_SOURCE_OPTIONS = [
  { value: 'housing', label: 'Housing', storage: 'website' },
  { value: 'website', label: 'Website', storage: 'website' },
  { value: '99acres', label: '99acres', storage: 'website' },
  { value: 'magicbricks', label: 'MagicBricks', storage: 'website' },
  { value: 'personal_referral', label: 'Personal Referral', storage: 'referral' },
  { value: 'facebook', label: 'Facebook', storage: 'social_media' },
  { value: 'instagram', label: 'Instagram', storage: 'social_media' },
  { value: 'walk_in', label: 'Walk-in', storage: 'walk_in' },
] as const

const LEAD_TYPE_OPTIONS = ['buyer', 'seller', 'tenant'] as const
const CONFIGURATION_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Penthouse', 'Plot', 'Commercial']

const defaultLeadForm: LeadFormState = {
  fullName: '',
  phone: '',
  email: '',
  whatsappAvailable: false,
  source: 'website',
  sourceDetail: 'Website',
  leadType: 'buyer',
  budgetMin: '',
  budgetMax: '',
  preferredLocations: '',
  configurations: [],
  propertyInterestId: 'none',
  message: '',
  notes: '',
}

export default function CrmLeadCreate() {
  const navigate = useNavigate()
  const [addLeadForm, setAddLeadForm] = useState<LeadFormState>(defaultLeadForm)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [isSavingLead, setIsSavingLead] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.listProperties()
        setProperties(response.properties || [])
      } catch (error) {
        console.error('Error fetching properties for lead form', error)
      }
    }
    void fetchProperties()
  }, [])

  const handleAddLead = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')

    if (!addLeadForm.fullName.trim() || !addLeadForm.phone.trim()) {
      setFormError('Full name and phone number are required.')
      return
    }

    if (addLeadForm.budgetMin && Number(addLeadForm.budgetMin) < 0) {
      setFormError('Minimum budget cannot be negative.')
      return
    }

    if (addLeadForm.budgetMax && Number(addLeadForm.budgetMax) < 0) {
      setFormError('Maximum budget cannot be negative.')
      return
    }

    setIsSavingLead(true)

    try {
      const sourceConfig = LEAD_SOURCE_OPTIONS.find((option) => option.value === addLeadForm.source)
      const requirementLines = [
        `Lead Type: ${addLeadForm.leadType}`,
        `WhatsApp Available: ${addLeadForm.whatsappAvailable ? 'Yes' : 'No'}`,
        addLeadForm.preferredLocations ? `Preferred Locations: ${addLeadForm.preferredLocations}` : '',
        addLeadForm.configurations.length ? `Configuration Preference: ${addLeadForm.configurations.join(', ')}` : '',
        addLeadForm.budgetMin || addLeadForm.budgetMax ? `Budget Range: ${addLeadForm.budgetMin || '0'} - ${addLeadForm.budgetMax || 'Open'}` : '',
        addLeadForm.sourceDetail ? `Inquiry Source Detail: ${addLeadForm.sourceDetail}` : '',
      ].filter(Boolean)

      const composedMessage = [
        addLeadForm.message.trim(),
        requirementLines.join('\n'),
      ].filter(Boolean).join('\n\n')

      await api.createLead({
        fullName: addLeadForm.fullName,
        email: addLeadForm.email,
        phone: addLeadForm.phone,
        source: sourceConfig?.storage || 'website',
        propertyInterestId: addLeadForm.propertyInterestId === 'none' ? null : Number(addLeadForm.propertyInterestId),
        message: composedMessage,
        notes: addLeadForm.notes,
      })

      toast.success('Lead created successfully')
      navigate('/crm/leads')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead')
    } finally {
      setIsSavingLead(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/crm/leads')} className="h-10 w-10 p-0 rounded-full">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-emerald-600" />
            Add New Lead
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Capture the essentials fast, then layer in source context and client requirements.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <form onSubmit={(e) => void handleAddLead(e)}>
          <div className="space-y-8 bg-slate-50/60 px-6 py-8 sm:px-8">
            <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Section 01</p>
                <h3 className="text-lg font-semibold text-slate-950">Basic Information</h3>
                <p className="text-sm leading-6 text-slate-500">Core contact details with a quick WhatsApp reachability flag for follow-up speed.</p>
              </div>
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="grid gap-5 p-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-slate-800">Full Name *</Label>
                    <Input
                      value={addLeadForm.fullName}
                      onChange={(event) => setAddLeadForm({ ...addLeadForm, fullName: event.target.value })}
                      placeholder="Rohan Sharma"
                      className="h-11 rounded-xl border-0 bg-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Phone Number *</Label>
                    <div className="flex h-11 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-transparent focus-within:ring-2 focus-within:ring-slate-900">
                      <div className="flex items-center border-r border-slate-200 px-3 text-sm font-medium text-slate-600">+91</div>
                      <Input
                        value={addLeadForm.phone}
                        onChange={(event) => setAddLeadForm({ ...addLeadForm, phone: event.target.value })}
                        placeholder="98765 43210"
                        className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Email Address</Label>
                    <Input
                      type="email"
                      value={addLeadForm.email}
                      onChange={(event) => setAddLeadForm({ ...addLeadForm, email: event.target.value })}
                      placeholder="client@email.com"
                      className="h-11 rounded-xl border-0 bg-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">WhatsApp Available</p>
                        <p className="text-xs text-slate-500">Use this to flag fast WhatsApp follow-up opportunities.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{addLeadForm.whatsappAvailable ? 'Yes' : 'No'}</span>
                        <Switch
                          checked={addLeadForm.whatsappAvailable}
                          onCheckedChange={(checked) => setAddLeadForm({ ...addLeadForm, whatsappAvailable: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Section 02</p>
                <h3 className="text-lg font-semibold text-slate-950">Lead Context</h3>
                <p className="text-sm leading-6 text-slate-500">Track where the lead came from and what kind of client motion this represents.</p>
              </div>
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="grid gap-5 p-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Inquiry Source</Label>
                    <Select
                      value={addLeadForm.source}
                      onValueChange={(value) => {
                        const option = LEAD_SOURCE_OPTIONS.find((item) => item.value === value)
                        setAddLeadForm({
                          ...addLeadForm,
                          source: value,
                          sourceDetail: option?.label || '',
                        })
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-0 bg-slate-100 shadow-none focus:ring-2 focus:ring-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCE_OPTIONS.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Lead Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {LEAD_TYPE_OPTIONS.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddLeadForm({ ...addLeadForm, leadType: type })}
                          className={`rounded-xl px-4 py-3 text-sm font-medium capitalize transition ${
                            addLeadForm.leadType === type
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-slate-800">Linked Property</Label>
                    <Select value={addLeadForm.propertyInterestId} onValueChange={(value) => setAddLeadForm({ ...addLeadForm, propertyInterestId: value })}>
                      <SelectTrigger className="h-11 rounded-xl border-0 bg-slate-100 shadow-none focus:ring-2 focus:ring-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">General enquiry</SelectItem>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={String(property.id)}>
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Section 03</p>
                <h3 className="text-lg font-semibold text-slate-950">Requirements</h3>
                <p className="text-sm leading-6 text-slate-500">Capture budget, location interest, and configuration preferences in a format the sales team can scan instantly.</p>
              </div>
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-5 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-800">Budget Range</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex h-11 overflow-hidden rounded-xl bg-slate-100">
                          <div className="flex items-center border-r border-slate-200 px-3 text-slate-500">
                            <IndianRupee className="h-4 w-4" />
                          </div>
                          <Input
                            type="number"
                            min="0"
                            value={addLeadForm.budgetMin}
                            onChange={(event) => setAddLeadForm({ ...addLeadForm, budgetMin: event.target.value })}
                            placeholder="Min"
                            className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                          />
                        </div>
                        <div className="flex h-11 overflow-hidden rounded-xl bg-slate-100">
                          <div className="flex items-center border-r border-slate-200 px-3 text-slate-500">
                            <IndianRupee className="h-4 w-4" />
                          </div>
                          <Input
                            type="number"
                            min="0"
                            value={addLeadForm.budgetMax}
                            onChange={(event) => setAddLeadForm({ ...addLeadForm, budgetMax: event.target.value })}
                            placeholder="Max"
                            className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-800">Preferred Locations</Label>
                      <div className="relative">
                        <MapPinned className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={addLeadForm.preferredLocations}
                          onChange={(event) => setAddLeadForm({ ...addLeadForm, preferredLocations: event.target.value })}
                          placeholder="Salt Lake, New Town, Ballygunge"
                          className="h-11 rounded-xl border-0 bg-slate-100 pl-9 shadow-none focus-visible:ring-2 focus-visible:ring-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Configuration Preference</Label>
                    <div className="flex flex-wrap gap-2">
                      {CONFIGURATION_OPTIONS.map((option) => {
                        const active = addLeadForm.configurations.includes(option)
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAddLeadForm({
                              ...addLeadForm,
                              configurations: active
                                ? addLeadForm.configurations.filter((item) => item !== option)
                                : [...addLeadForm.configurations, option],
                            })}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              active
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Section 04</p>
                <h3 className="text-lg font-semibold text-slate-950">Notes</h3>
                <p className="text-sm leading-6 text-slate-500">Capture urgency, objections, budget nuance, and anything the next caller should know before reaching out.</p>
              </div>
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-5 p-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Client Brief</Label>
                    <Textarea
                      rows={4}
                      value={addLeadForm.message}
                      onChange={(event) => setAddLeadForm({ ...addLeadForm, message: event.target.value })}
                      placeholder="Timeline, urgency, family size, use case, or anything the agent should know before the first call."
                      className="rounded-2xl border-0 bg-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-800">Internal Notes</Label>
                    <Textarea
                      rows={4}
                      value={addLeadForm.notes}
                      onChange={(event) => setAddLeadForm({ ...addLeadForm, notes: event.target.value })}
                      placeholder="Budget sensitivity, referral quality, next step owner, special instructions..."
                      className="rounded-2xl border-0 bg-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {formError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
            <p className="text-sm text-slate-500">
              {isSavingLead ? 'Adding lead and saving context...' : 'Full name and phone number are mandatory. Everything else is optional.'}
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/crm/leads')} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 font-semibold text-white hover:bg-slate-800"
                disabled={isSavingLead}
              >
                {isSavingLead ? 'Adding...' : 'Add Lead'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
