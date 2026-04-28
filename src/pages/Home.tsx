import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bed, Bath, Square, MapPin, ArrowRight, Search, Shield, TrendingUp, Headphones, Building2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/hooks/useApi'
import { formatINR, formatINRCompact, formatBathrooms } from '@/lib/property-display'

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
  featured_image: string | null
  images: string[]
  amenities: string[]
  is_featured: number
}

export default function Home() {
  const [featured, setFeatured] = useState<Property[]>([])
  const [recent, setRecent] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.listProperties({ limit: '12' })
        const liveProperties = Array.isArray(response?.properties) ? response.properties : []
        setFeatured(liveProperties.filter((property: Property) => property.is_featured === 1).slice(0, 2))
        setRecent(liveProperties.slice(0, 8))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="Real Estate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Vidhaata Ventures
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect <span className="text-emerald-400">Property</span> Today
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Discover luxury homes, commercial spaces, and investment properties. Our expert agents are here to guide you every step of the way— honestly and transparently.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/properties">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Search className="h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-emerald-700 hover:bg-white hover:text-slate-900 gap-2">
                  <Headphones className="h-5 w-5" />
                  Talk to an Agent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Properties Listed', value: '100+', icon: Building2 },
              { label: 'Happy Clients', value: '300+', icon: Users },
              { label: 'Areas Covered in Kolkata', value: "25+", icon: MapPin },
              { label: 'Avg. Sale Price', value: formatINRCompact(7000000), icon: TrendingUp },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Properties</h2>
              <p className="text-slate-500 mt-1">Handpicked premium listings by our expert agents</p>
            </div>
            <Link to="/properties">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map(property => (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={property.featured_image || property.images[0] || '/images/hero-bg.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-emerald-600">Featured</Badge>
                        <Badge variant="secondary" className="capitalize">{property.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Badge variant="secondary" className="text-lg font-semibold">
                          {formatINR(property.price, property.status)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{property.title}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                        <MapPin className="h-4 w-4" />
                        {property.city}, {property.state}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {formatBathrooms(property.bathrooms)}</span>
                        <span className="flex items-center gap-1"><Square className="h-4 w-4" /> {property.square_feet?.toLocaleString()} sqft</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Recent Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.map(property => (
              <Link key={property.id} to={`/properties/${property.id}`}>
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.featured_image || property.images[0] || '/images/hero-bg.jpg'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-lg font-semibold text-slate-900">{formatINR(property.price, property.status)}</p>
                    <h3 className="text-sm font-medium text-slate-700 mt-1 truncate">{property.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{property.city}, {property.state}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {property.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {formatBathrooms(property.bathrooms)}</span>
                      <span className="flex items-center gap-1"><Square className="h-3 w-3" /> {property.square_feet}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Vidhaata Ventures?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We combine cutting-edge technology with personalized service to deliver an unmatched real estate experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Smart Property Search',
                desc: 'Advanced filters and AI-powered recommendations help you find the perfect property faster.'
              },
              {
                icon: Shield,
                title: 'Verified Listings',
                desc: 'Every property is thoroughly verified by our team to ensure accuracy and eliminate scams.'
              },
              {
                icon: Headphones,
                title: 'Expert Support',
                desc: 'Our experienced agents are available 24/7 to guide you through every step of your journey.'
              }
            ].map(feature => (
              <div key={feature.title} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8">
            Whether you are buying, selling, or renting, our team of experts is here to make your real estate journey smooth and successful.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/properties">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                Start Searching
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-emerald-700 hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
