import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Dialog removed
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Bed, Bath, Square, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/hooks/useApi'
import { formatINR, formatBathrooms } from '@/lib/property-display'

interface Property {
  id: number
  title: string
  price: number
  status: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  address: string
  city: string
  state: string
  description: string
  featured_image: string
  amenities: string[]
  is_featured: number
  is_published: number
}

const mockProperties: Property[] = [
  { id: 1, title: 'Luxury Modern Villa', price: 2850000, status: 'for_sale', property_type: 'house', bedrooms: 5, bathrooms: 4.5, square_feet: 4500, address: '123 Ocean Drive', city: 'Malibu', state: 'California', description: 'Stunning modern villa with panoramic ocean views', featured_image: '/images/prop-1.jpg', amenities: ['Pool', 'Ocean View', 'Smart Home'], is_featured: 1, is_published: 1 },
  { id: 2, title: 'Downtown Penthouse Suite', price: 1850000, status: 'for_sale', property_type: 'apartment', bedrooms: 3, bathrooms: 3, square_feet: 2800, address: '456 Tower Ave, PH-1', city: 'Los Angeles', state: 'California', description: 'Exclusive penthouse with 360-degree city views', featured_image: '/images/prop-2.jpg', amenities: ['Rooftop Terrace', 'Concierge'], is_featured: 1, is_published: 1 },
  { id: 3, title: 'Cozy Suburban Family Home', price: 785000, status: 'for_sale', property_type: 'house', bedrooms: 4, bathrooms: 3, square_feet: 2400, address: '789 Maple Street', city: 'Pasadena', state: 'California', description: 'Beautiful family home in quiet neighborhood', featured_image: '/images/prop-3.jpg', amenities: ['Backyard', 'Garage'], is_featured: 0, is_published: 1 },
  { id: 4, title: 'Waterfront Condo', price: 1250000, status: 'for_sale', property_type: 'condo', bedrooms: 2, bathrooms: 2, square_feet: 1800, address: '321 Marina Blvd', city: 'Marina Del Rey', state: 'California', description: 'Spacious waterfront condo with private dock', featured_image: '/images/prop-4.jpg', amenities: ['Waterfront', 'Pool'], is_featured: 0, is_published: 1 },
  { id: 5, title: 'Modern Office Space', price: 8500, status: 'for_rent', property_type: 'commercial', bedrooms: 0, bathrooms: 2, square_feet: 3200, address: '555 Finance Way', city: 'San Francisco', state: 'California', description: 'Prime commercial space in financial district', featured_image: '/images/prop-5.jpg', amenities: ['Conference Rooms', 'Parking'], is_featured: 0, is_published: 1 },
  { id: 6, title: 'Historic Brownstone', price: 1650000, status: 'for_sale', property_type: 'townhouse', bedrooms: 4, bathrooms: 3.5, square_feet: 3200, address: '888 Heritage Row', city: 'Boston', state: 'Massachusetts', description: 'Beautifully restored historic brownstone', featured_image: '/images/prop-6.jpg', amenities: ['Garden', 'Wine Cellar'], is_featured: 0, is_published: 1 },
]

export default function CrmListings() {
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const filtered = properties.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch = !search || p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await api.adminListProperties()
        if (Array.isArray(response)) {
          setProperties(response)
        }
      } catch {
        toast.error('Could not load live property listings. Showing local sample data instead.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProperties()
  }, [])

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      for_sale: 'bg-emerald-100 text-emerald-700',
      for_rent: 'bg-blue-100 text-blue-700',
      sold: 'bg-slate-100 text-slate-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

// handleSubmit removed

  const handleDelete = (id: number) => {
    void (async () => {
      try {
        await api.deleteProperty(id)
        setProperties(prev => prev.filter(p => p.id !== id))
        toast.success('Property deleted')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete property')
      }
    })()
  }

  const openEdit = (property: Property) => {
    navigate(`/crm/listings/edit/${property.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Property Listings</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Link to="/crm/listings/new">
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search properties..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="for_sale">For Sale</SelectItem>
            <SelectItem value="for_rent">For Rent</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading listings...
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(property => (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <img src={property.featured_image} alt={property.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={getStatusBadge(property.status)}>{property.status.replace('_', ' ')}</Badge>
                {property.is_featured === 1 && <Badge className="bg-amber-500">Featured</Badge>}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 truncate pr-2">{property.title}</h3>
                <p className="text-emerald-600 font-bold">{formatINR(property.price, property.status)}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                <MapPin className="h-3 w-3" />
                {property.address}, {property.city}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {property.bedrooms}</span>}
                <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {formatBathrooms(property.bathrooms)}</span>
                <span className="flex items-center gap-1"><Square className="h-3 w-3" /> {property.square_feet?.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => openEdit(property)}>
                  <Edit className="h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(property.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No properties found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Add/Edit Dialog removed */}
    </div>
  )
}
