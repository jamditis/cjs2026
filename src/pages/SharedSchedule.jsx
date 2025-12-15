import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, Lock, ArrowLeft, AlertCircle } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SessionCard from '../components/SessionCard'
import { getSessionsByIds } from '../content/scheduleData'
import { useAuth } from '../contexts/AuthContext'

function SharedSchedule() {
  const { uid } = useParams()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [savedSessions, setSavedSessions] = useState([])

  useEffect(() => {
    async function fetchUserSchedule() {
      try {
        setLoading(true)
        setError(null)

        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          setError('User not found')
          return
        }

        const data = userSnap.data()
        const visibility = data.scheduleVisibility || 'private'

        // Check access permissions
        if (visibility === 'private') {
          // Only the owner can see private schedules
          if (!currentUser || currentUser.uid !== uid) {
            setError('This schedule is private')
            return
          }
        } else if (visibility === 'attendees_only') {
          // Only logged-in users can see attendees_only schedules
          if (!currentUser) {
            setError('login_required')
            return
          }
        }
        // public schedules are accessible to everyone

        setUserData({
          displayName: data.displayName || 'Anonymous',
          organization: data.organization,
          photoURL: data.photoURL,
        })

        // Get saved sessions
        const sessionIds = data.savedSessions || []
        const sessions = getSessionsByIds(sessionIds)

        // Sort by day and order
        const sorted = sessions.sort((a, b) => {
          const dayOrder = { 'monday': 0, 'tuesday': 1 }
          const dayA = dayOrder[a.day?.toLowerCase()] ?? 2
          const dayB = dayOrder[b.day?.toLowerCase()] ?? 2
          if (dayA !== dayB) return dayA - dayB
          return a.order - b.order
        })

        setSavedSessions(sorted)
      } catch (err) {
        console.error('Error fetching schedule:', err)
        setError('Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    if (uid) {
      fetchUserSchedule()
    }
  }, [uid, currentUser])

  // Group sessions by day
  const mondaySessions = savedSessions.filter(s => s.day?.toLowerCase() === 'monday')
  const tuesdaySessions = savedSessions.filter(s => s.day?.toLowerCase() === 'tuesday')

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 text-brand-ink/60 hover:text-brand-teal mb-6 font-body text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to schedule
          </Link>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-3 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin mx-auto mb-4" />
              <p className="font-body text-brand-ink/60">Loading schedule...</p>
            </div>
          ) : error ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-brand-cardinal/10 flex items-center justify-center mx-auto mb-4">
                {error === 'login_required' ? (
                  <Lock className="w-8 h-8 text-brand-cardinal" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-brand-cardinal" />
                )}
              </div>
              <h2 className="font-heading font-semibold text-xl text-brand-ink mb-2">
                {error === 'login_required' ? 'Login required' : 'Cannot view schedule'}
              </h2>
              <p className="font-body text-brand-ink/60 mb-6">
                {error === 'login_required'
                  ? 'This schedule is only visible to CJS attendees. Please sign in to view.'
                  : error === 'This schedule is private'
                    ? 'This user has set their schedule to private.'
                    : error}
              </p>
              {error === 'login_required' ? (
                <Link to="/login" className="btn-primary">
                  Sign in
                </Link>
              ) : (
                <Link to="/schedule" className="btn-secondary">
                  Browse full schedule
                </Link>
              )}
            </motion.div>
          ) : (
            <>
              {/* User info header */}
              <motion.div
                className="card-sketch p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center overflow-hidden">
                    {userData?.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-brand-teal" />
                    )}
                  </div>
                  <div>
                    <h1 className="font-heading font-semibold text-2xl text-brand-ink">
                      {userData?.displayName}'s schedule
                    </h1>
                    {userData?.organization && (
                      <p className="font-body text-brand-ink/60">
                        {userData.organization}
                      </p>
                    )}
                    <p className="font-body text-sm text-brand-ink/50 mt-1">
                      {savedSessions.length} session{savedSessions.length !== 1 ? 's' : ''} saved
                    </p>
                  </div>
                </div>
              </motion.div>

              {savedSessions.length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-brand-ink/5 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-brand-ink/30" />
                  </div>
                  <p className="font-body text-brand-ink/60">
                    No sessions saved yet.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* Monday sessions */}
                  {mondaySessions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="font-heading font-semibold text-lg text-brand-ink mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
                          <span className="font-accent text-sm text-white">1</span>
                        </div>
                        Monday, June 8
                      </h2>
                      <div className="space-y-3">
                        {mondaySessions.map((session, index) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            index={index}
                            showSaveButton={false}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tuesday sessions */}
                  {tuesdaySessions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="font-heading font-semibold text-lg text-brand-ink mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
                          <span className="font-accent text-sm text-white">2</span>
                        </div>
                        Tuesday, June 9
                      </h2>
                      <div className="space-y-3">
                        {tuesdaySessions.map((session, index) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            index={index}
                            showSaveButton={false}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SharedSchedule
