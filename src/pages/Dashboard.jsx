import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  LogOut,
  Ticket,
  Users,
  FileText,
  Building,
  Globe,
  Twitter,
  Linkedin,
  AtSign,
  Award,
  X,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ============================================
// Badge Definitions
// ============================================
const BADGE_CATEGORIES = {
  experience: {
    label: 'Collaboration experience',
    badges: [
      { id: 'collab-curious', label: 'Collab Curious', emoji: '🌱', description: 'New to collaborative journalism' },
      { id: 'collab-practitioner', label: 'Practitioner', emoji: '🤝', description: 'Actively collaborating' },
      { id: 'collab-veteran', label: 'Veteran', emoji: '🎖️', description: '3+ collaborations under my belt' },
      { id: 'collab-evangelist', label: 'Evangelist', emoji: '📣', description: 'Spreading the collab gospel' },
    ]
  },
  role: {
    label: 'Role',
    badges: [
      { id: 'role-reporter', label: 'Reporter', emoji: '📝', description: 'On the ground' },
      { id: 'role-editor', label: 'Editor', emoji: '✂️', description: 'Making it better' },
      { id: 'role-leadership', label: 'Leadership', emoji: '🧭', description: 'Setting direction' },
      { id: 'role-funder', label: 'Funder', emoji: '💰', description: 'Supporting the work' },
      { id: 'role-academic', label: 'Academic', emoji: '🎓', description: 'Research & teaching' },
      { id: 'role-technologist', label: 'Technologist', emoji: '💻', description: 'Building tools' },
    ]
  },
  attendance: {
    label: 'CJS attendance',
    badges: [
      { id: 'cjs-first-timer', label: 'First Timer', emoji: '👋', description: 'My first CJS!' },
      { id: 'cjs-returning', label: 'Returning', emoji: '🔄', description: '2-3 summits' },
      { id: 'cjs-regular', label: 'Regular', emoji: '⭐', description: '4+ summits' },
      { id: 'cjs-og', label: 'OG', emoji: '🏆', description: 'Since 2017' },
    ]
  },
  values: {
    label: 'Values & perspectives',
    badges: [
      { id: 'value-cooperation', label: 'Cooperation > Competition', emoji: '🤲', description: 'Rising tides lift all boats' },
      { id: 'value-public-good', label: 'Public Good', emoji: '🌍', description: 'Journalism as public service' },
      { id: 'value-indie', label: 'Indie Spirit', emoji: '🏴', description: 'Independent & nonprofit' },
      { id: 'value-local-first', label: 'Local First', emoji: '🏘️', description: 'Community journalism advocate' },
      { id: 'value-open-source', label: 'Open Source', emoji: '🔓', description: 'Share the tools' },
      { id: 'value-solidarity', label: 'Solidarity', emoji: '✊', description: 'Workers unite' },
      { id: 'value-disruptor', label: 'Disruptor', emoji: '💥', description: 'Break the old models' },
      { id: 'value-bridge-builder', label: 'Bridge Builder', emoji: '🌉', description: 'Connecting communities' },
    ]
  },
  fun: {
    label: 'Just for fun',
    badges: [
      { id: 'fun-coffee', label: 'Coffee Powered', emoji: '☕', description: 'Runs on caffeine' },
      { id: 'fun-night-owl', label: 'Night Owl', emoji: '🦉', description: 'Best work after midnight' },
      { id: 'fun-early-bird', label: 'Early Bird', emoji: '🐦', description: 'Dawn deadlines' },
      { id: 'fun-spreadsheet', label: 'Spreadsheet Nerd', emoji: '📊', description: 'Pivot tables are my passion' },
    ]
  }
}

const ALL_BADGES = Object.values(BADGE_CATEGORIES).flatMap(cat => cat.badges)

function Dashboard() {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    displayName: '',
    organization: '',
    role: '',
    website: '',
    twitter: '',
    linkedin: '',
    bluesky: '',
    badges: [],
  })
  const [saving, setSaving] = useState(false)
  const [showBadgePicker, setShowBadgePicker] = useState(false)

  // Tutorial state
  const [tutorialState, setTutorialState] = useState(() => {
    const saved = localStorage.getItem('cjs2026_profile_tutorial')
    return saved ? JSON.parse(saved) : { dismissed: false, completed: false, skipUntilComplete: false }
  })

  const isProfileIncomplete = !userProfile?.displayName
  const showTutorial = isProfileIncomplete && !tutorialState.dismissed && !tutorialState.skipUntilComplete

  // Initialize edit data when profile loads
  useEffect(() => {
    if (userProfile) {
      setEditData({
        displayName: userProfile.displayName || '',
        organization: userProfile.organization || '',
        role: userProfile.role || '',
        website: userProfile.website || '',
        twitter: userProfile.twitter || '',
        linkedin: userProfile.linkedin || '',
        bluesky: userProfile.bluesky || '',
        badges: userProfile.badges || [],
      })
    }
  }, [userProfile])

  // Auto-open edit mode if profile is incomplete
  useEffect(() => {
    if (isProfileIncomplete && !editing) {
      setEditing(true)
    }
  }, [isProfileIncomplete])

  function dismissTutorial(permanently = false) {
    const newState = permanently
      ? { dismissed: true, completed: false, skipUntilComplete: false }
      : { dismissed: false, completed: false, skipUntilComplete: true }
    setTutorialState(newState)
    localStorage.setItem('cjs2026_profile_tutorial', JSON.stringify(newState))
  }

  function completeTutorial() {
    const newState = { dismissed: false, completed: true, skipUntilComplete: false }
    setTutorialState(newState)
    localStorage.setItem('cjs2026_profile_tutorial', JSON.stringify(newState))
  }

  // Reset skip state on new session if profile still incomplete
  useEffect(() => {
    if (isProfileIncomplete && tutorialState.skipUntilComplete) {
      const sessionKey = sessionStorage.getItem('cjs2026_session')
      if (!sessionKey) {
        sessionStorage.setItem('cjs2026_session', Date.now().toString())
        setTutorialState(prev => ({ ...prev, skipUntilComplete: false }))
        localStorage.setItem('cjs2026_profile_tutorial', JSON.stringify({ ...tutorialState, skipUntilComplete: false }))
      }
    }
  }, [isProfileIncomplete, tutorialState])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(currentUser.uid, editData)
      setEditing(false)
      if (editData.displayName) {
        completeTutorial()
      }
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  function toggleBadge(badgeId) {
    setEditData(prev => {
      const current = prev.badges || []
      if (current.includes(badgeId)) {
        return { ...prev, badges: current.filter(id => id !== badgeId) }
      } else if (current.length < 3) {
        return { ...prev, badges: [...current, badgeId] }
      }
      return prev
    })
  }

  const registrationStatus = userProfile?.registrationStatus || 'pending'

  const statusConfig = {
    pending: {
      label: 'Registration pending',
      color: 'brand-cardinal',
      icon: AlertCircle,
      description: 'Registration opens in early 2026',
    },
    registered: {
      label: 'Registered',
      color: 'brand-teal',
      icon: CheckCircle,
      description: 'Your spot is reserved',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'brand-green-dark',
      icon: CheckCircle,
      description: 'See you in Chapel Hill!',
    },
  }

  const status = statusConfig[registrationStatus]
  const StatusIcon = status.icon

  // Get badge objects from IDs
  const selectedBadges = (editData.badges || []).map(id => ALL_BADGES.find(b => b.id === id)).filter(Boolean)
  const displayBadges = (userProfile?.badges || []).map(id => ALL_BADGES.find(b => b.id === id)).filter(Boolean)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              {userProfile?.displayName
                ? `Welcome, ${userProfile.displayName.split(' ')[0]}`
                : 'Welcome'}
            </h1>
            <p className="font-body text-brand-ink/60">
              Manage your summit registration and profile
            </p>
          </motion.div>

          {/* Tutorial prompt with dismiss options */}
          <AnimatePresence>
            {showTutorial && (
              <motion.div
                className="mb-6 p-4 bg-brand-teal/10 border-2 border-brand-teal/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-body font-medium text-brand-ink">Complete your profile</p>
                      <p className="font-body text-sm text-brand-ink/60">
                        Add your name and info so other attendees can connect with you.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 text-xs">
                    <button
                      onClick={() => dismissTutorial(false)}
                      className="text-brand-ink/50 hover:text-brand-ink transition-colors whitespace-nowrap"
                    >
                      I'll do this later
                    </button>
                    <button
                      onClick={() => dismissTutorial(true)}
                      className="text-brand-ink/40 hover:text-brand-ink/60 transition-colors whitespace-nowrap"
                    >
                      I know what I'm doing
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Registration status card */}
              <motion.div
                className="card-sketch p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${status.color}/10 flex items-center justify-center`}>
                    <StatusIcon className={`w-6 h-6 text-${status.color}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading font-semibold text-xl text-brand-ink mb-1">
                      {status.label}
                    </h2>
                    <p className="font-body text-brand-ink/60 mb-4">
                      {status.description}
                    </p>

                    {registrationStatus === 'pending' && (
                      <div className="bg-white rounded-lg p-4 border border-brand-ink/10">
                        <p className="font-body text-sm text-brand-ink/70 mb-3">
                          Sign up for updates to be notified when registration opens.
                        </p>
                        <Link
                          to="/#updates"
                          className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          Get notified
                        </Link>
                      </div>
                    )}

                    {registrationStatus === 'registered' && (
                      <div className="bg-white rounded-lg p-4 border border-brand-ink/10">
                        <p className="font-body text-sm text-brand-ink/70">
                          Complete your registration by paying the registration fee.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Event details */}
              <motion.div
                className="card-sketch p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-heading font-semibold text-xl text-brand-ink mb-4">
                  Event details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-brand-ink">June 8–9, 2026</p>
                      <p className="font-body text-sm text-brand-ink/60">Monday & Tuesday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-brand-ink">UNC Friday Center</p>
                      <p className="font-body text-sm text-brand-ink/60">Chapel Hill, North Carolina</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-brand-ink">8:00 AM – 7:00 PM</p>
                      <p className="font-body text-sm text-brand-ink/60">Full schedule coming soon</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick links */}
              <motion.div
                className="grid sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/schedule"
                  className="card-sketch p-5 hover:border-brand-teal/50 transition-colors flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-brand-ink">Schedule</p>
                    <p className="font-body text-sm text-brand-ink/60">View sessions & workshops</p>
                  </div>
                </Link>
                <Link
                  to="/code-of-conduct"
                  className="card-sketch p-5 hover:border-brand-teal/50 transition-colors flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-brand-ink">Code of conduct</p>
                    <p className="font-body text-sm text-brand-ink/60">Community guidelines</p>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile card with tutorial glow */}
              <motion.div
                className={`card-sketch p-6 relative ${showTutorial ? 'ring-2 ring-brand-teal ring-offset-2' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Pulsing glow effect for tutorial */}
                {showTutorial && (
                  <motion.div
                    className="absolute -inset-1 bg-brand-teal/20 rounded-xl -z-10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-lg text-brand-ink">
                    Your profile
                  </h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-brand-teal hover:text-brand-teal-dark transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Name <span className="text-brand-cardinal">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
                        <input
                          type="text"
                          value={editData.displayName}
                          onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                          required
                          placeholder="Your full name"
                          className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
                        <input
                          type="text"
                          value={editData.organization}
                          onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                          placeholder="Your news organization"
                          className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Role/Title
                      </label>
                      <input
                        type="text"
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        placeholder="e.g. Editor, Reporter, Director"
                        className="w-full px-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Social links with forced prefixes */}
                    <div className="border-t-2 border-brand-ink/10 pt-4 mt-4">
                      <p className="font-body text-xs text-brand-ink/50 mb-3">Social links (optional)</p>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">Website</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50">
                              https://
                            </span>
                            <input
                              type="text"
                              value={editData.website}
                              onChange={(e) => setEditData({ ...editData, website: e.target.value.replace(/^https?:\/\//, '') })}
                              placeholder="yoursite.com"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">Twitter/X</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50">
                              @
                            </span>
                            <input
                              type="text"
                              value={editData.twitter}
                              onChange={(e) => setEditData({ ...editData, twitter: e.target.value.replace(/^@/, '') })}
                              placeholder="username"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">LinkedIn</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50 whitespace-nowrap">
                              linkedin.com/in/
                            </span>
                            <input
                              type="text"
                              value={editData.linkedin}
                              onChange={(e) => setEditData({ ...editData, linkedin: e.target.value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '') })}
                              placeholder="username"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">Bluesky</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50">
                              @
                            </span>
                            <input
                              type="text"
                              value={editData.bluesky}
                              onChange={(e) => setEditData({ ...editData, bluesky: e.target.value.replace(/^@/, '') })}
                              placeholder="handle.bsky.social"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge picker */}
                    <div className="border-t-2 border-brand-ink/10 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-body text-xs text-brand-ink/50">Profile badges (choose up to 3)</p>
                        <button
                          type="button"
                          onClick={() => setShowBadgePicker(!showBadgePicker)}
                          className="text-brand-teal text-xs hover:underline flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          {showBadgePicker ? 'Hide' : 'Choose badges'}
                        </button>
                      </div>

                      {/* Selected badges preview */}
                      {selectedBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedBadges.map(badge => (
                            <span
                              key={badge.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                            >
                              <span>{badge.emoji}</span>
                              <span>{badge.label}</span>
                              <button
                                type="button"
                                onClick={() => toggleBadge(badge.id)}
                                className="text-brand-ink/40 hover:text-brand-cardinal ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Badge picker modal */}
                      <AnimatePresence>
                        {showBadgePicker && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-brand-ink/5 rounded-lg p-3 space-y-4 max-h-64 overflow-y-auto">
                              {Object.entries(BADGE_CATEGORIES).map(([key, category]) => (
                                <div key={key}>
                                  <p className="font-body text-xs font-medium text-brand-ink/60 mb-2">{category.label}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {category.badges.map(badge => {
                                      const isSelected = editData.badges?.includes(badge.id)
                                      const isDisabled = !isSelected && (editData.badges?.length || 0) >= 3
                                      return (
                                        <button
                                          key={badge.id}
                                          type="button"
                                          onClick={() => !isDisabled && toggleBadge(badge.id)}
                                          disabled={isDisabled}
                                          title={badge.description}
                                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all
                                            ${isSelected
                                              ? 'bg-brand-teal text-white'
                                              : isDisabled
                                                ? 'bg-brand-ink/5 text-brand-ink/30 cursor-not-allowed'
                                                : 'bg-white border border-brand-ink/20 text-brand-ink hover:border-brand-teal'
                                            }`}
                                        >
                                          <span>{badge.emoji}</span>
                                          <span>{badge.label}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={saving || !editData.displayName}
                        className="btn-primary py-2 px-4 text-sm flex-1 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save profile'}
                      </button>
                      {!isProfileIncomplete && (
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="py-2 px-4 text-sm border-2 border-brand-ink/20 rounded-lg font-body text-brand-ink hover:border-brand-ink/40 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
                        {currentUser?.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt=""
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-brand-teal" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-brand-ink">
                          {userProfile?.displayName || 'No name set'}
                        </p>
                        <p className="font-body text-sm text-brand-ink/60">
                          {currentUser?.email}
                        </p>
                      </div>
                    </div>

                    {userProfile?.organization && (
                      <p className="font-body text-sm text-brand-ink/70">
                        <span className="text-brand-ink/50">Organization:</span> {userProfile.organization}
                      </p>
                    )}
                    {userProfile?.role && (
                      <p className="font-body text-sm text-brand-ink/70">
                        <span className="text-brand-ink/50">Role:</span> {userProfile.role}
                      </p>
                    )}

                    {/* Display badges */}
                    {displayBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {displayBadges.map(badge => (
                          <span
                            key={badge.id}
                            title={badge.description}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                          >
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Social links */}
                    {(userProfile?.website || userProfile?.twitter || userProfile?.linkedin || userProfile?.bluesky) && (
                      <div className="flex gap-2 pt-2 border-t border-brand-ink/10">
                        {userProfile.website && (
                          <a
                            href={`https://${userProfile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.twitter && (
                          <a
                            href={`https://twitter.com/${userProfile.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.linkedin && (
                          <a
                            href={`https://linkedin.com/in/${userProfile.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.bluesky && (
                          <a
                            href={`https://bsky.app/profile/${userProfile.bluesky}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <AtSign className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="card-sketch p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 rounded-lg border-2 border-brand-ink/20 font-body text-brand-ink/70 hover:border-brand-cardinal/50 hover:text-brand-cardinal transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Dashboard
