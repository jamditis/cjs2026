import React from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Globe, Twitter, ExternalLink } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Contact() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
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

        {/* Contact info - full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-6">Get in touch</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
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

          {/* Hosting and co-located */}
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div>
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

            <div>
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
          </div>
        </motion.div>

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
