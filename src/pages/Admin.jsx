import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User,
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
  UserCog,
  FileText,
  TrendingUp,
  Clock,
  UserPlus,
  UserMinus,
  XCircle,
  Menu,
  X,
  Settings,
  LogOut,
  Sun,
  Moon,
  Megaphone,
  Calendar,
  Target,
  Bell,
  CheckCircle2,
  Circle,
  ExternalLink,
  Trash2,
  Save,
  Pencil,
  Bookmark,
  Flame,
  Database,
  Link2,
  FileCode,
  GitBranch,
  Play,
  History,
  PenSquare,
  Sparkles
} from 'lucide-react'
import DOMPurify from 'dompurify'
import { useAuth } from '../contexts/AuthContext'
import CMSManager from '../components/CMSManager'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit, serverTimestamp, getDoc, setDoc } from 'firebase/firestore'
import { updates as staticUpdates } from '../content/updatesData'

// Navigation items with icons
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: BarChart3, description: 'System health & metrics' },
  { id: 'cms', label: 'Edit Content', icon: PenSquare, description: 'Website content & sponsors', featured: true },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone, description: 'Site announcements' },
  { id: 'updates', label: 'Updates', icon: FileText, description: 'News & updates content' },
  { id: 'attendees', label: 'Attendees', icon: Users, description: 'User management' },
  { id: 'sessions', label: 'Sessions', icon: Bookmark, description: 'Session popularity' },
  { id: 'admins', label: 'Admins', icon: UserCog, description: 'Access control' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Goals & configuration' }
]

// DOMPurify config for announcements
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['a', 'strong', 'em', 'b', 'i', 'br', 'span'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
}
const sanitizeHtml = (html) => DOMPurify.sanitize(html, SANITIZE_CONFIG)

// Default settings
const DEFAULT_SETTINGS = {
  attendeeGoal: 150,
  speakerDeadline: '2026-04-01',
  schedulePublishDate: '2026-04-15',
  summitStartDate: '2026-06-08',
  summitEndDate: '2026-06-09',
  ticketPrice: 299
}

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

// Theme hook with localStorage persistence
function useAdminTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-theme') || 'ink'
    }
    return 'ink'
  })

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'ink' ? 'parchment' : 'ink'
      localStorage.setItem('admin-theme', next)
      return next
    })
  }, [])

  return { theme, toggleTheme, isInk: theme === 'ink' }
}

// Settings hook with Firestore persistence
function useAdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'admin_settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...doc.data() })
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const updateSettings = async (newSettings) => {
    await setDoc(doc(db, 'admin_settings', 'config'), {
      ...newSettings,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  return { settings, updateSettings, loading }
}

// Days until a date
function daysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Main Admin Panel
function AdminPanel() {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme, isInk } = useAdminTheme()
  const { settings, updateSettings, loading: settingsLoading } = useAdminSettings()
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
      <div className={`min-h-screen admin-base admin-grid-subtle ${isInk ? 'admin-theme-ink' : 'admin-theme-parchment'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl admin-glass-teal flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-admin-teal animate-spin" />
          </div>
          <p className="font-admin-body text-[var(--admin-text-secondary)]">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Unauthorized
  if (!isAdmin) {
    return (
      <div className={`min-h-screen admin-base admin-grid-subtle ${isInk ? 'admin-theme-ink' : 'admin-theme-parchment'} flex items-center justify-center p-6`}>
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl admin-glass flex items-center justify-center" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
            <Shield className="w-10 h-10 text-admin-rose" />
          </div>
          <h1 className="font-admin-heading text-2xl font-semibold text-[var(--admin-text)] mb-3">
            Access restricted
          </h1>
          <p className="font-admin-body text-[var(--admin-text-secondary)] mb-6">
            This area is reserved for CJS2026 administrators.
          </p>
          {currentUser && (
            <div className="p-4 rounded-xl admin-glass mb-6">
              <p className="text-sm text-[var(--admin-text-muted)] font-admin-body">Logged in as</p>
              <p className="text-[var(--admin-text)] font-admin-mono text-sm">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="admin-btn-secondary"
          >
            Return to site
          </button>
        </motion.div>
      </div>
    )
  }

  // Main admin interface
  return (
    <div className={`min-h-screen admin-base ${isInk ? 'admin-theme-ink' : 'admin-theme-parchment'} flex`}>
      {/* Sidebar - Desktop */}
      <motion.aside
        className={`hidden lg:flex flex-col admin-sidebar ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } transition-all duration-300`}
        initial={false}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--admin-border)]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/cjs-logo-iso.png"
                alt="CJS"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="font-admin-heading font-semibold text-[var(--admin-text)] text-sm">CJS2026</span>
                <span className="block font-admin-mono text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider">Admin</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <img
              src="/cjs-logo-iso.png"
              alt="CJS"
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-3 border-b border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-colors"
          >
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto admin-scrollbar">
          {NAV_ITEMS
            .filter(item => {
              // Only super_admins can see the Admins tab
              if (item.id === 'admins' && userProfile?.role !== 'super_admin') return false
              return true
            })
            .map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isFeatured = item.featured && !isActive
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`admin-nav-item w-full ${isActive ? 'active' : ''} ${isFeatured ? 'relative ring-1 ring-admin-teal/30 bg-admin-teal/5' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isFeatured && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-admin-teal opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-admin-teal"></span>
                  </span>
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-admin-teal' : ''} ${isFeatured ? 'text-admin-teal' : ''}`} />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className={`block text-sm font-medium ${isFeatured ? 'text-admin-teal' : ''}`}>{item.label}</span>
                    <span className="block text-[11px] text-[var(--admin-text-muted)] truncate">{item.description}</span>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Theme toggle + User section - Sticky at bottom */}
        <div className="sticky bottom-0 p-3 border-t border-[var(--admin-border)] bg-[var(--admin-sidebar)] backdrop-blur-xl shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.2)]">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 transition-colors ${
              isInk ? 'bg-[var(--admin-elevated)] text-[var(--admin-text)]' : 'bg-admin-ink text-white'
            }`}
          >
            {isInk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!sidebarCollapsed && (
              <span className="font-admin-body text-sm">
                {isInk ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>

          {!sidebarCollapsed ? (
            <div className="p-3 rounded-xl admin-glass">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--admin-elevated)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-admin-body text-sm font-medium text-[var(--admin-text)] truncate">
                    {currentUser?.displayName || 'Admin'}
                  </p>
                  <p className="font-admin-mono text-[11px] text-[var(--admin-text-muted)] truncate">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-3 py-1.5 font-admin-body text-xs font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] rounded-lg hover:bg-[var(--admin-elevated)] transition-colors"
                >
                  My profile
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 font-admin-body text-xs font-medium text-[var(--admin-text-secondary)] hover:text-admin-rose rounded-lg hover:bg-[var(--admin-elevated)] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-3 rounded-xl text-[var(--admin-text-secondary)] hover:text-admin-rose hover:bg-[var(--admin-elevated)] transition-colors"
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
              className={`lg:hidden fixed inset-y-0 left-0 w-72 admin-sidebar z-50 flex flex-col ${isInk ? 'admin-theme-ink' : 'admin-theme-parchment'}`}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--admin-border)]">
                <div className="flex items-center gap-3">
                  <img
                    src="/cjs-logo-iso.png"
                    alt="CJS"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-admin-heading font-semibold text-[var(--admin-text)]">CJS2026 Admin</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS
                  .filter(item => {
                    // Only super_admins can see the Admins tab
                    if (item.id === 'admins' && userProfile?.role !== 'super_admin') return false
                    return true
                  })
                  .map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  const isFeatured = item.featured && !isActive
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`admin-nav-item w-full ${isActive ? 'active' : ''} ${isFeatured ? 'relative ring-1 ring-admin-teal/30 bg-admin-teal/5' : ''}`}
                    >
                      {isFeatured && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-admin-teal opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-admin-teal"></span>
                        </span>
                      )}
                      <Icon className={`w-5 h-5 ${isFeatured ? 'text-admin-teal' : ''}`} />
                      <span className={`font-medium ${isFeatured ? 'text-admin-teal' : ''}`}>{item.label}</span>
                    </button>
                  )
                })}
              </nav>
              <div className="p-3 border-t border-[var(--admin-border)]">
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isInk ? 'bg-[var(--admin-elevated)] text-[var(--admin-text)]' : 'bg-admin-ink text-white'
                  }`}
                >
                  {isInk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="font-admin-body text-sm">
                    {isInk ? 'Light mode' : 'Dark mode'}
                  </span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 admin-grid-subtle">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Admin'}
              </h1>
              <p className="font-admin-body text-xs text-[var(--admin-text-muted)] hidden sm:block">
                {NAV_ITEMS.find(n => n.id === activeTab)?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="admin-btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View site</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto admin-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && <DashboardTab currentUser={currentUser} isInk={isInk} settings={settings} />}
              {activeTab === 'broadcast' && <BroadcastTab currentUser={currentUser} isInk={isInk} />}
              {activeTab === 'updates' && <UpdatesTab currentUser={currentUser} isInk={isInk} />}
              {activeTab === 'attendees' && <AttendeesTab currentUser={currentUser} isInk={isInk} />}
              {activeTab === 'sessions' && <SessionsTab currentUser={currentUser} isInk={isInk} />}
              {activeTab === 'cms' && <CMSTab currentUser={currentUser} userRole={userProfile?.role} isInk={isInk} />}
              {activeTab === 'admins' && <AdminsTab currentUser={currentUser} isInk={isInk} />}
              {activeTab === 'settings' && <SettingsTab settings={settings} updateSettings={updateSettings} loading={settingsLoading} isInk={isInk} toggleTheme={toggleTheme} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// KPI Card component with glass-morphism
function KPICard({ title, value, subtitle, icon: Icon, color = 'teal', goal = null }) {
  const iconColors = {
    teal: 'text-admin-teal',
    emerald: 'text-admin-emerald',
    amber: 'text-admin-amber',
    rose: 'text-admin-rose'
  }

  const progress = goal ? Math.min((parseInt(value) / goal) * 100, 100) : null

  return (
    <div className="admin-kpi-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center">
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
        {goal && (
          <span className="admin-badge admin-badge-info">
            Goal: {goal}
          </span>
        )}
      </div>
      <p className="admin-metric">{value}</p>
      <p className="font-admin-body text-sm text-[var(--admin-text-secondary)] mt-1">{title}</p>
      {subtitle && <p className="font-admin-mono text-xs text-[var(--admin-text-muted)] mt-1">{subtitle}</p>}
      {progress !== null && (
        <div className="mt-4">
          <div className="admin-progress">
            <div className="admin-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="font-admin-mono text-xs text-[var(--admin-text-muted)] mt-1">{progress.toFixed(0)}% of goal</p>
        </div>
      )}
    </div>
  )
}

// Dashboard Tab
function DashboardTab({ currentUser, isInk, settings }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Build milestones from settings
  const milestones = [
    { id: 'speaker-deadline', label: 'Speaker confirmations', date: settings.speakerDeadline, icon: Users },
    { id: 'schedule-publish', label: 'Schedule published', date: settings.schedulePublishDate, icon: Calendar },
    { id: 'summit-start', label: 'Summit begins', date: settings.summitStartDate, icon: Target }
  ]

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
          <Loader2 className="w-8 h-8 mx-auto text-admin-teal animate-spin mb-4" />
          <p className="font-admin-body text-[var(--admin-text-secondary)]">Loading system stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-admin-rose mb-4" />
          <p className="font-admin-body text-admin-rose font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Primary KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Attendee reach"
          value={stats.users.total}
          icon={Users}
          color="teal"
          goal={settings.attendeeGoal}
        />
        <KPICard
          title="Profile completion"
          value={`${stats.users.profileCompletionRate}%`}
          subtitle={`${stats.users.profileComplete} of ${stats.users.total} users`}
          icon={CheckCircle}
          color="emerald"
        />
        <KPICard
          title="Tickets purchased"
          value={stats.users.ticketsPurchased}
          icon={Target}
          color="teal"
        />
        <KPICard
          title="Email signups"
          value={stats.emailSignups}
          icon={Mail}
          color="amber"
        />
      </div>

      {/* Milestones */}
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center">
            <Calendar className="w-5 h-5 text-admin-teal" />
          </div>
          <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Upcoming milestones</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map(milestone => {
            const days = daysUntil(milestone.date)
            const Icon = milestone.icon
            const isPast = days < 0
            const isUrgent = days >= 0 && days <= 14
            return (
              <div key={milestone.id} className={`p-4 rounded-xl admin-glass ${isPast ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-4 h-4 ${isUrgent ? 'text-admin-amber' : 'text-[var(--admin-text-secondary)]'}`} />
                  <span className={`admin-badge ${isPast ? 'admin-badge-success' : isUrgent ? 'admin-badge-warning' : 'admin-badge-info'}`}>
                    {isPast ? 'Complete' : `${days}d`}
                  </span>
                </div>
                <p className="font-admin-body text-sm text-[var(--admin-text)]">{milestone.label}</p>
                <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">{milestone.date}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Registration funnel */}
      <div className="admin-surface p-4 sm:p-6">
        <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)] mb-4 sm:mb-6">Registration funnel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl admin-glass flex items-center justify-center mb-3" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <Clock className="w-8 h-8 text-admin-amber" />
            </div>
            <p className="admin-metric">{stats.users.pending}</p>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Pending</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl admin-glass-teal flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-admin-teal" />
            </div>
            <p className="admin-metric">{stats.users.registered}</p>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Registered</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl admin-glass flex items-center justify-center mb-3" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle className="w-8 h-8 text-admin-emerald" />
            </div>
            <p className="admin-metric">{stats.users.confirmed}</p>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Confirmed</p>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="admin-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-admin-teal" />
            </div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Recent signups</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl admin-glass">
              <div>
                <p className="admin-metric text-2xl">{stats.signups.last24h}</p>
                <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Last 24 hours</p>
              </div>
              <div className="w-12 h-12 rounded-full admin-glass-teal flex items-center justify-center">
                <Clock className="w-5 h-5 text-admin-teal" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl admin-glass">
                <p className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">{stats.signups.last7d}</p>
                <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">Last 7 days</p>
              </div>
              <div className="p-4 rounded-xl admin-glass">
                <p className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">{stats.signups.last30d}</p>
                <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* System health */}
        <div className="admin-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Activity className="w-5 h-5 text-admin-emerald" />
            </div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">System health</h3>
            <span className="ml-auto admin-badge admin-badge-info">Last 24h</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl admin-glass" style={{ borderColor: stats.activity.recentErrors === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)' }}>
              {stats.activity.recentErrors === 0 ? (
                <CheckCircle className="w-6 h-6 text-admin-emerald" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-admin-rose" />
              )}
              <div className="flex-1">
                <p className="font-admin-body font-semibold text-[var(--admin-text)]">{stats.activity.recentErrors} errors</p>
                <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">
                  {stats.activity.recentErrors === 0 ? 'All systems operational' : 'Needs attention'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl admin-glass">
              <Activity className="w-6 h-6 text-admin-teal" />
              <div className="flex-1">
                <p className="font-admin-body font-semibold text-[var(--admin-text)]">{stats.activity.recentActivity} activities</p>
                <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">User actions logged</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={fetchStats}
          className="admin-btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh data
        </button>
      </div>
    </div>
  )
}

// Settings Tab
function SettingsTab({ settings, updateSettings, loading, isInk, toggleTheme }) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await updateSettings(localSettings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleChange(key, value) {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-admin-teal animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Appearance */}
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
            {isInk ? <Moon className="w-5 h-5 text-admin-teal" /> : <Sun className="w-5 h-5 text-admin-teal" />}
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Appearance</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Customize the admin panel theme</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl admin-glass">
          <div>
            <p className="font-admin-body font-medium text-[var(--admin-text)]">
              {isInk ? 'Dark mode (Ink)' : 'Light mode (Parchment)'}
            </p>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">
              {isInk ? 'Easy on the eyes in low light' : 'Bright and clean for daytime'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl font-admin-body text-sm font-medium transition-colors ${
              isInk
                ? 'bg-admin-amber/20 text-admin-amber hover:bg-admin-amber/30'
                : 'bg-admin-ink/10 text-admin-ink hover:bg-admin-ink/20'
            }`}
          >
            {isInk ? 'Switch to light' : 'Switch to dark'}
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
            <Target className="w-5 h-5 text-admin-teal" />
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Goals</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Target metrics for the summit</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Attendee goal
            </label>
            <input
              type="number"
              value={localSettings.attendeeGoal}
              onChange={(e) => handleChange('attendeeGoal', parseInt(e.target.value) || 0)}
              className="admin-input w-full"
            />
            <p className="font-admin-mono text-xs text-[var(--admin-text-muted)] mt-1">Used for progress tracking on dashboard</p>
          </div>
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Ticket price ($)
            </label>
            <input
              type="number"
              value={localSettings.ticketPrice}
              onChange={(e) => handleChange('ticketPrice', parseInt(e.target.value) || 0)}
              className="admin-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Key dates */}
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center">
            <Calendar className="w-5 h-5 text-admin-teal" />
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Key dates</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Milestones and deadlines</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Speaker confirmation deadline
            </label>
            <input
              type="date"
              value={localSettings.speakerDeadline}
              onChange={(e) => handleChange('speakerDeadline', e.target.value)}
              className="admin-input w-full"
            />
          </div>
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Schedule publish date
            </label>
            <input
              type="date"
              value={localSettings.schedulePublishDate}
              onChange={(e) => handleChange('schedulePublishDate', e.target.value)}
              className="admin-input w-full"
            />
          </div>
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Summit start date
            </label>
            <input
              type="date"
              value={localSettings.summitStartDate}
              onChange={(e) => handleChange('summitStartDate', e.target.value)}
              className="admin-input w-full"
            />
          </div>
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Summit end date
            </label>
            <input
              type="date"
              value={localSettings.summitEndDate}
              onChange={(e) => handleChange('summitEndDate', e.target.value)}
              className="admin-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save settings
        </button>
        {saved && (
          <motion.span
            className="flex items-center gap-2 text-admin-emerald font-admin-body text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <CheckCircle className="w-4 h-4" />
            Saved successfully
          </motion.span>
        )}
      </div>
    </div>
  )
}

// Broadcast Tab - Announcement management
function BroadcastTab({ currentUser, isInk }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [newType, setNewType] = useState('info')
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit state
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [editMessage, setEditMessage] = useState('')
  const [editType, setEditType] = useState('info')
  const [editLinkText, setEditLinkText] = useState('')
  const [editLinkUrl, setEditLinkUrl] = useState('')

  // Listen to announcements in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = []
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() })
      })
      setAnnouncements(items)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Generate HTML message with link
  function generateHtmlMessage() {
    let html = newMessage.trim()
    if (linkText && linkUrl) {
      // If the link text exists in the message, replace it with a link
      if (html.includes(linkText)) {
        html = html.replace(
          linkText,
          `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
        )
      } else {
        // Otherwise append the link
        html += ` <a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      }
    }
    return html
  }

  async function createAnnouncement() {
    if (!newMessage.trim()) return
    setSaving(true)
    try {
      const htmlMessage = generateHtmlMessage()
      await addDoc(collection(db, 'announcements'), {
        message: newMessage.trim(),
        htmlMessage: htmlMessage,
        type: newType,
        active: true,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email
      })
      setNewMessage('')
      setNewType('info')
      setLinkText('')
      setLinkUrl('')
    } catch (err) {
      console.error('Failed to create announcement:', err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(announcement) {
    const action = announcement.active ? 'deactivate' : 'activate'
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this announcement? ${announcement.active ? 'It will no longer appear on the site.' : 'It will appear on the site immediately.'}`)) {
      return
    }
    try {
      await updateDoc(doc(db, 'announcements', announcement.id), {
        active: !announcement.active
      })
    } catch (err) {
      console.error('Failed to toggle announcement:', err)
      alert(`Failed to ${action} announcement: ${err.message}`)
    }
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await deleteDoc(doc(db, 'announcements', id))
    } catch (err) {
      console.error('Failed to delete announcement:', err)
    }
  }

  // Start editing an announcement
  function startEdit(announcement) {
    setEditingAnnouncement(announcement)
    setEditMessage(announcement.message || '')
    setEditType(announcement.type || 'info')
    // Try to extract link from htmlMessage if present
    const linkMatch = announcement.htmlMessage?.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/)
    if (linkMatch) {
      setEditLinkUrl(linkMatch[1])
      setEditLinkText(linkMatch[2])
    } else {
      setEditLinkUrl('')
      setEditLinkText('')
    }
  }

  // Cancel editing
  function cancelEdit() {
    setEditingAnnouncement(null)
    setEditMessage('')
    setEditType('info')
    setEditLinkText('')
    setEditLinkUrl('')
  }

  // Generate HTML message for edit
  function generateEditHtmlMessage() {
    let html = editMessage.trim()
    if (editLinkText && editLinkUrl) {
      if (html.includes(editLinkText)) {
        html = html.replace(
          editLinkText,
          `<a href="${editLinkUrl}" target="_blank" rel="noopener noreferrer">${editLinkText}</a>`
        )
      } else {
        html += ` <a href="${editLinkUrl}" target="_blank" rel="noopener noreferrer">${editLinkText}</a>`
      }
    }
    return html
  }

  // Save edited announcement
  async function saveEdit() {
    if (!editingAnnouncement || !editMessage.trim()) return
    setSaving(true)
    try {
      const htmlMessage = generateEditHtmlMessage()
      await updateDoc(doc(db, 'announcements', editingAnnouncement.id), {
        message: editMessage.trim(),
        htmlMessage: htmlMessage,
        type: editType,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByEmail: currentUser.email
      })
      cancelEdit()
    } catch (err) {
      console.error('Failed to update announcement:', err)
    } finally {
      setSaving(false)
    }
  }

  const typeOptions = [
    { value: 'info', label: 'Info', icon: Bell },
    { value: 'warning', label: 'Warning', icon: AlertTriangle },
    { value: 'urgent', label: 'Urgent', icon: AlertCircle }
  ]

  const getTypeStyle = (type) => {
    switch (type) {
      case 'warning': return 'admin-badge-warning'
      case 'urgent': return 'admin-badge-error'
      default: return 'admin-badge-info'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-admin-teal animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Create new announcement */}
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-admin-teal" />
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Create announcement</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">
              Banner will appear on the homepage above the anniversary badge
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Message
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tickets are now on sale via Eventbrite! Get yours at bit.ly/cjs2026!"
              rows={2}
              className="admin-input w-full resize-y min-h-[60px]"
            />
          </div>

          {/* Link fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
                Link text <span className="text-[var(--admin-text-muted)]">(optional)</span>
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="bit.ly/cjs2026"
                className="admin-input w-full"
              />
              <p className="font-admin-body text-xs text-[var(--admin-text-muted)] mt-1">
                Text in your message to turn into a link
              </p>
            </div>
            <div>
              <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
                Link URL <span className="text-[var(--admin-text-muted)]">(optional)</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://bit.ly/cjs2026"
                className="admin-input w-full"
              />
            </div>
          </div>

          {/* Preview */}
          {newMessage.trim() && (
            <div>
              <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
                Preview
              </label>
              <div className="p-4 rounded-xl bg-brand-teal/10 border-2 border-brand-teal/30">
                <div
                  className="text-brand-teal font-body font-medium text-sm announcement-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(generateHtmlMessage()) }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">
              Type
            </label>
            <div className="flex gap-3">
              {typeOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => setNewType(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                      newType === opt.value
                        ? 'border-admin-teal bg-admin-teal/10 text-admin-teal'
                        : 'border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-text-secondary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-admin-body text-sm">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={createAnnouncement}
            disabled={saving || !newMessage.trim()}
            className="admin-btn-primary flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            Publish announcement
          </button>
        </div>
      </div>

      {/* Active announcements */}
      <div className="admin-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Announcements</h3>
          <span className="admin-badge admin-badge-info">
            {announcements.filter(a => a.active).length} active
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 mx-auto text-[var(--admin-text-muted)] mb-4" />
            <p className="font-admin-body text-[var(--admin-text-secondary)]">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <motion.div
                key={announcement.id}
                className={`p-4 rounded-xl admin-glass ${!announcement.active ? 'opacity-50' : ''}`}
                layout
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`admin-badge ${getTypeStyle(announcement.type)}`}>
                        {announcement.type}
                      </span>
                      <span className={`admin-badge ${announcement.active ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                        {announcement.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div
                      className="font-admin-body text-[var(--admin-text)] announcement-content"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.htmlMessage || announcement.message) }}
                    />
                    <p className="font-admin-mono text-xs text-[var(--admin-text-muted)] mt-2">
                      Created by {announcement.createdByEmail} • {announcement.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(announcement)}
                      className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-admin-teal hover:bg-admin-teal/10 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleActive(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.active
                          ? 'text-admin-emerald hover:bg-admin-emerald/10'
                          : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-elevated)]'
                      }`}
                      title={announcement.active ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.active ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-admin-rose hover:bg-admin-rose/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingAnnouncement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelEdit}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg admin-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-admin-teal" />
                  </div>
                  <div>
                    <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
                      Edit announcement
                    </h3>
                    <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
                      Update the message, type, or link
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelEdit}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Message */}
                <div>
                  <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    rows={2}
                    className="admin-input w-full resize-y min-h-[60px]"
                    placeholder="Enter your announcement message..."
                  />
                </div>

                {/* Link fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Link text <span className="text-[var(--admin-text-muted)] font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editLinkText}
                      onChange={(e) => setEditLinkText(e.target.value)}
                      placeholder="bit.ly/cjs2026"
                      className="admin-input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Link URL <span className="text-[var(--admin-text-muted)] font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={editLinkUrl}
                      onChange={(e) => setEditLinkUrl(e.target.value)}
                      placeholder="https://bit.ly/cjs2026"
                      className="admin-input w-full h-11"
                    />
                  </div>
                </div>

                {/* Type selector */}
                <div>
                  <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map(opt => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setEditType(opt.value)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                            editType === opt.value
                              ? 'border-admin-teal bg-admin-teal/10 text-admin-teal shadow-sm'
                              : 'border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-text-muted)] hover:bg-[var(--admin-elevated)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-admin-body text-sm font-medium">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Preview */}
                {editMessage.trim() && (
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                      Preview
                    </label>
                    <div className={`p-4 rounded-xl ${
                      editType === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                      editType === 'urgent' ? 'bg-brand-cardinal/10 border border-brand-cardinal/30' :
                      'bg-brand-teal/10 border border-brand-teal/30'
                    }`}>
                      <div
                        className={`font-body font-medium text-sm announcement-content ${
                          editType === 'warning' ? 'text-amber-600' :
                          editType === 'urgent' ? 'text-brand-cardinal' :
                          'text-brand-teal'
                        }`}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(generateEditHtmlMessage()) }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-elevated)]/30">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] border border-transparent hover:border-[var(--admin-border)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving || !editMessage.trim()}
                  className="admin-btn-primary flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// CMS Tab - Full content management system
function CMSTab({ currentUser, userRole, isInk }) {
  return <CMSManager currentUser={currentUser} userRole={userRole} isInk={isInk} />
}

// Format time string for display
function formatSessionTime(timeStr) {
  if (!timeStr) return ''
  if (timeStr.includes('T') || timeStr.includes('Z')) {
    try {
      const date = new Date(timeStr)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      }
    } catch (e) { /* fall through */ }
  }
  return timeStr
}

// Sessions Tab - Session popularity analytics
function SessionsTab({ currentUser, isInk }) {
  const [bookmarkCounts, setBookmarkCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [sessionLoadError, setSessionLoadError] = useState(null)

  // Fetch bookmark counts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'sessionBookmarks'),
      (snapshot) => {
        const counts = {}
        snapshot.forEach((doc) => {
          counts[doc.id] = doc.data().count || 0
        })
        setBookmarkCounts(counts)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching bookmark counts:', error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // Load session data from static file
  useEffect(() => {
    import('../content/scheduleData')
      .then((module) => {
        const allSessions = [
          ...(module.sessionsByDay.monday || []),
          ...(module.sessionsByDay.tuesday || [])
        ]
        setSessions(allSessions)
        setSessionLoadError(null)
      })
      .catch((error) => {
        console.error('Failed to load schedule data:', error)
        setSessionLoadError('Failed to load session data. Please refresh the page.')
      })
  }, [])

  // Combine sessions with bookmark counts and sort by count
  const sessionsWithCounts = sessions
    .filter(s => s.isBookmarkable)
    .map(session => ({
      ...session,
      bookmarkCount: bookmarkCounts[session.id] || 0
    }))
    .sort((a, b) => b.bookmarkCount - a.bookmarkCount)

  const totalBookmarks = Object.values(bookmarkCounts).reduce((sum, count) => sum + Math.max(0, count), 0)
  const hotSessions = sessionsWithCounts.filter(s => s.bookmarkCount >= 10)
  const popularSessions = sessionsWithCounts.filter(s => s.bookmarkCount >= 5 && s.bookmarkCount < 10)
  const coldSessions = sessionsWithCounts.filter(s => s.bookmarkCount === 0)

  const getTierBadge = (count) => {
    if (count >= 10) return { label: 'Hot', bg: 'bg-gradient-to-r from-orange-500 to-red-500', text: 'text-white', icon: Flame }
    if (count >= 5) return { label: 'Popular', bg: 'bg-amber-500/20', text: 'text-amber-600', icon: Flame }
    if (count > 0) return { label: 'Normal', bg: 'bg-[var(--admin-surface)]', text: 'text-[var(--admin-text-muted)]', icon: Users }
    return { label: 'Cold', bg: 'bg-blue-500/10', text: 'text-blue-500', icon: AlertCircle }
  }

  return (
    <div className="space-y-6">
      {/* Error state */}
      {sessionLoadError && (
        <div className="admin-card p-4 border-l-4 border-admin-rose">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-admin-rose flex-shrink-0" />
            <div>
              <p className="font-admin-body text-sm text-admin-rose">{sessionLoadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-admin-teal/10 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-admin-teal" />
            </div>
            <div>
              <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">Total Bookmarks</p>
              <p className="font-admin-heading text-2xl font-bold text-[var(--admin-text)]">{totalBookmarks}</p>
            </div>
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">Hot Sessions</p>
              <p className="font-admin-heading text-2xl font-bold text-[var(--admin-text)]">{hotSessions.length}</p>
            </div>
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">Popular</p>
              <p className="font-admin-heading text-2xl font-bold text-[var(--admin-text)]">{popularSessions.length}</p>
            </div>
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">Need Attention</p>
              <p className="font-admin-heading text-2xl font-bold text-[var(--admin-text)]">{coldSessions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session list */}
      <div className="admin-card">
        <div className="p-4 border-b border-[var(--admin-border)]">
          <h3 className="font-admin-heading font-semibold text-[var(--admin-text)]">Session Popularity Rankings</h3>
          <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
            Sessions sorted by bookmark count. Hot = 10+, Popular = 5-9, Cold = 0.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--admin-text-muted)]" />
          </div>
        ) : sessionsWithCounts.length === 0 && Object.keys(bookmarkCounts).length === 0 ? (
          <div className="p-8 text-center text-[var(--admin-text-muted)]">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No bookmarkable sessions found</p>
          </div>
        ) : sessionsWithCounts.length === 0 && Object.keys(bookmarkCounts).length > 0 ? (
          <div className="p-4">
            <div className="p-3 bg-amber-500/10 rounded-lg mb-4">
              <p className="font-admin-body text-sm text-amber-600">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Schedule data not yet published. Showing raw bookmark counts from Firestore:
              </p>
            </div>
            <div className="divide-y divide-[var(--admin-border)]">
              {Object.entries(bookmarkCounts)
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([sessionId, count], index) => {
                  const tier = getTierBadge(count)
                  const TierIcon = tier.icon
                  return (
                    <div key={sessionId} className="p-4 flex items-center gap-4 hover:bg-[var(--admin-surface-hover)] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[var(--admin-surface)] flex items-center justify-center font-admin-heading font-bold text-sm text-[var(--admin-text-muted)]">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-admin-body font-medium text-[var(--admin-text)] truncate font-mono text-sm">{sessionId}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${tier.bg} ${tier.text}`}>
                            <TierIcon className="w-3 h-3" />
                            {tier.label}
                          </span>
                        </div>
                        <p className="font-admin-body text-xs text-[var(--admin-text-muted)]">
                          Session ID from Firestore
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-lg ${count >= 10 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : count >= 5 ? 'bg-amber-500/20 text-amber-600' : 'bg-[var(--admin-surface)] text-[var(--admin-text)]'}`}>
                          <span className="font-admin-heading font-bold">{count}</span>
                          <span className="font-admin-body text-xs ml-1 opacity-80">saves</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--admin-border)]">
            {sessionsWithCounts.map((session, index) => {
              const tier = getTierBadge(session.bookmarkCount)
              const TierIcon = tier.icon
              return (
                <div key={session.id} className="p-4 flex items-center gap-4 hover:bg-[var(--admin-surface-hover)] transition-colors">
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full bg-[var(--admin-surface)] flex items-center justify-center font-admin-heading font-bold text-sm text-[var(--admin-text-muted)]">
                    {index + 1}
                  </div>

                  {/* Session info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-admin-body font-medium text-[var(--admin-text)] truncate">{session.title}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${tier.bg} ${tier.text}`}>
                        <TierIcon className="w-3 h-3" />
                        {tier.label}
                      </span>
                    </div>
                    <p className="font-admin-body text-xs text-[var(--admin-text-muted)]">
                      {session.day} • {formatSessionTime(session.startTime)} {session.room && `• ${session.room}`}
                    </p>
                  </div>

                  {/* Bookmark count */}
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-lg ${session.bookmarkCount >= 10 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : session.bookmarkCount >= 5 ? 'bg-amber-500/20 text-amber-600' : 'bg-[var(--admin-surface)] text-[var(--admin-text)]'}`}>
                      <span className="font-admin-heading font-bold">{session.bookmarkCount}</span>
                      <span className="font-admin-body text-xs ml-1 opacity-80">saves</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cold sessions alert */}
      {coldSessions.length > 0 && (
        <div className="admin-card p-4 border-l-4 border-blue-500">
          <h4 className="font-admin-heading font-semibold text-[var(--admin-text)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Sessions needing promotion ({coldSessions.length})
          </h4>
          <p className="font-admin-body text-sm text-[var(--admin-text-muted)] mt-1 mb-3">
            These sessions have no bookmarks yet. Consider promoting them in emails or social media.
          </p>
          <div className="flex flex-wrap gap-2">
            {coldSessions.slice(0, 5).map(session => (
              <span key={session.id} className="inline-block px-2 py-1 bg-[var(--admin-surface)] rounded text-xs font-admin-body text-[var(--admin-text)]">
                {session.title}
              </span>
            ))}
            {coldSessions.length > 5 && (
              <span className="inline-block px-2 py-1 text-xs font-admin-body text-[var(--admin-text-muted)]">
                +{coldSessions.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Attendees Tab
function AttendeesTab({ currentUser, isInk }) {
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

  // Edit/Delete modal state
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [deletingUser, setDeletingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      'Name', 'Email', 'Organization', 'Job Title', 'Registration Status',
      'Badges', 'Attended Summits', 'Website', 'Instagram', 'LinkedIn', 'Bluesky',
      'Notify When Available', 'Eventbrite Attendee ID', 'Eventbrite Order ID', 'Created At'
    ]
    const rows = filteredAttendees.map(a => [
      a.displayName, a.email, a.organization,
      // Use jobTitle, or fall back to role if it's not a system role
      a.jobTitle || (!['admin', 'super_admin'].includes(a.role) ? a.role : ''),
      a.registrationStatus,
      (a.badges || []).map(id => getBadgeInfo(id)?.label || id).join('; '),
      (a.attendedSummits || []).join('; '), a.website, a.instagram, a.linkedin, a.bluesky,
      a.notifyWhenTicketsAvailable ? 'Yes' : 'No',
      a.eventbriteAttendeeId || '', a.eventbriteOrderId || '',
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

  // Filter and sort
  const filteredAttendees = attendees
    .filter(a => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        // Search in name, email, organization, and job title
        if (!a.displayName?.toLowerCase().includes(term) &&
            !a.email?.toLowerCase().includes(term) &&
            !a.organization?.toLowerCase().includes(term) &&
            !a.jobTitle?.toLowerCase().includes(term) &&
            // Also check old role field for backwards compatibility (excluding system roles)
            !(a.role && !['admin', 'super_admin'].includes(a.role) && a.role.toLowerCase().includes(term))) return false
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

  // Edit user handlers
  function openEditModal(user) {
    setEditFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      organization: user.organization || '',
      jobTitle: user.jobTitle || '',
      registrationStatus: user.registrationStatus || 'pending',
      role: user.role || '', // System role (admin, super_admin)
      website: user.website || '',
      instagram: user.instagram || '',
      linkedin: user.linkedin || '',
      bluesky: user.bluesky || ''
    })
    setEditingUser(user)
  }

  function closeEditModal() {
    setEditingUser(null)
    setEditFormData({})
  }

  async function handleEditSave() {
    if (!editingUser) return
    setSaving(true)
    try {
      const userRef = doc(db, 'users', editingUser.uid)
      await updateDoc(userRef, {
        displayName: editFormData.displayName,
        organization: editFormData.organization,
        jobTitle: editFormData.jobTitle,
        registrationStatus: editFormData.registrationStatus,
        role: editFormData.role || null, // Clear if empty
        website: editFormData.website,
        instagram: editFormData.instagram,
        linkedin: editFormData.linkedin,
        bluesky: editFormData.bluesky,
        updatedAt: serverTimestamp()
      })
      // Update local state
      setAttendees(prev => prev.map(a =>
        a.uid === editingUser.uid
          ? { ...a, ...editFormData }
          : a
      ))
      closeEditModal()
    } catch (err) {
      console.error('Failed to update user:', err)
      alert('Failed to update user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Delete user handlers
  function openDeleteModal(user) {
    setDeletingUser(user)
  }

  function closeDeleteModal() {
    setDeletingUser(null)
  }

  async function handleDelete() {
    if (!deletingUser) return
    setDeleting(true)
    try {
      const userRef = doc(db, 'users', deletingUser.uid)
      await deleteDoc(userRef)
      // Update local state
      setAttendees(prev => prev.filter(a => a.uid !== deletingUser.uid))
      closeDeleteModal()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-admin-teal animate-spin mb-4" />
          <p className="font-admin-body text-[var(--admin-text-secondary)]">Loading attendees...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-admin-rose mb-4" />
          <p className="font-admin-body text-admin-rose font-medium">{error}</p>
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
          className="admin-btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={exportToCSV}
          disabled={filteredAttendees.length === 0}
          className="admin-btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
          onClick={syncAllToAirtable}
          disabled={syncing}
          className="admin-btn-primary flex items-center gap-2"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Sync to Airtable
        </button>
      </div>

      {/* Sync result */}
      {syncResult && (
        <motion.div
          className="flex items-center gap-3 p-4 rounded-xl admin-glass"
          style={{ borderColor: syncResult.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {syncResult.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-admin-emerald" />
          ) : (
            <AlertCircle className="w-5 h-5 text-admin-rose" />
          )}
          <span className={`font-admin-body ${syncResult.type === 'success' ? 'text-admin-emerald' : 'text-admin-rose'}`}>
            {syncResult.message}
          </span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="admin-surface p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, org..."
                className="admin-input w-full pl-11"
              />
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <select
              value={filterBadge}
              onChange={(e) => setFilterBadge(e.target.value)}
              className="admin-input flex-1 sm:flex-none text-sm"
            >
              <option value="">All badges</option>
              {ALL_BADGES.map(badge => (
                <option key={badge.id} value={badge.id}>{badge.emoji} {badge.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-input flex-1 sm:flex-none text-sm"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
        </div>
        {(searchTerm || filterBadge || filterStatus) && (
          <div className="mt-3 flex items-center gap-3 font-admin-body text-sm">
            <span className="text-[var(--admin-text-secondary)]">
              Showing {filteredAttendees.length} of {attendees.length}
            </span>
            <button
              onClick={() => { setSearchTerm(''); setFilterBadge(''); setFilterStatus(''); }}
              className="text-admin-teal hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="admin-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  className="cursor-pointer hover:text-[var(--admin-text)]"
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
                  className="hidden md:table-cell cursor-pointer hover:text-[var(--admin-text)]"
                  onClick={() => toggleSort('organization')}
                >
                  <span className="inline-flex items-center gap-2">
                    Organization
                    {sortField === 'organization' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
                <th className="hidden lg:table-cell">Badges</th>
                <th
                  className="cursor-pointer hover:text-[var(--admin-text)]"
                  onClick={() => toggleSort('registrationStatus')}
                >
                  <span className="inline-flex items-center gap-2">
                    Status
                    {sortField === 'registrationStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
                <th className="hidden lg:table-cell">Eventbrite</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map(attendee => (
                <React.Fragment key={attendee.uid}>
                  <tr
                    className="cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === attendee.uid ? null : attendee.uid)}
                  >
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center overflow-hidden flex-shrink-0">
                          {attendee.photoURL ? (
                            <img src={attendee.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-[var(--admin-text-secondary)]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-admin-body font-medium text-[var(--admin-text)]">{attendee.displayName || 'No name'}</p>
                            {attendee.role === 'super_admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-admin-amber/10 text-admin-amber text-xs font-medium" title="Super Admin">
                                <Shield className="w-3 h-3" />
                                Super
                              </span>
                            )}
                            {attendee.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-admin-teal/10 text-admin-teal text-xs font-medium" title="Admin">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">{attendee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <p className="font-admin-body text-[var(--admin-text)]">{attendee.organization || '—'}</p>
                      {/* Show job title (check both new jobTitle and old role field, excluding system roles) */}
                      {(attendee.jobTitle || (attendee.role && !['admin', 'super_admin'].includes(attendee.role))) && (
                        <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">{attendee.jobTitle || attendee.role}</p>
                      )}
                    </td>
                    <td className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(attendee.badges || []).slice(0, 3).map(badgeId => {
                          const badge = getBadgeInfo(badgeId)
                          return badge ? (
                            <span
                              key={badgeId}
                              className="inline-flex items-center px-2 py-0.5 rounded-md admin-glass text-xs"
                              title={badge.label}
                            >
                              {badge.emoji}
                            </span>
                          ) : null
                        })}
                        {(attendee.badges?.length || 0) > 3 && (
                          <span className="font-admin-mono text-xs text-[var(--admin-text-muted)]">+{attendee.badges.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        attendee.registrationStatus === 'confirmed'
                          ? 'admin-badge-success'
                          : attendee.registrationStatus === 'registered'
                            ? 'admin-badge-info'
                            : 'admin-badge-warning'
                      }`}>
                        {attendee.registrationStatus || 'pending'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      {attendee.eventbriteAttendeeId ? (
                        <span className="font-admin-mono text-xs text-[var(--admin-text-secondary)]" title={`Order: ${attendee.eventbriteOrderId || 'N/A'}`}>
                          {attendee.eventbriteAttendeeId.slice(-8)}
                        </span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1 sm:gap-2">
                        {attendee.email && (
                          <a
                            href={`mailto:${attendee.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 sm:p-2 rounded-lg admin-glass text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] transition-colors touch-manipulation"
                            title="Send email"
                          >
                            <Mail className="w-5 h-5 sm:w-4 sm:h-4" />
                          </a>
                        )}
                        {attendee.linkedin && (
                          <a
                            href={`https://linkedin.com/in/${attendee.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hidden sm:block p-2.5 sm:p-2 rounded-lg admin-glass text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] transition-colors touch-manipulation"
                            title="View LinkedIn"
                          >
                            <Linkedin className="w-5 h-5 sm:w-4 sm:h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(attendee); }}
                          className="p-2.5 sm:p-2 rounded-lg admin-glass text-[var(--admin-text-secondary)] hover:text-admin-teal transition-colors touch-manipulation"
                          title="Edit user"
                        >
                          <Pencil className="w-5 h-5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openDeleteModal(attendee); }}
                          className="p-2.5 sm:p-2 rounded-lg admin-glass text-[var(--admin-text-secondary)] hover:text-admin-rose transition-colors touch-manipulation"
                          title="Delete user"
                        >
                          <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                        </button>
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
                        <td colSpan={6} className="p-4 sm:p-6 bg-[var(--admin-elevated)]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <div>
                              <h4 className="font-admin-body text-sm font-semibold text-[var(--admin-text)] mb-4">Contact & social</h4>
                              <div className="space-y-3">
                                <a href={`mailto:${attendee.email}`} className="flex items-center gap-3 font-admin-body text-sm text-[var(--admin-text-secondary)] hover:text-admin-teal">
                                  <Mail className="w-4 h-4" /> {attendee.email}
                                </a>
                                {attendee.website && (
                                  <a href={`https://${attendee.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-admin-body text-sm text-[var(--admin-text-secondary)] hover:text-admin-teal">
                                    <Globe className="w-4 h-4" /> {attendee.website}
                                  </a>
                                )}
                                {attendee.instagram && (
                                  <a href={`https://instagram.com/${attendee.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-admin-body text-sm text-[var(--admin-text-secondary)] hover:text-admin-teal">
                                    <Instagram className="w-4 h-4" /> @{attendee.instagram}
                                  </a>
                                )}
                                {attendee.linkedin && (
                                  <a href={`https://linkedin.com/in/${attendee.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-admin-body text-sm text-[var(--admin-text-secondary)] hover:text-admin-teal">
                                    <Linkedin className="w-4 h-4" /> {attendee.linkedin}
                                  </a>
                                )}
                                {attendee.bluesky && (
                                  <a href={`https://bsky.app/profile/${attendee.bluesky}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-admin-body text-sm text-[var(--admin-text-secondary)] hover:text-admin-teal">
                                    <AtSign className="w-4 h-4" /> @{attendee.bluesky}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-admin-body text-sm font-semibold text-[var(--admin-text)] mb-4">Badges & history</h4>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {(attendee.badges || []).map(badgeId => {
                                  const badge = getBadgeInfo(badgeId)
                                  return badge ? (
                                    <span key={badgeId} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)]">
                                      {badge.emoji} {badge.label}
                                    </span>
                                  ) : null
                                })}
                                {attendee.customBadges && Object.entries(attendee.customBadges).flatMap(([_, badges]) =>
                                  (badges || []).map(badge => (
                                    <span key={badge.label} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)]">
                                      {badge.emoji} {badge.label}
                                    </span>
                                  ))
                                )}
                              </div>
                              {attendee.attendedSummits?.length > 0 && (
                                <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">
                                  Past summits: {attendee.attendedSummits.sort().join(', ')}
                                </p>
                              )}
                              {attendee.notifyWhenTicketsAvailable && (
                                <p className="font-admin-body text-sm text-admin-teal mt-2">Wants ticket notifications</p>
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
            <Users className="w-12 h-12 mx-auto text-[var(--admin-text-muted)] mb-4" />
            <p className="font-admin-body text-[var(--admin-text-secondary)]">No attendees found</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeEditModal}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg admin-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-admin-teal" />
                  </div>
                  <div>
                    <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
                      Edit user
                    </h3>
                    <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
                      Update profile information
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Name & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.displayName}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="admin-input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      disabled
                      className="admin-input w-full h-11 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Organization & Job Title row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={editFormData.organization}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, organization: e.target.value }))}
                      className="admin-input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Job title
                    </label>
                    <input
                      type="text"
                      value={editFormData.jobTitle}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="admin-input w-full h-11"
                    />
                  </div>
                </div>

                {/* Status & Role row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Registration status
                    </label>
                    <select
                      value={editFormData.registrationStatus}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, registrationStatus: e.target.value }))}
                      className="admin-input w-full h-11"
                    >
                      <option value="pending">Pending</option>
                      <option value="registered">Registered</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      System role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="admin-input w-full h-11"
                    >
                      <option value="">None (regular user)</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                {/* Social Links section */}
                <div className="pt-2">
                  <h4 className="font-admin-body text-sm font-medium text-[var(--admin-text)] mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    Social links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-admin-body text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                        Website
                      </label>
                      <input
                        type="text"
                        value={editFormData.website}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="admin-input w-full h-10 text-sm"
                        placeholder="example.com"
                      />
                    </div>
                    <div>
                      <label className="block font-admin-body text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={editFormData.instagram}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        className="admin-input w-full h-10 text-sm"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <label className="block font-admin-body text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={editFormData.linkedin}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="admin-input w-full h-10 text-sm"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <label className="block font-admin-body text-xs font-medium text-[var(--admin-text-muted)] mb-1.5">
                        Bluesky
                      </label>
                      <input
                        type="text"
                        value={editFormData.bluesky}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, bluesky: e.target.value }))}
                        className="admin-input w-full h-10 text-sm"
                        placeholder="handle.bsky.social"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-elevated)]/30">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] border border-transparent hover:border-[var(--admin-border)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="admin-btn-primary flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeDeleteModal}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-sm admin-surface rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-end px-4 pt-4">
                <button
                  onClick={closeDeleteModal}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-admin-rose/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-admin-rose" />
                </div>
                <h3 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)] mb-2">
                  Delete user?
                </h3>
                <p className="font-admin-body text-[var(--admin-text-secondary)] mb-1">
                  Are you sure you want to delete
                </p>
                <p className="font-admin-body font-semibold text-[var(--admin-text)] mb-3">
                  {deletingUser.displayName || deletingUser.email}
                </p>
                <p className="font-admin-body text-sm text-admin-rose/80 bg-admin-rose/5 rounded-lg px-4 py-2">
                  This action cannot be undone.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-elevated)]/30">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium text-[var(--admin-text)] bg-[var(--admin-surface)] border border-[var(--admin-border)] hover:bg-[var(--admin-elevated)] hover:border-[var(--admin-text-muted)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium bg-admin-rose text-white hover:bg-admin-rose/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Admins Tab
function AdminsTab({ currentUser, isInk }) {
  const [targetEmail, setTargetEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [admins, setAdmins] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)

  // Fetch current admins from Firestore
  useEffect(() => {
    async function fetchAdmins() {
      setLoadingAdmins(true)
      try {
        const token = await currentUser.getIdToken()
        const response = await fetch('https://us-central1-cjs2026.cloudfunctions.net/getAdminUsers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setAdmins(data.admins || [])
        }
      } catch (err) {
        console.error('Failed to fetch admins:', err)
      } finally {
        setLoadingAdmins(false)
      }
    }
    fetchAdmins()
  }, [currentUser, result]) // Refetch when result changes (after grant/revoke)

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
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
            <UserCog className="w-5 h-5 text-admin-teal" />
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Grant admin access</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Add or remove admin privileges</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">User email</label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="user@example.com"
              className="admin-input w-full"
            />
          </div>

          <div>
            <label className="block font-admin-body text-sm font-medium text-[var(--admin-text)] mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="admin-input w-full"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
            <p className="mt-2 font-admin-body text-xs text-[var(--admin-text-muted)]">
              Super admins can grant/revoke admin access. Regular admins cannot.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={grantAdmin}
              disabled={loading || !targetEmail}
              className="admin-btn-primary flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Grant access
            </button>
            <button
              onClick={revokeAdmin}
              disabled={loading || !targetEmail}
              className="admin-btn-secondary flex items-center gap-2 border-admin-rose/30 text-admin-rose hover:bg-admin-rose/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              Revoke access
            </button>
          </div>

          {result && (
            <motion.div
              className="flex items-center gap-3 p-4 rounded-xl admin-glass"
              style={{ borderColor: result.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-admin-emerald" />
              ) : (
                <XCircle className="w-5 h-5 text-admin-rose" />
              )}
              <span className={`font-admin-body ${result.type === 'success' ? 'text-admin-emerald' : 'text-admin-rose'}`}>
                {result.message}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Current admins list */}
      <div className="admin-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <Users className="w-5 h-5 text-admin-amber" />
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Current admins</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">{admins.length} users with admin access</p>
          </div>
        </div>

        {loadingAdmins ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-admin-teal animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <p className="font-admin-body text-[var(--admin-text-muted)] text-center py-8">No admins found</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.uid || admin.email} className="flex items-center gap-4 p-4 rounded-xl admin-glass">
                <div className="w-10 h-10 rounded-xl admin-glass flex items-center justify-center flex-shrink-0">
                  {admin.photoURL ? (
                    <img src={admin.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-[var(--admin-text-secondary)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-admin-body text-sm font-medium text-[var(--admin-text)] truncate">
                    {admin.displayName || admin.email}
                  </p>
                  <p className="font-admin-mono text-xs text-[var(--admin-text-muted)] truncate">{admin.email}</p>
                </div>
                <span className={`admin-badge flex-shrink-0 ${
                  admin.role === 'super_admin' ? 'admin-badge-warning' : 'admin-badge-info'
                }`}>
                  {admin.role === 'super_admin' ? (
                    <><Shield className="w-3 h-3 mr-1" /> Super</>
                  ) : (
                    <><Shield className="w-3 h-3 mr-1" /> Admin</>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current session */}
      <div className="admin-surface p-6">
        <h3 className="font-admin-body font-semibold text-[var(--admin-text)] mb-4">Current session</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl admin-glass-teal">
          <div className="w-12 h-12 rounded-xl admin-glass flex items-center justify-center">
            <Shield className="w-6 h-6 text-admin-teal" />
          </div>
          <div>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">Logged in as</p>
            <p className="font-admin-mono text-sm text-[var(--admin-text)]">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Updates Tab - News/Updates content management
function UpdatesTab({ currentUser, isInk }) {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [conflict, setConflict] = useState(null) // { currentDoc, theirChanges }

  // Form state for new/edit
  const [editingUpdate, setEditingUpdate] = useState(null)
  const [originalUpdatedAt, setOriginalUpdatedAt] = useState(null) // For optimistic locking
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    type: 'announcement',
    category: 'Announcements',
    date: new Date().toISOString().split('T')[0],
    featured: false,
    visible: true,
    countdown: false,
    color: 'teal',
    ctaText: '',
    ctaUrl: '',
    ctaExternal: false
  })

  // Generate slug from title
  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60)
  }

  // Listen to updates in real-time and merge with static updates
  useEffect(() => {
    // Wait for user authentication before querying Firestore
    if (!currentUser) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'updates'),
      orderBy('date', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreItems = []
        snapshot.forEach(doc => {
          firestoreItems.push({ id: doc.id, ...doc.data(), isStatic: false })
        })

        // Merge: Firestore updates take precedence over static updates by slug
        const firestoreSlugs = new Set(firestoreItems.map(u => u.slug))
        const staticItems = staticUpdates
          .filter(u => !firestoreSlugs.has(u.slug))
          .map(u => ({ ...u, id: `static-${u.slug}`, isStatic: true }))

        // Combine and sort by date
        const allItems = [...firestoreItems, ...staticItems]
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        setUpdates(allItems)
        setLoading(false)
      },
      (error) => {
        console.error('[UpdatesTab] Firestore listener error:', error)
        // Fall back to static updates only
        const staticItems = staticUpdates.map(u => ({ ...u, id: `static-${u.slug}`, isStatic: true }))
        setUpdates(staticItems)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      type: 'announcement',
      category: 'Announcements',
      date: new Date().toISOString().split('T')[0],
      featured: false,
      visible: true,
      countdown: false,
      color: 'teal',
      ctaText: '',
      ctaUrl: '',
      ctaExternal: false
    })
    setEditingUpdate(null)
    setOriginalUpdatedAt(null)
    setConflict(null)
    setShowForm(false)
  }

  function startEdit(update) {
    // For static updates, we clone them to Firestore for editing
    if (update.isStatic) {
      setEditingUpdate(null) // null = creating new
      setOriginalUpdatedAt(null)
    } else {
      setEditingUpdate(update)
      // Capture the updatedAt timestamp for optimistic locking
      setOriginalUpdatedAt(update.updatedAt || null)
    }
    setConflict(null) // Clear any previous conflict
    setFormData({
      title: update.title || '',
      slug: update.slug || '',
      summary: update.summary || '',
      content: update.content || '',
      type: update.type || 'announcement',
      category: update.category || 'Announcements',
      date: update.date || new Date().toISOString().split('T')[0],
      featured: update.featured || false,
      visible: update.visible !== false,
      countdown: update.countdown || false,
      color: update.color || 'teal',
      ctaText: update.cta?.text || '',
      ctaUrl: update.cta?.url || '',
      ctaExternal: update.cta?.external || false
    })
    setShowForm(true)
  }

  async function saveUpdate(forceOverwrite = false) {
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert('Title and slug are required')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        featured: formData.featured,
        visible: formData.visible,
        countdown: formData.countdown,
        color: formData.color,
        cta: formData.ctaText ? {
          text: formData.ctaText.trim(),
          url: formData.ctaUrl.trim(),
          external: formData.ctaExternal
        } : null,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByEmail: currentUser.email
      }

      if (editingUpdate) {
        // Optimistic locking: check if document was modified since we started editing
        if (!forceOverwrite && originalUpdatedAt) {
          const currentDoc = await getDoc(doc(db, 'updates', editingUpdate.id))
          if (currentDoc.exists()) {
            const currentData = currentDoc.data()
            const currentUpdatedAt = currentData.updatedAt?.toMillis?.() || 0
            const originalUpdatedAtMs = originalUpdatedAt?.toMillis?.() || originalUpdatedAt?.seconds * 1000 || 0

            if (currentUpdatedAt > originalUpdatedAtMs) {
              // Conflict detected!
              setConflict({
                currentDoc: currentData,
                modifiedBy: currentData.updatedByEmail || 'another user',
                modifiedAt: currentData.updatedAt?.toDate?.() || new Date()
              })
              setSaving(false)
              return
            }
          }
        }

        await updateDoc(doc(db, 'updates', editingUpdate.id), updateData)
      } else {
        updateData.createdAt = serverTimestamp()
        updateData.createdBy = currentUser.uid
        updateData.createdByEmail = currentUser.email
        await addDoc(collection(db, 'updates'), updateData)
      }
      setConflict(null)
      resetForm()
    } catch (err) {
      console.error('Failed to save update:', err)
      alert('Failed to save update: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle conflict resolution
  function handleDiscardMyChanges() {
    setConflict(null)
    resetForm()
  }

  function handleOverwriteTheirChanges() {
    setConflict(null)
    saveUpdate(true) // Force overwrite
  }

  function handleRefreshAndEdit() {
    // Find the latest version from our real-time updates list
    const latestVersion = updates.find(u => u.id === editingUpdate?.id)
    if (latestVersion) {
      startEdit(latestVersion)
    }
    setConflict(null)
  }

  async function toggleVisible(update) {
    try {
      await updateDoc(doc(db, 'updates', update.id), {
        visible: !update.visible
      })
    } catch (err) {
      console.error('Failed to toggle visibility:', err)
    }
  }

  async function toggleFeatured(update) {
    try {
      await updateDoc(doc(db, 'updates', update.id), {
        featured: !update.featured
      })
    } catch (err) {
      console.error('Failed to toggle featured:', err)
    }
  }

  async function deleteUpdate(id) {
    if (!window.confirm('Delete this update? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'updates', id))
    } catch (err) {
      console.error('Failed to delete update:', err)
    }
  }

  const typeOptions = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'story', label: 'Story' },
    { value: 'milestone', label: 'Milestone' }
  ]

  const categoryOptions = [
    'Announcements', 'Deadlines', 'Registration', 'Speakers',
    'Location', 'Events', 'Sponsors', '10th anniversary', 'Call for proposals'
  ]

  const colorOptions = [
    { value: 'teal', label: 'Teal', class: 'bg-admin-teal' },
    { value: 'cardinal', label: 'Cardinal', class: 'bg-rose-500' },
    { value: 'green-dark', label: 'Green', class: 'bg-emerald-700' }
  ]

  const getTypeStyle = (type) => {
    switch (type) {
      case 'deadline': return 'admin-badge-warning'
      case 'story': return 'admin-badge-info'
      case 'milestone': return 'admin-badge-success'
      default: return 'admin-badge-info'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-admin-teal animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-admin-teal" />
          </div>
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">Updates & News</h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-secondary)]">
              {updates.length} total updates
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="admin-button-primary w-full sm:w-auto justify-center"
        >
          <span className="mr-2">+</span> New Update
        </button>
      </div>

      {/* Form Modal (Create/Edit) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={resetForm}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-2xl admin-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl admin-glass-teal flex items-center justify-center">
                    <FileText className="w-5 h-5 text-admin-teal" />
                  </div>
                  <div>
                    <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
                      {editingUpdate ? 'Edit Update' : 'Create New Update'}
                    </h3>
                    <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
                      {editingUpdate ? 'Modify the update details' : 'Add a news item or announcement'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Title - Full width */}
                <div>
                  <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        title: e.target.value,
                        slug: editingUpdate ? prev.slug : generateSlug(e.target.value)
                      }))
                    }}
                    className="admin-input w-full h-11"
                    placeholder="Update title"
                  />
                </div>

                {/* Slug & Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Slug * <span className="text-xs font-normal text-[var(--admin-text-muted)]">(URL: /updates/{formData.slug || '...'})</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="admin-input w-full h-11 font-mono text-sm"
                      placeholder="url-friendly-slug"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="admin-input w-full h-11"
                    />
                  </div>
                </div>

                {/* Type, Category, Color row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="admin-input w-full h-11"
                    >
                      {typeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="admin-input w-full h-11"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                      Color
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="admin-input w-full h-11"
                    >
                      {colorOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    className="admin-input w-full resize-y min-h-[60px]"
                    rows={2}
                    placeholder="Brief summary for list views"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-admin-body font-medium text-[var(--admin-text-secondary)] mb-1.5">
                    Content <span className="text-xs font-normal text-[var(--admin-text-muted)]">(Markdown supported)</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="admin-input w-full font-mono text-sm resize-y min-h-[150px]"
                    rows={6}
                    placeholder="Full content with **markdown** support..."
                  />
                </div>

                {/* CTA Section */}
                <div className="p-4 rounded-xl bg-[var(--admin-elevated)]/50 border border-[var(--admin-border)]">
                  <label className="block text-sm font-admin-body font-medium text-[var(--admin-text)] mb-3">
                    Call to Action <span className="text-xs font-normal text-[var(--admin-text-muted)]">(optional)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-admin-body text-[var(--admin-text-muted)] mb-1">Button text</label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                        className="admin-input w-full h-10 text-sm"
                        placeholder="Learn more"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-admin-body text-[var(--admin-text-muted)] mb-1">Link URL</label>
                      <input
                        type="text"
                        value={formData.ctaUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                        className="admin-input w-full h-10 text-sm"
                        placeholder="/path or https://..."
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-admin-body text-[var(--admin-text-secondary)] h-10">
                      <input
                        type="checkbox"
                        checked={formData.ctaExternal}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaExternal: e.target.checked }))}
                        className="rounded w-4 h-4"
                      />
                      External
                    </label>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <label className="flex items-center gap-2.5 text-sm font-admin-body text-[var(--admin-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                      className="rounded w-4 h-4 text-admin-teal"
                    />
                    Visible
                  </label>
                  <label className="flex items-center gap-2.5 text-sm font-admin-body text-[var(--admin-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded w-4 h-4 text-admin-teal"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2.5 text-sm font-admin-body text-[var(--admin-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.countdown}
                      onChange={(e) => setFormData(prev => ({ ...prev, countdown: e.target.checked }))}
                      className="rounded w-4 h-4 text-admin-teal"
                    />
                    Show countdown (for deadlines)
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-elevated)]/30">
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] border border-transparent hover:border-[var(--admin-border)] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUpdate}
                  disabled={saving}
                  className="admin-btn-primary flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingUpdate ? 'Save Changes' : 'Create Update'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Resolution Modal */}
      <AnimatePresence>
        {conflict && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-md admin-surface rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)] mb-2">
                  Conflict Detected
                </h3>
                <p className="font-admin-body text-[var(--admin-text-secondary)]">
                  This update was modified while you were editing.
                </p>
              </div>

              {/* Conflict details */}
              <div className="px-6 pb-4">
                <div className="p-4 rounded-xl bg-[var(--admin-elevated)] border border-[var(--admin-border)]">
                  <div className="flex items-center gap-2 text-sm font-admin-body text-[var(--admin-text-secondary)] mb-2">
                    <User className="w-4 h-4" />
                    <span>Modified by:</span>
                    <span className="font-medium text-[var(--admin-text)]">{conflict.modifiedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-admin-body text-[var(--admin-text-secondary)]">
                    <Clock className="w-4 h-4" />
                    <span>At:</span>
                    <span className="font-medium text-[var(--admin-text)]">
                      {conflict.modifiedAt?.toLocaleString?.() || 'Unknown time'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 space-y-2">
                <button
                  onClick={handleRefreshAndEdit}
                  className="w-full admin-btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Load their changes & continue editing
                </button>
                <button
                  onClick={handleOverwriteTheirChanges}
                  className="w-full px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Overwrite with my changes
                </button>
                <button
                  onClick={handleDiscardMyChanges}
                  className="w-full px-4 py-2.5 rounded-xl font-admin-body text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-elevated)] transition-all"
                >
                  Discard my changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Updates List */}
      {updates.length === 0 ? (
        <div className="admin-surface p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 text-[var(--admin-text-secondary)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--admin-text-secondary)] font-admin-body">No updates yet</p>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-2">
            Create your first update to see it here
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {updates.map((update) => (
              <div
                key={update.id}
                className={`admin-surface p-4 ${!update.visible ? 'opacity-50' : ''}`}
              >
                {/* Header row with title and badges */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-admin-body font-medium text-[var(--admin-text)] leading-tight">
                      {update.title}
                    </p>
                    <p className="text-xs font-admin-mono text-[var(--admin-text-secondary)] mt-1 truncate">
                      /updates/{update.slug}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {update.isStatic && (
                      <span className="admin-badge text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Static
                      </span>
                    )}
                    <span className={`admin-badge text-xs ${update.visible ? 'admin-badge-success' : 'admin-badge-error'}`}>
                      {update.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                  <span className={`admin-badge ${getTypeStyle(update.type)}`}>
                    {update.type}
                  </span>
                  <span className="text-[var(--admin-text-secondary)]">•</span>
                  <span className="font-admin-body text-[var(--admin-text-secondary)]">{update.category}</span>
                  <span className="text-[var(--admin-text-secondary)]">•</span>
                  <span className="font-admin-mono text-[var(--admin-text-secondary)]">{update.date}</span>
                  {update.featured && (
                    <>
                      <span className="text-[var(--admin-text-secondary)]">•</span>
                      <span className="admin-badge admin-badge-warning">Featured</span>
                    </>
                  )}
                </div>

                {/* Actions row - larger touch targets */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--admin-border)]">
                  <a
                    href={`/updates/${update.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] touch-manipulation"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-sm">View</span>
                  </a>
                  <button
                    onClick={() => startEdit(update)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-admin-teal touch-manipulation"
                  >
                    <Pencil className="w-5 h-5" />
                    <span className="text-sm">{update.isStatic ? 'Clone' : 'Edit'}</span>
                  </button>
                  {!update.isStatic && (
                    <>
                      <button
                        onClick={() => toggleVisible(update)}
                        className="p-3 rounded-lg bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-admin-amber touch-manipulation"
                        title={update.visible ? 'Hide' : 'Show'}
                      >
                        {update.visible ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => deleteUpdate(update.id)}
                        className="p-3 rounded-lg bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-admin-rose touch-manipulation"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block admin-surface overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th className="hidden lg:table-cell">Category</th>
                  <th className="hidden lg:table-cell">Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((update) => (
                  <tr key={update.id} className={!update.visible ? 'opacity-50' : ''}>
                    <td>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-admin-body font-medium text-[var(--admin-text)]">{update.title}</p>
                          {update.isStatic && (
                            <span className="admin-badge text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Static
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-admin-mono text-[var(--admin-text-secondary)]">/updates/{update.slug}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${getTypeStyle(update.type)}`}>
                        {update.type}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell font-admin-body text-sm">{update.category}</td>
                    <td className="hidden lg:table-cell font-admin-mono text-sm">{update.date}</td>
                    <td>
                      <div className="flex gap-2">
                        {update.featured && (
                          <span className="admin-badge admin-badge-warning">Featured</span>
                        )}
                        <span className={`admin-badge ${update.visible ? 'admin-badge-success' : 'admin-badge-error'}`}>
                          {update.visible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/updates/${update.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg hover:bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => startEdit(update)}
                          className="p-2.5 rounded-lg hover:bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-admin-teal"
                          title={update.isStatic ? 'Clone to Firestore for editing' : 'Edit'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {!update.isStatic && (
                          <>
                            <button
                              onClick={() => toggleVisible(update)}
                              className="p-2.5 rounded-lg hover:bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-admin-amber"
                              title={update.visible ? 'Hide' : 'Show'}
                            >
                              {update.visible ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteUpdate(update.id)}
                              className="p-2.5 rounded-lg hover:bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] hover:text-admin-rose"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-lg admin-glass border border-[var(--admin-border)]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-admin-teal mt-0.5" />
          <div className="text-sm font-admin-body text-[var(--admin-text-secondary)]">
            <p className="font-medium text-[var(--admin-text)] mb-1">How Updates Work</p>
            <ul className="list-disc ml-4 space-y-1">
              <li><strong>Admin Dashboard edits</strong> → Firestore → Live on website immediately</li>
              <li><strong>Airtable edits</strong> → Run deploy → Static file regenerated → Live on website</li>
              <li><span className="text-purple-400">Static</span> updates come from Airtable (edit there or clone here)</li>
              <li>Firestore updates take precedence over static updates with the same slug</li>
              <li>Featured updates appear prominently at the top of the /updates page</li>
              <li>Each update has a unique slug for shareable URLs (e.g., /updates/registration-open)</li>
            </ul>
            <p className="mt-3 text-xs text-[var(--admin-text-secondary)]">
              <strong>To sync Airtable → Website:</strong> Trigger a deploy from GitHub Actions or run <code className="font-admin-mono bg-[var(--admin-bg)] px-1 rounded">npm run generate-updates</code> locally
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
