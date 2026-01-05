import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MapPin, Users, Bookmark, BookmarkCheck, ExternalLink, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Modal showing full session details
 * Includes description, speakers, room, track, and bookmark functionality
 */
function SessionDetailModal({ session, isOpen, onClose, isBookmarked, onToggleBookmark, bookmarkCount = 0 }) {
  const { currentUser } = useAuth()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!session) return null

  // Session type styling
  const typeStyles = {
    keynote: { bg: 'bg-brand-cardinal/10', text: 'text-brand-cardinal', border: 'border-brand-cardinal/20' },
    session: { bg: 'bg-brand-teal/10', text: 'text-brand-teal', border: 'border-brand-teal/20' },
    lightning: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
    workshop: { bg: 'bg-brand-green-dark/10', text: 'text-brand-green-dark', border: 'border-brand-green-dark/20' },
    break: { bg: 'bg-brand-ink/5', text: 'text-brand-ink/60', border: 'border-brand-ink/10' },
    networking: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  }

  const style = typeStyles[session.type] || typeStyles.session

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-brand-ink/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full md:max-h-[85vh] bg-paper rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-brand-ink/10">
              <div className="flex-1 pr-4">
                {/* Type badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border} mb-3`}>
                  <Tag className="w-3 h-3" />
                  {session.type?.charAt(0).toUpperCase() + session.type?.slice(1)}
                </span>

                <h2 className="font-heading font-bold text-xl md:text-2xl text-brand-ink leading-tight">
                  {session.title}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-brand-ink/60" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {session.time && (
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Clock className="w-4 h-4" />
                    <span className="font-body text-sm">{session.time}</span>
                  </div>
                )}
                {session.room && (
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <MapPin className="w-4 h-4" />
                    <span className="font-body text-sm">{session.room}</span>
                  </div>
                )}
                {session.track && (
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Tag className="w-4 h-4" />
                    <span className="font-body text-sm">{session.track}</span>
                  </div>
                )}
              </div>

              {/* Speakers */}
              {session.speakers && (
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-sm text-brand-ink/50 uppercase tracking-wide mb-2">
                    Speakers
                  </h3>
                  <p className="font-body text-brand-ink">{session.speakers}</p>
                </div>
              )}

              {/* Description */}
              {session.description && (
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-sm text-brand-ink/50 uppercase tracking-wide mb-2">
                    About this session
                  </h3>
                  <p className="font-body text-brand-ink/80 leading-relaxed whitespace-pre-wrap">
                    {session.description}
                  </p>
                </div>
              )}

              {/* Day info */}
              {session.day && (
                <div className="text-sm text-brand-ink/50 font-body">
                  {session.day.charAt(0).toUpperCase() + session.day.slice(1)}, June {session.day.toLowerCase() === 'monday' ? '8' : '9'}, 2026
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="p-4 sm:p-6 border-t border-brand-ink/10 bg-brand-ink/[0.02]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                {/* Bookmark count */}
                <div className="flex items-center gap-2 text-brand-ink/50">
                  <Users className="w-4 h-4" />
                  <span className="font-body text-sm">
                    {bookmarkCount} {bookmarkCount === 1 ? 'person' : 'people'} saved this
                  </span>
                </div>

                {/* Bookmark button */}
                {currentUser && onToggleBookmark && (
                  <button
                    onClick={() => onToggleBookmark(session.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body font-medium transition-all ${
                      isBookmarked
                        ? 'bg-brand-teal text-white hover:bg-brand-teal/90'
                        : 'bg-brand-ink/5 text-brand-ink hover:bg-brand-ink/10'
                    }`}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        Save to my schedule
                      </>
                    )}
                  </button>
                )}

                {!currentUser && (
                  <a
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-body font-medium bg-brand-ink/5 text-brand-ink hover:bg-brand-ink/10 transition-all"
                  >
                    Sign in to save
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SessionDetailModal
