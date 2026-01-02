import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Share2,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getUpdateBySlug, getRecentUpdates, getDaysUntil } from '../content/updatesData'

// Share button component
function ShareButton({ icon: Icon, label, onClick, href }) {
  const className = "flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-ink/10 hover:border-brand-teal hover:bg-brand-teal/5 transition-all text-sm text-brand-ink/70 hover:text-brand-teal"

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={label}>
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </a>
    )
  }

  return (
    <button onClick={onClick} className={className} title={label}>
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// Related updates sidebar
function RelatedUpdates({ currentSlug }) {
  const recentUpdates = getRecentUpdates(4).filter(u => u.slug !== currentSlug).slice(0, 3)

  if (recentUpdates.length === 0) return null

  return (
    <div className="card-sketch p-6">
      <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
        More updates
      </h3>
      <div className="space-y-4">
        {recentUpdates.map((update) => (
          <Link
            key={update.slug}
            to={`/updates/${update.slug}`}
            className="block group"
          >
            <p className="font-body text-sm text-brand-ink group-hover:text-brand-teal transition-colors line-clamp-2">
              {update.title}
            </p>
            <p className="text-xs text-brand-ink/50 mt-1">
              {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </Link>
        ))}
      </div>
      <Link
        to="/updates"
        className="inline-flex items-center gap-1 text-sm text-brand-teal hover:underline font-medium mt-4"
      >
        View all updates
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function UpdateDetail() {
  const { slug } = useParams()
  const update = getUpdateBySlug(slug)

  // If update not found, redirect to updates page
  if (!update) {
    return <Navigate to="/updates" replace />
  }

  const shareUrl = `https://summit.collaborativejournalism.org/updates/${slug}`
  const shareText = `${update.title} | CJS2026`

  const colorClasses = {
    teal: 'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
    cardinal: 'text-brand-cardinal bg-brand-cardinal/10 border-brand-cardinal/20',
    'green-dark': 'text-brand-green-dark bg-brand-green-dark/10 border-brand-green-dark/20',
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    // Could add a toast notification here
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/updates"
              className="inline-flex items-center gap-2 text-brand-ink/60 hover:text-brand-teal transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all updates
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <motion.article
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[update.color] || colorClasses.teal}`}>
                    <Tag className="w-3 h-3" />
                    {update.category}
                  </span>
                  <span className="text-sm text-brand-ink/50 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(update.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <h1 className="editorial-headline text-3xl md:text-4xl lg:text-5xl text-brand-ink mb-4">
                  {update.title}
                </h1>

                <p className="font-body text-xl text-brand-ink/70 leading-relaxed">
                  {update.summary}
                </p>

                {/* Countdown for deadline items */}
                {update.countdown && (
                  <div className="mt-6 inline-flex items-center gap-3 px-4 py-3 bg-brand-cardinal/10 rounded-lg border border-brand-cardinal/20">
                    <Clock className="w-5 h-5 text-brand-cardinal" />
                    <span className="font-heading font-bold text-2xl text-brand-cardinal">
                      {getDaysUntil(update.date)}
                    </span>
                    <span className="text-brand-cardinal font-body">days until deadline</span>
                  </div>
                )}
              </header>

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <div
                  className="font-body text-brand-ink/80 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: update.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-ink">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-brand-teal hover:underline">$1</a>')
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                      .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
                  }}
                />
              </div>

              {/* CTA */}
              {update.cta && (
                <div className="mb-8">
                  {update.cta.external ? (
                    <a
                      href={update.cta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 btn-primary"
                    >
                      {update.cta.text}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      to={update.cta.url}
                      className="inline-flex items-center gap-2 btn-primary"
                    >
                      {update.cta.text}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}

              {/* Share */}
              <div className="border-t border-brand-ink/10 pt-6">
                <p className="font-body text-sm text-brand-ink/50 mb-3">Share this update</p>
                <div className="flex flex-wrap gap-2">
                  <ShareButton
                    icon={Twitter}
                    label="Twitter"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  />
                  <ShareButton
                    icon={Linkedin}
                    label="LinkedIn"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  />
                  <ShareButton
                    icon={LinkIcon}
                    label="Copy link"
                    onClick={copyToClipboard}
                  />
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="sticky top-28 space-y-6">
                <RelatedUpdates currentSlug={slug} />

                {/* Quick links */}
                <div className="card-sketch p-6">
                  <h3 className="font-heading font-semibold text-lg text-brand-ink mb-4">
                    Quick links
                  </h3>
                  <div className="space-y-2">
                    <Link to="/schedule" className="block font-body text-sm text-brand-ink/70 hover:text-brand-teal transition-colors">
                      View schedule →
                    </Link>
                    <Link to="/sponsors" className="block font-body text-sm text-brand-ink/70 hover:text-brand-teal transition-colors">
                      Our sponsors →
                    </Link>
                    <Link to="/contact" className="block font-body text-sm text-brand-ink/70 hover:text-brand-teal transition-colors">
                      Contact us →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}

export default UpdateDetail
