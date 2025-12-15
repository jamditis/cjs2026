import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { currentUser } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Schedule', path: '/schedule' },
    { name: 'Sponsors', path: '/sponsors' },
    { name: 'Code of conduct', path: '/code-of-conduct' },
    { name: 'Contact', path: '/contact' },
  ]

  const homeLinks = [
    { name: 'History', href: '#history' },
    { name: 'Partners', href: '#partners' },
  ]

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-paper/90 backdrop-blur-md shadow-sm border-b border-brand-ink/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/cjs-logo-iso.png" alt="CJS" className="h-8 md:h-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className={`font-heading font-bold text-xl ${scrolled ? 'text-brand-ink' : 'text-brand-ink'} transition-colors`}>
            CJS<span className="text-brand-teal">2026</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isHome && homeLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="font-body text-brand-ink/70 hover:text-brand-teal font-medium transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-teal transition-all group-hover:w-full opacity-50"></span>
            </a>
          ))}
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`font-body font-medium transition-colors relative group ${
                location.pathname === item.path
                  ? 'text-brand-teal'
                  : 'text-brand-ink/70 hover:text-brand-teal'
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-teal transition-all opacity-50 ${
                location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
          {currentUser ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 btn-primary py-2 px-5 text-sm"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 btn-primary py-2 px-5 text-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-brand-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper border-t border-brand-ink/10 px-6 py-4">
          <div className="flex flex-col gap-4">
            {isHome && homeLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-body text-brand-ink/70 hover:text-brand-teal font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-body font-medium py-2 ${
                  location.pathname === item.path
                    ? 'text-brand-teal'
                    : 'text-brand-ink/70 hover:text-brand-teal'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {currentUser ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 btn-primary py-2 px-5 text-sm w-full mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 btn-primary py-2 px-5 text-sm w-full mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
