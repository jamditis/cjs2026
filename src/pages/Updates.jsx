import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Newspaper,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Tag,
  Clock,
  ExternalLink,
  Bell,
  TrendingUp,
  MapPin,
  Loader2,
  Lightbulb
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import EmailSignup from '../components/EmailSignup'
import { updates as staticUpdates, getDaysUntil } from '../content/updatesData'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'

// Quick stats
const summitDate = '2026-06-08'
const daysUntilSummit = getDaysUntil(summitDate)

// Category badge component
function CategoryBadge({ category, color = 'teal' }) {
  const colorClasses = {
    teal: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
    cardinal: 'bg-brand-cardinal/10 text-brand-cardinal border-brand-cardinal/20',
    'green-dark': 'bg-brand-green-dark/10 text-brand-green-dark border-brand-green-dark/20',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color] || colorClasses.teal}`}>
      <Tag className="w-3 h-3" />
      {category}
    </span>
  )
}

// Featured announcement card
function FeaturedCard({ update, index }) {
  const borderColor = {
    teal: 'hover:border-brand-teal',
    cardinal: 'hover:border-brand-cardinal',
    'green-dark': 'hover:border-brand-green-dark',
  }[update.color] || 'hover:border-brand-teal'

  return (
    <motion.article
      className={`relative card-sketch p-0 overflow-hidden ${borderColor} group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/updates/${update.slug}`} className="block p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <CategoryBadge category={update.category} color={update.color} />
          <span className="text-sm text-brand-ink/50 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <h3 className="font-heading font-bold text-2xl md:text-3xl text-brand-ink mb-3 group-hover:text-brand-teal transition-colors">
          {update.title}
        </h3>

        <p className="font-body text-brand-ink/70 text-lg mb-6 leading-relaxed">
          {update.summary}
        </p>

        <span className="inline-flex items-center gap-2 text-brand-teal font-medium">
          Read more
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.article>
  )
}

// Timeline update card
function TimelineCard({ update, index }) {
  const iconColor = {
    teal: 'bg-brand-teal text-white',
    cardinal: 'bg-brand-cardinal text-white',
    'green-dark': 'bg-brand-green-dark text-white',
  }[update.color] || 'bg-brand-teal text-white'

  const TypeIcon = {
    announcement: Bell,
    deadline: Calendar,
    story: Newspaper,
    milestone: Sparkles,
  }[update.type] || Newspaper

  return (
    <motion.article
      className="relative flex gap-4 pb-8 last:pb-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Timeline line */}
      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-brand-ink/10"></div>

      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${iconColor} flex items-center justify-center shadow-md`}>
        <TypeIcon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-brand-ink/50">
            {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {update.countdown && (
            <span className="text-xs px-2 py-0.5 bg-brand-cardinal/10 text-brand-cardinal rounded-full font-medium">
              Deadline
            </span>
          )}
        </div>

        <Link to={`/updates/${update.slug}`} className="group">
          <h4 className="font-heading font-semibold text-lg text-brand-ink mb-1 group-hover:text-brand-teal transition-colors">
            {update.title}
          </h4>
        </Link>

        <p className="font-body text-brand-ink/60 text-sm leading-relaxed mb-2">
          {update.summary}
        </p>

        <Link
          to={`/updates/${update.slug}`}
          className="inline-flex items-center gap-1 text-sm text-brand-teal hover:underline font-medium"
        >
          Read more
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  )
}

// Countdown component
function DeadlineCountdown({ date }) {
  const days = getDaysUntil(date)

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-brand-cardinal/10 rounded-lg border border-brand-cardinal/20">
      <Clock className="w-5 h-5 text-brand-cardinal" />
      <span className="font-heading font-bold text-2xl text-brand-cardinal">{days}</span>
      <span className="text-sm text-brand-cardinal">days left</span>
    </div>
  )
}

// Quick links section
function QuickLinks() {
  const links = [
    { icon: Lightbulb, label: 'Pitch a session', path: 'https://airtable.com/appL8Sn87xUotm4jF/pag23Y1hW5Y58hSy0/form', external: true },
    { icon: Calendar, label: 'View schedule', path: '/schedule' },
    { icon: Users, label: 'See sponsors', path: '/sponsors' },
    { icon: MapPin, label: 'Event details', path: '/#details' },
  ]

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {links.map((link) => (
        link.external || link.path.startsWith('/#') ? (
          <a
            key={link.path}
            href={link.path}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-brand-ink/10 hover:border-brand-teal hover:bg-brand-teal/5 transition-all font-body text-sm text-brand-ink/70 hover:text-brand-teal"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </a>
        ) : (
          <Link
            key={link.path}
            to={link.path}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-brand-ink/10 hover:border-brand-teal hover:bg-brand-teal/5 transition-all font-body text-sm text-brand-ink/70 hover:text-brand-teal"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        )
      ))}
    </div>
  )
}

// Stats banner
function StatsBanner() {
  return (
    <motion.div
      className="grid grid-cols-3 gap-4 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="text-center p-4 rounded-lg bg-brand-teal/5 border border-brand-teal/10">
        <div className="font-accent text-3xl md:text-4xl text-brand-teal font-bold">
          {daysUntilSummit}
        </div>
        <div className="text-xs text-brand-ink/50 font-body mt-1">days until summit</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-brand-cardinal/5 border border-brand-cardinal/10">
        <div className="font-accent text-3xl md:text-4xl text-brand-cardinal font-bold">
          10
        </div>
        <div className="text-xs text-brand-ink/50 font-body mt-1">years of CJS</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-brand-green-dark/5 border border-brand-green-dark/10">
        <div className="font-accent text-3xl md:text-4xl text-brand-green-dark font-bold">
          150
        </div>
        <div className="text-xs text-brand-ink/50 font-body mt-1">expected attendees</div>
      </div>
    </motion.div>
  )
}

function Updates() {
  const [updates, setUpdates] = useState(staticUpdates)
  const [loading, setLoading] = useState(true)

  // Fetch updates from Firestore and merge with static data
  useEffect(() => {
    const q = query(
      collection(db, 'updates'),
      where('visible', '==', true),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreUpdates = []
      snapshot.forEach(doc => {
        firestoreUpdates.push({ id: doc.id, ...doc.data() })
      })

      // Merge: Firestore updates override static updates by slug
      const firestoreSlugs = new Set(firestoreUpdates.map(u => u.slug))
      const mergedUpdates = [
        ...firestoreUpdates,
        ...staticUpdates.filter(u => !firestoreSlugs.has(u.slug))
      ].sort((a, b) => new Date(b.date) - new Date(a.date))

      setUpdates(mergedUpdates)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching updates:', error)
      // Fall back to static data on error
      setUpdates(staticUpdates)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const featuredUpdates = updates.filter(u => u.featured)
  const timelineUpdates = updates.filter(u => !u.featured)
  const deadlineUpdate = updates.find(u => u.countdown)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">

          {/* Hero section */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 rounded-full text-brand-teal text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Latest from CJS2026
            </div>

            <h1 className="editorial-headline text-4xl md:text-5xl text-brand-ink mb-4">
              News and updates
            </h1>
            <p className="font-body text-brand-ink/60 text-lg max-w-2xl mx-auto mb-8">
              Stay up to date with the latest announcements, deadlines, and stories as we build toward the 10th anniversary summit in Pittsburgh.
            </p>

            <QuickLinks />
          </motion.div>

          {/* Stats banner */}
          <StatsBanner />

          {/* Featured announcements */}
          {featuredUpdates.length > 0 && (
            <section className="mb-12">
              <h2 className="font-heading font-semibold text-xl text-brand-ink mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-teal" />
                Featured
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredUpdates.map((update, index) => (
                  <FeaturedCard key={update.slug} update={update} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Deadline callout */}
          {deadlineUpdate && (
            <motion.section
              className="mb-12 p-6 bg-brand-cardinal/5 rounded-xl border-2 border-brand-cardinal/20"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <Link to={`/updates/${deadlineUpdate.slug}`} className="group">
                    <h3 className="font-heading font-bold text-xl text-brand-cardinal mb-1 group-hover:underline">
                      {deadlineUpdate.title}
                    </h3>
                  </Link>
                  <p className="font-body text-brand-ink/60">
                    {deadlineUpdate.summary}
                  </p>
                </div>
                <DeadlineCountdown date={deadlineUpdate.date} />
              </div>
            </motion.section>
          )}

          {/* Timeline of updates */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-xl text-brand-ink flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-brand-teal" />
                Recent updates
              </h2>
            </div>

            <div className="pl-1">
              {timelineUpdates.map((update, index) => (
                <TimelineCard key={update.slug} update={update} index={index} />
              ))}
            </div>
          </section>

          {/* Email signup section */}
          <motion.section
            className="text-center p-8 bg-parchment rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Bell className="w-8 h-8 text-brand-teal mx-auto mb-4" />
            <h3 className="font-heading font-bold text-2xl text-brand-ink mb-2">
              Never miss an update
            </h3>
            <p className="font-body text-brand-ink/60 mb-6">
              Get the latest CJS2026 news delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto">
              <EmailSignup />
            </div>
          </motion.section>

        </div>
      </div>
      <Footer />
    </>
  )
}

export default Updates
