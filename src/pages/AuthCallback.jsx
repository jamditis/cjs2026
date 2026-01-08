import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AuthCallback() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState('')
  const { completeSignInWithEmailLink, isEmailLink } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const url = window.location.href

      // Check if this is a valid sign-in link
      if (!isEmailLink(url)) {
        setStatus('error')
        setError('Invalid or expired sign-in link. Please request a new one.')
        return
      }

      try {
        await completeSignInWithEmailLink(url)
        setStatus('success')
        // Redirect to dashboard after brief success message
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 1500)
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        if (err.code === 'auth/invalid-action-code') {
          setError('This sign-in link has expired or already been used. Please request a new one.')
        } else if (err.code === 'auth/invalid-email') {
          setError('Email verification failed. Please try signing in again.')
        } else {
          setError('Failed to complete sign-in. Please try again.')
        }
      }
    }

    handleCallback()
  }, [completeSignInWithEmailLink, isEmailLink, navigate])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-sketch p-8">
            {status === 'processing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
                </div>
                <h1 className="editorial-headline text-2xl md:text-3xl text-brand-ink mb-4">
                  Signing you in...
                </h1>
                <p className="font-body text-brand-ink-muted">
                  Please wait while we verify your sign-in link.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-brand-teal" />
                </div>
                <h1 className="editorial-headline text-2xl md:text-3xl text-brand-ink mb-4">
                  You're signed in!
                </h1>
                <p className="font-body text-brand-ink-muted">
                  Redirecting you to your dashboard...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-brand-cardinal/10 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-brand-cardinal" />
                </div>
                <h1 className="editorial-headline text-2xl md:text-3xl text-brand-ink mb-4">
                  Sign-in failed
                </h1>
                <p className="font-body text-brand-ink-muted mb-6">
                  {error}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="py-2 px-4 rounded-lg border-2 border-brand-ink/20 font-body text-brand-ink hover:border-brand-ink/40 transition-colors"
                  >
                    Go home
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default AuthCallback
