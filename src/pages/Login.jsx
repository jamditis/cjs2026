import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, AlertCircle, CheckCircle, Send, Clock, Timer } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const LAST_SIGNIN_KEY = 'cjs2026_last_signin_method'
const MAGIC_LINK_COOLDOWN_KEY = 'cjs2026_magic_link_cooldown'
const COOLDOWN_SECONDS = 60

function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [lastMethod, setLastMethod] = useState(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  const { sendMagicLink, loginWithGoogle, currentUser } = useAuth()

  // Calculate remaining cooldown time
  const calculateCooldown = useCallback(() => {
    const lastSent = localStorage.getItem(MAGIC_LINK_COOLDOWN_KEY)
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000)
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed)
      return remaining
    }
    return 0
  }, [])

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      window.location.href = '/dashboard'
    }
  }, [currentUser])

  // Load last sign-in method and check cooldown
  useEffect(() => {
    const saved = localStorage.getItem(LAST_SIGNIN_KEY)
    if (saved) {
      setLastMethod(saved)
    }

    // Check initial cooldown
    setCooldownRemaining(calculateCooldown())
  }, [calculateCooldown])

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return

    const timer = setInterval(() => {
      const remaining = calculateCooldown()
      setCooldownRemaining(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownRemaining, calculateCooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Check cooldown
    const remaining = calculateCooldown()
    if (remaining > 0) {
      setError(`Please wait ${remaining} seconds before requesting another link.`)
      setCooldownRemaining(remaining)
      return
    }

    setLoading(true)

    try {
      await sendMagicLink(email)
      localStorage.setItem(LAST_SIGNIN_KEY, 'email')
      // Set cooldown timestamp
      localStorage.setItem(MAGIC_LINK_COOLDOWN_KEY, Date.now().toString())
      setCooldownRemaining(COOLDOWN_SECONDS)
      setEmailSent(true)
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else {
        setError('Failed to send sign-in link. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)

    try {
      const result = await loginWithGoogle()
      // If null, redirect is in progress OR popup was cancelled
      // For redirect, the page will reload and auth will complete
      if (result === null) {
        // Check if we're doing a redirect (loading state should stay on)
        if (localStorage.getItem('cjs2026_auth_pending')) {
          // Redirect in progress - keep loading state
          return
        }
        // Popup was cancelled - reset loading state
        setLoading(false)
        return
      }
      localStorage.setItem(LAST_SIGNIN_KEY, 'google')
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Google login error:', err)
      // Handle user-friendly error messages from AuthContext
      if (err.message && !err.code) {
        setError(err.message)
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.')
      } else {
        setError('Failed to sign in with Google. Please try the email sign-in option instead.')
      }
      setLoading(false)
    }
  }

  // Success state - email sent
  if (emailSent) {
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
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-brand-teal" />
              </div>
              <h1 className="editorial-headline text-2xl md:text-3xl text-brand-ink mb-4">
                Check your inbox
              </h1>
              <p className="font-body text-brand-ink-muted mb-6">
                We sent a sign-in link to <strong className="text-brand-ink">{email}</strong>
              </p>
              <p className="font-body text-brand-ink/50 text-sm mb-4">
                Click the link in the email to sign in. The link expires in 1 hour.
              </p>
              <motion.div
                className="bg-brand-teal/10 border-2 border-brand-teal/30 rounded-lg p-4 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  boxShadow: [
                    '0 0 0 0 rgba(42, 157, 143, 0)',
                    '0 0 20px 4px rgba(42, 157, 143, 0.3)',
                    '0 0 0 0 rgba(42, 157, 143, 0)'
                  ]
                }}
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                  boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <motion.p
                  className="font-body text-base text-brand-teal font-semibold mb-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  📬 Check your spam folder!
                </motion.p>
                <p className="font-body text-sm text-brand-ink-muted mb-1">
                  The email comes from:
                </p>
                <p className="font-mono text-sm text-brand-ink-muted mb-1">
                  noreply@cjs2026.firebaseapp.com
                </p>
                <p className="font-body text-sm text-brand-ink-muted">
                  Subject: "Sign in to cjs2026"
                </p>
              </motion.div>
              <div className="border-t-2 border-brand-ink/10 pt-6">
                <p className="font-body text-brand-ink/50 text-sm">
                  Didn't receive the email?{' '}
                  {cooldownRemaining > 0 ? (
                    <span className="text-brand-ink/40 inline-flex items-center gap-1">
                      <Timer className="w-3 h-3 inline" />
                      Wait {cooldownRemaining}s to resend
                    </span>
                  ) : (
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-brand-teal hover:underline"
                    >
                      Try again
                    </button>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  const LastUsedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-body">
      <Clock className="w-3 h-3" />
      Last used
    </span>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              Welcome back
            </h1>
            <p className="font-body text-brand-ink-muted">
              Sign in to access your attendee dashboard
            </p>
          </div>

          <div className="card-sketch p-8">
            {error && (
              <motion.div
                className="bg-brand-cardinal/10 border-2 border-brand-cardinal/30 rounded-lg p-4 mb-6 flex items-start gap-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle className="w-5 h-5 text-brand-cardinal flex-shrink-0 mt-0.5" />
                <p className="font-body text-brand-cardinal text-sm">{error}</p>
              </motion.div>
            )}

            {/* Google Sign-in - Primary option */}
            <div className="space-y-3 mb-6">
              {lastMethod === 'google' && (
                <div className="flex justify-center">
                  <LastUsedBadge />
                </div>
              )}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>
              <p className="text-center font-body text-sm text-brand-ink-muted">
                Recommended — instant sign-in
              </p>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-brand-ink/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 font-body text-sm text-brand-ink/50">or use email</span>
              </div>
            </div>

            {/* Email Sign-in - Secondary option */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="email" className="block font-body font-medium text-brand-ink">
                    Email address
                  </label>
                  {lastMethod === 'email' && <LastUsedBadge />}
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/40" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Prominent spam warning */}
              <motion.div
                className="bg-brand-gold/15 border-2 border-brand-gold/40 rounded-lg p-4"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(234, 179, 8, 0)',
                    '0 0 12px 2px rgba(234, 179, 8, 0.25)',
                    '0 0 0 0 rgba(234, 179, 8, 0)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.p
                  className="font-body text-sm text-brand-ink font-semibold mb-1"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ⚠️ Check your spam folder
                </motion.p>
                <p className="font-body text-xs text-brand-ink-muted">
                  Sign-in emails often land in spam. Look for an email from <span className="font-mono text-brand-ink/80">noreply@cjs2026.firebaseapp.com</span>
                </p>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading || cooldownRemaining > 0}
                className="w-full py-3 px-4 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink hover:border-brand-teal/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={cooldownRemaining <= 0 ? { scale: 1.02 } : {}}
                whileTap={cooldownRemaining <= 0 ? { scale: 0.98 } : {}}
              >
                {cooldownRemaining > 0 ? (
                  <>
                    <Timer className="w-4 h-4" />
                    Wait {cooldownRemaining}s
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending link...' : 'Send sign-in link'}
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <p className="text-center mt-6 font-body text-brand-ink/50 text-sm">
            <Link to="/privacy" className="text-brand-ink/50 hover:text-brand-teal hover:underline">
              Privacy policy
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default Login
