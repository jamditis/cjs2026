import React from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Clock, MapPin, Users, Coffee, Utensils, Mic, Lightbulb, BookOpen, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { typeColors } from '../content/scheduleData'

// Icon mapping for session types
const typeIcons = {
  session: Mic,
  workshop: BookOpen,
  break: Coffee,
  special: Sparkles,
  lightning: Lightbulb,
}

function SessionCard({ session, index = 0, showSaveButton = true, compact = false }) {
  const { currentUser, userProfile, saveSession, unsaveSession, isSessionSaved } = useAuth()

  const isSaved = isSessionSaved?.(session.id) || false
  const canSave = currentUser && session.isBookmarkable && showSaveButton

  // Get colors for this session type
  const colors = typeColors[session.type] || typeColors.session
  const Icon = typeIcons[session.type] || Mic

  const handleToggleSave = async (e) => {
    e.stopPropagation()
    if (!currentUser) return

    if (isSaved) {
      await unsaveSession(session.id)
    } else {
      await saveSession(session.id)
    }
  }

  if (compact) {
    // Compact view for "My Schedule" lists
    return (
      <motion.div
        className={`card-sketch p-4 ${colors.bg} ${colors.border}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg} ${colors.text}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-brand-ink/60 mb-1">
              <Clock className="w-3 h-3" />
              <span>{session.startTime}{session.endTime && ` - ${session.endTime}`}</span>
              {session.room && (
                <>
                  <span className="text-brand-ink/30">|</span>
                  <MapPin className="w-3 h-3" />
                  <span>{session.room}</span>
                </>
              )}
            </div>
            <h4 className="font-heading font-semibold text-brand-ink truncate">{session.title}</h4>
          </div>
          {canSave && (
            <button
              onClick={handleToggleSave}
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                isSaved
                  ? 'bg-brand-teal/20 text-brand-teal'
                  : 'bg-brand-ink/5 text-brand-ink/40 hover:text-brand-teal hover:bg-brand-teal/10'
              }`}
              title={isSaved ? 'Remove from my schedule' : 'Add to my schedule'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // Full view for Schedule page
  return (
    <motion.div
      className={`card-sketch p-5 ${colors.bg} ${colors.border}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex gap-4">
        {/* Time column */}
        <div className="flex-shrink-0 w-20 text-right">
          <span className="font-body text-sm text-brand-ink/60">{session.startTime}</span>
          {session.endTime && session.endTime !== session.startTime && (
            <span className="font-body text-xs text-brand-ink/40 block">{session.endTime}</span>
          )}
        </div>

        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            colors.bg.replace('/5', '/20').replace('/10', '/20')
          } ${colors.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-brand-ink">{session.title}</h4>

              {session.description && (
                <p className="font-body text-sm text-brand-ink/60 mt-1">{session.description}</p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {session.room && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-ink/50">
                    <MapPin className="w-3 h-3" />
                    {session.room}
                  </span>
                )}
                {session.speakers && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-ink/50">
                    <Users className="w-3 h-3" />
                    {session.speakers}
                  </span>
                )}
                {session.track && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {session.track}
                  </span>
                )}
              </div>
            </div>

            {/* Save button */}
            {canSave && (
              <button
                onClick={handleToggleSave}
                className={`flex-shrink-0 p-2 rounded-full transition-all ${
                  isSaved
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'bg-brand-ink/5 text-brand-ink/40 hover:text-brand-teal hover:bg-brand-teal/10'
                }`}
                title={isSaved ? 'Remove from my schedule' : 'Add to my schedule'}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SessionCard
