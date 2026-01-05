import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PrivacySEO } from '../components'

function PrivacyPolicy() {
  return (
    <>
      <PrivacySEO />
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              Privacy policy
            </h1>
            <p className="font-body text-brand-ink/50 mb-8">
              Last updated: January 2026
            </p>

            <div className="prose prose-ink max-w-none font-body text-brand-ink/80 space-y-6">

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Who we are
                </h2>
                <p>
                  The Collaborative Journalism Summit is organized by the Center for Cooperative Media
                  at Montclair State University in partnership with the Institute for Nonprofit News (INN).
                  This privacy policy explains how we collect, use, and protect your personal information
                  when you use this website.
                </p>
                <p className="mt-3">
                  <strong>Contact:</strong> summit@collaborativejournalism.org
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  What information we collect
                </h2>
                <p>When you sign in or register for the summit, we collect:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>Email address</strong> — Required for account authentication</li>
                  <li><strong>Name</strong> — To identify you as an attendee</li>
                  <li><strong>Organization</strong> — Optional, for networking purposes</li>
                </ul>
                <p className="mt-3">
                  We may also collect basic analytics data about how you use the site (pages visited,
                  time on site) through Firebase Analytics.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  How we use your information
                </h2>
                <p>We use your information to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Authenticate your account and enable sign-in</li>
                  <li>Process your summit registration</li>
                  <li>Send you transactional emails about your registration (confirmations, updates, schedule changes)</li>
                  <li>Create attendee lists for networking purposes during the event</li>
                  <li>Improve the website and event experience</li>
                </ul>
                <p className="mt-3">
                  <strong>Newsletter communications:</strong> If you explicitly opt in to receive our newsletter,
                  we will add you to our mailing list. You can unsubscribe at any time using the link in any email.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Third-party services
                </h2>
                <p>We use the following services to operate this website:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>Firebase (Google)</strong> — Authentication, database, hosting, and analytics</li>
                  <li><strong>Airtable</strong> — Data management and event coordination</li>
                </ul>
                <p className="mt-3">
                  These services have their own privacy policies governing how they handle data.
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Data retention
                </h2>
                <p>
                  We retain your account information as long as your account is active or as needed
                  to provide you services. Registration data from past summits may be retained for
                  historical and planning purposes. You can request deletion of your data at any time.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Your rights
                </h2>
                <p>You have the right to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>Access</strong> — Request a copy of the personal data we hold about you</li>
                  <li><strong>Correction</strong> — Update or correct your information through your dashboard</li>
                  <li><strong>Deletion</strong> — Request that we delete your account and associated data</li>
                  <li><strong>Opt-out</strong> — Unsubscribe from marketing emails at any time</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, contact us at summit@collaborativejournalism.org.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Security
                </h2>
                <p>
                  We use industry-standard security measures to protect your data, including encrypted
                  connections (HTTPS), secure authentication through Firebase, and access controls on
                  our databases. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Changes to this policy
                </h2>
                <p>
                  We may update this privacy policy from time to time. We will notify registered users
                  of significant changes via email. The "last updated" date at the top of this page
                  indicates when the policy was last revised.
                </p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-xl text-brand-ink mt-8 mb-4">
                  Contact us
                </h2>
                <p>
                  If you have questions about this privacy policy or how we handle your data, contact us at:
                </p>
                <p className="mt-3">
                  <strong>Email:</strong> summit@collaborativejournalism.org<br />
                  <strong>Organization:</strong> Center for Cooperative Media, Montclair State University
                </p>
              </section>

            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PrivacyPolicy
