import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react'
import { db } from '../firebase'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'

/**
 * AnnouncementBanner - Displays site-wide announcements from Firestore
 *
 * Announcements are managed in the Admin panel (/admin > Broadcast)
 * This component listens to Firestore in real-time and displays active announcements.
 *
 * Announcements are stored in localStorage when dismissed, so users don't see
 * the same announcement again (until it's updated or a new one is published).
 */
export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load dismissed announcements from localStorage
  useEffect(() => {
    let dismissedIds = []
    try {
      dismissedIds = JSON.parse(localStorage.getItem('dismissed-announcements') || '[]')
    } catch (e) {
      // localStorage may be disabled or corrupted
      dismissedIds = []
    }

    // Listen to active announcements
    const q = query(
      collection(db, 'announcements'),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setAnnouncement(null)
      } else {
        const doc = snapshot.docs[0]
        const data = { id: doc.id, ...doc.data() }

        // Check if this announcement was already dismissed
        if (dismissedIds.includes(doc.id)) {
          setAnnouncement(null)
        } else {
          setAnnouncement(data)
        }
      }
      setLoading(false)
    }, (error) => {
      console.error('Error loading announcements:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  function dismissAnnouncement() {
    if (!announcement) return

    // Save to localStorage
    try {
      const dismissedIds = JSON.parse(localStorage.getItem('dismissed-announcements') || '[]')
      dismissedIds.push(announcement.id)
      localStorage.setItem('dismissed-announcements', JSON.stringify(dismissedIds))
    } catch (e) {
      // localStorage may be disabled; continue anyway
    }

    setDismissed(true)
    setTimeout(() => setAnnouncement(null), 300) // Wait for animation
  }

  // Don't render anything while loading or if no announcement
  if (loading || !announcement || dismissed) return null

  // Type-based styling
  const typeStyles = {
    info: {
      bg: 'bg-brand-teal',
      border: 'border-brand-teal-dark',
      text: 'text-white',
      icon: Bell
    },
    warning: {
      bg: 'bg-amber-500',
      border: 'border-amber-600',
      text: 'text-white',
      icon: AlertTriangle
    },
    urgent: {
      bg: 'bg-brand-cardinal',
      border: 'border-red-800',
      text: 'text-white',
      icon: AlertCircle
    }
  }

  const style = typeStyles[announcement.type] || typeStyles.info
  const Icon = style.icon

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className={`${style.bg} ${style.border} border-b ${style.text}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="font-body text-sm font-medium truncate sm:whitespace-normal">
                  {announcement.message}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {announcement.link && (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    Learn more
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={dismissAnnouncement}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
