import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Feather, Bell, AlertTriangle, AlertCircle } from 'lucide-react'
import { db } from '../firebase'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { getContent } from '../content/siteContent'

// Type-based styling for announcements
const typeStyles = {
  info: {
    bg: 'bg-brand-teal/10',
    border: 'border-brand-teal/30',
    text: 'text-brand-teal',
    icon: Bell
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-600',
    icon: AlertTriangle
  },
  urgent: {
    bg: 'bg-brand-cardinal/10',
    border: 'border-brand-cardinal/30',
    text: 'text-brand-cardinal',
    icon: AlertCircle
  }
}

/**
 * HeroAnnouncement - Displays announcements inline in the hero section
 *
 * When an announcement is active:
 *   - Announcement appears in a styled badge
 *   - The "10th anniversary" badge moves below it
 *
 * When dismissed or no announcement:
 *   - Only the anniversary badge shows in its original position
 *
 * Supports rich text via `htmlMessage` field (sanitized HTML with links)
 */
export default function HeroAnnouncement() {
  const [announcement, setAnnouncement] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed-announcements') || '[]')

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

    const dismissedIds = JSON.parse(localStorage.getItem('dismissed-announcements') || '[]')
    dismissedIds.push(announcement.id)
    localStorage.setItem('dismissed-announcements', JSON.stringify(dismissedIds))

    setDismissed(true)
    setTimeout(() => setAnnouncement(null), 300)
  }

  const showAnnouncement = !loading && announcement && !dismissed
  const badgeText = getContent('details', 'badge_text', '10th anniversary edition')

  // Get type-based styling (default to info)
  const style = typeStyles[announcement?.type] || typeStyles.info
  const TypeIcon = style.icon

  return (
    <div className="flex flex-col items-center gap-4 mb-10">
      {/* Announcement badge (when active) */}
      <AnimatePresence mode="wait">
        {showAnnouncement && (
          <motion.div
            key="announcement"
            className={`relative inline-flex items-center gap-3 ${style.bg} border-2 ${style.border} rounded-xl pl-4 pr-3 py-2.5 max-w-lg`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Type icon */}
            <TypeIcon className={`w-4 h-4 ${style.text} flex-shrink-0`} />

            {/* Rich text content */}
            <div
              className={`${style.text} font-body font-medium text-sm sm:text-base announcement-content`}
              dangerouslySetInnerHTML={{
                __html: announcement.htmlMessage || announcement.message
              }}
            />

            {/* Dismiss button */}
            <button
              onClick={dismissAnnouncement}
              className={`p-1.5 rounded-full hover:${style.bg} transition-colors flex-shrink-0`}
              aria-label="Dismiss announcement"
            >
              <X className={`w-4 h-4 ${style.text} opacity-60 hover:opacity-100`} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anniversary badge (always visible) */}
      <motion.div
        className="inline-flex items-center gap-2 bg-brand-cardinal/10 border-2 border-brand-cardinal/30 rounded-full px-5 py-2 transform hover:scale-105 transition-transform cursor-default"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: showAnnouncement ? 0.1 : 0.7 }}
      >
        <Feather className="w-4 h-4 text-brand-cardinal" />
        <span className="text-brand-cardinal font-body font-medium">{badgeText}</span>
      </motion.div>
    </div>
  )
}
