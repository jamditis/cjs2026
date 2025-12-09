import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      console.error('Password reset error:', err)
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-body text-brand-ink/60 hover:text-brand-teal mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="text-center mb-8">
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              Reset password
            </h1>
            <p className="font-body text-brand-ink/60">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <div className="card-sketch p-8">
            {success ? (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-brand-teal" />
                </div>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mb-2">
                  Check your email
                </h2>
                <p className="font-body text-brand-ink/60 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="font-body text-sm text-brand-ink/50">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                    }}
                    className="text-brand-teal hover:underline"
                  >
                    Try again
                  </button>
                </p>
              </motion.div>
            ) : (
              <>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block font-body font-medium text-brand-ink mb-2">
                      Email address
                    </label>
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

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default ForgotPassword
