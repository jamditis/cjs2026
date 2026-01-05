import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Sparkles,
  MousePointer,
  Layers,
  ArrowUpDown,
  Plus,
  Eye,
  Upload,
  CheckCircle
} from 'lucide-react'

// Tour step definitions - only steps that are always visible on the CMS landing page
// More detailed feature discovery happens through tooltips and contextual help
const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to the CMS',
    description: 'This guided tour will walk you through the content management system. You can edit and publish content for the CJS2026 website.',
    icon: Sparkles,
    target: null,
    position: 'center'
  },
  {
    id: 'page-selector',
    title: 'Select a page to edit',
    description: 'Choose which page you want to manage. Each card shows the page name and how many content items it contains. Click a card to start editing.',
    icon: MousePointer,
    target: '[data-tour="page-grid"]',
    position: 'bottom'
  },
  {
    id: 'tabs',
    title: 'Content types',
    description: 'Use these tabs to switch between different content types: site content, schedule sessions, organizations, timeline events, version history, and publishing.',
    icon: Layers,
    target: '[data-tour="cms-tabs"]',
    position: 'bottom'
  },
  {
    id: 'publish',
    title: 'Publish your changes',
    description: 'After editing, go to the "Publish" tab to deploy your changes to the live website. Changes take about 60 seconds to appear.',
    icon: Upload,
    target: '[data-tour="publish-tab"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: 'You\'re ready to go!',
    description: 'Click any page card to start editing. You\'ll find reorder arrows, edit buttons, and add buttons inside each page. Hover over elements for more tips.',
    icon: CheckCircle,
    target: null,
    position: 'center'
  }
]

// Storage key for tour state
const TOUR_STORAGE_KEY = 'cjs2026_cms_tour_completed'
const TOUR_DISMISSED_KEY = 'cjs2026_cms_tour_dismissed'

/**
 * CMSTour - Interactive guided walkthrough for first-time CMS users
 *
 * Features:
 * - Step-by-step tour with highlights
 * - Skip/dismiss options
 * - "Never show again" persistence
 * - Spotlight effect on target elements
 */
export default function CMSTour({ onComplete }) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const overlayRef = useRef(null)

  // Check if tour should be shown
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY)
    const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY)

    if (!completed && !dismissed) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Update target element position when step changes
  useEffect(() => {
    if (!isVisible) return

    const step = TOUR_STEPS[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        })
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep, isVisible])

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setIsVisible(false)
    onComplete?.()
  }, [onComplete])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
  }, [])

  const handleNeverShow = useCallback(() => {
    localStorage.setItem(TOUR_DISMISSED_KEY, 'true')
    setIsVisible(false)
  }, [])

  // Reset tour (for testing)
  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    localStorage.removeItem(TOUR_DISMISSED_KEY)
    setCurrentStep(0)
    setIsVisible(true)
  }, [])

  // Expose reset function globally for debugging
  useEffect(() => {
    window.__resetCMSTour = resetTour
  }, [resetTour])

  if (!isVisible) return null

  const step = TOUR_STEPS[currentStep]
  const StepIcon = step.icon
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TOUR_STEPS.length - 1
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  // Calculate tooltip position with viewport boundary checking
  const getTooltipStyle = () => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    const padding = 16
    const tooltipWidth = 360
    const tooltipHeight = 280 // Approximate height of tooltip
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Helper to clamp a value within viewport bounds
    const clampLeft = (left) => Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding))
    const clampTop = (top) => Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding))

    // Calculate preferred position based on step.position
    let preferredTop, preferredLeft

    switch (step.position) {
      case 'bottom':
        preferredTop = targetRect.top + targetRect.height + padding
        preferredLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        break
      case 'top':
        preferredTop = targetRect.top - tooltipHeight - padding
        preferredLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        break
      case 'left':
        preferredTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
        preferredLeft = targetRect.left - tooltipWidth - padding
        break
      case 'right':
        preferredTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
        preferredLeft = targetRect.left + targetRect.width + padding
        break
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }

    // If preferred position is off-screen, fall back to center-right of viewport
    // This ensures the tooltip is always visible
    if (preferredTop < padding || preferredTop > viewportHeight - tooltipHeight - padding) {
      // Tooltip would be off-screen vertically - position it in a visible area
      return {
        position: 'fixed',
        top: clampTop(Math.max(targetRect.top, padding)),
        right: padding,
        maxHeight: viewportHeight - padding * 2
      }
    }

    return {
      position: 'fixed',
      top: clampTop(preferredTop),
      left: clampLeft(preferredLeft)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlight border around target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-2 border-admin-teal rounded-lg shadow-lg shadow-admin-teal/30"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              pointerEvents: 'none'
            }}
          >
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 rounded-lg animate-pulse bg-admin-teal/10" />
          </motion.div>
        )}

        {/* Tooltip card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-[360px] admin-surface p-5 rounded-2xl shadow-2xl border border-admin-teal/30"
          style={getTooltipStyle()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-admin-teal/20 flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-admin-teal" />
              </div>
              <div>
                <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
                  {step.title}
                </h3>
                <span className="text-xs text-[var(--admin-text-muted)] font-admin-body">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
              title="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[var(--admin-glass-bg)] rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-admin-teal rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Description */}
          <p className="font-admin-body text-sm text-[var(--admin-text-secondary)] mb-5 leading-relaxed">
            {step.description}
          </p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg admin-glass text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-colors font-admin-body text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {isFirstStep && (
                <button
                  onClick={handleNeverShow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-rose-400 transition-colors font-admin-body text-xs"
                >
                  <SkipForward className="w-3 h-3" />
                  Don't show again
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-admin-teal text-white hover:bg-admin-teal/80 transition-colors font-admin-body text-sm font-medium"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Finish tour
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip link on non-final steps */}
          {!isLastStep && !isFirstStep && (
            <button
              onClick={handleComplete}
              className="w-full mt-3 text-center text-xs text-[var(--admin-text-muted)] hover:text-admin-teal transition-colors font-admin-body"
            >
              Skip tour
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * TourTrigger - Button to restart the tour
 */
export function TourTrigger({ className = '' }) {
  const handleClick = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    localStorage.removeItem(TOUR_DISMISSED_KEY)
    window.location.reload()
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg admin-glass text-[var(--admin-text-muted)] hover:text-admin-teal hover:bg-[var(--admin-surface-hover)] transition-colors font-admin-body text-sm ${className}`}
      title="Take a guided tour of the CMS"
    >
      <Sparkles className="w-4 h-4" />
      Take tour
    </button>
  )
}

/**
 * Tooltip - Contextual help tooltips for CMS elements
 */
export function CMSTooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 500)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-admin-body max-w-xs whitespace-normal shadow-lg ${positionClasses[position]}`}
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
                'right-full top-1/2 -translate-y-1/2 -mr-1'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
