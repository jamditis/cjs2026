import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, BookmarkX, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSessionsByIds, sessionsByDay } from '../content/scheduleData'
import SessionCard from './SessionCard'

function MySchedule({ compact = false, maxSessions = null, showViewAll = true }) {
  const { userProfile } = useAuth()

  const savedSessionIds = userProfile?.savedSessions || []
  const savedSessions = getSessionsByIds(savedSessionIds)

  // Sort saved sessions by day and time
  const sortedSessions = savedSessions.sort((a, b) => {
    const dayOrder = { 'monday': 0, 'tuesday': 1 }
    const dayA = dayOrder[a.day?.toLowerCase()] ?? 2
    const dayB = dayOrder[b.day?.toLowerCase()] ?? 2
    if (dayA !== dayB) return dayA - dayB
    return a.order - b.order
  })

  // Apply max limit if specified
  const displaySessions = maxSessions ? sortedSessions.slice(0, maxSessions) : sortedSessions

  // Group by day for non-compact view
  const mondaySessions = displaySessions.filter(s => s.day?.toLowerCase() === 'monday')
  const tuesdaySessions = displaySessions.filter(s => s.day?.toLowerCase() === 'tuesday')

  if (savedSessions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-brand-ink/5 flex items-center justify-center mx-auto mb-4">
          <BookmarkX className="w-8 h-8 text-brand-ink/30" />
        </div>
        <h3 className="font-heading font-semibold text-brand-ink mb-2">No saved sessions</h3>
        <p className="font-body text-sm text-brand-ink/60 mb-4">
          Browse the schedule and bookmark sessions you want to attend.
        </p>
        <Link
          to="/schedule"
          className="inline-flex items-center gap-2 text-brand-teal hover:underline font-body text-sm"
        >
          View schedule <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (compact) {
    // Compact view for Dashboard widget
    return (
      <div className="space-y-2">
        {displaySessions.map((session, index) => (
          <SessionCard
            key={session.id}
            session={session}
            index={index}
            compact={true}
          />
        ))}
        {showViewAll && savedSessions.length > (maxSessions || 0) && (
          <Link
            to="/my-schedule"
            className="block text-center py-3 text-brand-teal hover:underline font-body text-sm"
          >
            View all {savedSessions.length} saved sessions
          </Link>
        )}
      </div>
    )
  }

  // Full view with day groupings
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-brand-ink/60">
        <span className="inline-flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {savedSessions.length} session{savedSessions.length !== 1 ? 's' : ''} saved
        </span>
        {mondaySessions.length > 0 && (
          <span>{mondaySessions.length} Monday</span>
        )}
        {tuesdaySessions.length > 0 && (
          <span>{tuesdaySessions.length} Tuesday</span>
        )}
      </div>

      {/* Monday sessions */}
      {mondaySessions.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
              <span className="font-accent text-sm text-white">1</span>
            </div>
            Monday, June 8
          </h3>
          <div className="space-y-3">
            {mondaySessions.map((session, index) => (
              <SessionCard key={session.id} session={session} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Tuesday sessions */}
      {tuesdaySessions.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
              <span className="font-accent text-sm text-white">2</span>
            </div>
            Tuesday, June 9
          </h3>
          <div className="space-y-3">
            {tuesdaySessions.map((session, index) => (
              <SessionCard key={session.id} session={session} index={index} />
            ))}
          </div>
        </div>
      )}

      {showViewAll && (
        <div className="text-center pt-4">
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 text-brand-teal hover:underline font-body"
          >
            Browse full schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default MySchedule
