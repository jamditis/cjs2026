import React from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import EmailSignup from './EmailSignup'

function Footer() {
  return (
    <footer id="updates" className="py-16 px-6 bg-parchment">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-10">
          <h3 className="font-heading font-semibold text-2xl text-brand-ink mb-2">Join us in Pittsburgh</h3>
          <p className="text-brand-ink/60 mb-6 font-body">Secure your spot at the 10th anniversary summit.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <EmailSignup />
            <a
              href="https://collaborativejournalism.us5.list-manage.com/subscribe?u=7f46611cb324e9e193acda7cc&id=2e8bb60c9c"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-brand-ink/20 text-brand-ink/70 hover:border-brand-teal hover:text-brand-teal transition-colors font-body text-sm"
            >
              <Mail className="w-4 h-4" />
              Get newsletter updates
            </a>
          </div>
        </div>

        <div className="border-t-2 border-brand-ink/10 pt-10">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-brand-ink/50 font-body mb-6">
            <Link to="/schedule" className="hover:text-brand-teal transition-colors">Schedule</Link>
            <span className="text-brand-ink/20">•</span>
            <Link to="/sponsors" className="hover:text-brand-teal transition-colors">Sponsors</Link>
            <span className="text-brand-ink/20">•</span>
            <Link to="/code-of-conduct" className="hover:text-brand-teal transition-colors">Code of conduct</Link>
            <span className="text-brand-ink/20">•</span>
            <Link to="/contact" className="hover:text-brand-teal transition-colors">Contact</Link>
          </div>

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
            <a href="https://bsky.app/profile/centercoopmedia.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
              Bluesky
            </a>
            <span className="hidden md:inline text-brand-ink/20">•</span>
            <a href="https://twitter.com/CenterCoopMedia" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">
              X/Twitter
            </a>
          </div>
          <p className="text-brand-ink/30 text-xs mt-8 font-body">
            © 2026 Center for Cooperative Media at Montclair State University
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
