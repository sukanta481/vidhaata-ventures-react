import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, Target, Shield, ArrowRight, Building2 } from 'lucide-react'
import { Link } from 'react-router'

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="About" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Vidhaata Ventures</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Connecting people with their perfect properties through trusted guidance, local expertise, and genuine relationships — since 2005.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Story</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Vidhaata Ventures was founded by Anish Chowdhury with a clear purpose: to make property buying, selling, and renting in Kolkata a transparent, stress-free experience for every client.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                What began as a focused practice rooted in deep local market knowledge has grown into a trusted real estate advisory serving homebuyers, tenants, investors, and developers across the city.
                <br />Anish believes that finding the right property should never feel overwhelming. By combining honest market guidance with a personal, relationship-driven approach, Vidhaata Ventures has helped hundreds of clients make confident decisions about their most important investments.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, the firm continues to grow — with a commitment to integrity, client-first service, and a thorough understanding of Kolkata's ever-evolving property landscape.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-emerald-600 mb-1">5,00+</p>
                  <p className="text-sm text-slate-600">Happy Clients</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-slate-700 mb-1">10+</p>
                  <p className="text-sm text-slate-600">Years of Local Experience</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-slate-700 mb-1">25+</p>
                  <p className="text-sm text-slate-600">Areas Covered in Kolkata</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-emerald-600 mb-1">₹150Cr+</p>
                  <p className="text-sm text-slate-600">Properties Sold</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              The principles that guide everything we do at Vidhaata Ventures
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Client First', desc: 'Every decision we make starts with our clients needs and goals in mind.' },
              { icon: Shield, title: 'Integrity', desc: 'We believe in transparency, honesty, and ethical practices in every transaction.' },
              { icon: Target, title: 'Excellence', desc: 'We strive for the highest standards in service, marketing, and negotiation.' },
              { icon: Award, title: 'Innovation', desc: 'We embrace technology and new ideas to improve the real estate experience.' },
            ].map(value => (
              <Card key={value.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-500">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Leadership Bio</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Guiding Vidhaata Ventures with integrity and vision
            </p>
          </div>
          <Card className="max-w-[800px] mx-auto overflow-hidden shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-[40%] h-72 md:h-auto min-h-[350px]">
                <img src="/images/anish.webp" alt="Anish Chowdhury" className="w-full h-full object-cover object-top" />
              </div>
              <div className="md:w-[60%] p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900">Anish Chowdhury</h3>
                <p className="text-emerald-600 font-medium mb-4">CEO & Founder</p>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    With over a decade of experience in Kolkata's real estate market, Anish Chowdhury founded Vidhaata Ventures to bring honesty and professionalism to property dealings in the city. A trusted name among homebuyers, investors, and developers alike, Anish has guided clients through hundreds of successful transactions — from residential apartments in South Kolkata to commercial spaces across the city.
                  </p>
                  <p>
                    His hands-on approach, deep neighborhood knowledge, and commitment to long-term relationships set Vidhaata Ventures apart in a competitive market.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Work With Vidhaata Ventures</h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8">
            Whether you're looking to buy, sell, or join our team as an agent, we'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2">
                <Building2 className="h-5 w-5" />
                Contact Us
              </Button>
            </Link>
            <Link to="/properties">
              <Button size="lg" variant="outline" className="border-white text-emerald-700 hover:bg-white/10 gap-2">
                Browse Properties <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
