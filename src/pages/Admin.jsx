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
  ChevronLeft,
  ChevronRight,
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
  XCircle,
  Menu,
  X,
  Zap,
  Database,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Navigation items with icons
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: BarChart3, description: 'System health & metrics' },
  { id: 'attendees', label: 'Attendees', icon: Users, description: 'User management' },
  { id: 'activity', label: 'Activity', icon: Activity, description: 'User actions' },
  { id: 'errors', label: 'Errors', icon: AlertTriangle, description: 'System errors' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, description: 'Background tasks' },
  { id: 'admins', label: 'Admins', icon: UserCog, description: 'Access control' },
  { id: 'audit', label: 'Audit', icon: FileText, description: 'Admin actions' }
]

// Badge definitions
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

// API helpers
async function getAuthToken(currentUser) {
  if (!currentUser) throw new Error('No user logged in')
  return await currentUser.getIdToken()
}

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

// Main Admin Panel
function AdminPanel() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-400 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Unauthorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            Access restricted
          </h1>
          <p className="text-slate-400 mb-6">
            This area is reserved for CJS2026 administrators.
          </p>
          {currentUser && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6">
              <p className="text-sm text-slate-500">Logged in as</p>
              <p className="text-slate-300 font-medium">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
          >
            Return to site
          </button>
        </motion.div>
      </div>
    )
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        className={`hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } transition-all duration-300`}
        initial={false}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-white text-sm">CJS2026</span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Admin</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-400 border border-teal-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-[11px] text-slate-500 truncate">{item.description}</span>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-slate-800">
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {currentUser?.displayName || 'Admin'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-white">Admin Panel</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-teal-500/10 text-teal-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Admin'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {NAV_ITEMS.find(n => n.id === activeTab)?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              View site
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
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
        </main>
      </div>
    </div>
  )
}

// Reusable metric card component
function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'teal', large = false }) {
  const colors = {
    teal: 'from-teal-500/20 to-emerald-500/10 border-teal-500/20 text-teal-400',
    green: 'from-emerald-500/20 to-green-500/10 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
    blue: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400'
  }

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${colors[color]} border p-5 overflow-hidden`}>
      <div className="absolute top-4 right-4 opacity-20">
        <Icon className={`${large ? 'w-16 h-16' : 'w-12 h-12'}`} />
      </div>
      <div className="relative">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{title}</p>
        <p className={`${large ? 'text-4xl' : 'text-3xl'} font-bold text-white mb-1`}>{value}</p>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        {trend && (
          <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${
            trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% from last week
          </div>
        )}
      </div>
    </div>
  )
}

// Dashboard Tab
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-teal-400 animate-spin mb-4" />
          <p className="text-slate-400">Loading system stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-400 mb-4" />
          <p className="text-rose-400 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Primary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total users"
          value={stats.users.total}
          icon={Users}
          color="teal"
        />
        <MetricCard
          title="Profile complete"
          value={`${stats.users.profileCompletionRate}%`}
          subtitle={`${stats.users.profileComplete} of ${stats.users.total}`}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Tickets purchased"
          value={stats.users.ticketsPurchased}
          icon={CheckCircle}
          color="blue"
        />
        <MetricCard
          title="Email signups"
          value={stats.emailSignups}
          icon={Mail}
          color="amber"
        />
      </div>

      {/* Registration funnel */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Registration funnel</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.users.pending}</p>
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-teal-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.users.registered}</p>
            <p className="text-sm text-slate-400">Registered</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.users.confirmed}</p>
            <p className="text-sm text-slate-400">Confirmed</p>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recent signups</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50">
              <div>
                <p className="text-2xl font-bold text-white">{stats.signups.last24h}</p>
                <p className="text-sm text-slate-400">Last 24 hours</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/50">
                <p className="text-xl font-bold text-white">{stats.signups.last7d}</p>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50">
                <p className="text-xl font-bold text-white">{stats.signups.last30d}</p>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* System health */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">System health</h3>
            <span className="ml-auto text-xs text-slate-500">Last 24h</span>
          </div>
          <div className="space-y-4">
            <div className={`flex items-center gap-4 p-4 rounded-xl ${
              stats.activity.recentErrors === 0 ? 'bg-emerald-500/5' : 'bg-rose-500/5'
            }`}>
              {stats.activity.recentErrors === 0 ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-white">{stats.activity.recentErrors} errors</p>
                <p className="text-sm text-slate-400">
                  {stats.activity.recentErrors === 0 ? 'All systems operational' : 'Needs attention'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50">
              <Activity className="w-6 h-6 text-teal-400" />
              <div className="flex-1">
                <p className="font-semibold text-white">{stats.activity.recentActivity} activities</p>
                <p className="text-sm text-slate-400">User actions logged</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent jobs */}
      {stats.recentJobs && stats.recentJobs.length > 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recent background jobs</h3>
          </div>
          <div className="space-y-2">
            {stats.recentJobs.slice(0, 5).map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{job.jobType}</p>
                    <p className="text-xs text-slate-500">{new Date(job.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : job.status === 'failed'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh data
        </button>
      </div>
    </div>
  )
}

// Attendees Tab
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
      setSyncResult({ type: data.success ? 'success' : 'error', message: data.message || data.error })
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
      a.displayName, a.email, a.organization, a.role, a.registrationStatus,
      a.badges.map(id => getBadgeInfo(id)?.label || id).join('; '),
      a.attendedSummits.join('; '), a.website, a.instagram, a.linkedin, a.bluesky,
      a.notifyWhenTicketsAvailable ? 'Yes' : 'No', a.createdAt || ''
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

  // Filter and sort
  const filteredAttendees = attendees
    .filter(a => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        if (!a.displayName?.toLowerCase().includes(term) &&
            !a.email?.toLowerCase().includes(term) &&
            !a.organization?.toLowerCase().includes(term) &&
            !a.role?.toLowerCase().includes(term)) return false
      }
      if (filterBadge && !a.badges?.includes(filterBadge)) return false
      if (filterStatus && a.registrationStatus !== filterStatus) return false
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-teal-400 animate-spin mb-4" />
          <p className="text-slate-400">Loading attendees...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-400 mb-4" />
          <p className="text-rose-400 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={fetchAttendees}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={exportToCSV}
          disabled={filteredAttendees.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
          onClick={syncAllToAirtable}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium hover:from-teal-500 hover:to-emerald-500 transition-colors disabled:opacity-50"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Sync to Airtable
        </button>
      </div>

      {/* Sync result */}
      {syncResult && (
        <motion.div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            syncResult.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {syncResult.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className={syncResult.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
            {syncResult.message}
          </span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, org..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
          <select
            value={filterBadge}
            onChange={(e) => setFilterBadge(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-teal-500 focus:outline-none"
          >
            <option value="">All badges</option>
            {ALL_BADGES.map(badge => (
              <option key={badge.id} value={badge.id}>{badge.emoji} {badge.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-teal-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="registered">Registered</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
        {(searchTerm || filterBadge || filterStatus) && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-slate-400">
              Showing {filteredAttendees.length} of {attendees.length}
            </span>
            <button
              onClick={() => { setSearchTerm(''); setFilterBadge(''); setFilterStatus(''); }}
              className="text-teal-400 hover:text-teal-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => toggleSort('displayName')}
                >
                  <span className="inline-flex items-center gap-2">
                    Name
                    {sortField === 'displayName' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => toggleSort('organization')}
                >
                  <span className="inline-flex items-center gap-2">
                    Organization
                    {sortField === 'organization' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Badges
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => toggleSort('registrationStatus')}
                >
                  <span className="inline-flex items-center gap-2">
                    Status
                    {sortField === 'registrationStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredAttendees.map(attendee => (
                <React.Fragment key={attendee.uid}>
                  <tr
                    className="hover:bg-slate-700/20 cursor-pointer transition-colors"
                    onClick={() => setExpandedUser(expandedUser === attendee.uid ? null : attendee.uid)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {attendee.photoURL ? (
                            <img src={attendee.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{attendee.displayName || 'No name'}</p>
                          <p className="text-sm text-slate-500">{attendee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300">{attendee.organization || '—'}</p>
                      {attendee.role && <p className="text-sm text-slate-500">{attendee.role}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(attendee.badges || []).slice(0, 3).map(badgeId => {
                          const badge = getBadgeInfo(badgeId)
                          return badge ? (
                            <span
                              key={badgeId}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-700/50 text-xs"
                              title={badge.label}
                            >
                              {badge.emoji}
                            </span>
                          ) : null
                        })}
                        {(attendee.badges?.length || 0) > 3 && (
                          <span className="text-xs text-slate-500">+{attendee.badges.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        attendee.registrationStatus === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : attendee.registrationStatus === 'registered'
                            ? 'bg-teal-500/10 text-teal-400'
                            : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {attendee.registrationStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {attendee.email && (
                          <a
                            href={`mailto:${attendee.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
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
                            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  <AnimatePresence>
                    {expandedUser === attendee.uid && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={5} className="px-6 py-6 bg-slate-900/50">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-4">Contact & social</h4>
                              <div className="space-y-3">
                                <a href={`mailto:${attendee.email}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-teal-400">
                                  <Mail className="w-4 h-4" /> {attendee.email}
                                </a>
                                {attendee.website && (
                                  <a href={`https://${attendee.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-teal-400">
                                    <Globe className="w-4 h-4" /> {attendee.website}
                                  </a>
                                )}
                                {attendee.instagram && (
                                  <a href={`https://instagram.com/${attendee.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-teal-400">
                                    <Instagram className="w-4 h-4" /> @{attendee.instagram}
                                  </a>
                                )}
                                {attendee.linkedin && (
                                  <a href={`https://linkedin.com/in/${attendee.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-teal-400">
                                    <Linkedin className="w-4 h-4" /> {attendee.linkedin}
                                  </a>
                                )}
                                {attendee.bluesky && (
                                  <a href={`https://bsky.app/profile/${attendee.bluesky}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-teal-400">
                                    <AtSign className="w-4 h-4" /> @{attendee.bluesky}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-4">Badges & history</h4>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {(attendee.badges || []).map(badgeId => {
                                  const badge = getBadgeInfo(badgeId)
                                  return badge ? (
                                    <span key={badgeId} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 text-sm text-slate-300">
                                      {badge.emoji} {badge.label}
                                    </span>
                                  ) : null
                                })}
                                {attendee.customBadges && Object.entries(attendee.customBadges).flatMap(([_, badges]) =>
                                  (badges || []).map(badge => (
                                    <span key={badge.label} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 text-sm text-slate-300">
                                      {badge.emoji} {badge.label}
                                    </span>
                                  ))
                                )}
                              </div>
                              {attendee.attendedSummits?.length > 0 && (
                                <p className="text-sm text-slate-500">
                                  Past summits: {attendee.attendedSummits.sort().join(', ')}
                                </p>
                              )}
                              {attendee.notifyWhenTicketsAvailable && (
                                <p className="text-sm text-teal-400 mt-2">✓ Wants ticket notifications</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No attendees found</p>
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

  async function fetchLogs() {
    setLoading(true)
    try {
      const data = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/getActivityLogs?limit=100',
        currentUser
      )
      if (data.success) setLogs(data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400">{logs.length} entries</p>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-16 text-center">
          <Activity className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No activity logged yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{log.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.userId?.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
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
      if (data.success) setErrors(data.errors)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchErrors() }, [showResolved])

  async function resolveError(errorId) {
    try {
      const token = await getAuthToken(currentUser)
      await fetch('https://us-central1-cjs2026.cloudfunctions.net/resolveError', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ errorId })
      })
      fetchErrors()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-slate-400">{errors.length} errors</p>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500"
            />
            Show resolved
          </label>
        </div>
        <button
          onClick={fetchErrors}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {errors.length === 0 ? (
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-16 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <p className="text-xl font-semibold text-white mb-2">All clear</p>
          <p className="text-slate-400">No errors to show</p>
        </div>
      ) : (
        <div className="space-y-4">
          {errors.map((error) => (
            <div key={error.id} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">{error.source}</p>
                    <p className="text-slate-400">{error.error.message}</p>
                    <p className="text-sm text-slate-500 mt-2">{new Date(error.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!error.resolved && (
                  <button
                    onClick={() => resolveError(error.id)}
                    className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors"
                  >
                    Mark resolved
                  </button>
                )}
              </div>
              {error.context && Object.keys(error.context).length > 0 && (
                <pre className="p-4 rounded-xl bg-slate-900/50 text-xs text-slate-400 overflow-x-auto">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
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
      if (data.success) setJobs(data.jobs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400">{jobs.length} jobs</p>
        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Job type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-sm text-white">{job.jobType}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400'
                      : job.status === 'failed' ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{JSON.stringify(job.details)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(job.createdAt).toLocaleString()}</td>
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <UserCog className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Grant admin access</h3>
            <p className="text-sm text-slate-400">Add or remove admin privileges</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">User email</label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Super admins can grant/revoke admin access. Regular admins cannot.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={grantAdmin}
              disabled={loading || !targetEmail}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium hover:from-teal-500 hover:to-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Grant access
            </button>
            <button
              onClick={revokeAdmin}
              disabled={loading || !targetEmail}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Revoke access
            </button>
          </div>

          {result && (
            <motion.div
              className={`flex items-center gap-3 p-4 rounded-xl ${
                result.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span className={result.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                {result.message}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
        <h3 className="font-semibold text-white mb-4">Current session</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="font-semibold text-white">{currentUser.email}</p>
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
      if (data.success) setLogs(data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400">{logs.length} entries</p>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-16 text-center">
          <FileText className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No admin actions logged yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.adminUid?.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.targetUid?.slice(0, 8) || '—'}...</td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
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
