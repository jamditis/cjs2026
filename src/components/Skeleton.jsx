import React from 'react'

/**
 * Skeleton loading placeholder component
 * Uses CSS animation for a shimmer effect
 */

// Base skeleton with shimmer animation
function Skeleton({ className = '', variant = 'text', width, height, rounded = false }) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-brand-ink/5 via-brand-ink/10 to-brand-ink/5 bg-[length:200%_100%]'

  const variantClasses = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    avatar: 'rounded-full',
    card: 'rounded-xl',
    button: 'h-10 rounded-lg',
    badge: 'h-6 rounded-full',
  }

  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${rounded ? 'rounded-full' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// Pre-built skeleton patterns for common use cases

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card-sketch p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton variant="avatar" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="55%" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonSession({ className = '' }) {
  return (
    <div className={`card-sketch p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton variant="badge" width={80} className="mb-2" />
          <Skeleton variant="title" width="85%" className="mb-2" />
          <Skeleton variant="text" width="60%" />
        </div>
        <Skeleton variant="button" width={40} height={40} className="rounded-full" />
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={80} />
      </div>
    </div>
  )
}

export function SkeletonSchedule({ sessions = 4, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Day header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="badge" width={120} height={32} />
        <Skeleton variant="text" width={200} />
      </div>

      {/* Session cards */}
      {Array.from({ length: sessions }).map((_, i) => (
        <SkeletonSession key={i} />
      ))}
    </div>
  )
}

export function SkeletonProfile({ className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <Skeleton variant="avatar" width={120} height={120} className="mx-auto mb-4" />
      <Skeleton variant="title" width="60%" className="mx-auto mb-2" />
      <Skeleton variant="text" width="40%" className="mx-auto mb-4" />
      <div className="flex justify-center gap-2">
        <Skeleton variant="badge" width={80} />
        <Skeleton variant="badge" width={100} />
        <Skeleton variant="badge" width={70} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-brand-ink/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              className="flex-1"
              width={colIndex === 0 ? '80%' : '60%'}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonSponsors({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-sketch p-6 flex flex-col items-center">
          <Skeleton width={120} height={60} className="mb-4" />
          <Skeleton variant="text" width="70%" className="mb-2" />
          <Skeleton variant="text" width="50%" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
