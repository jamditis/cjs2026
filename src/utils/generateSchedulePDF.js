import jsPDF from 'jspdf'

// Format ISO time string to readable format (e.g., "9:30 AM")
function formatTime(timeStr) {
  if (!timeStr) return null
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return null
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return null
  }
}

// Brand colors from Tailwind config
const COLORS = {
  teal: [42, 157, 143],       // #2A9D8F
  ink: [44, 62, 80],          // #2C3E50
  inkLight: [128, 128, 128],  // for secondary text
  cream: [253, 251, 247],     // #FDFBF7
  cardinal: [145, 50, 50],    // #913232
}

/**
 * Generate a PDF of the user's saved schedule
 * @param {Object} params
 * @param {Array} params.sessions - Array of session objects
 * @param {Object} params.userProfile - User profile for personalization
 * @returns {jsPDF} - The generated PDF document
 */
export function generateSchedulePDF({ sessions, userProfile }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Helper to check if we need a new page
  const checkNewPage = (neededHeight) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // ========================================
  // Header
  // ========================================
  doc.setFillColor(...COLORS.teal)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('My CJS2026 Schedule', margin, 22)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Collaborative Journalism Summit | June 8-9, 2026 | Pittsburgh, PA', margin, 32)

  yPos = 50

  // ========================================
  // User info (if available)
  // ========================================
  if (userProfile?.displayName) {
    doc.setTextColor(...COLORS.ink)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Prepared for: ${userProfile.displayName}`, margin, yPos)
    yPos += 8
  }

  // Generated date
  doc.setTextColor(...COLORS.inkLight)
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, margin, yPos)
  yPos += 12

  // ========================================
  // Sort and group sessions by day
  // ========================================
  const sortedSessions = [...sessions].sort((a, b) => {
    const dayOrder = { 'monday': 0, 'tuesday': 1 }
    const dayA = dayOrder[a.day?.toLowerCase()] ?? 2
    const dayB = dayOrder[b.day?.toLowerCase()] ?? 2
    if (dayA !== dayB) return dayA - dayB
    return (a.order || 0) - (b.order || 0)
  })

  const mondaySessions = sortedSessions.filter(s => s.day?.toLowerCase() === 'monday')
  const tuesdaySessions = sortedSessions.filter(s => s.day?.toLowerCase() === 'tuesday')

  // ========================================
  // Render day sections
  // ========================================
  const renderDayHeader = (dayName, date) => {
    checkNewPage(20)
    doc.setFillColor(...COLORS.teal)
    doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${dayName}, ${date}`, margin + 4, yPos + 7)
    yPos += 15
  }

  const renderSession = (session) => {
    // Estimate height needed for this session
    const titleLines = doc.splitTextToSize(session.title || 'Untitled Session', contentWidth - 45)
    const descLines = session.description
      ? doc.splitTextToSize(session.description, contentWidth - 8)
      : []
    const estimatedHeight = 20 + (titleLines.length * 5) + (descLines.length > 0 ? Math.min(descLines.length, 3) * 4 + 6 : 0)

    checkNewPage(estimatedHeight)

    // Session card background
    doc.setFillColor(250, 250, 250)
    doc.setDrawColor(220, 220, 220)
    doc.roundedRect(margin, yPos, contentWidth, estimatedHeight, 2, 2, 'FD')

    let cardY = yPos + 5

    // Time badge - format from startTime ISO string
    const timeDisplay = formatTime(session.startTime)
    if (timeDisplay) {
      doc.setFillColor(...COLORS.teal)
      const timeWidth = doc.getTextWidth(timeDisplay) + 6
      doc.roundedRect(margin + 4, cardY - 2, Math.max(timeWidth, 25), 7, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(timeDisplay, margin + 7, cardY + 3)
    }

    // Room (right side)
    if (session.room) {
      doc.setTextColor(...COLORS.inkLight)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const roomText = session.room
      const roomWidth = doc.getTextWidth(roomText)
      doc.text(roomText, margin + contentWidth - 4 - roomWidth, cardY + 3)
    }

    cardY += 10

    // Title
    doc.setTextColor(...COLORS.ink)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    titleLines.forEach((line, i) => {
      doc.text(line, margin + 4, cardY + (i * 5))
    })
    cardY += titleLines.length * 5 + 2

    // Speakers
    if (session.speakers) {
      doc.setTextColor(...COLORS.teal)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(session.speakers, margin + 4, cardY)
      cardY += 5
    }

    // Description (truncated to 3 lines)
    if (descLines.length > 0) {
      doc.setTextColor(...COLORS.inkLight)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const truncatedDesc = descLines.slice(0, 3)
      if (descLines.length > 3) {
        truncatedDesc[2] = truncatedDesc[2].substring(0, truncatedDesc[2].length - 3) + '...'
      }
      truncatedDesc.forEach((line, i) => {
        doc.text(line, margin + 4, cardY + (i * 4))
      })
    }

    yPos += estimatedHeight + 4
  }

  // Render Monday
  if (mondaySessions.length > 0) {
    renderDayHeader('Monday', 'June 8, 2026')
    mondaySessions.forEach(renderSession)
    yPos += 6
  }

  // Render Tuesday
  if (tuesdaySessions.length > 0) {
    renderDayHeader('Tuesday', 'June 9, 2026')
    tuesdaySessions.forEach(renderSession)
  }

  // ========================================
  // Footer on each page
  // ========================================
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Footer line
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

    // Footer text
    doc.setTextColor(...COLORS.inkLight)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('summit.collaborativejournalism.org', margin, pageHeight - 10)

    // Page number (right)
    const pageText = `Page ${i} of ${totalPages}`
    const pageWidth2 = doc.getTextWidth(pageText)
    doc.text(pageText, pageWidth - margin - pageWidth2, pageHeight - 10)
  }

  return doc
}

/**
 * Generate and download the PDF
 * @param {Object} params
 * @param {Array} params.sessions - Array of session objects
 * @param {Object} params.userProfile - User profile for personalization
 */
export function downloadSchedulePDF({ sessions, userProfile }) {
  const doc = generateSchedulePDF({ sessions, userProfile })
  const fileName = `CJS2026-MySchedule-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
