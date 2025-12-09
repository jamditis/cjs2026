import React, { useRef, useEffect } from 'react'

/**
 * ParticlesBackground - Connected particles that represent collaboration
 * Inspired by React Bits Particles component
 *
 * Particles connect when near each other, symbolizing collaboration
 */
export function ParticlesBackground({
  particleCount = 50,
  particleColor = 'rgba(202, 53, 83, 0.6)',
  lineColor = 'rgba(202, 53, 83, 0.15)',
  particleSize = 2,
  connectionDistance = 150,
  speed = 0.5,
  className = ''
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = canvas.offsetWidth
    let height = canvas.offsetHeight

    // Set canvas size
    const setSize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    setSize()

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * particleSize + 1
        })
      }
    }
    initParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      const particles = particlesRef.current

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1

        // Keep in bounds
        particle.x = Math.max(0, Math.min(width, particle.x))
        particle.y = Math.max(0, Math.min(height, particle.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particleColor
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${opacity * 0.3})`)
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      setSize()
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, particleColor, lineColor, particleSize, connectionDistance, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.7 }}
    />
  )
}

/**
 * FloatingDots - Simpler floating dots animation
 */
export function FloatingDots({
  count = 20,
  color = 'rgba(202, 53, 83, 0.3)',
  className = ''
}) {
  const dots = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full animate-float"
          style={{
            width: dot.size,
            height: dot.size,
            backgroundColor: color,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animationDuration: `${dot.duration}s`,
            animationDelay: `${dot.delay}s`
          }}
        />
      ))}
    </div>
  )
}

export default ParticlesBackground
