import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Bed,
  Bath,
  Square,
  MapPin,
  ArrowLeft,
  Heart,
  Share2,
  Check,
  Phone,
  Mail,
  Building2,
  Briefcase,
  IndianRupee,
  Landmark,
  CalendarDays,
} from 'lucide-react'
import { api } from '@/hooks/useApi'
import { formatINR, isCommercialProperty, parsePropertyDescription } from '@/lib/property-display'

interface Property {
  id: number
  title: string
  description: string
  price: number
  status: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  address: string
  city: string
  state: string
  zip_code?: string
  featured_image: string | null
  images: string[]
  amenities: string[]
  agent_name?: string
  agent_email?: string
  agent_phone?: string
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bed
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <Icon className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false)
        setError('Property not found')
        return
      }

      try {
        setLoading(true)
        setError('')
        const response = await api.getProperty(Number(id))
        setProperty(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    void fetchProperty()
  }, [id])

  const gallery = useMemo(() => {
    if (!property) return []
    const images = Array.isArray(property.images) ? property.images.filter(Boolean) : []
    const featured = property.featured_image ? [property.featured_image] : []
    const unique = Array.from(new Set([...featured, ...images]))
    return unique.length > 0 ? unique : ['/images/hero-bg.jpg']
  }, [property])

  const mapQuery = useMemo(() => {
    if (!property) return ''
    return encodeURIComponent(
      [property.address, property.city, property.state, property.zip_code].filter(Boolean).join(', ')
    )
  }, [property])

  const parsedDescription = useMemo(
    () => parsePropertyDescription(property?.description || ''),
    [property?.description]
  )

  const isCommercial = useMemo(
    () => isCommercialProperty(property?.property_type || ''),
    [property?.property_type]
  )

  const residentialFacts = useMemo(() => {
    const metadata = parsedDescription.metadata
    return [
      { label: 'Configuration', value: metadata.configuration || (property?.bedrooms ? `${property.bedrooms} BHK` : 'Not specified') },
      { label: 'Building Type', value: metadata['building type'] || 'Not specified' },
      { label: 'Transaction Type', value: metadata['transaction type'] || 'Not specified' },
      { label: 'Balconies', value: metadata.balconies || 'Not specified' },
      { label: 'Listing Purpose', value: metadata['listing purpose'] || 'Not specified' },
      { label: 'Property Group', value: metadata['property group'] || 'Residential' },
    ]
  }, [parsedDescription.metadata, property?.bedrooms])

  const commercialFacts = useMemo(() => {
    const metadata = parsedDescription.metadata
    return [
      { label: 'Use Type', value: metadata['specific type'] || 'Commercial Space' },
      { label: 'Washrooms', value: metadata.washrooms || (property?.bathrooms ? String(property.bathrooms) : 'Not specified') },
      { label: 'Furnishing Status', value: metadata['commercial furnishing'] || 'Not specified' },
      { label: 'Transaction Type', value: metadata['transaction type'] || 'Not specified' },
      { label: 'Construction Status', value: metadata['construction status'] || 'Not specified' },
      { label: 'Listing Purpose', value: metadata['listing purpose'] || 'Not specified' },
    ]
  }, [parsedDescription.metadata, property?.bathrooms])

  const pricePerSqft = useMemo(() => {
    if (!property?.square_feet) return '-'
    return formatINR(Math.round(property.price / property.square_feet), 'for_sale').replace('/month', '')
  }, [property?.price, property?.square_feet])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading property details...
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Property not found</h2>
        <p className="mt-2 text-slate-500">{error || 'The property you are looking for is unavailable.'}</p>
        <Button className="mt-4" onClick={() => navigate('/properties')}>Back to Properties</Button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="gap-2 mb-4 -ml-4" onClick={() => navigate('/properties')}>
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Button>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
                <Badge className={property.status === 'for_sale' ? 'bg-emerald-600' : property.status === 'for_rent' ? 'bg-blue-600' : 'bg-slate-600'}>
                  {property.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">{isCommercial ? 'Commercial Listing' : 'Residential Listing'}</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">{property.title}</h1>
                <div className="mt-2 flex items-start gap-2 text-slate-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{property.address}, {property.city}, {property.state} {property.zip_code || ''}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 xl:items-end">
              <p className="text-3xl font-bold text-emerald-600">{formatINR(property.price, property.status)}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setLiked(!liked)}>
                  <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm xl:h-[560px]">
            <div className="h-[320px] sm:h-[420px] xl:h-full">
              <img
                src={gallery[activeImage] || gallery[0]}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-1 xl:auto-rows-[130px] xl:max-h-[560px] xl:overflow-auto xl:pr-1">
            {gallery.map((img, i) => (
              <button
                key={`${img}-${i}`}
                onClick={() => setActiveImage(i)}
                className={`overflow-hidden rounded-2xl border-2 bg-slate-100 transition-all ${
                  activeImage === i ? 'border-emerald-600 shadow-sm' : 'border-transparent hover:border-slate-200'
                }`}
              >
                <div className="h-28 sm:h-32 xl:h-full">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {isCommercial ? (
                <>
                  <StatCard icon={Building2} label="Built-up Area" value={property.square_feet ? `${property.square_feet.toLocaleString()} sq ft` : '-'} />
                  <StatCard icon={Bath} label="Washrooms" value={String(property.bathrooms || 0)} />
                  <StatCard icon={IndianRupee} label="Price / sq ft" value={pricePerSqft} />
                  <StatCard icon={Briefcase} label="Use Type" value={commercialFacts[0]?.value || 'Commercial'} />
                </>
              ) : (
                <>
                  <StatCard icon={Bed} label="Bedrooms" value={String(property.bedrooms || 0)} />
                  <StatCard icon={Bath} label="Bathrooms" value={String(property.bathrooms || 0)} />
                  <StatCard icon={Square} label="Area" value={property.square_feet ? `${property.square_feet.toLocaleString()} sq ft` : '-'} />
                  <StatCard icon={Building2} label="Configuration" value={residentialFacts[0]?.value || '-'} />
                </>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-slate-900">
                {isCommercial ? 'Commercial Overview' : 'About this Property'}
              </h2>
              <p className="leading-relaxed text-slate-600">
                {parsedDescription.summary || 'No description available for this property yet.'}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                {isCommercial ? 'Commercial Details' : 'Residential Details'}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(isCommercial ? commercialFacts : residentialFacts).map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">{fact.label}</p>
                    <p className="mt-1 font-semibold capitalize text-slate-900">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Amenities</h2>
              {property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Amenities have not been added yet.</p>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Location</h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <iframe
                  title={`Map for ${property.title}`}
                  src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <p className="text-slate-600">{property.address}, {property.city}, {property.state}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-slate-900">Listing Agent</h3>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {property.agent_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{property.agent_name || 'Assigned Agent'}</p>
                    <p className="text-sm text-slate-500">Real Estate Agent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={!property.agent_phone}>
                    <a href={property.agent_phone ? `tel:${property.agent_phone}` : undefined}>
                      <Phone className="h-4 w-4" /> {property.agent_phone ? 'Call Agent' : 'Phone Unavailable'}
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full gap-2" disabled={!property.agent_email}>
                    <a href={property.agent_email ? `mailto:${property.agent_email}` : undefined}>
                      <Mail className="h-4 w-4" /> {property.agent_email ? 'Send Email' : 'Email Unavailable'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-slate-900">Quick Facts</h3>
                <div className="space-y-3">
                  <DetailRow label="Price" value={formatINR(property.price, property.status)} />
                  <DetailRow label="Price per sq ft" value={pricePerSqft} />
                  <DetailRow label="City" value={property.city} />
                  <DetailRow label="State" value={property.state} />
                  <DetailRow label="ZIP" value={property.zip_code || '-'} />
                  <DetailRow label="Category" value={isCommercial ? 'Commercial' : 'Residential'} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-slate-900">
                  {isCommercial ? 'Business Fit' : 'Residential Snapshot'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {isCommercial ? <Briefcase className="mt-0.5 h-4 w-4 text-emerald-600" /> : <Landmark className="mt-0.5 h-4 w-4 text-emerald-600" />}
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {isCommercial ? commercialFacts[0]?.value || 'Commercial Space' : residentialFacts[1]?.value || 'Residential Building'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {isCommercial
                          ? 'Configured for office, retail, or enterprise use based on the listing metadata.'
                          : 'Presented with home-oriented layout and livability information.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {(isCommercial ? commercialFacts[4]?.value : residentialFacts[2]?.value) || 'Not specified'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {isCommercial ? 'Construction and operational status for business planning.' : 'Transaction and ownership context for home buyers or tenants.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-slate-900">Schedule a Tour</h3>
                <p className="mb-4 text-sm text-slate-500">
                  {isCommercial
                    ? 'Interested in seeing the space in person? Book a site visit with the listing agent.'
                    : 'Interested in this home? Schedule a private viewing with the listing agent.'}
                </p>
                <Link to="/contact">
                  <Button className="w-full">Request Tour</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
