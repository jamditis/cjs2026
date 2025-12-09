import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Mail, ExternalLink, ChevronDown } from 'lucide-react'
import {
  AnimatedLogo,
  BlurText,
  SplitText,
  CountUp,
  ParticlesBackground,
  SplashScreen
} from './components'

// Countdown component
function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ]

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
        >
          <div className="bg-white text-brand-black rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] shadow-lg">
            <span className="countdown-number text-2xl md:text-4xl font-montserrat font-bold">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <p className="text-white/80 text-xs md:text-sm mt-2 font-montserrat">{unit.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// Email signup form
function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  if (status === 'success') {
    return (
      <motion.div
        className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-green-800 font-medium">Thanks! We'll keep you posted.</p>
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
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
        aria-label="Email address"
      />
      <motion.button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {status === 'loading' ? 'Signing up...' : 'Notify me'}
      </motion.button>
    </form>
  )
}

// Info card component
function InfoCard({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start gap-4">
        <div className="bg-brand-red/10 rounded-lg p-3">
          <Icon className="w-6 h-6 text-brand-red" />
        </div>
        <div>
          <h3 className="font-montserrat font-semibold text-lg mb-2">{title}</h3>
          <div className="text-gray-600">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

// Main App
function App() {
  const summitDate = '2026-06-08T09:00:00'
  const [splashComplete, setSplashComplete] = useState(false)

  return (
    <SplashScreen duration={2000} onComplete={() => setSplashComplete(true)}>
      <div className="min-h-screen bg-white">
        {/* Hero section */}
        <section className="relative bg-brand-black text-white min-h-screen flex flex-col overflow-hidden">
          {/* Particles background */}
          <ParticlesBackground
            particleCount={40}
            particleColor="rgba(202, 53, 83, 0.5)"
            lineColor="rgba(202, 53, 83, 0.2)"
            connectionDistance={120}
            speed={0.3}
          />

          {/* Header */}
          <header className="relative z-10 w-full py-4 px-6">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <img
                  src="/cjs-logo-iso.png"
                  alt="Collaborative Journalism Summit"
                  className="h-10 md:h-12 logo-glow"
                />
                <span className="font-montserrat font-bold text-lg hidden sm:inline">CJS 2026</span>
              </motion.div>
              <motion.a
                href="https://centerforcooperativemedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Center for Cooperative Media
                <ExternalLink className="w-3 h-3" />
              </motion.a>
            </div>
          </header>

          {/* Hero content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="max-w-4xl">
              {/* Animated logo */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <AnimatedLogo size={100} showPulse={true} />
              </motion.div>

              {/* 10th anniversary badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/30 rounded-full px-4 py-2 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-brand-red font-montserrat font-semibold">10th anniversary</span>
              </motion.div>

              {/* Animated headline */}
              <h1 className="font-montserrat font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
                <BlurText
                  text="Collaborative Journalism Summit"
                  animateByWord={true}
                  delay={0.5}
                  staggerDelay={0.08}
                />
              </h1>

              <motion.p
                className="text-xl md:text-2xl text-white/80 mb-4 font-montserrat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                June 8–9, 2026 • Chapel Hill, NC
              </motion.p>

              <motion.p
                className="text-lg text-white/70 max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                A decade of bringing journalists together to work in the public interest.
                Join us at UNC Chapel Hill for the 10th anniversary summit.
              </motion.p>

              {/* Countdown */}
              <div className="mb-12">
                <Countdown targetDate={summitDate} />
              </div>

              {/* CTA */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
              >
                <p className="text-white/70 text-sm">Registration opens soon</p>
                <EmailSignup />
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="relative z-10 pb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <button
              onClick={() => document.getElementById('details').scrollIntoView({ behavior: 'smooth' })}
              className="text-white/50 hover:text-white transition-colors"
              aria-label="Scroll to learn more"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-8 h-8 mx-auto" />
              </motion.div>
            </button>
          </motion.div>
        </section>

        {/* Details section */}
        <section id="details" className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="font-montserrat font-bold text-3xl md:text-4xl text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Save the date
            </motion.h2>
            <motion.p
              className="text-gray-600 text-center max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              The Collaborative Journalism Summit is the premier gathering for journalists exploring
              how to work together in the public interest.
            </motion.p>

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
                <p className="text-sm mt-2 text-gray-500">
                  Co-located with INN Days (June 9–11)
                </p>
              </InfoCard>

              <InfoCard icon={Users} title="Who" delay={0.2}>
                <p><strong>130–150 attendees</strong></p>
                <p className="text-sm">
                  Journalists, media leaders, funders, and academics working on collaborative journalism
                </p>
              </InfoCard>
            </div>

            {/* What to expect */}
            <motion.div
              className="bg-white rounded-2xl p-8 md:p-12 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-montserrat font-bold text-2xl mb-6">What to expect</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-montserrat font-semibold text-lg mb-3 text-brand-red">Monday: Main summit</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 8 curated sessions with invited speakers</li>
                    <li>• 8 lightning talks from community pitches</li>
                    <li>• Networking opportunities throughout</li>
                    <li>• Evening dinner and celebration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-lg mb-3 text-brand-red">Tuesday: Workshops</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Track 1:</strong> Collaborating 101 — intro to the field</li>
                    <li>• <strong>Track 2:</strong> Advanced collaboration — invite-only intensive</li>
                    <li>• Hands-on learning and skill building</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 10 years section */}
        <section className="py-20 px-6 bg-brand-black text-white overflow-hidden relative">
          <ParticlesBackground
            particleCount={25}
            particleColor="rgba(255, 255, 255, 0.3)"
            lineColor="rgba(255, 255, 255, 0.1)"
            connectionDistance={100}
            speed={0.2}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              className="font-montserrat font-bold text-3xl md:text-4xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              10 years of working together
            </motion.h2>
            <motion.p
              className="text-white/80 text-lg mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Since 2017, the Collaborative Journalism Summit has brought together practitioners,
              funders, and innovators to advance the field. This year, we celebrate a decade of
              proving that journalism is stronger when we collaborate.
            </motion.p>

            {/* Animated stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: 10, label: 'Summits' },
                { value: 8, label: 'Cities' },
                { value: 1500, label: 'Attendees', suffix: '+' },
                { value: 1, label: 'Mission' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="font-montserrat font-bold text-4xl md:text-5xl text-brand-red">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix || ''}
                      duration={2}
                      delay={0.3}
                    />
                  </p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              className="text-gray-500 text-sm mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Hosted by
            </motion.p>
            <motion.div
              className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <a
                href="https://centerforcooperativemedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="/ccm-logo.png"
                  alt="Center for Cooperative Media at Montclair State University"
                  className="h-12 md:h-16"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = '<span class="font-montserrat font-semibold text-lg">Center for Cooperative Media</span>'
                  }}
                />
              </a>
              <span className="text-gray-300 hidden md:block">×</span>
              <a
                href="https://inn.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="/inn-logo.png"
                  alt="Institute for Nonprofit News"
                  className="h-12 md:h-16"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = '<span class="font-montserrat font-semibold text-lg">Institute for Nonprofit News</span>'
                  }}
                />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-100 py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h3 className="font-montserrat font-semibold text-lg mb-2">Stay connected</h3>
              <p className="text-gray-600 mb-4">Get updates on CJS 2026 programming, registration, and more.</p>
              <EmailSignup />
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                <a
                  href="mailto:summit@collaborativejournalism.org"
                  className="hover:text-brand-red transition-colors flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  summit@collaborativejournalism.org
                </a>
                <span className="hidden md:inline">•</span>
                <a
                  href="https://collaborativejournalism.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-red transition-colors"
                >
                  collaborativejournalism.org
                </a>
                <span className="hidden md:inline">•</span>
                <a
                  href="https://twitter.com/CenterCoopMedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-red transition-colors"
                >
                  @CenterCoopMedia
                </a>
              </div>
              <p className="text-gray-400 text-xs mt-6">
                © 2024 Center for Cooperative Media at Montclair State University
              </p>
            </div>
          </div>
        </footer>
      </div>
    </SplashScreen>
  )
}

export default App
