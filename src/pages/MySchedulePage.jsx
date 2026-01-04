import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Share2, ArrowLeft, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MySchedule from '../components/MySchedule'
import ShareScheduleModal from '../components/ShareScheduleModal'
import { useAuth } from '../contexts/AuthContext'
import { getSessionsByIds } from '../content/scheduleData'
import { downloadSchedulePDF } from '../utils/generateSchedulePDF'

function MySchedulePage() {
  const { userProfile } = useAuth()
  const [showShareModal, setShowShareModal] = useState(false)
  const savedCount = userProfile?.savedSessions?.length || 0

  const handleDownloadPDF = () => {
    const savedSessionIds = userProfile?.savedSessions || []
    const sessions = getSessionsByIds(savedSessionIds)
    downloadSchedulePDF({ sessions, userProfile })
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-brand-ink/60 hover:text-brand-teal mb-4 font-body text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
                  My schedule
                </h1>
                <p className="font-body text-brand-ink/60">
                  {savedCount > 0
                    ? `You've saved ${savedCount} session${savedCount !== 1 ? 's' : ''} for CJS2026.`
                    : 'Bookmark sessions from the schedule to build your personal agenda.'}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {savedCount > 0 && (
                  <>
                    <button
                      onClick={handleDownloadPDF}
                      className="btn-secondary text-sm flex items-center gap-2"
                      title="Download as PDF"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                    <Link
                      to="/schedule"
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Add more
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* My Schedule content */}
          <motion.div
            className="card-sketch p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MySchedule showViewAll={false} />
          </motion.div>

          {/* Tips section */}
          {savedCount > 0 && (
            <motion.div
              className="mt-8 p-6 bg-brand-teal/5 rounded-lg border-2 border-brand-teal/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-heading font-semibold text-brand-ink mb-2">Tips</h3>
              <ul className="font-body text-sm text-brand-ink/70 space-y-2">
                <li>Click the bookmark icon on any session to remove it from your schedule.</li>
                <li>Check back as sessions are finalized - more details will be added in spring 2026.</li>
                <li>Some sessions may run concurrently - plan accordingly!</li>
                <li>Use the share button to let others see your schedule, or download a PDF for offline access.</li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />

      {/* Share modal */}
      <ShareScheduleModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  )
}

export default MySchedulePage
