import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Dashboard() {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    displayName: userProfile?.displayName || '',
    organization: userProfile?.organization || '',
    role: userProfile?.role || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(currentUser.uid, editData)
      setEditing(false)
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
              Welcome{userProfile?.displayName ? `, ${userProfile.displayName.split(' ')[0]}` : ''}
            </h1>
            <p className="font-body text-brand-ink/60">
              Manage your summit registration and profile
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Registration status card */}
              <motion.div
                className={`card-sketch p-6 border-2 border-${status.color}/30 bg-${status.color}/5`}
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
                <Link
                  to="/schedule"
                  className="mt-4 inline-flex items-center gap-2 font-body text-brand-teal hover:underline"
                >
                  View full schedule →
                </Link>
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
              {/* Profile card */}
              <motion.div
                className="card-sketch p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
                        Name
                      </label>
                      <input
                        type="text"
                        value={editData.displayName}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={editData.organization}
                        onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Role/Title
                      </label>
                      <input
                        type="text"
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary py-2 px-4 text-sm flex-1 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="py-2 px-4 text-sm border-2 border-brand-ink/20 rounded-lg font-body text-brand-ink hover:border-brand-ink/40 transition-colors"
                      >
                        Cancel
                      </button>
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
