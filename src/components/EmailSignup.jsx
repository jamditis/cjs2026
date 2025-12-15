import React from 'react'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'

const EVENTBRITE_URL = 'https://www.eventbrite.com/e/2026-collaborative-journalism-summit-tickets-1977919688031?aff=oddtdtcreator'

function EmailSignup({ darkBg = false }) {
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
