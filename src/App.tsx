import { Routes, Route, Navigate } from 'react-router'
import PublicLayout from './layouts/PublicLayout'
import CrmLayout from './layouts/CrmLayout'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import CrmDashboard from './pages/CrmDashboard'
import CrmLeads from './pages/CrmLeads'
import CrmListings from './pages/CrmListings'
import CrmPropertyCreate from './pages/CrmPropertyCreate'
import CrmAnalytics from './pages/CrmAnalytics'
import CrmSettings from './pages/CrmSettings'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/properties" element={<PublicLayout><Properties /></PublicLayout>} />
        <Route path="/properties/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* CRM Routes */}
        <Route path="/crm" element={<CrmLayout><CrmDashboard /></CrmLayout>} />
        <Route path="/crm/leads" element={<CrmLayout><CrmLeads /></CrmLayout>} />
        <Route path="/crm/listings" element={<CrmLayout><CrmListings /></CrmLayout>} />
        <Route path="/crm/listings/new" element={<CrmLayout><CrmPropertyCreate /></CrmLayout>} />
        <Route path="/crm/listings/edit/:id" element={<CrmLayout><CrmPropertyCreate /></CrmLayout>} />
        <Route path="/crm/analytics" element={<CrmLayout><CrmAnalytics /></CrmLayout>} />
        <Route path="/crm/settings" element={<CrmLayout><CrmSettings /></CrmLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}
