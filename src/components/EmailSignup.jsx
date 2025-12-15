import React from 'react'
import { motion } from 'framer-motion'
import { Ticket, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const EVENTBRITE_URL = 'https://www.eventbrite.com/e/2026-collaborative-journalism-summit-tickets-1977919688031?aff=oddtdtcreator'

function EmailSignup({ darkBg = false }) {
  const { userProfile } = useAuth()

  // If user has already purchased tickets, show confirmation instead
  if (userProfile?.ticketsPurchased) {
    return (
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${darkBg ? 'bg-white/10 text-white' : 'bg-brand-green-dark/10 text-brand-green-dark'}`}>
          <CheckCircle className="w-5 h-5" />
          <span className="font-body font-medium">Tickets purchased</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <motion.a
        href={EVENTBRITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-primary inline-flex items-center gap-2 ${darkBg ? 'bg-white text-brand-teal hover:bg-white/90' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Ticket className="w-5 h-5" />
        Get tickets
      </motion.a>
    </div>
  )
}

export default EmailSignup
