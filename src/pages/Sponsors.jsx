import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plane, Calendar, Mic, UtensilsCrossed, Gift, ShieldCheck, Cookie, Tag, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { sponsors, hasSponsors, sponsorsByTier, tierDisplayNames } from '../content/organizationsData'

// Main sponsorship packages with explicit Tailwind classes
// (dynamic classes like `bg-${color}` don't work with Tailwind's JIT compiler)
const sponsorshipPackages = [
  {
    name: 'Presenting sponsor',
    price: '$10,000',
    icon: Sparkles,
    textClass: 'text-brand-cardinal',
    bgClass: 'bg-brand-cardinal',
    bgLightClass: 'bg-brand-cardinal/10',
    bgAccentClass: 'bg-brand-cardinal/5',
    borderClass: 'border-brand-cardinal/30',
    benefits: [
      'Full-page ad in program',
      '8 conference tickets',
      'Logo on website',
      'Logo on registration page',
      'Ad in email to attendees',
      'Items on swag table',
      'Sponsored session',
      '10 min. speaking opportunity',
    ],
    available: 1,
  },
  {
    name: 'Travel scholarships',
    price: '$10,000',
    icon: Plane,
    textClass: 'text-brand-teal',
    bgClass: 'bg-brand-teal',
    bgLightClass: 'bg-brand-teal/10',
    bgAccentClass: 'bg-brand-teal/5',
    borderClass: 'border-brand-teal/30',
    benefits: [
      'Full-page ad in program',
      '8 conference tickets',
      'Logo on website',
      'Logo on registration page',
      'Ad in email to attendees',
      'Items on swag table',
    ],
    available: 1,
  },
  {
    name: 'Day 1 or 2 sponsor',
    price: '$7,500',
    icon: Calendar,
    textClass: 'text-brand-green-dark',
    bgClass: 'bg-brand-green-dark',
    bgLightClass: 'bg-brand-green-dark/10',
    bgAccentClass: 'bg-brand-green-dark/5',
    borderClass: 'border-brand-green-dark/30',
    benefits: [
      'Half-page ad in program',
      '4 conference tickets',
      'Logo on website',
      'Logo on registration page',
      'Ad in email to attendees',
      'Items on swag table',
      '5 min. speaking opportunity',
    ],
    available: 2,
  },
  {
    name: 'Sponsored session',
    price: '$5,000',
    icon: Mic,
    textClass: 'text-brand-gold',
    bgClass: 'bg-brand-gold',
    bgLightClass: 'bg-brand-gold/10',
    bgAccentClass: 'bg-brand-gold/5',
    borderClass: 'border-brand-gold/30',
    benefits: [
      'Half-page ad in program',
      '2 conference tickets',
      'Logo on website',
      'Logo on registration page',
      'Ad in email to attendees',
      'Items on swag table',
      'Sponsored session*',
    ],
    available: 'Multiple',
    note: '*Sessions must be mutually agreed upon and may take place before or after a day\'s programming.',
  },
]

// Additional sponsorship opportunities
const additionalOpportunities = [
  {
    name: 'Dinner and recognition event',
    price: '$8,000',
    icon: UtensilsCrossed,
    description: 'Underwrite our Monday dinner with keynote speaker and recognition for top collaborations. Includes a speaking slot if desired.',
  },
  {
    name: 'North Carolina welcome gift',
    price: '$5,000',
    icon: Gift,
    description: 'Welcome participants with NC BBQ sauce and locally-handcrafted wooden utensils. Your name included on the gift bags!',
  },
  {
    name: 'Mini safety kits',
    price: '$3,000',
    icon: ShieldCheck,
    description: 'Your logo on an item in a mini-safety kit we\'ll provide to journalists on site.',
  },
  {
    name: 'Sweet treats',
    price: '$1,500',
    icon: Cookie,
    description: 'Provide a sweet treat for attendees — locally-made candy, cookies, or cupcakes!',
  },
  {
    name: 'Lanyards',
    price: '$1,500',
    icon: Tag,
    description: 'Your organization\'s logo and branding on all Summit lanyards and name badges.',
  },
]

// Sponsors are now pulled from Airtable via organizationsData.js

function SponsorPackageCard({ pkg, index }) {
  const Icon = pkg.icon

  return (
    <motion.div
      className={`card-sketch p-6 border-2 ${pkg.borderClass} ${pkg.bgAccentClass}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${pkg.bgLightClass} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${pkg.textClass}`} />
        </div>
        <span className={`font-accent text-2xl ${pkg.textClass}`}>{pkg.price}</span>
      </div>

      <h3 className="font-heading font-bold text-xl text-brand-ink mb-4">{pkg.name}</h3>

      <ul className="space-y-2 mb-4">
        {pkg.benefits.map((benefit, i) => (
          <li key={i} className="font-body text-sm text-brand-ink/70 flex items-start gap-2">
            <span className={`${pkg.textClass} mt-1`}>•</span>
            {benefit}
          </li>
        ))}
      </ul>

      {pkg.note && (
        <p className="font-body text-xs text-brand-ink/50 italic mb-4">{pkg.note}</p>
      )}

      <div className="pt-4 border-t border-brand-ink/10">
        <p className="font-body text-xs text-brand-ink/50">
          {typeof pkg.available === 'number'
            ? `${pkg.available} available`
            : pkg.available}
        </p>
      </div>
    </motion.div>
  )
}

function Sponsors() {
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
        {hasSponsors() ? (
          <section className="mb-16">
            <h2 className="font-heading font-semibold text-2xl text-brand-ink text-center mb-8">
              Thank you to our sponsors
            </h2>
            {/* Sponsor logos grouped by tier */}
            {Object.entries(sponsorsByTier).map(([tier, tierSponsors]) => (
              <motion.div
                key={tier}
                className="mb-10 last:mb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Tier label */}
                <p className="text-brand-ink/50 text-sm uppercase tracking-wider mb-4 text-center font-body">
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
                        className="h-20 md:h-24 max-w-[220px] object-contain"
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

        {/* Main sponsorship packages */}
        <section className="mb-16">
          <h2 className="font-heading font-semibold text-2xl text-brand-ink text-center mb-8">
            Sponsorship packages
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {sponsorshipPackages.map((pkg, index) => (
              <SponsorPackageCard key={pkg.name} pkg={pkg} index={index} />
            ))}
          </div>
        </section>

        {/* Additional sponsorship opportunities */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading font-semibold text-2xl text-brand-ink text-center mb-8">
            Additional sponsorship opportunities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalOpportunities.map((opp, index) => {
              const Icon = opp.icon
              return (
                <motion.div
                  key={opp.name}
                  className="card-sketch p-5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-brand-ink">{opp.name}</h3>
                      <span className="font-accent text-lg text-brand-teal">{opp.price}</span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-brand-ink/70">{opp.description}</p>
                </motion.div>
              )
            })}
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
