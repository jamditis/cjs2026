import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  Globe,
  Instagram,
  Linkedin,
  AtSign,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Upload
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Admin email addresses (must match Cloud Functions)
const ADMIN_EMAILS = [
  "amditisj@montclair.edu",
  "jamditis@gmail.com",
  "murrays@montclair.edu",
]

// Badge definitions (copied from Dashboard for display)
const BADGE_CATEGORIES = {
  experience: {
    badges: [
      { id: 'collab-curious', label: 'collab curious', emoji: '🌱' },
      { id: 'collab-practitioner', label: 'practitioner', emoji: '🤝' },
      { id: 'collab-veteran', label: 'veteran', emoji: '🎖️' },
      { id: 'collab-evangelist', label: 'evangelist', emoji: '📣' },
    ]
  },
  role: {
    badges: [
      { id: 'role-reporter', label: 'reporter', emoji: '📝' },
      { id: 'role-editor', label: 'editor', emoji: '✂️' },
      { id: 'role-leadership', label: 'leadership', emoji: '🧭' },
      { id: 'role-funder', label: 'funder', emoji: '💰' },
      { id: 'role-academic', label: 'academic', emoji: '🎓' },
      { id: 'role-technologist', label: 'technologist', emoji: '💻' },
      { id: 'role-organizer', label: 'organizer', emoji: '🗂️' },
      { id: 'role-personality-hire', label: 'personality hire', emoji: '✨' },
    ]
  },
  philosophy: {
    badges: [
      { id: 'value-cooperation', label: 'cooperation > competition', emoji: '🤲' },
      { id: 'value-public-good', label: 'public good', emoji: '🌍' },
      { id: 'value-indie', label: 'indie spirit', emoji: '🏴' },
      { id: 'value-local-first', label: 'local first', emoji: '🏘️' },
      { id: 'value-open-source', label: 'open source', emoji: '🔓' },
      { id: 'value-solidarity', label: 'solidarity', emoji: '✊' },
      { id: 'value-disruptor', label: 'disruptor', emoji: '💥' },
      { id: 'value-bridge-builder', label: 'bridge builder', emoji: '🌉' },
    ]
  },
  misc: {
    badges: [
      { id: 'misc-deadline-driven', label: 'deadline driven', emoji: '⏰' },
      { id: 'misc-data-hound', label: 'data hound', emoji: '🔍' },
      { id: 'misc-rural-beat', label: 'rural beat', emoji: '🌾' },
      { id: 'misc-audio-first', label: 'audio first', emoji: '🎙️' },
      { id: 'misc-newsletter-brain', label: 'newsletter brain', emoji: '📧' },
      { id: 'misc-grant-writer', label: 'grant writer', emoji: '📋' },
      { id: 'misc-cms-survivor', label: 'CMS survivor', emoji: '🖥️' },
      { id: 'misc-source-whisperer', label: 'source whisperer', emoji: '🤫' },
      { id: 'misc-j-school', label: 'j-school', emoji: '🏫' },
      { id: 'misc-self-taught', label: 'self-taught', emoji: '📚' },
      { id: 'misc-bilingual', label: 'bilingual', emoji: '🗣️' },
      { id: 'misc-visual-thinker', label: 'visual thinker', emoji: '📐' },
    ]
  }
}

const ALL_BADGES = Object.values(BADGE_CATEGORIES).flatMap(cat => cat.badges)

function getBadgeInfo(badgeId) {
  return ALL_BADGES.find(b => b.id === badgeId)
}

function Admin() {
  const { currentUser } = useAuth()
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBadge, setFilterBadge] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField] = useState('displayName')
  const [sortDirection, setSortDirection] = useState('asc')
  const [expandedUser, setExpandedUser] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email)

  // Fetch attendees on mount
  useEffect(() => {
    if (isAdmin) {
      fetchAttendees()
    }
  }, [isAdmin])

  async function fetchAttendees() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://us-central1-cjs2026.cloudfunctions.net/exportAttendees?adminEmail=${encodeURIComponent(currentUser.email)}`
      )
      const data = await response.json()
      if (data.success) {
        setAttendees(data.attendees)
      } else {
        setError(data.error || 'Failed to fetch attendees')
      }
    } catch (err) {
      console.error('Error fetching attendees:', err)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  async function syncAllToAirtable() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const response = await fetch(
        'https://us-central1-cjs2026.cloudfunctions.net/syncAllProfilesToAirtable',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminEmail: currentUser.email })
        }
      )
      const data = await response.json()
      if (data.success) {
        setSyncResult({ type: 'success', message: data.message })
      } else {
        setSyncResult({ type: 'error', message: data.error })
      }
    } catch (err) {
      setSyncResult({ type: 'error', message: 'Failed to sync' })
    } finally {
      setSyncing(false)
    }
  }

  function exportToCSV() {
    const headers = [
      'Name', 'Email', 'Organization', 'Role', 'Registration Status',
      'Badges', 'Attended Summits', 'Website', 'Instagram', 'LinkedIn', 'Bluesky',
      'Notify When Available', 'Created At'
    ]

    const rows = filteredAttendees.map(a => [
      a.displayName,
      a.email,
      a.organization,
      a.role,
      a.registrationStatus,
      a.badges.map(id => getBadgeInfo(id)?.label || id).join('; '),
      a.attendedSummits.join('; '),
      a.website,
      a.instagram,
      a.linkedin,
      a.bluesky,
      a.notifyWhenTicketsAvailable ? 'Yes' : 'No',
      a.createdAt || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cjs2026-attendees-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filter and sort attendees
  const filteredAttendees = attendees
    .filter(a => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matches =
          a.displayName?.toLowerCase().includes(term) ||
          a.email?.toLowerCase().includes(term) ||
          a.organization?.toLowerCase().includes(term) ||
          a.role?.toLowerCase().includes(term)
        if (!matches) return false
      }
      // Badge filter
      if (filterBadge && !a.badges?.includes(filterBadge)) {
        return false
      }
      // Status filter
      if (filterStatus && a.registrationStatus !== filterStatus) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''
      const cmp = aVal.toString().localeCompare(bVal.toString())
      return sortDirection === 'asc' ? cmp : -cmp
    })

  function toggleSort(field) {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Unauthorized view
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-paper pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-cardinal/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-brand-cardinal" />
            </div>
            <h1 className="editorial-headline text-3xl text-brand-ink mb-4">
              Admin access required
            </h1>
            <p className="font-body text-brand-ink/60">
              This page is restricted to CJS2026 administrators.
              {currentUser && (
                <span className="block mt-2 text-sm">
                  Logged in as: {currentUser.email}
                </span>
              )}
            </p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
                Attendee management
              </h1>
              <p className="font-body text-brand-ink/60">
                {attendees.length} registered attendees
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAttendees}
                disabled={loading}
                className="btn-secondary py-2 px-4 text-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredAttendees.length === 0}
                className="btn-secondary py-2 px-4 text-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={syncAllToAirtable}
                disabled={syncing}
                className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Sync to Airtable
              </button>
            </div>
          </motion.div>

          {/* Sync result message */}
          {syncResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                syncResult.type === 'success' ? 'bg-brand-teal/10' : 'bg-brand-cardinal/10'
              }`}
            >
              {syncResult.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-brand-teal" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-cardinal" />
              )}
              <span className={`font-body text-sm ${
                syncResult.type === 'success' ? 'text-brand-teal' : 'text-brand-cardinal'
              }`}>
                {syncResult.message}
              </span>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            className="card-sketch p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, org..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-sm focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              {/* Badge filter */}
              <div className="w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
                  <select
                    value={filterBadge}
                    onChange={(e) => setFilterBadge(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-sm focus:border-brand-teal focus:outline-none appearance-none"
                  >
                    <option value="">All badges</option>
                    {ALL_BADGES.map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.emoji} {badge.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status filter */}
              <div className="w-40">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-sm focus:border-brand-teal focus:outline-none appearance-none"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="registered">Registered</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>

            {/* Active filters */}
            {(searchTerm || filterBadge || filterStatus) && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-brand-ink/50">Showing {filteredAttendees.length} of {attendees.length}</span>
                <button
                  onClick={() => { setSearchTerm(''); setFilterBadge(''); setFilterStatus(''); }}
                  className="text-brand-teal hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>

          {/* Loading/error states */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
              <p className="mt-4 font-body text-brand-ink/60">Loading attendees...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 mx-auto text-brand-cardinal" />
              <p className="mt-4 font-body text-brand-cardinal">{error}</p>
            </div>
          )}

          {/* Attendee table */}
          {!loading && !error && (
            <motion.div
              className="card-sketch overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-ink/5">
                    <tr>
                      <th
                        className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink cursor-pointer hover:bg-brand-ink/10"
                        onClick={() => toggleSort('displayName')}
                      >
                        <span className="flex items-center gap-1">
                          Name
                          {sortField === 'displayName' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </span>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink cursor-pointer hover:bg-brand-ink/10"
                        onClick={() => toggleSort('organization')}
                      >
                        <span className="flex items-center gap-1">
                          Organization
                          {sortField === 'organization' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">
                        Badges
                      </th>
                      <th
                        className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink cursor-pointer hover:bg-brand-ink/10"
                        onClick={() => toggleSort('registrationStatus')}
                      >
                        <span className="flex items-center gap-1">
                          Status
                          {sortField === 'registrationStatus' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">
                        Links
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-ink/10">
                    {filteredAttendees.map(attendee => (
                      <React.Fragment key={attendee.uid}>
                        <tr
                          className="hover:bg-brand-teal/5 cursor-pointer"
                          onClick={() => setExpandedUser(expandedUser === attendee.uid ? null : attendee.uid)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {attendee.photoURL ? (
                                  <img src={attendee.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-brand-teal" />
                                )}
                              </div>
                              <div>
                                <p className="font-heading font-semibold text-brand-ink">
                                  {attendee.displayName || 'No name'}
                                </p>
                                <p className="font-body text-xs text-brand-ink/50">{attendee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-body text-sm text-brand-ink">{attendee.organization || '—'}</p>
                            {attendee.role && (
                              <p className="font-body text-xs text-brand-ink/50">{attendee.role}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(attendee.badges || []).slice(0, 3).map(badgeId => {
                                const badge = getBadgeInfo(badgeId)
                                return badge ? (
                                  <span
                                    key={badgeId}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-teal/10 rounded-full text-[10px]"
                                    title={badge.label}
                                  >
                                    {badge.emoji}
                                  </span>
                                ) : null
                              })}
                              {(attendee.badges?.length || 0) > 3 && (
                                <span className="text-[10px] text-brand-ink/50">
                                  +{attendee.badges.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-body ${
                              attendee.registrationStatus === 'confirmed'
                                ? 'bg-brand-green-dark/10 text-brand-green-dark'
                                : attendee.registrationStatus === 'registered'
                                  ? 'bg-brand-teal/10 text-brand-teal'
                                  : 'bg-brand-cardinal/10 text-brand-cardinal'
                            }`}>
                              {attendee.registrationStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {attendee.email && (
                                <a
                                  href={`mailto:${attendee.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/50 hover:text-brand-teal"
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                              )}
                              {attendee.linkedin && (
                                <a
                                  href={`https://linkedin.com/in/${attendee.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/50 hover:text-brand-teal"
                                >
                                  <Linkedin className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {expandedUser === attendee.uid && (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 bg-brand-ink/5">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Contact & social */}
                                <div>
                                  <h4 className="font-heading font-semibold text-sm text-brand-ink mb-3">Contact & social</h4>
                                  <div className="space-y-2 font-body text-sm">
                                    <p className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-brand-ink/40" />
                                      <a href={`mailto:${attendee.email}`} className="text-brand-teal hover:underline">{attendee.email}</a>
                                    </p>
                                    {attendee.website && (
                                      <p className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-brand-ink/40" />
                                        <a href={`https://${attendee.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">{attendee.website}</a>
                                      </p>
                                    )}
                                    {attendee.instagram && (
                                      <p className="flex items-center gap-2">
                                        <Instagram className="w-4 h-4 text-brand-ink/40" />
                                        <a href={`https://instagram.com/${attendee.instagram}`} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">@{attendee.instagram}</a>
                                      </p>
                                    )}
                                    {attendee.linkedin && (
                                      <p className="flex items-center gap-2">
                                        <Linkedin className="w-4 h-4 text-brand-ink/40" />
                                        <a href={`https://linkedin.com/in/${attendee.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">{attendee.linkedin}</a>
                                      </p>
                                    )}
                                    {attendee.bluesky && (
                                      <p className="flex items-center gap-2">
                                        <AtSign className="w-4 h-4 text-brand-ink/40" />
                                        <a href={`https://bsky.app/profile/${attendee.bluesky}`} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">@{attendee.bluesky}</a>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Badges & history */}
                                <div>
                                  <h4 className="font-heading font-semibold text-sm text-brand-ink mb-3">Badges & history</h4>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {(attendee.badges || []).map(badgeId => {
                                      const badge = getBadgeInfo(badgeId)
                                      return badge ? (
                                        <span
                                          key={badgeId}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs"
                                        >
                                          {badge.emoji} {badge.label}
                                        </span>
                                      ) : null
                                    })}
                                    {/* Custom badges */}
                                    {attendee.customBadges && Object.entries(attendee.customBadges).flatMap(([_, badges]) =>
                                      (badges || []).map(badge => (
                                        <span
                                          key={badge.label}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs"
                                        >
                                          {badge.emoji} {badge.label}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                  {attendee.attendedSummits?.length > 0 && (
                                    <p className="font-body text-xs text-brand-ink/60">
                                      Past summits: {attendee.attendedSummits.sort().join(', ')}
                                    </p>
                                  )}
                                  {attendee.notifyWhenTicketsAvailable && (
                                    <p className="font-body text-xs text-brand-teal mt-2">
                                      ✓ Wants ticket notifications
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-8 h-8 mx-auto text-brand-ink/30" />
                  <p className="mt-4 font-body text-brand-ink/60">No attendees found</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Admin
