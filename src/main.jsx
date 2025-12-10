import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, Schedule, Sponsors, CodeOfConduct, Contact, Login, AuthCallback, Dashboard, EditRequest, PrivacyPolicy, Admin } from './pages'
import { SplashScreen, ProtectedRoute } from './components'
import { AuthProvider } from './contexts/AuthContext'
import { ContentProvider } from './contexts/ContentContext'
import './index.css'

function App() {
  const [splashComplete, setSplashComplete] = React.useState(false)

  return (
    <SplashScreen onComplete={() => setSplashComplete(true)}>
      <BrowserRouter>
        <ContentProvider>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/code-of-conduct" element={<CodeOfConduct />} />
            <Route path="/contact" element={<Contact />} />
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
            </Routes>
          </AuthProvider>
        </ContentProvider>
      </BrowserRouter>
    </SplashScreen>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
