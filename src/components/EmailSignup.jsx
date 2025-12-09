import React, { useState } from 'react'
import { motion } from 'framer-motion'

// Cloud Function URL
const SAVE_EMAIL_URL = 'https://us-central1-cjs2026.cloudfunctions.net/saveEmailSignup'

function EmailSignup({ darkBg = false }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(SAVE_EMAIL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'CJS 2026 Website'
        })
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving email:', error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        className={`rounded-lg p-4 text-center border-2 ${darkBg ? 'bg-white/10 border-white/30' : 'bg-brand-teal/10 border-brand-teal/30'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className={`font-accent text-xl ${darkBg ? 'text-white' : 'text-brand-teal'}`}>
          Thanks! We'll keep you posted.
        </p>
      </motion.div>
    )
  }

  if (status === 'error') {
    return (
      <motion.div
        className="rounded-lg p-4 text-center border-2 bg-brand-cardinal/10 border-brand-cardinal/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="font-body text-brand-cardinal">
          Something went wrong. Please try again or email us directly.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-sm text-brand-cardinal underline"
        >
          Try again
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className={`flex-1 px-4 py-3 rounded-lg border-2 outline-none transition-all font-body
          ${darkBg
            ? 'bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white'
            : 'bg-white border-brand-ink/20 text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal'
          }`}
      />
      <motion.button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary whitespace-nowrap disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {status === 'loading' ? 'Signing up...' : 'Notify me'}
      </motion.button>
    </form>
  )
}

export default EmailSignup
