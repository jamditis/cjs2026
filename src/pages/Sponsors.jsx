import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, Award, Sparkles, Mail, ExternalLink } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Sponsorship tier information with explicit Tailwind classes
// (dynamic classes like `bg-${color}` don't work with Tailwind's JIT compiler)
const sponsorshipTiers = [
  {
    name: 'Presenting sponsor',
    price: '$15,000',
    icon: Sparkles,
    textClass: 'text-brand-cardinal',
    bgClass: 'bg-brand-cardinal',
    bgLightClass: 'bg-brand-cardinal/10',
    bgAccentClass: 'bg-brand-cardinal/5',
    borderClass: 'border-brand-cardinal/30',
    benefits: [
      'Logo on all event materials and website',
      'Speaking opportunity during opening session',
      'Premium booth placement',
      'Full-page ad in program',
      '10 complimentary registrations',
      'Social media recognition',
      'First right of refusal for 2027',
    ],
    available: 1,
  },
  {
    name: 'Gold sponsor',
    price: '$7,500',
    icon: Award,
    textClass: 'text-brand-teal',
    bgClass: 'bg-brand-teal',
    bgLightClass: 'bg-brand-teal/10',
    bgAccentClass: 'bg-brand-teal/5',
    borderClass: 'border-brand-teal/30',
    benefits: [
      'Logo on event materials and website',
      'Booth at networking reception',
      'Half-page ad in program',
      '5 complimentary registrations',
      'Social media recognition',
    ],
    available: 3,
  },
  {
    name: 'Silver sponsor',
    price: '$3,500',
    icon: Star,
    textClass: 'text-brand-green-dark',
    bgClass: 'bg-brand-green-dark',
    bgLightClass: 'bg-brand-green-dark/10',
    bgAccentClass: 'bg-brand-green-dark/5',
    borderClass: 'border-brand-green-dark/30',
    benefits: [
      'Logo on event materials and website',
      'Quarter-page ad in program',
      '3 complimentary registrations',
      'Social media recognition',
    ],
    available: 5,
  },
  {
    name: 'Community supporter',
    price: '$1,000',
    icon: Heart,
    textClass: 'text-brand-ink',
    bgClass: 'bg-brand-ink',
    bgLightClass: 'bg-brand-ink/10',
    bgAccentClass: 'bg-brand-ink/5',
    borderClass: 'border-brand-ink/30',
    benefits: [
      'Logo on website',
      'Listing in program',
      '1 complimentary registration',
    ],
    available: 'Unlimited',
  },
]

// Placeholder for current sponsors - will be populated as sponsors are confirmed
const currentSponsors = {
  presenting: [],
  gold: [],
  silver: [],
  community: [],
}

function SponsorTierCard({ tier, index }) {
  const Icon = tier.icon

  return (
    <motion.div
      className={`card-sketch p-6 border-2 ${tier.borderClass} ${tier.bgAccentClass}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${tier.bgLightClass} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${tier.textClass}`} />
        </div>
        <span className={`font-accent text-2xl ${tier.textClass}`}>{tier.price}</span>
      </div>

      <h3 className="font-heading font-bold text-xl text-brand-ink mb-4">{tier.name}</h3>

      <ul className="space-y-2 mb-6">
        {tier.benefits.map((benefit, i) => (
          <li key={i} className="font-body text-sm text-brand-ink/70 flex items-start gap-2">
            <span className={`${tier.textClass} mt-1`}>•</span>
            {benefit}
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-brand-ink/10">
        <p className="font-body text-xs text-brand-ink/50">
          {typeof tier.available === 'number'
            ? `${tier.available} available`
            : tier.available}
        </p>
      </div>
    </motion.div>
  )
}

function Sponsors() {
  const hasSponsors = Object.values(currentSponsors).some(arr => arr.length > 0)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="editorial-headline text-4xl md:text-5xl text-brand-ink mb-4">
            Sponsors
          </h1>
          <p className="font-body text-brand-ink/60 text-lg max-w-2xl mx-auto">
            Support the 10th anniversary Collaborative Journalism Summit and connect with 130+ leaders in collaborative journalism.
          </p>
        </motion.div>

        {/* Current sponsors section */}
        {hasSponsors ? (
          <section className="mb-16">
            <h2 className="font-heading font-semibold text-2xl text-brand-ink text-center mb-8">
              Thank you to our sponsors
            </h2>
            {/* Sponsor logos will go here once confirmed */}
          </section>
        ) : (
          <motion.div
            className="card-sketch p-8 text-center mb-16 bg-brand-teal/5 border-brand-teal/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-accent text-xl text-brand-teal mb-2">Sponsorships now open</p>
            <p className="font-body text-brand-ink/70">
              Be among the first to support the 10th anniversary summit. Sponsors will be recognized here as they are confirmed.
            </p>
          </motion.div>
        )}

        {/* Why sponsor */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading font-semibold text-2xl text-brand-ink text-center mb-8">
            Why sponsor the summit?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-sketch p-6">
              <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                <span className="font-accent text-2xl text-brand-teal">10</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-brand-ink mb-2">Milestone event</h3>
              <p className="font-body text-sm text-brand-ink/70">
                Be part of our 10th anniversary celebration — a landmark moment in the collaborative journalism movement.
              </p>
            </div>

            <div className="card-sketch p-6">
              <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                <span className="font-accent text-2xl text-brand-teal">130+</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-brand-ink mb-2">Engaged audience</h3>
              <p className="font-body text-sm text-brand-ink/70">
                Connect with journalists, editors, funders, and media leaders actively working on collaborative projects.
              </p>
            </div>

            <div className="card-sketch p-6">
              <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                <span className="font-accent text-2xl text-brand-teal">2x</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-brand-ink mb-2">Dual-event exposure</h3>
              <p className="font-body text-sm text-brand-ink/70">
                Co-located with INN Days means additional visibility to the nonprofit news community.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Sponsorship tiers */}
        <section className="mb-16">
          <h2 className="font-heading font-semibold text-2xl text-brand-ink text-center mb-8">
            Sponsorship opportunities
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {sponsorshipTiers.map((tier, index) => (
              <SponsorTierCard key={tier.name} tier={tier} index={index} />
            ))}
          </div>
        </section>

        {/* Custom sponsorships */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="card-sketch p-8 bg-parchment">
            <h2 className="font-heading font-semibold text-xl text-brand-ink mb-4 text-center">
              Custom sponsorship opportunities
            </h2>
            <p className="font-body text-brand-ink/70 text-center mb-6">
              Interested in sponsoring a specific element of the summit? We offer custom packages for:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <p className="font-heading font-semibold text-brand-ink">Reception sponsor</p>
                <p className="font-body text-sm text-brand-ink/60">Monday networking event</p>
              </div>
              <div className="p-4">
                <p className="font-heading font-semibold text-brand-ink">Workshop sponsor</p>
                <p className="font-body text-sm text-brand-ink/60">Tuesday training sessions</p>
              </div>
              <div className="p-4">
                <p className="font-heading font-semibold text-brand-ink">Anniversary dinner</p>
                <p className="font-body text-sm text-brand-ink/60">10th anniversary celebration</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">
            Ready to sponsor?
          </h2>
          <p className="font-body text-brand-ink/70 mb-6 max-w-xl mx-auto">
            Contact us to discuss sponsorship opportunities and receive a full prospectus.
          </p>
          <a
            href="mailto:summit@collaborativejournalism.org?subject=CJS%202026%20Sponsorship%20Inquiry"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contact us about sponsoring
          </a>
        </motion.div>
      </div>
    </div>
      <Footer />
    </>
  )
}

export default Sponsors
