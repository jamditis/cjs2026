import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Loader2, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileSetupModal() {
  const { currentUser, completeProfileSetup, skipProfileSetup } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)')
      return
    }

    setLoading(true)
    setError('')

    try {
      await completeProfileSetup(displayName.trim())
      // Success - the modal will automatically disappear when needsProfileSetup becomes false
    } catch (err) {
      console.error('Profile setup error:', err)
      setError(err.message || 'Failed to save profile. Please try again.')
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-paper rounded-lg shadow-xl max-w-md w-full p-6 md:p-8 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Skip button */}
        <button
          onClick={skipProfileSetup}
          className="absolute top-4 right-4 p-2 text-brand-ink/40 hover:text-brand-ink/70
                   hover:bg-brand-ink/5 rounded-full transition-colors"
          title="Skip for now"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-teal/10 flex items-center justify-center">
            <User className="w-8 h-8 text-brand-teal" />
          </div>
          <h2 className="font-heading text-2xl text-brand-ink mb-2">
            Complete your profile
          </h2>
          <p className="font-body text-brand-ink/70">
            Add your name so other attendees can find you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-brand-ink mb-1">
              Your full name <span className="text-brand-cardinal">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Jane Smith"
              className="w-full px-4 py-3 border-2 border-brand-ink/20 rounded-lg font-body
                       focus:outline-none focus:border-brand-teal bg-white
                       placeholder:text-brand-ink/40"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-brand-ink mb-1">
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-3 border-2 border-brand-ink/10 rounded-lg font-body
                       bg-brand-cream/50 text-brand-ink/70"
            />
            <p className="font-body text-xs text-brand-ink/50 mt-1">
              This is the email you signed in with
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="font-body text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full py-3 px-4 bg-brand-teal text-white font-body font-semibold
                     rounded-lg hover:bg-brand-teal/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to dashboard'
            )}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          <p className="font-body text-xs text-brand-ink/50">
            You can add more details to your profile later.
          </p>
          <button
            type="button"
            onClick={skipProfileSetup}
            disabled={loading}
            className="font-body text-sm text-brand-ink/60 hover:text-brand-teal underline
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
