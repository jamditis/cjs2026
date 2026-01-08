import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Link2, Check, Globe, Users, Lock, Copy, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const VISIBILITY_OPTIONS = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can see your schedule',
    icon: Lock,
  },
  {
    id: 'attendees_only',
    label: 'Attendees only',
    description: 'Logged-in summit attendees can view',
    icon: Users,
  },
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone with the link can view',
    icon: Globe,
  },
]

function ShareScheduleModal({ isOpen, onClose }) {
  const { currentUser, userProfile, updateScheduleVisibility } = useAuth()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmingVisibility, setConfirmingVisibility] = useState(null)

  const currentVisibility = userProfile?.scheduleVisibility || 'private'
  const shareUrl = `${window.location.origin}/schedule/user/${currentUser?.uid}`

  // Check if new visibility is more public than current
  const isMorePublic = (newVis, currentVis) => {
    const order = { private: 0, attendees_only: 1, public: 2 }
    return order[newVis] > order[currentVis]
  }

  const handleVisibilityChange = async (visibility) => {
    // If making more public, show confirmation first
    if (isMorePublic(visibility, currentVisibility) && !confirmingVisibility) {
      setConfirmingVisibility(visibility)
      return
    }

    setSaving(true)
    setConfirmingVisibility(null)
    try {
      await updateScheduleVisibility(visibility)
      toast.success('Visibility updated')
    } catch (err) {
      console.error('Error updating visibility:', err)
      toast.error('Failed to update visibility')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy link to clipboard')
    }
  }

  const canShare = currentVisibility !== 'private'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-brand-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-ink/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg text-brand-ink">
                    Share your schedule
                  </h2>
                  <p className="font-body text-sm text-brand-ink-muted">
                    Control who can see your saved sessions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-brand-ink/50" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Confirmation banner for making schedule more public */}
              {confirmingVisibility && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-amber-50 border-2 border-amber-200"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-amber-800">
                        Make your schedule {confirmingVisibility === 'public' ? 'public' : 'visible to attendees'}?
                      </p>
                      <p className="font-body text-sm text-amber-700 mt-1">
                        {confirmingVisibility === 'public'
                          ? 'Anyone with the link will be able to see your saved sessions.'
                          : 'Other CJS attendees will be able to see your saved sessions.'}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setConfirmingVisibility(null)}
                          className="px-3 py-1.5 rounded-lg font-body text-sm bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleVisibilityChange(confirmingVisibility)}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg font-body text-sm bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2"
                        >
                          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                          Yes, make {confirmingVisibility === 'public' ? 'public' : 'visible'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Visibility options */}
              <div className="space-y-2">
                <p className="font-body text-sm text-brand-ink-muted mb-3">
                  Who can view your schedule?
                </p>
                {VISIBILITY_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isSelected = currentVisibility === option.id
                  const isConfirming = confirmingVisibility === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVisibilityChange(option.id)}
                      disabled={saving || confirmingVisibility}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                        isSelected
                          ? 'border-brand-teal bg-brand-teal/5'
                          : isConfirming
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-brand-ink/10 hover:border-brand-ink/20'
                      } ${(saving || confirmingVisibility) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-brand-teal text-white' : 'bg-brand-ink/5 text-brand-ink/50'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-heading font-semibold ${
                          isSelected ? 'text-brand-teal' : 'text-brand-ink'
                        }`}>
                          {option.label}
                        </p>
                        <p className="font-body text-sm text-brand-ink-muted">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-brand-teal flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Share link */}
              {canShare && (
                <div className="pt-4 border-t border-brand-ink/10">
                  <p className="font-body text-sm text-brand-ink-muted mb-2">
                    Share link
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-2 bg-brand-ink/5 rounded-lg font-mono text-sm text-brand-ink-muted truncate">
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`px-4 py-2 rounded-lg font-body text-sm flex items-center gap-2 transition-colors ${
                        copied
                          ? 'bg-brand-teal text-white'
                          : 'bg-brand-ink/5 text-brand-ink hover:bg-brand-ink/10'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-brand-ink/5 border-t border-brand-ink/10">
              <p className="font-body text-xs text-brand-ink/50 text-center">
                {currentVisibility === 'private'
                  ? 'Your schedule is private. Change the setting above to share.'
                  : currentVisibility === 'attendees_only'
                    ? 'Only logged-in CJS attendees can view your schedule.'
                    : 'Anyone with the link can view your schedule.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ShareScheduleModal
