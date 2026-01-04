import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Heart, Users, AlertTriangle, Mail, Phone } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CodeOfConductSEO } from '../components'

function CodeOfConduct() {
  return (
    <>
      <CodeOfConductSEO />
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
            Code of conduct
          </h1>
          <p className="font-body text-brand-ink/60 text-lg">
            Creating a welcoming, inclusive environment for all participants
          </p>
        </motion.div>

        {/* Quick summary */}
        <motion.div
          className="card-sketch p-8 mb-12 bg-brand-teal/5 border-brand-teal/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-xl text-brand-ink mb-2">The short version</h2>
              <p className="font-body text-brand-ink/70">
                The Collaborative Journalism Summit is dedicated to providing a harassment-free experience for everyone. We do not tolerate harassment of participants in any form. Be kind, be respectful, and assume good intent.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Full policy */}
        <div className="prose prose-lg max-w-none">
          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Our commitment</h2>
            <p className="font-body text-brand-ink/80 mb-4">
              The Collaborative Journalism Summit is committed to being a welcoming, safe, and inclusive event for all participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, body size, race, ethnicity, age, religion, nationality, or level of experience.
            </p>
            <p className="font-body text-brand-ink/80">
              We expect all attendees, speakers, sponsors, volunteers, and staff to help us create a positive experience for everyone.
            </p>
          </motion.section>

          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Expected behavior</h2>
            <div className="space-y-4">
              <div className="card-sketch p-5 flex items-start gap-4">
                <Heart className="w-5 h-5 text-brand-teal mt-1 flex-shrink-0" />
                <div>
                  <p className="font-heading font-semibold text-brand-ink">Be respectful and inclusive</p>
                  <p className="font-body text-sm text-brand-ink/70">Value each other's ideas, styles, and viewpoints. Be open to learning from others.</p>
                </div>
              </div>
              <div className="card-sketch p-5 flex items-start gap-4">
                <Users className="w-5 h-5 text-brand-teal mt-1 flex-shrink-0" />
                <div>
                  <p className="font-heading font-semibold text-brand-ink">Collaborate with kindness</p>
                  <p className="font-body text-sm text-brand-ink/70">Assume good intent. Offer and accept constructive feedback gracefully.</p>
                </div>
              </div>
              <div className="card-sketch p-5 flex items-start gap-4">
                <Shield className="w-5 h-5 text-brand-teal mt-1 flex-shrink-0" />
                <div>
                  <p className="font-heading font-semibold text-brand-ink">Create a safe space</p>
                  <p className="font-body text-sm text-brand-ink/70">Be mindful of your surroundings and fellow participants. Alert staff if you notice someone in distress.</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Unacceptable behavior</h2>
            <p className="font-body text-brand-ink/80 mb-4">
              Harassment and other exclusionary behavior are not acceptable. This includes, but is not limited to:
            </p>
            <ul className="space-y-2 font-body text-brand-ink/80">
              <li>• Offensive verbal comments related to gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, ethnicity, religion, or nationality</li>
              <li>• Deliberate intimidation, stalking, or following</li>
              <li>• Harassing photography or recording</li>
              <li>• Sustained disruption of talks or other events</li>
              <li>• Inappropriate physical contact</li>
              <li>• Unwelcome sexual attention</li>
              <li>• Advocating for, or encouraging, any of the above behavior</li>
            </ul>
          </motion.section>

          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Consequences</h2>
            <p className="font-body text-brand-ink/80">
              Participants asked to stop any harassing behavior are expected to comply immediately. If a participant engages in harassing behavior, the event organizers may take any action they deem appropriate, including warning the offender, expulsion from the event with no refund, or reporting to local law enforcement.
            </p>
          </motion.section>

          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Reporting</h2>
            <p className="font-body text-brand-ink/80 mb-6">
              If you are being harassed, notice that someone else is being harassed, or have any other concerns, please contact a member of the event staff immediately. Staff can be identified by their badges.
            </p>

            <div className="card-sketch p-6 bg-brand-cardinal/5 border-brand-cardinal/20">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-brand-cardinal flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-semibold text-brand-ink mb-2">Need to report an incident?</h3>
                  <p className="font-body text-sm text-brand-ink/70 mb-4">
                    You can reach the event organizers through any of these channels:
                  </p>
                  <div className="space-y-2">
                    <a href="mailto:summit@collaborativejournalism.org" className="flex items-center gap-2 font-body text-brand-cardinal hover:underline">
                      <Mail className="w-4 h-4" />
                      summit@collaborativejournalism.org
                    </a>
                    <p className="flex items-center gap-2 font-body text-brand-ink/70">
                      <Phone className="w-4 h-4" />
                      On-site contact number will be provided at registration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Photo and video policy</h2>
            <p className="font-body text-brand-ink/80 mb-4">
              By attending the Collaborative Journalism Summit, you consent to being photographed and/or recorded. These images may be used in promotional materials for the event and the hosting organizations.
            </p>
            <p className="font-body text-brand-ink/80">
              If you do not wish to be photographed, please let a staff member know, and we will do our best to accommodate your request. You may also wear a colored lanyard (available at registration) to indicate you prefer not to be photographed.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-semibold text-2xl text-brand-ink mb-4">Attribution</h2>
            <p className="font-body text-brand-ink/60 text-sm">
              This code of conduct is adapted from the <a href="https://confcodeofconduct.com/" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">Conference Code of Conduct</a>, which is licensed under a <a href="https://creativecommons.org/licenses/by/3.0/deed.en_US" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">Creative Commons Attribution 3.0 Unported License</a>.
            </p>
          </motion.section>
        </div>
      </div>
    </div>
      <Footer />
    </>
  )
}

export default CodeOfConduct
