import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Building, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Register() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)

    try {
      await signup(formData.email, formData.password, formData.displayName, {
        organization: formData.organization,
      })
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      console.error('Google signup error:', err)
      setError('Failed to sign up with Google. Please try again.')
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
          <div className="text-center mb-8">
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              Create an account
            </h1>
            <p className="font-body text-brand-ink/60">
              Join us for the 10th anniversary summit
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="displayName" className="block font-body font-medium text-brand-ink mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/40" />
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block font-body font-medium text-brand-ink mb-2">
                  Organization <span className="text-brand-ink/40">(optional)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/40" />
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="Your news organization"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block font-body font-medium text-brand-ink mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/40" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block font-body font-medium text-brand-ink mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="font-body text-xs text-brand-ink/50 mt-1">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-body font-medium text-brand-ink mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="••••••••"
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
                {loading ? 'Creating account...' : 'Create account'}
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-brand-ink/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 font-body text-sm text-brand-ink/50">or</span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink hover:border-brand-teal/50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            <p className="text-center mt-4 font-body text-xs text-brand-ink/50">
              By creating an account, you agree to our code of conduct.
            </p>
          </div>

          <p className="text-center mt-6 font-body text-brand-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-teal hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default Register
