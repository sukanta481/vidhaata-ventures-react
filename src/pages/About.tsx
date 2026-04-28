import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, Target, Shield, ArrowRight, Building2 } from 'lucide-react'

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
            Connecting people with their perfect properties through innovative technology and personalized service since 2015.
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
                Vidhaata Ventures was founded with a simple mission: to transform the real estate experience by combining thoughtful market knowledge with genuine human connection. What started as a focused team has grown into a trusted property advisory brand serving homebuyers, tenants, and investors.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We believe that finding the right property should feel exciting, not stressful. Our systems and workflows help the team deliver seamless, personalized service to every client.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, Vidhaata Ventures continues to expand its reach with a client-first approach, local market expertise, and a strong focus on long-term relationships.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-emerald-600 mb-1">5,000+</p>
                  <p className="text-sm text-slate-600">Happy Clients</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-slate-700 mb-1">200+</p>
                  <p className="text-sm text-slate-600">Expert Agents</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-slate-700 mb-1">45+</p>
                  <p className="text-sm text-slate-600">Cities Covered</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-emerald-600 mb-1">$2.5B</p>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Leadership</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Experienced professionals dedicated to transforming the real estate industry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Sarah Mitchell', role: 'CEO & Founder', image: '/images/agent-1.jpg', desc: '20+ years in real estate, former VP at national brokerage.' },
              { name: 'Michael Chen', role: 'COO', image: '/images/agent-2.jpg', desc: 'Operations expert with background in tech startups.' },
              { name: 'David Williams', role: 'Head of Sales', image: '/images/agent-2.jpg', desc: 'Led teams to $500M+ in annual sales volume.' },
              { name: 'Lisa Park', role: 'Marketing Director', image: '/images/agent-1.jpg', desc: 'Digital marketing strategist with Fortune 500 experience.' },
            ].map(member => (
              <Card key={member.name} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-sm text-emerald-600 mb-2">{member.role}</p>
                  <p className="text-sm text-slate-500">{member.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                Browse Properties <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
