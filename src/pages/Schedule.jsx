import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Filter, X, Clock, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SessionCard from '../components/SessionCard'
import { sessionsByDay, sessionTypes, sessionTracks, metadata } from '../content/scheduleData'
import { useAuth } from '../contexts/AuthContext'

function Schedule() {
  const { currentUser } = useAuth()
  const [activeFilters, setActiveFilters] = useState({
    types: [],
    tracks: [],
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filter sessions based on active filters
  const filterSessions = (sessions) => {
    return sessions.filter(session => {
      // Type filter
      if (activeFilters.types.length > 0 && !activeFilters.types.includes(session.type)) {
        return false
      }
      // Track filter
      if (activeFilters.tracks.length > 0 && session.track && !activeFilters.tracks.includes(session.track)) {
        return false
      }
      return true
    })
  }

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category]
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [category]: updated }
    })
  }

  const clearFilters = () => {
    setActiveFilters({ types: [], tracks: [] })
  }

  const hasActiveFilters = activeFilters.types.length > 0 || activeFilters.tracks.length > 0
  const filteredMonday = filterSessions(sessionsByDay.monday || [])
  const filteredTuesday = filterSessions(sessionsByDay.tuesday || [])

  // Check if there are any sessions at all (not just filtered)
  const hasAnySessions = (sessionsByDay.monday?.length || 0) + (sessionsByDay.tuesday?.length || 0) > 0

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="editorial-headline text-4xl md:text-5xl text-brand-ink mb-4">
              Schedule
            </h1>
            <p className="font-body text-brand-ink/60 text-lg max-w-2xl mx-auto">
              Two days of sessions, workshops, and networking. Programming details will be announced in spring 2026.
            </p>
            {currentUser && (
              <p className="font-body text-sm text-brand-teal mt-2">
                Click the bookmark icon on any session to add it to your personal schedule.
              </p>
            )}
          </motion.div>

          {/* Event info cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <motion.div
              className="card-sketch p-6 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="font-heading font-semibold text-brand-ink">June 8-9, 2026</p>
                <p className="font-body text-sm text-brand-ink/60">Monday & Tuesday</p>
              </div>
            </motion.div>

            <motion.div
              className="card-sketch p-6 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="font-heading font-semibold text-brand-ink">UNC Friday Center</p>
                <p className="font-body text-sm text-brand-ink/60">Chapel Hill, North Carolina</p>
              </div>
            </motion.div>
          </div>

          {/* Coming soon state - when no sessions are published yet */}
          {!hasAnySessions && (
            <motion.div
              className="card-sketch p-8 md:p-12 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-brand-teal" />
              </div>
              <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">
                Schedule coming soon
              </h2>
              <p className="font-body text-brand-ink/70 max-w-md mx-auto mb-6">
                We're putting together an incredible lineup of sessions, workshops, and speakers for CJS 2026. Check back soon for the full schedule.
              </p>
              <a
                href="https://collaborativejournalism.us5.list-manage.com/subscribe?u=7f46611cb324e9e193acda7cc&id=2e8bb60c9c"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-brand-teal/5 border-2 border-brand-teal/20 rounded-lg p-6 max-w-md mx-auto hover:border-brand-teal/40 hover:bg-brand-teal/10 transition-colors"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-brand-teal" />
                  <p className="font-body font-medium text-brand-ink">Stay in the loop</p>
                </div>
                <p className="font-body text-sm text-brand-ink/60">
                  Sign up for the Collaborative Journalism Newsletter for updates on CJS 2026 and all things collaboration.
                </p>
              </a>
            </motion.div>
          )}

          {/* Show schedule content only when sessions exist */}
          {hasAnySessions && (
            <>
              {/* Filters */}
              {(sessionTypes.length > 1 || sessionTracks.length > 0) && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 font-body text-sm text-brand-ink/60 hover:text-brand-teal transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide filters' : 'Filter sessions'}
                    {hasActiveFilters && (
                      <span className="bg-brand-teal text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFilters.types.length + activeFilters.tracks.length}
                      </span>
                    )}
                  </button>

                  {showFilters && (
                    <div className="mt-4 p-4 card-sketch bg-white/50">
                      {/* Type filters */}
                      {sessionTypes.length > 1 && (
                        <div className="mb-4">
                          <p className="font-body text-xs text-brand-ink/50 uppercase tracking-wide mb-2">Session type</p>
                          <div className="flex flex-wrap gap-2">
                            {sessionTypes.map(type => (
                              <button
                                key={type}
                                onClick={() => toggleFilter('types', type)}
                                className={`px-3 py-1.5 rounded-full text-sm font-body transition-colors ${
                                  activeFilters.types.includes(type)
                                    ? 'bg-brand-teal text-white'
                                    : 'bg-brand-ink/5 text-brand-ink/60 hover:bg-brand-ink/10'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Track filters */}
                      {sessionTracks.length > 0 && (
                        <div className="mb-4">
                          <p className="font-body text-xs text-brand-ink/50 uppercase tracking-wide mb-2">Track</p>
                          <div className="flex flex-wrap gap-2">
                            {sessionTracks.map(track => (
                              <button
                                key={track}
                                onClick={() => toggleFilter('tracks', track)}
                                className={`px-3 py-1.5 rounded-full text-sm font-body transition-colors ${
                                  activeFilters.tracks.includes(track)
                                    ? 'bg-brand-teal text-white'
                                    : 'bg-brand-ink/5 text-brand-ink/60 hover:bg-brand-ink/10'
                                }`}
                              >
                                {track}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1 text-sm text-brand-cardinal hover:underline"
                        >
                          <X className="w-3 h-3" />
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Preliminary notice */}
              <motion.div
                className="bg-brand-cardinal/10 border-2 border-brand-cardinal/20 rounded-lg p-6 mb-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-accent text-xl text-brand-cardinal mb-2">Preliminary schedule</p>
                <p className="font-body text-brand-ink/70">
                  Session topics and speakers will be announced in spring 2026. Sign up for updates to be the first to know.
                </p>
              </motion.div>

              {/* Monday */}
              {filteredMonday.length > 0 && (
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
                      <span className="font-accent text-xl text-white">1</span>
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-2xl text-brand-ink">Monday, June 8</h2>
                      <p className="font-body text-brand-ink/60">Main summit day</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredMonday.map((session, index) => (
                      <SessionCard key={session.id} session={session} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tuesday */}
              {filteredTuesday.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
                      <span className="font-accent text-xl text-white">2</span>
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-2xl text-brand-ink">Tuesday, June 9</h2>
                      <p className="font-body text-brand-ink/60">Workshop day</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredTuesday.map((session, index) => (
                      <SessionCard key={session.id} session={session} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* No results message - only when filters are active */}
              {hasActiveFilters && filteredMonday.length === 0 && filteredTuesday.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="font-body text-brand-ink/60 mb-4">No sessions match your filters.</p>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary text-sm"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* INN Days note */}
          <motion.div
            className="mt-12 card-sketch p-8 text-center bg-brand-green-dark/5 border-brand-green-dark/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-heading font-semibold text-xl text-brand-green-dark mb-2">
              Co-located with INN Days
            </h3>
            <p className="font-body text-brand-ink/70 mb-4">
              INN Days runs June 9-11 at the same venue. Attend both events in one trip.
            </p>
            <a
              href="https://inn.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-brand-green-dark hover:underline"
            >
              Learn more about INN Days
            </a>
          </motion.div>

          {/* Metadata footer */}
          {metadata && (
            <p className="text-center text-xs text-brand-ink/30 mt-8 font-body">
              {metadata.totalSessions} sessions | Last updated {new Date(metadata.generatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Schedule
