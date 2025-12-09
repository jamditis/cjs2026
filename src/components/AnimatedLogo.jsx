import React from 'react'
import { motion } from 'framer-motion'

/**
 * Animated CJS Logo
 *
 * The logo features 5 people (circles) connected around a center with triangles.
 * This component animates the logo with:
 * - Fade in and scale on mount
 * - Subtle continuous rotation
 * - Pulse effect on hover
 */
export function AnimatedLogo({
  size = 120,
  className = '',
  animate = true,
  showPulse = true
}) {
  const logoVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] // Custom easing
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      className={`relative ${className}`}
      initial={animate ? 'hidden' : 'visible'}
      animate="visible"
      whileHover={showPulse ? 'hover' : undefined}
      variants={logoVariants}
    >
      {/* Pulse ring effect */}
      {showPulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(202, 53, 83, 0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Logo image */}
      <motion.img
        src="/cjs-logo-iso.png"
        alt="Collaborative Journalism Summit"
        width={size}
        height={size}
        className="relative z-10"
        animate={animate ? {
          rotate: [0, 360],
        } : undefined}
        transition={{
          duration: 60, // Very slow rotation
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </motion.div>
  )
}

/**
 * Animated Logo with text underneath
 */
export function AnimatedLogoWithText({
  size = 120,
  showSubtitle = true,
  className = ''
}) {
  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <AnimatedLogo size={size} />

      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="font-montserrat font-bold text-2xl text-white">
          CJS 2026
        </h1>
        {showSubtitle && (
          <p className="text-white/70 text-sm mt-1">
            10th anniversary
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}

export default AnimatedLogo
