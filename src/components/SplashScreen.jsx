import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SplashScreen - Animated loading screen with logo
 *
 * Shows on initial page load, then fades out to reveal content
 */
export function SplashScreen({
  duration = 2000, // Reduced duration slightly
  onComplete,
  children
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 500) // Exit animation duration
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-paper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-center">
              {/* Logo animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: isAnimating ? [0, 1.1, 1] : 1,
                  rotate: isAnimating ? [-180, 10, 0] : 0
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.7, 1]
                }}
              >
                <motion.img
                  src="/cjs-logo-iso.png"
                  alt="CJS"
                  className="w-24 h-24 md:w-32 md:h-32 logo-glow"
                  animate={isAnimating ? {
                    filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)']
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>

              {/* Text animation */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.h1
                  className="font-heading font-bold text-3xl text-brand-ink"
                  animate={isAnimating ? {
                    opacity: [1, 0.7, 1]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  CJS2026
                </motion.h1>
                <motion.p
                  className="text-brand-ink-muted text-lg mt-1 font-accent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  10th anniversary
                </motion.p>
              </motion.div>

              {/* Loading indicator */}
              <motion.div
                className="mt-8 flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-teal"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content - always rendered but hidden behind splash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  )
}

/**
 * SimpleSplash - Minimalist splash that just shows logo
 */
export function SimpleSplash({
  duration = 1500,
  onComplete,
  children
}) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <AnimatePresence mode="wait">
      {!showContent ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex items-center justify-center bg-paper"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.img
            src="/cjs-logo-iso.png"
            alt="CJS2026"
            className="w-20 h-20 logo-glow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SplashScreen
