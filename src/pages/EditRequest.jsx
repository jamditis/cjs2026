import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, FileText, Type, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SECTIONS = [
  { id: 'hero', label: 'Hero section (main headline & subtext)' },
  { id: 'about', label: 'About section' },
  { id: 'details', label: 'Event details (dates, venue, times)' },
  { id: 'schedule', label: 'Schedule page' },
  { id: 'sponsors', label: 'Sponsors page' },
  { id: 'code-of-conduct', label: 'Code of conduct' },
  { id: 'contact', label: 'Contact page' },
  { id: 'footer', label: 'Footer' },
  { id: 'other', label: 'Other (specify in description)' },
]

const PRIORITY_LEVELS = [
  { id: 'low', label: 'Low - whenever convenient', borderClass: 'border-brand-teal', bgClass: 'bg-brand-teal', bgLightClass: 'bg-brand-teal/5' },
  { id: 'medium', label: 'Medium - within a few days', borderClass: 'border-brand-gold', bgClass: 'bg-brand-gold', bgLightClass: 'bg-brand-gold/5' },
  { id: 'high', label: 'High - needs attention soon', borderClass: 'border-brand-cardinal', bgClass: 'bg-brand-cardinal', bgLightClass: 'bg-brand-cardinal/5' },
]

function EditRequest() {
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    priority: 'medium',
    currentText: '',
    requestedChange: '',
    additionalNotes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('https://us-central1-cjs2026.cloudfunctions.net/saveEditRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNewRequest() {
    setFormData({
      name: '',
      section: '',
      priority: 'medium',
      currentText: '',
      requestedChange: '',
      additionalNotes: '',
    })
    setSubmitted(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
                Request a copy edit
              </h1>
              <p className="font-body text-brand-ink/60">
                Use this form to request changes to the CJS2026 website copy
              </p>
            </div>

            <div className="card-sketch p-8">
              {submitted ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-brand-teal" />
                  </div>
                  <h2 className="font-heading font-semibold text-xl text-brand-ink mb-2">
                    Request submitted
                  </h2>
                  <p className="font-body text-brand-ink/60 mb-6">
                    Your edit request has been saved. An admin will review it and implement the changes.
                  </p>
                  <button
                    onClick={handleNewRequest}
                    className="btn-primary py-2 px-6"
                  >
                    Submit another request
                  </button>
                </motion.div>
              ) : (
                <>
                  {error && (
                    <motion.div
                      className="bg-brand-cardinal/10 border-2 border-brand-cardinal/30 rounded-lg p-4 mb-6 flex items-start gap-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <AlertCircle className="w-5 h-5 text-brand-cardinal flex-shrink-0 mt-0.5" />
                      <p className="font-body text-brand-cardinal text-sm">{error}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block font-body font-medium text-brand-ink mb-2">
                        Your name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                        placeholder="Stefanie Murray"
                      />
                    </div>

                    <div>
                      <label htmlFor="section" className="block font-body font-medium text-brand-ink mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Which section needs editing?
                      </label>
                      <select
                        id="section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink focus:border-brand-teal focus:outline-none transition-colors"
                      >
                        <option value="">Select a section...</option>
                        {SECTIONS.map(section => (
                          <option key={section.id} value={section.id}>
                            {section.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-body font-medium text-brand-ink mb-2">
                        Priority level
                      </label>
                      <div className="space-y-2">
                        {PRIORITY_LEVELS.map(level => (
                          <label
                            key={level.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.priority === level.id
                                ? `${level.borderClass} ${level.bgLightClass}`
                                : 'border-brand-ink/10 hover:border-brand-ink/20'
                            }`}
                          >
                            <input
                              type="radio"
                              name="priority"
                              value={level.id}
                              checked={formData.priority === level.id}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.priority === level.id
                                ? `${level.borderClass} ${level.bgClass}`
                                : 'border-brand-ink/30'
                            }`}>
                              {formData.priority === level.id && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-body text-brand-ink">{level.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currentText" className="block font-body font-medium text-brand-ink mb-2">
                        <Type className="w-4 h-4 inline mr-2" />
                        Current text (copy/paste what's there now)
                      </label>
                      <textarea
                        id="currentText"
                        name="currentText"
                        value={formData.currentText}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors resize-none"
                        placeholder="Paste the current text that needs to be changed..."
                      />
                      <p className="font-body text-xs text-brand-ink/50 mt-1">
                        Optional but helpful for context
                      </p>
                    </div>

                    <div>
                      <label htmlFor="requestedChange" className="block font-body font-medium text-brand-ink mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        What should it say instead?
                      </label>
                      <textarea
                        id="requestedChange"
                        name="requestedChange"
                        value={formData.requestedChange}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors resize-none"
                        placeholder="Describe the change you want, or write the new text exactly as it should appear..."
                      />
                    </div>

                    <div>
                      <label htmlFor="additionalNotes" className="block font-body font-medium text-brand-ink mb-2">
                        Additional notes
                      </label>
                      <textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors resize-none"
                        placeholder="Any other context or instructions..."
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Submitting...' : 'Submit request'}
                    </motion.button>
                  </form>
                </>
              )}
            </div>

            <p className="text-center mt-6 font-body text-sm text-brand-ink/50">
              This form is for internal use only. Requests are saved securely and reviewed by the web team.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default EditRequest
