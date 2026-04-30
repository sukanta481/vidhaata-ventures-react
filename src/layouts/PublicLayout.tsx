import { Link, useLocation } from 'react-router'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/properties', label: 'Properties' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/vidhaataventureslogo.webp" alt="Vidhaata Ventures" className="h-10 w-auto" />
              {/* <span className="text-xl font-bold text-slate-900">Vidhaata Ventures</span> */}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${isActive(link.path) ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/logo.webp" alt="Vidhaata Ventures" className="h-10 w-auto" />
                {/* <span className="text-lg font-bold text-white">Vidhaata Ventures</span> */}
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Your trusted partner in finding the right property. Vidhaata Ventures connects buyers, tenants, and investors with spaces that fit real goals.
              </p>
              <div className="flex gap-3">
                <Facebook className="h-5 w-5 hover:text-emerald-500 cursor-pointer" />
                <Twitter className="h-5 w-5 hover:text-emerald-500 cursor-pointer" />
                <Instagram className="h-5 w-5 hover:text-emerald-500 cursor-pointer" />
                <Linkedin className="h-5 w-5 hover:text-emerald-500 cursor-pointer" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-emerald-500">Home</Link></li>
                <li><Link to="/properties" className="hover:text-emerald-500">Properties</Link></li>
                <li><Link to="/about" className="hover:text-emerald-500">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-500">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Property Types</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/properties?type=house" className="hover:text-emerald-500">Houses</Link></li>
                <li><Link to="/properties?type=apartment" className="hover:text-emerald-500">Apartments</Link></li>
                <li><Link to="/properties?type=condo" className="hover:text-emerald-500">Condos</Link></li>
                <li><Link to="/properties?type=commercial" className="hover:text-emerald-500">Commercial</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  152 Manictalla Main road kolkata 700054
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  +91 90517 51059
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  Ventures.vidhaata@gmail.com
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
            <div>&copy; {new Date().getFullYear()} Vidhaata Ventures. All rights reserved.</div>
            <div>
              Designed & Developed by <a href="https://biznexa.tech" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">Biznexa</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
