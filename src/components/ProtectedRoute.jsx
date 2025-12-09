import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-body text-brand-ink/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    // Redirect to login, but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
