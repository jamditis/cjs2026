import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, BookmarkCheck, Clock, MapPin, Users, Coffee, Utensils, Mic, Lightbulb, BookOpen, Sparkles, ChevronDown, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { typeColors, sessions as allSessions } from '../content/scheduleData'

// Icon mapping for session types
const typeIcons = {
  session: Mic,
  workshop: BookOpen,
  break: Coffee,
  special: Sparkles,
  lightning: Lightbulb,
}

// Format time string - handles ISO dates or already formatted times
function formatTime(timeStr) {
  if (!timeStr) return ''

  // If it looks like an ISO date (contains 'T' or 'Z'), parse and format it
  if (timeStr.includes('T') || timeStr.includes('Z')) {
    try {
      const date = new Date(timeStr)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }
    } catch (e) {
      // Fall through to return original
    }
  }

  // Already formatted or unknown format, return as-is
  return timeStr
}

// Get badge tier based on bookmark count
// Uses consistent Users icon across all tiers for clarity
// Returns { tier, icon, bgClass, textClass, label }
function getBookmarkTier(count) {
  if (count >= 10) {
    return {
      tier: 'hot',
      icon: Users,
      bgClass: 'bg-brand-teal',
      textClass: 'text-white',
      label: `${count} attendees saved this session`
    }
  }
  if (count >= 5) {
    return {
      tier: 'popular',
      icon: Users,
      bgClass: 'bg-brand-teal/20',
      textClass: 'text-brand-teal',
      label: `${count} attendees saved this session`
    }
  }
  return {
    tier: 'normal',
    icon: Users,
    bgClass: 'bg-brand-ink/10',
    textClass: 'text-brand-ink/60',
    label: `${count} attendee${count !== 1 ? 's' : ''} saved this session`
  }
}

// Default session duration in minutes (when endTime is not specified)
const DEFAULT_SESSION_DURATION = 60

// Check if two sessions overlap in time
function sessionsOverlap(session1, session2) {
  if (!session1.startTime || !session2.startTime) return false
  if (session1.day !== session2.day) return false

  const start1 = new Date(session1.startTime).getTime()
  const start2 = new Date(session2.startTime).getTime()

  // Calculate end times, using default duration if not specified
  const end1 = session1.endTime
    ? new Date(session1.endTime).getTime()
    : start1 + DEFAULT_SESSION_DURATION * 60 * 1000
  const end2 = session2.endTime
    ? new Date(session2.endTime).getTime()
    : start2 + DEFAULT_SESSION_DURATION * 60 * 1000

  // Check for overlap: session1 starts before session2 ends AND session1 ends after session2 starts
  return start1 < end2 && end1 > start2
}

// Find conflicting sessions from user's saved sessions
function findConflicts(targetSession, savedSessionIds) {
  if (!savedSessionIds?.length) return []

  const savedSessions = allSessions.filter(s => savedSessionIds.includes(s.id))
  return savedSessions.filter(saved => sessionsOverlap(targetSession, saved))
}

function SessionCard({ session, index = 0, showSaveButton = true, compact = false, bookmarkCount = 0, onOpenDetail = null }) {
  const { currentUser, userProfile, saveSession, unsaveSession, isSessionSaved, canBookmarkSessions } = useAuth()
  const toast = useToast()

  // Use local state for optimistic UI updates
  const [localSaved, setLocalSaved] = useState(() => {
    // Initialize from context on mount
    return isSessionSaved?.(session.id) || false
  })
  const [saving, setSaving] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  // Sync local state with auth context state, but NOT while saving (to preserve optimistic update)
  useEffect(() => {
    if (!saving) {
      const saved = isSessionSaved?.(session.id) || false
      setLocalSaved(saved)
    }
  }, [session.id, userProfile?.savedSessions, saving])

  // Only allow saving for registered/confirmed users (or admins)
  const canSave = currentUser && session.isBookmarkable && showSaveButton && canBookmarkSessions()

  // Determine why user can't bookmark (for UI feedback)
  const getBookmarkBlockReason = () => {
    if (!showSaveButton || !session.isBookmarkable) return null
    if (!currentUser) return 'Sign in to save sessions'
    if (!canBookmarkSessions()) return 'Register for the conference to save sessions'
    return null
  }
  const bookmarkBlockReason = getBookmarkBlockReason()

  // Get colors for this session type
  const colors = typeColors[session.type] || typeColors.session
  const Icon = typeIcons[session.type] || Mic

  // Format times
  const formattedStartTime = formatTime(session.startTime)
  const formattedEndTime = formatTime(session.endTime)

  const handleToggleSave = async (e) => {
    e.stopPropagation()
    if (!currentUser || saving) return

    const newSavedState = !localSaved

    // Check for schedule conflicts when adding a session
    if (newSavedState) {
      const conflicts = findConflicts(session, userProfile?.savedSessions)
      if (conflicts.length > 0) {
        toast.warning(`Schedule conflict: This session overlaps with "${conflicts[0].title}"${conflicts.length > 1 ? ` and ${conflicts.length - 1} other(s)` : ''}`)
        // Still allow saving - just warn the user
      }
    }

    // Optimistic update
    setLocalSaved(newSavedState)
    setSaving(true)

    try {
      if (newSavedState) {
        await saveSession(session.id)
        toast.success('Session added to your schedule')
      } else {
        await unsaveSession(session.id)
        // Show toast with undo option for removal
        toast.info(
          <div className="flex items-center justify-between gap-3">
            <span>Session removed</span>
            <button
              onClick={async () => {
                setLocalSaved(true)
                setSaving(true)
                try {
                  await saveSession(session.id)
                } catch (err) {
                  setLocalSaved(false)
                  console.error('Undo failed:', err)
                } finally {
                  setSaving(false)
                }
              }}
              className="px-2 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Undo
            </button>
          </div>,
          { duration: 5000 }
        )
      }
    } catch (error) {
      // Revert on error
      console.error('Error toggling save:', error)
      setLocalSaved(!newSavedState)
      toast.error('Failed to update schedule')
    } finally {
      setSaving(false)
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
              <span>{formattedStartTime}{formattedEndTime && ` - ${formattedEndTime}`}</span>
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
          <div className="flex items-center gap-2 flex-shrink-0">
            {bookmarkCount > 0 && (() => {
              const tier = getBookmarkTier(bookmarkCount)
              const TierIcon = tier.icon
              return (
                <span
                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${tier.bgClass} ${tier.textClass}`}
                  title={tier.label}
                >
                  <TierIcon className="w-3 h-3" />
                  {bookmarkCount}
                </span>
              )
            })()}
            {canSave ? (
              <button
                onClick={handleToggleSave}
                disabled={saving}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                  localSaved
                    ? 'bg-brand-teal/20 text-brand-teal'
                    : 'bg-brand-ink/5 text-brand-ink/40 hover:text-brand-teal hover:bg-brand-teal/10'
                } ${saving ? 'opacity-50' : ''}`}
                title={localSaved ? 'Remove from my schedule' : 'Add to my schedule'}
              >
                {localSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            ) : bookmarkBlockReason ? (
              <span
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-brand-ink/5 text-brand-ink/30 cursor-help"
                title={bookmarkBlockReason}
              >
                <Bookmark className="w-5 h-5" />
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>
    )
  }

  // Full view for Schedule page
  return (
    <motion.div
      className={`card-sketch p-4 lg:p-5 ${colors.bg} ${colors.border}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Mobile layout: stacked */}
      <div className="lg:hidden">
        {/* Header row: time, icon, title, save button */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              colors.bg.replace('/5', '/20').replace('/10', '/20')
            } ${colors.text}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-brand-ink/60 mb-1">
              <Clock className="w-3 h-3" />
              <span>{formattedStartTime}{formattedEndTime && formattedEndTime !== formattedStartTime && ` - ${formattedEndTime}`}</span>
              {session.room && (
                <>
                  <span className="text-brand-ink/30">•</span>
                  <span>{session.room}</span>
                </>
              )}
            </div>
            <h4
              className={`font-heading font-semibold text-brand-ink text-sm leading-tight ${onOpenDetail ? 'cursor-pointer hover:text-brand-teal transition-colors' : ''}`}
              onClick={() => onOpenDetail?.(session)}
            >
              {session.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {bookmarkCount > 0 && (() => {
              const tier = getBookmarkTier(bookmarkCount)
              const TierIcon = tier.icon
              return (
                <span
                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${tier.bgClass} ${tier.textClass}`}
                  title={tier.label}
                >
                  <TierIcon className="w-3 h-3" />
                  {bookmarkCount}
                </span>
              )
            })()}
            {canSave ? (
              <button
                onClick={handleToggleSave}
                disabled={saving}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all ${
                  localSaved
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'bg-brand-ink/5 text-brand-ink/40 hover:text-brand-teal hover:bg-brand-teal/10'
                } ${saving ? 'opacity-50' : ''}`}
                title={localSaved ? 'Remove from my schedule' : 'Add to my schedule'}
              >
                {localSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            ) : bookmarkBlockReason ? (
              <span
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-brand-ink/5 text-brand-ink/30 cursor-help"
                title={bookmarkBlockReason}
              >
                <Bookmark className="w-5 h-5" />
              </span>
            ) : null}
          </div>
        </div>

        {/* Description (tap to expand on mobile) */}
        {session.description && (
          <button
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="w-full text-left mt-2 pl-11 group"
          >
            <p className={`font-body text-xs text-brand-ink/60 ${descriptionExpanded ? '' : 'line-clamp-2'}`}>
              {session.description}
            </p>
            {session.description.length > 100 && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-teal mt-1">
                <ChevronDown className={`w-3 h-3 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
                {descriptionExpanded ? 'Show less' : 'Show more'}
              </span>
            )}
          </button>
        )}

        {/* Speakers */}
        {session.speakers && (
          <div className="flex items-center gap-1 text-xs text-brand-ink/50 mt-2 pl-11">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{session.speakers}</span>
          </div>
        )}

        {/* Track badge */}
        {session.track && (
          <div className="mt-2 pl-11">
            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {session.track}
            </span>
          </div>
        )}
      </div>

      {/* Desktop layout: horizontal with time column */}
      <div className="hidden lg:flex gap-4">
        {/* Time column */}
        <div className="flex-shrink-0 w-20 text-right">
          <span className="font-body text-sm text-brand-ink/60">{formattedStartTime}</span>
          {formattedEndTime && formattedEndTime !== formattedStartTime && (
            <span className="font-body text-xs text-brand-ink/40 block">{formattedEndTime}</span>
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
              <h4
                className={`font-heading font-semibold text-brand-ink ${onOpenDetail ? 'cursor-pointer hover:text-brand-teal transition-colors' : ''}`}
                onClick={() => onOpenDetail?.(session)}
              >
                {session.title}
              </h4>

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

            {/* Bookmark count and save button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {bookmarkCount > 0 && (() => {
                const tier = getBookmarkTier(bookmarkCount)
                const TierIcon = tier.icon
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full ${tier.bgClass} ${tier.textClass} ${tier.tier === 'hot' ? 'shadow-sm' : ''}`}
                    title={tier.label}
                  >
                    <TierIcon className="w-4 h-4" />
                    {bookmarkCount}
                  </span>
                )
              })()}
              {canSave ? (
                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  className={`p-2 rounded-full transition-all ${
                    localSaved
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-brand-ink/5 text-brand-ink/40 hover:text-brand-teal hover:bg-brand-teal/10'
                  } ${saving ? 'opacity-50' : ''}`}
                  title={localSaved ? 'Remove from my schedule' : 'Add to my schedule'}
                >
                  {localSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              ) : bookmarkBlockReason ? (
                <span
                  className="p-2 rounded-full bg-brand-ink/5 text-brand-ink/30 cursor-help"
                  title={bookmarkBlockReason}
                >
                  <Bookmark className="w-5 h-5" />
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SessionCard
