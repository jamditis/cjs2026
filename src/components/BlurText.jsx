import React from 'react'
import { motion } from 'framer-motion'

/**
 * BlurText - Text that animates in with a blur effect
 * Inspired by React Bits BlurText component
 */
export function BlurText({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  blur = 10,
  animateByWord = false,
  staggerDelay = 0.05
}) {
  // Split text into words or characters
  const elements = animateByWord ? text.split(' ') : text.split('')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      filter: `blur(${blur}px)`,
      y: 10
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: duration,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {elements.map((element, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className="inline-block"
          style={{ whiteSpace: animateByWord ? 'pre' : 'normal' }}
        >
          {element}
          {animateByWord && index < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  )
}

/**
 * SplitText - Text that splits and animates in character by character
 */
export function SplitText({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  direction = 'up' // 'up', 'down', 'left', 'right'
}) {
  const chars = text.split('')

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 20, opacity: 0 }
      case 'down': return { y: -20, opacity: 0 }
      case 'left': return { x: 20, opacity: 0 }
      case 'right': return { x: -20, opacity: 0 }
      default: return { y: 20, opacity: 0 }
    }
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  }

  const charVariants = {
    hidden: getInitialPosition(),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

/**
 * GradientText - Text with animated gradient
 */
export function GradientText({
  text,
  className = '',
  colors = ['#CA3553', '#ff6b6b', '#CA3553'],
  animationDuration = 3
}) {
  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '200% auto'
      }}
      animate={{
        backgroundPosition: ['0% center', '200% center']
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {text}
    </motion.span>
  )
}

export default BlurText
