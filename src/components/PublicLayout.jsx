import React from 'react'
import AnnouncementBanner from './AnnouncementBanner'

/**
 * PublicLayout - Wrapper for public-facing pages
 *
 * Includes:
 * - AnnouncementBanner (site-wide alerts from admin panel)
 *
 * Used for: Home, Schedule, Sponsors, Code of Conduct, Contact
 * NOT used for: Dashboard, Admin, Login (protected or auth pages)
 */
export default function PublicLayout({ children }) {
  return (
    <>
      <AnnouncementBanner />
      {children}
    </>
  )
}
