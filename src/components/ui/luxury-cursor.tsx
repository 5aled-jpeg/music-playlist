import React, { useEffect, useState } from 'react'

export const LuxuryCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let rafId: number
    let targetX = -100
    let targetY = -100
    let currentX = -100
    let currentY = -100

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      setPos({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)

      const target = e.target as HTMLElement | null
      if (target?.closest('button, a, input, [role="button"], .cursor-pointer')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    const animate = () => {
      currentX += (targetX - currentX) * 0.18
      currentY += (targetY - currentY) * 0.18
      setTrail({ x: currentX, y: currentY })
      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer trailing ring */}
      <div
        className={`absolute rounded-full border border-white/30 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovering ? 'w-10 h-10 scale-125 border-white/60 bg-white/5' : 'w-7 h-7 scale-100'
        }`}
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
        }}
      />
      {/* Core pinpoint dot */}
      <div
        className="absolute w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      />
    </div>
  )
}
