import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PageLoader from './components/ui/PageLoader'
import ErrorBoundary from './components/ui/ErrorBoundary'
import PublicLayout from './components/layout/PublicLayout'
import { takeBootHtml } from './lib/prerender'
import LeadPopup from './components/layout/LeadPopup'

const Home        = lazy(() => import('./pages/Home'))
const Trips       = lazy(() => import('./pages/Trips'))
const TripDetail  = lazy(() => import('./pages/TripDetail'))
const About       = lazy(() => import('./pages/About'))
const Contact     = lazy(() => import('./pages/Contact'))
const CustomTrip  = lazy(() => import('./pages/CustomTrip'))
const Blogs       = lazy(() => import('./pages/Blogs'))
const BlogPost    = lazy(() => import('./pages/BlogPost'))
const NotFound    = lazy(() => import('./pages/NotFound'))
const PaymentResult = lazy(() => import('./pages/PaymentResult'))
const AdminLogin  = lazy(() => import('./admin/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))

const Spinner = () => (
  <div className="flex h-screen items-center justify-center" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-brand border-t-transparent" />
  </div>
)

// First load of a prerendered page: keep its static HTML on screen; afterwards show a spinner.
function BootFallback() {
  const html = takeBootHtml()
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <Spinner />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PageLoader />
      <LeadPopup />
      <ErrorBoundary>
        <Suspense fallback={<BootFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/custom-trip" element={<CustomTrip />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<BlogPost />} />
              <Route path="/payment/success" element={<PaymentResult status="success" />} />
              <Route path="/payment/failed" element={<PaymentResult status="failed" />} />
            </Route>
            {/* Trip detail has its own mobile CTA bar, so no floating WhatsApp button */}
            <Route element={<PublicLayout float={false} />}>
              <Route path="/trips/:slug" element={<TripDetail />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
