import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Home, Schedule, Sponsors, CodeOfConduct, Contact, FAQ, Login, AuthCallback, Dashboard, EditRequest, PrivacyPolicy, Admin, MySchedulePage, SharedSchedule, AttendeeProfile, Updates, UpdateDetail } from './pages'
import { SplashScreen, ProtectedRoute, ScrollToTop, ErrorBoundary } from './components'
import { AuthProvider } from './contexts/AuthContext'
import { ContentProvider } from './contexts/ContentContext'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

function App() {
  const [splashComplete, setSplashComplete] = React.useState(false)

  return (
    <HelmetProvider>
      <SplashScreen onComplete={() => setSplashComplete(true)}>
        <BrowserRouter>
          <ScrollToTop />
          <ToastProvider>
            <ContentProvider>
              <AuthProvider>
                <Routes>
                  {/* Public pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/sponsors" element={<Sponsors />} />
                  <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/edit-request" element={<EditRequest />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-schedule" element={
                    <ProtectedRoute>
                      <MySchedulePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/schedule/user/:uid" element={<SharedSchedule />} />
                  <Route path="/attendee/:uid" element={<AttendeeProfile />} />
                  <Route path="/updates" element={<Updates />} />
                  <Route path="/updates/:slug" element={<UpdateDetail />} />
                </Routes>
              </AuthProvider>
            </ContentProvider>
          </ToastProvider>
        </BrowserRouter>
      </SplashScreen>
    </HelmetProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
