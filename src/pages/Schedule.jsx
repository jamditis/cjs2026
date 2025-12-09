import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Coffee, Utensils, Users, Mic, Lightbulb, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Placeholder schedule data - will be updated as programming is finalized
const mondaySchedule = [
  { time: '8:00 AM', title: 'Registration & breakfast', type: 'break', icon: Coffee },
  { time: '9:00 AM', title: 'Welcome & opening remarks', type: 'session', icon: Mic, description: 'Setting the stage for our 10th anniversary summit' },
  { time: '9:30 AM', title: 'Keynote: A decade of collaboration', type: 'session', icon: Mic, description: 'Reflecting on 10 years of collaborative journalism' },
  { time: '10:30 AM', title: 'Coffee break', type: 'break', icon: Coffee },
  { time: '11:00 AM', title: 'Session 1: TBD', type: 'session', icon: Users },
  { time: '12:00 PM', title: 'Lunch', type: 'break', icon: Utensils },
  { time: '1:30 PM', title: 'Lightning talks (Round 1)', type: 'session', icon: Lightbulb, description: '4 community-pitched talks, 10 minutes each' },
  { time: '2:30 PM', title: 'Session 2: TBD', type: 'session', icon: Users },
  { time: '3:30 PM', title: 'Coffee break', type: 'break', icon: Coffee },
  { time: '4:00 PM', title: 'Lightning talks (Round 2)', type: 'session', icon: Lightbulb, description: '4 community-pitched talks, 10 minutes each' },
  { time: '5:00 PM', title: 'Session 3: TBD', type: 'session', icon: Users },
  { time: '6:00 PM', title: 'Reception & networking', type: 'break', icon: Users },
  { time: '7:00 PM', title: '10th anniversary dinner', type: 'special', icon: Utensils, description: 'Celebrating a decade of working together' },
]

const tuesdaySchedule = [
  { time: '8:00 AM', title: 'Breakfast', type: 'break', icon: Coffee },
  { time: '9:00 AM', title: 'Workshop Track 1: Collaborating 101', type: 'workshop', icon: BookOpen, description: 'For newcomers to collaborative journalism' },
  { time: '9:00 AM', title: 'Workshop Track 2: Advanced collaboration', type: 'workshop', icon: BookOpen, description: 'For experienced collaborators' },
  { time: '12:00 PM', title: 'Closing remarks & lunch', type: 'session', icon: Mic },
  { time: '1:00 PM', title: 'Summit concludes — INN Days begins', type: 'special', icon: MapPin, description: 'Attendees welcome to stay for INN Days (separate registration)' },
]

function ScheduleItem({ item, index }) {
  const bgColors = {
    session: 'bg-brand-teal/5 border-brand-teal/20',
    workshop: 'bg-brand-cardinal/5 border-brand-cardinal/20',
    break: 'bg-brand-cream border-brand-ink/10',
    special: 'bg-brand-green-dark/5 border-brand-green-dark/20',
  }

  const Icon = item.icon

  return (
    <motion.div
      className={`card-sketch p-5 ${bgColors[item.type]}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-20 text-right">
          <span className="font-body text-sm text-brand-ink/60">{item.time}</span>
        </div>
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            item.type === 'session' ? 'bg-brand-teal/10 text-brand-teal' :
            item.type === 'workshop' ? 'bg-brand-cardinal/10 text-brand-cardinal' :
            item.type === 'special' ? 'bg-brand-green-dark/10 text-brand-green-dark' :
            'bg-brand-ink/10 text-brand-ink/50'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-heading font-semibold text-brand-ink">{item.title}</h4>
          {item.description && (
            <p className="font-body text-sm text-brand-ink/60 mt-1">{item.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Schedule() {
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
            Schedule
          </h1>
          <p className="font-body text-brand-ink/60 text-lg max-w-2xl mx-auto">
            Two days of sessions, workshops, and networking. Programming details will be announced in spring 2026.
          </p>
        </motion.div>

        {/* Event info cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <motion.div
            className="card-sketch p-6 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <p className="font-heading font-semibold text-brand-ink">June 8–9, 2026</p>
              <p className="font-body text-sm text-brand-ink/60">Monday & Tuesday</p>
            </div>
          </motion.div>

          <motion.div
            className="card-sketch p-6 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <p className="font-heading font-semibold text-brand-ink">UNC Friday Center</p>
              <p className="font-body text-sm text-brand-ink/60">Chapel Hill, North Carolina</p>
            </div>
          </motion.div>
        </div>

        {/* Preliminary notice */}
        <motion.div
          className="bg-brand-cardinal/10 border-2 border-brand-cardinal/20 rounded-lg p-6 mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-accent text-xl text-brand-cardinal mb-2">Preliminary schedule</p>
          <p className="font-body text-brand-ink/70">
            Session topics and speakers will be announced in spring 2026. Sign up for updates to be the first to know.
          </p>
        </motion.div>

        {/* Monday */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
              <span className="font-accent text-xl text-white">1</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-brand-ink">Monday, June 8</h2>
              <p className="font-body text-brand-ink/60">Main summit day</p>
            </div>
          </div>

          <div className="space-y-3">
            {mondaySchedule.map((item, index) => (
              <ScheduleItem key={index} item={item} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Tuesday */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
              <span className="font-accent text-xl text-white">2</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-brand-ink">Tuesday, June 9</h2>
              <p className="font-body text-brand-ink/60">Workshop day</p>
            </div>
          </div>

          <div className="space-y-3">
            {tuesdaySchedule.map((item, index) => (
              <ScheduleItem key={index} item={item} index={index} />
            ))}
          </div>
        </motion.div>

        {/* INN Days note */}
        <motion.div
          className="mt-12 card-sketch p-8 text-center bg-brand-green-dark/5 border-brand-green-dark/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-heading font-semibold text-xl text-brand-green-dark mb-2">
            Co-located with INN Days
          </h3>
          <p className="font-body text-brand-ink/70 mb-4">
            INN Days runs June 9–11 at the same venue. Attend both events in one trip.
          </p>
          <a
            href="https://inn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-brand-green-dark hover:underline"
          >
            Learn more about INN Days →
          </a>
        </motion.div>
      </div>
    </div>
      <Footer />
    </>
  )
}

export default Schedule
