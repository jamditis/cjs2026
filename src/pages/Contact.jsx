import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Globe, Twitter, MessageCircle, Send, ExternalLink } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  })
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    // For now, open email client with pre-filled info
    const subject = encodeURIComponent(`[CJS2026] ${formData.subject}: ${formData.name}`)
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)
    window.location.href = `mailto:summit@collaborativejournalism.org?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  const subjectOptions = [
    { value: 'general', label: 'General inquiry' },
    { value: 'sponsorship', label: 'Sponsorship' },
    { value: 'speaking', label: 'Speaking opportunity' },
    { value: 'press', label: 'Press/media inquiry' },
    { value: 'accessibility', label: 'Accessibility needs' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="editorial-headline text-4xl md:text-5xl text-brand-ink mb-4">
            Contact us
          </h1>
          <p className="font-body text-brand-ink/60 text-lg max-w-2xl mx-auto">
            Have questions about the summit? We're here to help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-6">Get in touch</h2>

            <div className="space-y-6">
              <a
                href="mailto:summit@collaborativejournalism.org"
                className="card-sketch p-5 flex items-center gap-4 hover:border-brand-teal/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                  <Mail className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-brand-ink group-hover:text-brand-teal transition-colors">Email</p>
                  <p className="font-body text-sm text-brand-ink/60">summit@collaborativejournalism.org</p>
                </div>
              </a>

              <div className="card-sketch p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-brand-ink">Venue</p>
                  <p className="font-body text-sm text-brand-ink/60">UNC Friday Center</p>
                  <p className="font-body text-sm text-brand-ink/60">Chapel Hill, North Carolina</p>
                </div>
              </div>

              <a
                href="https://collaborativejournalism.org"
                target="_blank"
                rel="noopener noreferrer"
                className="card-sketch p-5 flex items-center gap-4 hover:border-brand-teal/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                  <Globe className="w-6 h-6 text-brand-teal" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-brand-ink group-hover:text-brand-teal transition-colors">Website</p>
                  <p className="font-body text-sm text-brand-ink/60">collaborativejournalism.org</p>
                </div>
                <ExternalLink className="w-4 h-4 text-brand-ink/30 group-hover:text-brand-teal transition-colors" />
              </a>

              <a
                href="https://twitter.com/CenterCoopMedia"
                target="_blank"
                rel="noopener noreferrer"
                className="card-sketch p-5 flex items-center gap-4 hover:border-brand-teal/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                  <Twitter className="w-6 h-6 text-brand-teal" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-brand-ink group-hover:text-brand-teal transition-colors">Twitter/X</p>
                  <p className="font-body text-sm text-brand-ink/60">@CenterCoopMedia</p>
                </div>
                <ExternalLink className="w-4 h-4 text-brand-ink/30 group-hover:text-brand-teal transition-colors" />
              </a>
            </div>

            {/* Hosting organization */}
            <div className="mt-10">
              <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">Hosted by</h3>
              <a
                href="https://centerforcooperativemedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block card-sketch p-4 hover:border-brand-teal/50 transition-colors"
              >
                <p className="font-heading font-semibold text-brand-ink">Center for Cooperative Media</p>
                <p className="font-body text-sm text-brand-ink/60">Montclair State University</p>
              </a>
            </div>

            {/* Co-located event */}
            <div className="mt-6">
              <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">Co-located with</h3>
              <a
                href="https://inn.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block card-sketch p-4 hover:border-brand-teal/50 transition-colors"
              >
                <p className="font-heading font-semibold text-brand-ink">INN Days</p>
                <p className="font-body text-sm text-brand-ink/60">Institute for Nonprofit News</p>
              </a>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-6">Send a message</h2>

            {status === 'sent' ? (
              <motion.div
                className="card-sketch p-8 text-center bg-brand-teal/5 border-brand-teal/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-brand-teal" />
                </div>
                <p className="font-accent text-xl text-brand-teal mb-2">Opening email client...</p>
                <p className="font-body text-brand-ink/60">
                  Your email client should open with your message. If it doesn't, please email us directly at{' '}
                  <a href="mailto:summit@collaborativejournalism.org" className="text-brand-teal hover:underline">
                    summit@collaborativejournalism.org
                  </a>
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 font-body text-sm text-brand-teal hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-body font-medium text-brand-ink mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-body font-medium text-brand-ink mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors"
                    placeholder="jane@example.org"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block font-body font-medium text-brand-ink mb-2">
                    What's this about?
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink focus:border-brand-teal focus:outline-none transition-colors"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block font-body font-medium text-brand-ink mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal focus:outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Send message
                </motion.button>

                <p className="font-body text-xs text-brand-ink/50 text-center">
                  This will open your email client with a pre-filled message.
                </p>
              </form>
            )}
          </motion.div>
        </div>

        {/* FAQ teaser */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="card-sketch p-8 bg-parchment">
            <h2 className="font-heading font-semibold text-xl text-brand-ink mb-2">
              Frequently asked questions
            </h2>
            <p className="font-body text-brand-ink/70 mb-4">
              Have questions about registration, travel, or the event? Check out our FAQ section (coming soon) or reach out directly.
            </p>
            <p className="font-accent text-brand-teal">
              FAQ page coming in early 2026
            </p>
          </div>
        </motion.div>
      </div>
    </div>
      <Footer />
    </>
  )
}

export default Contact
