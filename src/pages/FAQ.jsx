import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail, Calendar, MapPin, Ticket, Users, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// FAQ data organized by category
const FAQ_DATA = [
  {
    category: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: 'What is the Collaborative Journalism Summit?',
        a: 'The Collaborative Journalism Summit is an annual gathering of journalists, editors, funders, and media leaders who are working together to strengthen journalism. Since 2017, the summit has brought together practitioners to share best practices, build partnerships, and advance the field of collaborative journalism.'
      },
      {
        q: 'Who should attend?',
        a: 'The summit is designed for journalists, editors, newsroom leaders, funders, academics, and anyone interested in collaborative journalism. Whether you\'re new to collaboration or have years of experience, you\'ll find valuable sessions and networking opportunities.'
      },
      {
        q: 'What is the history of the summit?',
        a: 'The Collaborative Journalism Summit began in 2017 at Montclair State University in New Jersey. Since then, it has traveled to Philadelphia (2019), went virtual during the pandemic (2020-2021), and has been hosted in Chicago (2022), Washington D.C. (2023), Detroit (2024), and Denver (2025). CJS2026 in Pittsburgh marks our 10th anniversary.'
      }
    ]
  },
  {
    category: 'Registration',
    icon: Ticket,
    questions: [
      {
        q: 'How do I register for CJS2026?',
        a: 'Registration is available through Eventbrite. Click the "Get tickets" button on our homepage or visit our Eventbrite page directly. Early bird pricing is available for a limited time.'
      },
      {
        q: 'What does registration include?',
        a: 'Your registration includes access to all summit sessions on both days, meals during the event (breakfast, lunch, and the Monday evening dinner), networking opportunities, and access to all summit materials. Hotel accommodations are not included.'
      },
      {
        q: 'Is there a refund policy?',
        a: 'Yes, full refunds are available up to 30 days before the event. Partial refunds (50%) are available up to 14 days before the event. No refunds are available within 14 days of the summit. Contact us for special circumstances.'
      },
      {
        q: 'Are there scholarships or discounted rates available?',
        a: 'Yes! We offer a limited number of scholarships for journalists from under-resourced newsrooms. Nonprofit news organizations may also be eligible for discounted rates. Contact summit@collaborativejournalism.org for more information.'
      }
    ]
  },
  {
    category: 'Event details',
    icon: Calendar,
    questions: [
      {
        q: 'When is CJS2026?',
        a: 'The 2026 Collaborative Journalism Summit takes place Monday, June 8 and Tuesday, June 9, 2026. Monday features a full day of sessions and an evening dinner. Tuesday morning includes hands-on workshops.'
      },
      {
        q: 'What is the schedule like?',
        a: 'Monday begins with breakfast and registration at 8:00 AM, followed by a full day of keynotes and sessions. An evening dinner and networking event runs until about 9:00 PM. Tuesday features morning workshop tracks from 8:30 AM to 12:00 PM.'
      },
      {
        q: 'Can I attend just one day?',
        a: 'We encourage attending both days for the full experience, but single-day passes may be available. Check our registration page for current options or contact us with questions.'
      }
    ]
  },
  {
    category: 'Venue & travel',
    icon: MapPin,
    questions: [
      {
        q: 'Where is CJS2026 being held?',
        a: 'CJS2026 will be held in Pittsburgh, Pennsylvania. The specific venue will be announced in early 2026. We\'re excited to bring the summit to Pittsburgh for our 10th anniversary!'
      },
      {
        q: 'What about hotels?',
        a: 'We will announce a room block at a nearby hotel once the venue is confirmed. Information about hotel options and any negotiated rates will be shared via email and on our website.'
      },
      {
        q: 'Is the venue accessible?',
        a: 'Yes, we are committed to hosting an accessible event. The venue will be fully ADA compliant. Please contact us if you have specific accessibility needs so we can ensure your full participation.'
      },
      {
        q: 'What is the relationship with INN Days?',
        a: 'CJS2026 is co-located with INN Days, the annual conference of the Institute for Nonprofit News. INN Days typically takes place the days before CJS, making it convenient to attend both events. Separate registration is required for each event.'
      }
    ]
  },
  {
    category: 'Sessions & content',
    icon: Users,
    questions: [
      {
        q: 'How are sessions selected?',
        a: 'Sessions are a mix of curated content from invited speakers and community-pitched lightning talks. Our program committee reviews all submissions and selects sessions that reflect current trends, practical skills, and diverse perspectives in collaborative journalism.'
      },
      {
        q: 'Can I pitch a session?',
        a: 'Yes! We accept session pitches from the community. Lightning talk submissions are typically due by January 31, 2026. Watch our announcements for the call for proposals.'
      },
      {
        q: 'Will sessions be recorded?',
        a: 'Select sessions may be recorded and shared after the event. We\'ll communicate which sessions will be available and share links with registered attendees.'
      },
      {
        q: 'What are the workshop tracks on Tuesday?',
        a: 'Tuesday features two parallel tracks: "Collaborating 101" for those new to collaborative journalism, and "Advanced Collaboration" for experienced practitioners. Both tracks offer hands-on learning and skill building.'
      }
    ]
  }
]

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-brand-ink/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-4 text-left group"
      >
        <span className="font-heading font-semibold text-lg text-brand-ink group-hover:text-brand-teal transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-brand-ink/40 group-hover:text-brand-teal transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-body text-brand-ink/70 pb-5 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FAQCategory({ category, icon: Icon, questions }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <motion.div
      className="card-sketch p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-teal" />
        </div>
        <h2 className="font-heading font-semibold text-xl text-brand-ink">{category}</h2>
      </div>
      <div>
        {questions.map((item, index) => (
          <FAQItem
            key={index}
            question={item.q}
            answer={item.a}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </motion.div>
  )
}

function FAQ() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="editorial-headline text-4xl md:text-5xl text-brand-ink mb-4">
              Frequently asked questions
            </h1>
            <p className="font-body text-brand-ink/60 text-lg max-w-2xl mx-auto">
              Everything you need to know about CJS2026. Can't find what you're looking for?{' '}
              <Link to="/contact" className="text-brand-teal hover:underline">Contact us</Link>.
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {FAQ_DATA.map((category, index) => (
              <FAQCategory
                key={index}
                category={category.category}
                icon={category.icon}
                questions={category.questions}
              />
            ))}
          </div>

          {/* Still have questions? */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="card-sketch p-8 bg-brand-teal/5 border-brand-teal/20">
              <h3 className="font-heading font-semibold text-xl text-brand-ink mb-3">
                Still have questions?
              </h3>
              <p className="font-body text-brand-ink/60 mb-6">
                We're here to help! Reach out and we'll get back to you as soon as possible.
              </p>
              <a
                href="mailto:summit@collaborativejournalism.org"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email us
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default FAQ
