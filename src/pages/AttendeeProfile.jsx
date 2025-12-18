import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Building,
  Globe,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Lock,
  ExternalLink
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'

// Social icons
const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const BlueskyIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
  </svg>
)

function AttendeeProfile() {
  const { uid } = useParams()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)

        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          setError('Profile not found')
          return
        }

        const data = userSnap.data()

        // Check if profile is visible (based on scheduleVisibility for now)
        const visibility = data.scheduleVisibility || 'private'

        if (visibility === 'private') {
          if (!currentUser || currentUser.uid !== uid) {
            setError('This profile is private')
            return
          }
        } else if (visibility === 'attendees_only') {
          if (!currentUser) {
            setError('login_required')
            return
          }
        }

        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (uid) {
      fetchProfile()
    }
  }, [uid, currentUser])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
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
              <p className="font-body text-brand-ink/60">Loading profile...</p>
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
                {error === 'login_required' ? 'Login required' : 'Cannot view profile'}
              </h2>
              <p className="font-body text-brand-ink/60 mb-6">
                {error === 'login_required'
                  ? 'This profile is only visible to CJS attendees. Please sign in to view.'
                  : error === 'This profile is private'
                    ? 'This user has set their profile to private.'
                    : error}
              </p>
              {error === 'login_required' ? (
                <Link to="/login" className="btn-primary">
                  Sign in
                </Link>
              ) : (
                <Link to="/schedule" className="btn-secondary">
                  Browse schedule
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Profile card */}
              <div className="card-sketch p-8 text-center">
                {/* Photo */}
                <div className="w-32 h-32 rounded-full bg-brand-teal/10 flex items-center justify-center overflow-hidden mx-auto mb-6">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt=""
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-brand-teal" />
                  )}
                </div>

                {/* Name */}
                <h1 className="font-heading font-bold text-3xl text-brand-ink mb-2">
                  {profile?.displayName || 'Anonymous'}
                </h1>

                {/* Organization */}
                {profile?.organization && (
                  <p className="font-body text-lg text-brand-ink/70 mb-4 flex items-center justify-center gap-2">
                    <Building className="w-5 h-5" />
                    {profile.organization}
                  </p>
                )}

                {/* Job title (check both new jobTitle and old role field, excluding system roles) */}
                {(profile?.jobTitle || (profile?.role && !['admin', 'super_admin'].includes(profile.role))) && (
                  <p className="font-body text-brand-ink/60 mb-6">
                    {profile.jobTitle || profile.role}
                  </p>
                )}

                {/* Badges */}
                {profile?.badges && profile.badges.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {profile.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-body"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social links */}
                <div className="flex justify-center gap-4 pt-6 border-t border-brand-ink/10">
                  {profile?.website && (
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-brand-ink/5 text-brand-ink/60 hover:bg-brand-teal/10 hover:text-brand-teal transition-colors"
                      title="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-brand-ink/5 text-brand-ink/60 hover:bg-brand-teal/10 hover:text-brand-teal transition-colors"
                      title="Instagram"
                    >
                      <InstagramIcon />
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-brand-ink/5 text-brand-ink/60 hover:bg-brand-teal/10 hover:text-brand-teal transition-colors"
                      title="LinkedIn"
                    >
                      <LinkedInIcon />
                    </a>
                  )}
                  {profile?.bluesky && (
                    <a
                      href={`https://bsky.app/profile/${profile.bluesky}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-brand-ink/5 text-brand-ink/60 hover:bg-brand-teal/10 hover:text-brand-teal transition-colors"
                      title="Bluesky"
                    >
                      <BlueskyIcon />
                    </a>
                  )}
                </div>

                {/* View schedule link */}
                {profile?.savedSessions && profile.savedSessions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-brand-ink/10">
                    <Link
                      to={`/schedule/user/${uid}`}
                      className="inline-flex items-center gap-2 text-brand-teal hover:underline font-body"
                    >
                      <Calendar className="w-4 h-4" />
                      View their schedule ({profile.savedSessions.length} sessions)
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default AttendeeProfile
