import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bed, Bath, Square, MapPin, Search, SlidersHorizontal, Building2, Home } from 'lucide-react'
import { api } from '@/hooks/useApi'
import { formatINR } from '@/lib/property-display'

interface Property {
  id: number
  title: string
  price: number
  status: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  city: string
  state: string
  address: string
  featured_image: string | null
  images: string[]
  amenities: string[]
}

type Category = 'residential' | 'commercial'

export default function Properties() {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState<Category>(
    searchParams.get('type') === 'commercial' ? 'commercial' : 'residential'
  )
  const [filters, setFilters] = useState({
    type: searchParams.get('type') === 'commercial' ? 'commercial' : 'all',
    status: searchParams.get('status') || 'all',
    minPrice: '',
    maxPrice: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.listProperties({ limit: '200' })
        setProperties(Array.isArray(response?.properties) ? response.properties : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    void fetchProperties()
  }, [])

  useEffect(() => {
    setFilters((current) => {
      const nextType = category === 'commercial' ? 'commercial' : 'all'
      return { ...current, type: nextType }
    })
  }, [category])

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const isCommercial = property.property_type === 'commercial'
      if (category === 'commercial' && !isCommercial) return false
      if (category === 'residential' && isCommercial) return false

      if (filters.type !== 'all' && property.property_type !== filters.type) return false
      if (filters.status !== 'all' && property.status !== filters.status) return false
      if (filters.minPrice && property.price < Number(filters.minPrice)) return false
      if (filters.maxPrice && property.price > Number(filters.maxPrice)) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          property.title.toLowerCase().includes(q) ||
          property.city.toLowerCase().includes(q) ||
          property.address.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [category, filters.maxPrice, filters.minPrice, filters.status, filters.type, properties, searchQuery])

  const typeOptions = category === 'commercial'
    ? [{ value: 'commercial', label: 'Commercial' }]
    : [
        { value: 'all', label: 'All Residential' },
        { value: 'house', label: 'House' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'condo', label: 'Condo' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'land', label: 'Land' },
      ]

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Properties</h1>
            <p className="text-slate-500">Browse live listings from our database across residential and commercial inventory.</p>
          </div>

          <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm lg:w-auto">
            <button
              type="button"
              onClick={() => setCategory('residential')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition lg:min-w-44 ${
                category === 'residential'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Residential
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCategory('commercial')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition lg:min-w-44 ${
                category === 'commercial'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Commercial
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Search ${category === 'residential' ? 'residential' : 'commercial'} properties...`}
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t">
              <Select value={filters.type} onValueChange={v => setFilters({ ...filters, type: v })}>
                <SelectTrigger><SelectValue placeholder="Property Type" /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={v => setFilters({ ...filters, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                  <SelectItem value="for_rent">For Rent</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Min Price" type="number" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
              <Input placeholder="Max Price" type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-12 text-center text-slate-500">Loading properties...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
            <h3 className="text-lg font-semibold text-red-700">Could not load properties</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {filtered.length} {category === 'residential' ? 'residential' : 'commercial'} properties found
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(property => (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={property.featured_image || property.images[0] || '/images/hero-bg.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
                        <Badge className={property.status === 'for_sale' ? 'bg-emerald-600' : property.status === 'for_rent' ? 'bg-blue-600' : 'bg-slate-600'}>
                          {property.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-lg font-bold text-slate-900">{formatINR(property.price, property.status)}</p>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1 truncate">{property.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.state}
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {property.bedrooms}</span>}
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {property.bathrooms}</span>
                        <span className="flex items-center gap-1"><Square className="h-3 w-3" /> {property.square_feet?.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No properties found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
