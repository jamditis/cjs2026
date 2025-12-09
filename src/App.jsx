import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  ExternalLink, 
  ChevronDown, 
  Feather,
  Globe,
  Share2,
  Mic,
  Award,
  ArrowRight,
  History
} from 'lucide-react'
import { BlurText, ParticlesBackground, AnimatedLogo } from './components'

// Airtable config - API key from environment variable
const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF'
const AIRTABLE_TABLE_NAME = 'Email signups'
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY

// ============================================
// Data
// ============================================
const SummitHistory = [
  { year: '2017', location: 'Montclair, NJ', theme: 'The Beginning', icon: Globe, link: 'https://www.montclair.edu/college-of-communication-and-media/2017/06/07/18156_collaborative-journalism-summit-highlights-new-ideas-for-impactful-reporting/' },
  { year: '2018', location: 'Montclair, NJ', theme: 'Building Bridges', icon: Users, link: 'https://collaborativejournalism.org/2018summit/' },
  { year: '2019', location: 'Philadelphia, PA', theme: 'People Over Projects', icon: Share2, link: 'https://collaborativejournalism.org/cjs2019/' },
  { year: '2020', location: 'Virtual', theme: 'Adapting Together', icon: Mic, link: 'https://collaborativejournalism.org/cjs2020/' },
  { year: '2021', location: 'Virtual', theme: 'Removing Barriers', icon: Globe, link: 'https://collaborativejournalism.org/cjs2021/' },
  { year: '2022', location: 'Chicago, IL', theme: 'Building to Last', icon: MapPin, link: 'https://collaborativejournalism.org/cjs2022/' },
  { year: '2023', location: 'Washington, D.C.', theme: 'Building Frameworks', icon: Users, link: 'https://collaborativejournalism.org/cjs2023/' },
  { year: '2024', location: 'Detroit, MI', theme: 'Global Impact', icon: Award, link: 'https://collaborativejournalism.org/cjs2024/' },
  { year: '2025', location: 'Denver, CO', theme: 'Partnerships with Purpose', icon: ArrowRight, link: 'https://collaborativejournalism.org/cjs2025/' },
  { year: '2026', location: 'North Carolina', theme: '10th Anniversary', icon: History, link: null },
]

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
// Splash Screen - Hand-drawn feel
// ============================================
function SplashScreen({ onComplete, children }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-paper"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center flex flex-col items-center">
              <motion.img
                src="/cjs-logo-iso.png"
                alt="CJS"
                className="w-24 h-24 mx-auto mb-6"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.p
                className="font-accent text-3xl text-brand-green-dark mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Prepare to partner.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  )
}

// ============================================
// Navbar
// ============================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-paper/90 backdrop-blur-md shadow-sm border-b border-brand-ink/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 group">
          <img src="/cjs-logo-iso.png" alt="CJS" className="h-8 md:h-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className={`font-heading font-bold text-xl ${scrolled ? 'text-brand-ink' : 'text-brand-ink'} transition-colors`}>
            CJS<span className="text-brand-teal">2026</span>
          </span>
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          {['About', 'History', 'Partners'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-body text-brand-ink/70 hover:text-brand-teal font-medium transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-teal transition-all group-hover:w-full opacity-50"></span>
            </a>
          ))}
          <button 
            onClick={() => document.getElementById('updates').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary py-2 px-5 text-sm"
          >
            Get Updates
          </button>
        </div>
      </div>
    </nav>
  )
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
// Email signup with sketch styling - saves to Airtable
// ============================================
function EmailSignup({ darkBg = false }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [{
              fields: {
                'Email': email,
                'Source': 'CJS 2026 Website',
                'Signed up': new Date().toISOString(),
              }
            }]
          })
        }
      )

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving to Airtable:', error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        className={`rounded-lg p-4 text-center border-2 ${darkBg ? 'bg-white/10 border-white/30' : 'bg-brand-teal/10 border-brand-teal/30'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className={`font-accent text-xl ${darkBg ? 'text-white' : 'text-brand-teal'}`}>
          Thanks! We'll keep you posted.
        </p>
      </motion.div>
    )
  }

  if (status === 'error') {
    return (
      <motion.div
        className="rounded-lg p-4 text-center border-2 bg-brand-cardinal/10 border-brand-cardinal/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="font-body text-brand-cardinal">
          Something went wrong. Please try again or email us directly.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-sm text-brand-cardinal underline"
        >
          Try again
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className={`flex-1 px-4 py-3 rounded-lg border-2 outline-none transition-all font-body
          ${darkBg
            ? 'bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white'
            : 'bg-white border-brand-ink/20 text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-teal'
          }`}
      />
      <motion.button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary whitespace-nowrap disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {status === 'loading' ? 'Signing up...' : 'Notify me'}
      </motion.button>
    </form>
  )
}

// ============================================
// Info card with sketch aesthetic
// ============================================
function InfoCard({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.div
      className="card-sketch p-6"
      initial={{ opacity: 0, y: 20, rotate: -1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-brand-teal" />
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
            <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-brand-cream border-2 border-brand-green-dark rounded-full -translate-x-1.5 md:-translate-x-2 mt-6 z-10 shadow-[0_0_0_4px_var(--cream)]"></div>

            {/* Content Card */}
            <div className="ml-10 md:ml-0 md:w-1/2 md:px-8">
              {item.link ? (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block card-sketch p-6 hover:border-brand-teal/50 transition-all duration-300 group ${item.year === '2026' ? 'bg-brand-teal/5 border-brand-teal' : 'hover:-translate-y-1'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-teal/10 rounded-full text-brand-teal">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`font-accent text-2xl font-bold ${item.year === '2026' ? 'text-brand-teal' : 'text-brand-ink/40'}`}>
                      {item.year}
                    </span>
                    <ExternalLink className="w-3 h-3 text-brand-ink/20 ml-auto group-hover:text-brand-teal transition-colors" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-brand-ink mb-1 group-hover:text-brand-teal transition-colors">{item.location}</h4>
                  <p className="font-body text-brand-ink/60 text-sm italic">{item.theme}</p>
                </a>
              ) : (
                <div className={`card-sketch p-6 hover:border-brand-teal/50 transition-colors group ${item.year === '2026' ? 'bg-brand-teal/5 border-brand-teal' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-teal/10 rounded-full text-brand-teal">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`font-accent text-2xl font-bold ${item.year === '2026' ? 'text-brand-teal' : 'text-brand-ink/40'}`}>
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
// Main App
// ============================================
function App() {
  const summitDate = '2026-06-08T09:00:00'

  return (
    <SplashScreen onComplete={() => {}}>
      <div className="min-h-screen bg-paper">
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
            {/* NC Map accent - centered */}
            <motion.img
              src="/nc-shapes-green.png"
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
                <span className="font-accent text-6xl md:text-8xl text-brand-teal font-bold">
                  2026
                </span>
              </motion.div>

              {/* Main headline */}
              <BlurText 
                text="Collaborative Journalism Summit" 
                className="editorial-headline text-4xl md:text-6xl lg:text-7xl text-brand-ink mb-6 justify-center" 
                delay={150} 
              />

              {/* Tagline - italic like the og-image */}
              <BlurText 
                text="Prepare to partner." 
                className="italic-accent text-2xl md:text-3xl text-brand-green-dark mb-4 justify-center" 
                delay={500} 
              />

              {/* Date and location */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                 <p className="font-body text-lg md:text-xl text-brand-ink/70 mb-1">June 8–9, 2026</p>
                 <p className="font-body text-brand-ink/50 mb-10">Chapel Hill, North Carolina</p>
              </motion.div>

              {/* 10th anniversary badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-brand-cardinal/10 border-2 border-brand-cardinal/30 rounded-full px-5 py-2 mb-10 transform hover:scale-105 transition-transform cursor-default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Feather className="w-4 h-4 text-brand-cardinal" />
                <span className="text-brand-cardinal font-body font-medium">10th anniversary edition</span>
              </motion.div>

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
                <p className="text-brand-ink/50 text-sm font-body">Registration opens soon</p>
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
                Save the date
              </h2>
              <p className="font-body text-brand-ink/60 max-w-2xl mx-auto text-lg">
                The premier gathering for journalists exploring how to work together in the public interest.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <InfoCard icon={Calendar} title="When" delay={0}>
                <p><strong>Monday, June 8</strong></p>
                <p className="text-sm">Full day of sessions + dinner</p>
                <p className="mt-2"><strong>Tuesday, June 9</strong></p>
                <p className="text-sm">Morning workshops</p>
              </InfoCard>

              <InfoCard icon={MapPin} title="Where" delay={0.1}>
                <p><strong>UNC Friday Center</strong></p>
                <p className="text-sm">Chapel Hill, North Carolina</p>
                <p className="text-sm mt-2 text-brand-ink/50">Co-located with INN Days</p>
              </InfoCard>

              <InfoCard icon={Users} title="Who" delay={0.2}>
                <p><strong>130–150 attendees</strong></p>
                <p className="text-sm">Journalists, media leaders, funders, and academics</p>
              </InfoCard>
            </div>

            {/* What to expect */}
            <motion.div
              className="card-sketch p-8 md:p-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-heading font-semibold text-2xl text-brand-ink mb-8">What to expect</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-heading font-semibold text-lg mb-4 text-brand-teal flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-sm">1</span>
                    Monday: Main summit
                  </h4>
                  <ul className="space-y-2 text-brand-ink/70 font-body ml-10">
                    <li>• 8 curated sessions with invited speakers</li>
                    <li>• 8 lightning talks from community pitches</li>
                    <li>• Networking opportunities throughout</li>
                    <li>• Evening dinner and celebration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-lg mb-4 text-brand-teal flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-sm">2</span>
                    Tuesday: Workshops
                  </h4>
                  <ul className="space-y-2 text-brand-ink/70 font-body ml-10">
                    <li>• <strong>Track 1:</strong> Collaborating 101</li>
                    <li>• <strong>Track 2:</strong> Advanced collaboration</li>
                    <li>• Hands-on learning and skill building</li>
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
              10 years of working together
            </motion.h2>
            <motion.p
              className="font-body text-brand-green-dark/70 text-lg mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Since 2017, the Collaborative Journalism Summit has brought together practitioners,
              funders, and innovators. This year, we celebrate a decade of proving that
              journalism is stronger when we collaborate.
            </motion.p>

            {/* Stats with CountUp animation */}
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
                  <CountUp end={8} duration={1.5} />
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
                  <CountUp end={1500} duration={2} suffix="+" />
                </p>
                <p className="text-brand-green-dark/70 text-sm font-body mt-1">Attendees</p>
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
            <p className="text-brand-ink/40 text-sm mb-8 font-body">Hosted by</p>
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

        {/* Sketch divider */}
        <div className="divider-sketch" />

        {/* ============================================
            Footer
            ============================================ */}
        <footer id="updates" className="py-16 px-6 bg-parchment">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-10">
              <h3 className="font-heading font-semibold text-2xl text-brand-ink mb-2">Stay connected</h3>
              <p className="text-brand-ink/60 mb-6 font-body">Get updates on programming, registration, and more.</p>
              <EmailSignup />
            </div>

            <div className="border-t-2 border-brand-ink/10 pt-10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-brand-ink/50 font-body">
                <a href="mailto:summit@collaborativejournalism.org" className="hover:text-brand-teal transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  summit@collaborativejournalism.org
                </a>
                <span className="hidden md:inline text-brand-ink/20">•</span>
                <a href="https://collaborativejournalism.org" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
                  collaborativejournalism.org
                </a>
                <span className="hidden md:inline text-brand-ink/20">•</span>
                <a href="https://twitter.com/CenterCoopMedia" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
                  @CenterCoopMedia
                </a>
              </div>
              <p className="text-brand-ink/30 text-xs mt-8 font-body">
                © 2026 Center for Cooperative Media at Montclair State University
              </p>
            </div>
          </div>
        </footer>

      </div>
    </SplashScreen>
  )
}

export default App
