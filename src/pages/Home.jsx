import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Users,
  Mail,
  ExternalLink,
  ChevronDown,
  Globe,
  Share2,
  Mic,
  Award,
  ArrowRight,
  History
} from 'lucide-react'
import { BlurText, ParticlesBackground, HeroAnnouncement, HomeSEO } from '../components'
import Navbar from '../components/Navbar'
import EmailSignup from '../components/EmailSignup'

// Import static content from Airtable
import { getContent, getContentMeta, getColorClass, timeline } from '../content/siteContent'
import { sponsors, hasSponsors, sponsorsByTier, tierDisplayNames } from '../content/organizationsData'

// ============================================
// Data - Now pulled from Airtable via siteContent.js
// ============================================
// Map timeline data to include icons (icons can't be stored in Airtable)
const iconMap = {
  '2017': Globe,
  '2018': Users,
  '2019': Share2,
  '2020': Mic,
  '2021': Globe,
  '2022': MapPin,
  '2023': Users,
  '2024': Award,
  '2025': ArrowRight,
  '2026': History,
}

const SummitHistory = timeline.map(item => ({
  ...item,
  icon: iconMap[item.year] || Globe,
  link: item.link || null
}))

// ============================================
// CountUp animation component
// ============================================
function CountUp({ end, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ============================================
// Countdown with sketch-style cards
// ============================================
function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date()
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds }
  ]

  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {units.map((unit, i) => (
        <motion.div
          key={unit.label}
          className="text-center"
          initial={{ opacity: 0, y: 20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
        >
          <div className="countdown-card p-3 md:p-4 min-w-[56px] md:min-w-[72px]">
            <span className="countdown-number text-2xl md:text-4xl font-bold text-brand-ink">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <p className="text-brand-ink/60 text-xs md:text-sm mt-2 font-body">{unit.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// Info card with sketch aesthetic
// ============================================
function InfoCard({ icon: Icon, title, children, delay = 0, color = 'teal' }) {
  const bgLightClass = getColorClass(color, 'bgLight')
  const textClass = getColorClass(color, 'text')

  return (
    <motion.div
      className="card-sketch p-6"
      initial={{ opacity: 0, y: 20, rotate: -1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full ${bgLightClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${textClass}`} />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-xl text-brand-ink mb-2">{title}</h3>
          <div className="text-brand-ink/70 font-body">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// History Timeline Component
// ============================================
function HistoryTimeline() {
  return (
    <div className="relative max-w-4xl mx-auto mt-16 px-4">
      {/* Central Line - Sketch style */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 md:-ml-0.5 border-l-2 border-dashed border-brand-green-dark/40"></div>

      {SummitHistory.map((item, index) => {
        const isEven = index % 2 === 0
        const Icon = item.icon
        const colorClass = getColorClass(item.color || 'teal', 'text')
        const bgLightClass = getColorClass(item.color || 'teal', 'bgLight')
        const bgAccentClass = getColorClass(item.color || 'teal', 'bgAccent')
        const borderColorClass = getColorClass(item.color || 'teal', 'border')

        return (
          <motion.div
            key={item.year}
            className={`relative flex flex-col md:flex-row gap-8 mb-12 md:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Spacer for other side */}
            <div className="hidden md:block md:w-1/2" />

            {/* Timeline Dot */}
            <div className={`absolute left-4 md:left-1/2 w-4 h-4 bg-brand-cream border-2 ${borderColorClass} rounded-full -translate-x-1.5 md:-translate-x-2 mt-6 z-10 shadow-[0_0_0_4px_var(--cream)]`}></div>

            {/* Content Card */}
            <div className="ml-10 md:ml-0 md:w-1/2 md:px-8">
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block card-sketch p-6 transition-all duration-300 group hover:-translate-y-1 ${item.year === '2026' ? `${bgAccentClass} ${borderColorClass}` : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 ${bgLightClass} rounded-full ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`font-accent text-2xl font-bold ${item.year === '2026' ? colorClass : 'text-brand-ink/40'}`}>
                      {item.year}
                    </span>
                    <ExternalLink className="w-3 h-3 text-brand-ink/20 ml-auto group-hover:text-brand-teal transition-colors" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-brand-ink mb-1 group-hover:text-brand-teal transition-colors">{item.location}</h4>
                  <p className="font-body text-brand-ink/60 text-sm italic">{item.theme}</p>
                </a>
              ) : (
                <div className={`card-sketch p-6 transition-colors group ${item.year === '2026' ? `${bgAccentClass} ${borderColorClass}` : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 ${bgLightClass} rounded-full ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`font-accent text-2xl font-bold ${item.year === '2026' ? colorClass : 'text-brand-ink/40'}`}>
                      {item.year}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-lg text-brand-ink mb-1">{item.location}</h4>
                  <p className="font-body text-brand-ink/60 text-sm italic">{item.theme}</p>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================
// Home Page
// ============================================
function Home() {
  const summitDate = '2026-06-08T09:00:00'

  return (
    <div className="min-h-screen bg-paper">
      <HomeSEO />
      <Navbar />

      {/* ============================================
          Hero Section - Illustrated style
          ============================================ */}
      <section id="about" className="relative min-h-screen flex flex-col overflow-hidden pt-20">
        <ParticlesBackground color="#8B9A8B" particleCount={50} />

        {/* Decorative mountains background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full h-64 opacity-[0.07]" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path d="M0 200 L0 120 L150 60 L300 100 L450 30 L600 80 L750 20 L900 70 L1050 40 L1200 90 L1200 200 Z" fill="#2A9D8F"/>
          </svg>
          <svg className="absolute bottom-0 w-full h-48 opacity-[0.05]" viewBox="0 0 1200 150" preserveAspectRatio="none">
            <path d="M0 150 L0 100 L200 50 L400 90 L600 30 L800 70 L1000 45 L1200 80 L1200 150 Z" fill="#2C3E50"/>
          </svg>
          {/* PA Map accent - centered */}
          <motion.img
            src="/pa-map.png"
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[900px] opacity-[0.08]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="max-w-4xl">

            {/* Year badge - handwritten style */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className={`font-accent text-6xl md:text-8xl font-bold ${getColorClass(getContentMeta('details', 'year')?.color || 'teal', 'text')}`}>
                {getContent('details', 'year', '2026')}
              </span>
            </motion.div>

            {/* Main headline */}
            <BlurText
              text={getContent('details', 'headline', 'Collaborative Journalism Summit')}
              className="editorial-headline text-4xl md:text-6xl lg:text-7xl text-brand-ink mb-6 justify-center"
              delay={150}
            />

            {/* Tagline - italic like the og-image */}
            <BlurText
              text={getContent('details', 'tagline', 'Prepare to partner.')}
              className="italic-accent text-2xl md:text-3xl text-brand-green-dark mb-4 justify-center"
              delay={500}
            />

            {/* Date and location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
               <p className="font-body text-lg md:text-xl text-brand-ink/70 mb-1">{getContent('details', 'date_display', 'June 8–9, 2026')}</p>
               <p className="font-body text-brand-ink/50 mb-10">{getContent('details', 'location', 'Pittsburgh, Pennsylvania')}</p>
            </motion.div>

            {/* Announcement + Anniversary badge */}
            <HeroAnnouncement />

            {/* Countdown */}
            <div className="mb-10">
              <Countdown targetDate={summitDate} />
            </div>

            {/* CTA */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-brand-ink/50 text-sm font-body">{getContent('details', 'registration_note', 'Tickets now available')}</p>
              <EmailSignup />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="relative z-10 pb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button
            onClick={() => document.getElementById('details').scrollIntoView({ behavior: 'smooth' })}
            className="text-brand-ink/30 hover:text-brand-teal transition-colors"
            aria-label="Scroll to learn more"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ChevronDown className="w-8 h-8 mx-auto" />
            </motion.div>
          </button>
        </motion.div>
      </section>

      {/* Mountain divider */}
      <div className="divider-mountains" />

      {/* ============================================
          Details Section
          ============================================ */}
      <section id="details" className="py-20 px-6 bg-parchment">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="editorial-headline text-3xl md:text-5xl text-brand-ink mb-4">
              {getContent('details', 'section_headline', 'Save the date')}
            </h2>
            <p className="font-body text-brand-ink/60 max-w-2xl mx-auto text-lg">
              {getContent('details', 'section_description', 'The premier gathering for journalists exploring how to work together in the public interest.')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <InfoCard icon={Calendar} title="When" delay={0} color={getContentMeta('details', 'when_day1_description')?.color || 'teal'}>
              <p><strong>{getContent('details', 'when_day1_title', 'Monday, June 8')}</strong></p>
              <p className="text-sm">{getContent('details', 'when_day1_description', 'Full day of sessions + dinner')}</p>
              <p className="mt-2"><strong>{getContent('details', 'when_day2_title', 'Tuesday, June 9')}</strong></p>
              <p className="text-sm">{getContent('details', 'when_day2_description', 'Morning workshops')}</p>
            </InfoCard>

            <InfoCard icon={MapPin} title="Where" delay={0.1} color={getContentMeta('details', 'venue_name')?.color || 'teal'}>
              <p>
                <a
                  href="https://maps.google.com/?q=Pittsburgh,+PA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-brand-teal transition-colors underline decoration-brand-ink/30 hover:decoration-brand-teal"
                >
                  {getContent('details', 'venue_name', 'Pittsburgh venue TBA')}
                </a>
              </p>
              <p className="text-sm">{getContent('details', 'venue_location', 'Pittsburgh, Pennsylvania')}</p>
              <p className="text-sm mt-2 text-brand-ink/50">{getContent('details', 'venue_note', 'Co-located with INN Days')}</p>
            </InfoCard>

            <InfoCard icon={Users} title="Who" delay={0.2} color={getContentMeta('details', 'who_count')?.color || 'teal'}>
              <p><strong>{getContent('details', 'who_count', '130–150 attendees')}</strong></p>
              <p className="text-sm">{getContent('details', 'who_description', 'Journalists, media leaders, funders, and academics')}</p>
            </InfoCard>
          </div>

          {/* What to expect */}
          <motion.div
            className="card-sketch p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-heading font-semibold text-2xl text-brand-ink mb-8">{getContent('expect', 'section_headline', 'What to expect')}</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className={`font-heading font-semibold text-lg mb-4 ${getColorClass(getContentMeta('expect', 'monday_label')?.color || 'teal', 'text')} flex items-center gap-2`}>
                  <span className={`w-8 h-8 rounded-full ${getColorClass(getContentMeta('expect', 'monday_label')?.color || 'teal', 'bgLight')} flex items-center justify-center text-sm`}>1</span>
                  {getContent('expect', 'monday_label', 'Monday: Main summit')}
                </h4>
                <ul className="space-y-2 text-brand-ink/70 font-body ml-10">
                  {getContent('expect', 'monday_items', '').split('\n').map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={`font-heading font-semibold text-lg mb-4 ${getColorClass(getContentMeta('expect', 'tuesday_label')?.color || 'cardinal', 'text')} flex items-center gap-2`}>
                  <span className={`w-8 h-8 rounded-full ${getColorClass(getContentMeta('expect', 'tuesday_label')?.color || 'cardinal', 'bgLight')} flex items-center justify-center text-sm`}>2</span>
                  {getContent('expect', 'tuesday_label', 'Tuesday: Workshops')}
                </h4>
                <ul className="space-y-2 text-brand-ink/70 font-body ml-10">
                  {getContent('expect', 'tuesday_items', '').split('\n').map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          10 Years Section - Light background with dark green
          ============================================ */}
      <section id="history" className="py-20 px-6 bg-brand-cream relative overflow-hidden">
        {/* Decorative sketch lines */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#005442" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            className="editorial-headline text-3xl md:text-5xl mb-6 text-brand-green-dark"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {getContent('history', 'section_headline', '10 years of working together')}
          </motion.h2>
          <motion.p
            className="font-body text-brand-green-dark/70 text-lg mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {getContent('history', 'section_description', 'Since 2017, the Collaborative Journalism Summit has brought together practitioners, funders, and innovators. This year, we celebrate a decade of proving that journalism is stronger when we collaborate.')}
          </motion.p>

          {/* Stats with CountUp animation - historical data, hardcoded for reliability */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <p className="font-accent text-5xl md:text-6xl text-brand-green-dark">
                <CountUp end={10} duration={1.5} />
              </p>
              <p className="text-brand-green-dark/70 text-sm font-body mt-1">Summits</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-accent text-5xl md:text-6xl text-brand-green-dark">
                <CountUp end={6} duration={1.5} />
              </p>
              <p className="text-brand-green-dark/70 text-sm font-body mt-1">Cities</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-accent text-5xl md:text-6xl text-brand-green-dark">
                <CountUp end={2569} duration={2} />
              </p>
              <p className="text-brand-green-dark/70 text-sm font-body mt-1">Registrations</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-accent text-5xl md:text-6xl text-brand-green-dark">
                <CountUp end={1} duration={0.8} />
              </p>
              <p className="text-brand-green-dark/70 text-sm font-body mt-1">Mission</p>
            </motion.div>
          </div>

          <div className="divider-sketch opacity-50 mb-16"></div>

          {/* Timeline */}
          <HistoryTimeline />
        </div>
      </section>

      {/* ============================================
          Partners Section
          ============================================ */}
      <section id="partners" className="py-16 px-6 bg-paper">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-ink/40 text-sm mb-8 font-body">Co-located with</p>
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <a href="https://centerforcooperativemedia.org" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <img src="/ccm-logo.png" alt="Center for Cooperative Media" className="h-12 md:h-14"
                onError={(e) => { e.target.outerHTML = '<span class="font-heading font-semibold text-xl text-brand-ink">Center for Cooperative Media</span>' }} />
            </a>
            <span className="text-brand-ink/20 font-accent text-3xl hidden md:block">+</span>
            <a href="https://inn.org" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <img src="/inn-logo.png" alt="Institute for Nonprofit News" className="h-10 md:h-12" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          Sponsors Section - Dynamic from Airtable Organizations
          ============================================ */}
      {hasSponsors() && (
        <section id="sponsors" className="py-12 px-6 bg-parchment">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-brand-ink/40 text-sm mb-6 font-body">Supported by</p>
            {/* Group sponsors by tier */}
            {Object.entries(sponsorsByTier).map(([tier, tierSponsors]) => (
              <motion.div
                key={tier}
                className="mb-8 last:mb-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {/* Tier label */}
                <p className="text-brand-ink/50 text-xs uppercase tracking-wider mb-4 font-body">
                  {tierDisplayNames[tier] || tier}
                </p>
                {/* Sponsor logos for this tier */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {tierSponsors.map((sponsor) => (
                    <a
                      key={sponsor.id}
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity"
                      title={sponsor.name}
                    >
                      <img
                        src={sponsor.localLogoPath || sponsor.logoUrl}
                        alt={sponsor.name}
                        className="h-16 md:h-20 max-w-[200px] object-contain"
                        onError={(e) => {
                          // Fallback to Airtable URL if local path fails
                          if (sponsor.logoUrl && e.target.src !== sponsor.logoUrl) {
                            e.target.src = sponsor.logoUrl
                          }
                        }}
                      />
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Sketch divider */}
      <div className="divider-sketch" />

      {/* ============================================
          Footer - content from Airtable
          ============================================ */}
      <footer id="updates" className="py-16 px-6 bg-parchment">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-10">
            <h3 className="font-heading font-semibold text-2xl text-brand-ink mb-2">{getContent('footer', 'signup_headline', 'Join us in Pittsburgh')}</h3>
            <p className="text-brand-ink/60 mb-6 font-body">{getContent('footer', 'signup_description', 'Secure your spot at the 10th anniversary summit.')}</p>
            <EmailSignup />
          </div>

          <div className="border-t-2 border-brand-ink/10 pt-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-brand-ink/50 font-body">
              <a href={`mailto:${getContent('footer', 'contact_email', 'summit@collaborativejournalism.org')}`} className="hover:text-brand-teal transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {getContent('footer', 'contact_email', 'summit@collaborativejournalism.org')}
              </a>
              <span className="hidden md:inline text-brand-ink/20">•</span>
              <a href={`https://${getContent('footer', 'website_url', 'collaborativejournalism.org')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
                {getContent('footer', 'website_url', 'collaborativejournalism.org')}
              </a>
              <span className="hidden md:inline text-brand-ink/20">•</span>
              <a href="https://bsky.app/profile/centercoopmedia.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
                Bluesky
              </a>
              <span className="hidden md:inline text-brand-ink/20">•</span>
              <a href={`https://twitter.com/${getContent('footer', 'twitter_handle', '@CenterCoopMedia').replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
                X/Twitter
              </a>
            </div>
            <p className="text-brand-ink/30 text-xs mt-8 font-body">
              © {getContent('footer', 'copyright', '2026 Center for Cooperative Media at Montclair State University')}
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Home
