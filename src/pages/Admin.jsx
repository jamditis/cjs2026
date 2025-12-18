import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Upload,
  BarChart3,
  Activity,
  AlertTriangle,
  Briefcase,
  UserCog,
  FileText,
  TrendingUp,
  Clock,
  UserPlus,
  UserMinus,
  XCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'attendees', label: 'Attendees', icon: Users },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'errors', label: 'Errors', icon: AlertTriangle },
  { id: 'jobs', label: 'Background Jobs', icon: Briefcase },
  { id: 'admins', label: 'Admin Management', icon: UserCog },
  { id: 'audit', label: 'Audit Log', icon: FileText }
]

// Badge definitions (same as Dashboard)
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

// Helper to get auth token
async function getAuthToken(currentUser) {
  if (!currentUser) throw new Error('No user logged in')
  return await currentUser.getIdToken()
}

// Helper to make authenticated API calls
async function apiCall(endpoint, currentUser, options = {}) {
  const token = await getAuthToken(currentUser)
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  })
  return response.json()
}

function AdminPanel() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if user is admin by checking if they can access system stats
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!currentUser) {
        setIsAdmin(false)
        setCheckingAuth(false)
        return
      }

      try {
        const data = await apiCall(
          'https://us-central1-cjs2026.cloudfunctions.net/getSystemStats',
          currentUser
        )
        setIsAdmin(data.success === true)
      } catch (err) {
        setIsAdmin(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAdminStatus()
  }, [currentUser])

  // Unauthorized view
  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-paper pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        </div>
        <Footer />
      </>
    )
  }

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
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              Admin Panel
            </h1>
            <p className="font-body text-brand-ink/60">
              System visibility and management
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="card-sketch mb-6 overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex border-b border-brand-ink/10">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-body text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-brand-teal border-b-2 border-brand-teal -mb-px'
                        : 'text-brand-ink/60 hover:text-brand-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardTab currentUser={currentUser} />}
              {activeTab === 'attendees' && <AttendeesTab currentUser={currentUser} />}
              {activeTab === 'activity' && <ActivityTab currentUser={currentUser} />}
              {activeTab === 'errors' && <ErrorsTab currentUser={currentUser} />}
              {activeTab === 'jobs' && <JobsTab currentUser={currentUser} />}
              {activeTab === 'admins' && <AdminsTab currentUser={currentUser} />}
              {activeTab === 'audit' && <AuditTab currentUser={currentUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </>
  )
}

// Dashboard Tab - System Overview
function DashboardTab({ currentUser }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchStats() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/getSystemStats',
        currentUser
      )
      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
        <p className="mt-4 font-body text-brand-ink/60">Loading system stats...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-8 h-8 mx-auto text-brand-cardinal" />
        <p className="mt-4 font-body text-brand-cardinal">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Profile Complete"
          value={`${stats.users.profileCompletionRate}%`}
          subtitle={`${stats.users.profileComplete} of ${stats.users.total}`}
          icon={CheckCircle}
          color="green-dark"
        />
        <StatCard
          title="Tickets Purchased"
          value={stats.users.ticketsPurchased}
          icon={CheckCircle}
          color="green-dark"
        />
        <StatCard
          title="Email Signups"
          value={stats.emailSignups}
          icon={Mail}
          color="teal"
        />
      </div>

      {/* Registration Status */}
      <div className="card-sketch p-6">
        <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
          Registration Status
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-brand-cardinal mb-1">
              {stats.users.pending}
            </div>
            <div className="text-sm font-body text-brand-ink/60">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-brand-teal mb-1">
              {stats.users.registered}
            </div>
            <div className="text-sm font-body text-brand-ink/60">Registered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-brand-green-dark mb-1">
              {stats.users.confirmed}
            </div>
            <div className="text-sm font-body text-brand-ink/60">Confirmed</div>
          </div>
        </div>
      </div>

      {/* Signups Trend */}
      <div className="card-sketch p-6">
        <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Signups
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-heading font-bold text-brand-ink mb-1">
              {stats.signups.last24h}
            </div>
            <div className="text-sm font-body text-brand-ink/60">Last 24 hours</div>
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-brand-ink mb-1">
              {stats.signups.last7d}
            </div>
            <div className="text-sm font-body text-brand-ink/60">Last 7 days</div>
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-brand-ink mb-1">
              {stats.signups.last30d}
            </div>
            <div className="text-sm font-body text-brand-ink/60">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card-sketch p-6">
        <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
          System Health (Last 24h)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            {stats.activity.recentErrors === 0 ? (
              <CheckCircle className="w-6 h-6 text-brand-green-dark" />
            ) : (
              <AlertCircle className="w-6 h-6 text-brand-cardinal" />
            )}
            <div>
              <div className="font-heading font-semibold text-brand-ink">
                {stats.activity.recentErrors} Errors
              </div>
              <div className="text-sm font-body text-brand-ink/60">
                {stats.activity.recentErrors === 0 ? 'All systems operational' : 'Needs attention'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-brand-teal" />
            <div>
              <div className="font-heading font-semibold text-brand-ink">
                {stats.activity.recentActivity} Activities
              </div>
              <div className="text-sm font-body text-brand-ink/60">
                User actions logged
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Background Jobs */}
      {stats.recentJobs && stats.recentJobs.length > 0 && (
        <div className="card-sketch p-6">
          <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
            Recent Background Jobs
          </h3>
          <div className="space-y-2">
            {stats.recentJobs.slice(0, 5).map((job, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-brand-ink/5 last:border-0">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-brand-ink/40" />
                  <div>
                    <div className="font-body text-sm text-brand-ink">{job.jobType}</div>
                    <div className="font-body text-xs text-brand-ink/50">
                      {new Date(job.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-body ${
                  job.status === 'completed'
                    ? 'bg-brand-green-dark/10 text-brand-green-dark'
                    : job.status === 'failed'
                      ? 'bg-brand-cardinal/10 text-brand-cardinal'
                      : 'bg-brand-teal/10 text-brand-teal'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStats}
          className="btn-secondary py-2 px-4 text-sm inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stats
        </button>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    teal: 'bg-brand-teal/10 text-brand-teal',
    'green-dark': 'bg-brand-green-dark/10 text-brand-green-dark',
    cardinal: 'bg-brand-cardinal/10 text-brand-cardinal'
  }

  return (
    <div className="card-sketch p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="font-body text-sm text-brand-ink/60">{title}</div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="font-heading text-2xl font-bold text-brand-ink mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="font-body text-xs text-brand-ink/50">{subtitle}</div>
      )}
    </div>
  )
}

// Attendees Tab - Full user management
function AttendeesTab({ currentUser }) {
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

  async function fetchAttendees() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/exportAttendees',
        currentUser
      )
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

  useEffect(() => {
    fetchAttendees()
  }, [])

  async function syncAllToAirtable() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const token = await getAuthToken(currentUser)
      const response = await fetch(
        'https://us-central1-cjs2026.cloudfunctions.net/syncAllProfilesToAirtable',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
        <p className="mt-4 font-body text-brand-ink/60">Loading attendees...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-8 h-8 mx-auto text-brand-cardinal" />
        <p className="mt-4 font-body text-brand-cardinal">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-3">
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

      {/* Sync result message */}
      {syncResult && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          syncResult.type === 'success' ? 'bg-brand-teal/10' : 'bg-brand-cardinal/10'
        }`}>
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
        </div>
      )}

      {/* Filters */}
      <div className="card-sketch p-4">
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
      </div>

      {/* Attendee table */}
      <div className="card-sketch overflow-hidden">
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
      </div>
    </div>
  )
}

// Activity Tab
function ActivityTab({ currentUser }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchLogs() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/getActivityLogs?limit=100',
        currentUser
      )
      if (data.success) {
        setLogs(data.logs)
      } else {
        setError(data.error || 'Failed to fetch logs')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
      </div>
    )
  }

  return (
    <div className="card-sketch overflow-hidden">
      <div className="p-4 border-b border-brand-ink/10 flex items-center justify-between">
        <h3 className="font-heading font-semibold text-brand-ink">
          Activity Log ({logs.length} entries)
        </h3>
        <button
          onClick={fetchLogs}
          className="btn-secondary py-1 px-3 text-sm inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 mx-auto text-brand-ink/30" />
          <p className="mt-4 font-body text-brand-ink/60">No activity logged yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-ink/5">
              <tr>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Type</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">User</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Details</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-ink/10">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-teal/5">
                  <td className="px-4 py-3 font-body text-sm text-brand-ink">{log.type}</td>
                  <td className="px-4 py-3 font-body text-sm text-brand-ink/60">{log.userId?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-body text-xs text-brand-ink/50">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-brand-ink/50">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Errors Tab
function ErrorsTab({ currentUser }) {
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

  async function fetchErrors() {
    setLoading(true)
    try {
      const data = await apiCall(
        `https://us-central1-cjs2026.cloudfunctions.net/getSystemErrors?limit=50&resolved=${showResolved}`,
        currentUser
      )
      if (data.success) {
        setErrors(data.errors)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchErrors()
  }, [showResolved])

  async function resolveError(errorId) {
    try {
      const token = await getAuthToken(currentUser)
      await fetch('https://us-central1-cjs2026.cloudfunctions.net/resolveError', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ errorId })
      })
      fetchErrors()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-brand-ink">
          System Errors ({errors.length})
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded border-brand-ink/20"
            />
            Show resolved
          </label>
          <button
            onClick={fetchErrors}
            className="btn-secondary py-1 px-3 text-sm inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {errors.length === 0 ? (
        <div className="card-sketch p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-brand-green-dark mb-4" />
          <p className="font-body text-brand-ink">No errors to show</p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((error) => (
            <div key={error.id} className="card-sketch p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-brand-cardinal mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-heading font-semibold text-brand-ink mb-1">
                      {error.source}
                    </div>
                    <div className="font-body text-sm text-brand-ink/80 mb-2">
                      {error.error.message}
                    </div>
                    <div className="font-body text-xs text-brand-ink/50">
                      {new Date(error.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!error.resolved && (
                  <button
                    onClick={() => resolveError(error.id)}
                    className="btn-secondary py-1 px-3 text-xs"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
              {error.context && Object.keys(error.context).length > 0 && (
                <div className="mt-3 p-3 bg-brand-ink/5 rounded text-xs font-mono overflow-x-auto">
                  {JSON.stringify(error.context, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Jobs Tab
function JobsTab({ currentUser }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchJobs() {
    setLoading(true)
    try {
      const data = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/getBackgroundJobs?limit=100',
        currentUser
      )
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-brand-ink">
          Background Jobs ({jobs.length})
        </h3>
        <button
          onClick={fetchJobs}
          className="btn-secondary py-1 px-3 text-sm inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      <div className="card-sketch overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-ink/5">
            <tr>
              <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Job Type</th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Status</th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Details</th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-ink/10">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-brand-teal/5">
                <td className="px-4 py-3 font-body text-sm text-brand-ink">{job.jobType}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-body ${
                    job.status === 'completed'
                      ? 'bg-brand-green-dark/10 text-brand-green-dark'
                      : job.status === 'failed'
                        ? 'bg-brand-cardinal/10 text-brand-cardinal'
                        : 'bg-brand-teal/10 text-brand-teal'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-brand-ink/50 max-w-xs truncate">
                  {JSON.stringify(job.details)}
                </td>
                <td className="px-4 py-3 font-body text-xs text-brand-ink/50">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Admins Tab
function AdminsTab({ currentUser }) {
  const [targetEmail, setTargetEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function grantAdmin() {
    setLoading(true)
    setResult(null)
    try {
      const token = await getAuthToken(currentUser)
      const response = await fetch('https://us-central1-cjs2026.cloudfunctions.net/grantAdminRole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetEmail, role: selectedRole })
      })
      const data = await response.json()
      setResult({ type: data.success ? 'success' : 'error', message: data.message || data.error })
      if (data.success) setTargetEmail('')
    } catch (err) {
      setResult({ type: 'error', message: 'Failed to grant admin role' })
    } finally {
      setLoading(false)
    }
  }

  async function revokeAdmin() {
    setLoading(true)
    setResult(null)
    try {
      const token = await getAuthToken(currentUser)
      const response = await fetch('https://us-central1-cjs2026.cloudfunctions.net/revokeAdminRole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetEmail })
      })
      const data = await response.json()
      setResult({ type: data.success ? 'success' : 'error', message: data.message || data.error })
      if (data.success) setTargetEmail('')
    } catch (err) {
      setResult({ type: 'error', message: 'Failed to revoke admin role' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-sketch p-6">
        <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
          Grant Admin Access
        </h3>
        <p className="font-body text-sm text-brand-ink/60 mb-4">
          Grant admin or super admin privileges to a user by email. The user must have an existing account.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block font-body text-sm text-brand-ink mb-2">
              User Email
            </label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-body text-sm text-brand-ink mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-sm focus:border-brand-teal focus:outline-none"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="mt-2 font-body text-xs text-brand-ink/50">
              Super admins can grant/revoke admin access. Regular admins cannot.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={grantAdmin}
              disabled={loading || !targetEmail}
              className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Grant Access
            </button>
            <button
              onClick={revokeAdmin}
              disabled={loading || !targetEmail}
              className="btn-secondary py-2 px-4 text-sm inline-flex items-center gap-2 disabled:opacity-50 border-brand-cardinal text-brand-cardinal hover:bg-brand-cardinal/5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Revoke Access
            </button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              result.type === 'success' ? 'bg-brand-teal/10' : 'bg-brand-cardinal/10'
            }`}>
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-brand-teal" />
              ) : (
                <XCircle className="w-5 h-5 text-brand-cardinal" />
              )}
              <span className={`font-body text-sm ${
                result.type === 'success' ? 'text-brand-teal' : 'text-brand-cardinal'
              }`}>
                {result.message}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card-sketch p-6">
        <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
          Current Admin
        </h3>
        <div className="flex items-center gap-3 p-4 bg-brand-teal/5 rounded-lg">
          <Shield className="w-5 h-5 text-brand-teal" />
          <div>
            <div className="font-body text-sm text-brand-ink">You are logged in as:</div>
            <div className="font-heading font-semibold text-brand-ink">{currentUser.email}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Audit Tab
function AuditTab({ currentUser }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchLogs() {
    setLoading(true)
    try {
      const data = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/getAdminLogs?limit=100',
        currentUser
      )
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-teal" />
      </div>
    )
  }

  return (
    <div className="card-sketch overflow-hidden">
      <div className="p-4 border-b border-brand-ink/10 flex items-center justify-between">
        <h3 className="font-heading font-semibold text-brand-ink">
          Admin Audit Log ({logs.length} entries)
        </h3>
        <button
          onClick={fetchLogs}
          className="btn-secondary py-1 px-3 text-sm inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-8 h-8 mx-auto text-brand-ink/30" />
          <p className="mt-4 font-body text-brand-ink/60">No admin actions logged yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-ink/5">
              <tr>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Action</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Admin</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Target</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Details</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-brand-ink">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-ink/10">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-teal/5">
                  <td className="px-4 py-3 font-body text-sm text-brand-ink">{log.action}</td>
                  <td className="px-4 py-3 font-body text-sm text-brand-ink/60">{log.adminUid?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-body text-sm text-brand-ink/60">{log.targetUid?.slice(0, 8) || '—'}...</td>
                  <td className="px-4 py-3 font-body text-xs text-brand-ink/50 max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-brand-ink/50">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
