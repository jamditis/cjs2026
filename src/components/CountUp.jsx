import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * CountUp - Animated number counter
 * Inspired by React Bits CountUp component
 */
export function CountUp({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
  separator = ',',
  triggerOnView = true
}) {
  const [count, setCount] = useState(start)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (triggerOnView && !isInView) return
    if (hasAnimated.current) return

    hasAnimated.current = true

    const startTime = Date.now() + delay * 1000
    const endTime = startTime + duration * 1000

    const animate = () => {
      const now = Date.now()

      if (now < startTime) {
        requestAnimationFrame(animate)
        return
      }

      if (now >= endTime) {
        setCount(end)
        return
      }

      const progress = (now - startTime) / (duration * 1000)
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = start + (end - start) * easedProgress

      setCount(currentValue)
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, end, start, duration, delay, triggerOnView])

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals)
    if (!separator) return fixed

    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join('.')
  }

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {prefix}
      {formatNumber(count)}
      {suffix}
    </motion.span>
  )
}

/**
 * StatCard - Card with animated count
 */
export function StatCard({
  value,
  label,
  prefix = '',
  suffix = '',
  className = '',
  delay = 0
}) {
  return (
    <motion.div
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="font-montserrat font-bold text-4xl md:text-5xl text-brand-red">
        <CountUp
          end={typeof value === 'number' ? value : parseInt(value) || 0}
          prefix={prefix}
          suffix={suffix}
          duration={2}
          delay={delay + 0.2}
        />
      </p>
      <p className="text-white/70 text-sm mt-1">{label}</p>
    </motion.div>
  )
}

export default CountUp
