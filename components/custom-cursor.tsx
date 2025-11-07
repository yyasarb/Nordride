'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { gsap } from 'gsap'

export function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const { theme, systemTheme } = useTheme()
  const outerRingRef = useRef<HTMLDivElement>(null)
  const innerDotRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)

  // Get active theme
  const activeTheme = theme === 'system' ? systemTheme : theme

  // Theme-aware colors
  const cursorColor = activeTheme === 'dark' ? '#E76F51' : '#5F7161' // Terracotta in dark, Deep Sage in light

  useEffect(() => {
    setMounted(true)

    // Check if mobile/touch device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      setIsMobile(mobile)
    }

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      mediaQuery.addEventListener('change', (e) => {
        setPrefersReducedMotion(e.matches)
      })
    }

    checkMobile()
    checkReducedMotion()
  }, [])

  useEffect(() => {
    if (!mounted || isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }

      // Reset inactivity timer
      setIsVisible(true)
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
      }

      inactivityTimer.current = setTimeout(() => {
        setIsVisible(false)
      }, 5000)

      // Check if hovering over input fields
      const target = e.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.isContentEditable

      if (isInputField) {
        if (outerRingRef.current && innerDotRef.current) {
          outerRingRef.current.style.opacity = '0'
          innerDotRef.current.style.opacity = '0'
        }
      } else {
        if (outerRingRef.current && innerDotRef.current) {
          outerRingRef.current.style.opacity = isVisible ? '1' : '0'
          innerDotRef.current.style.opacity = isVisible ? '1' : '0'
        }
      }
    }

    const animateCursor = () => {
      // Inner dot moves instantly
      if (innerDotRef.current) {
        gsap.set(innerDotRef.current, {
          x: mousePos.current.x,
          y: mousePos.current.y,
          xPercent: -50,
          yPercent: -50,
        })
      }

      // Outer ring trails behind with lerp
      if (!prefersReducedMotion) {
        const ease = 0.15
        ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease
        ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease

        if (outerRingRef.current) {
          gsap.set(outerRingRef.current, {
            x: ringPos.current.x,
            y: ringPos.current.y,
            xPercent: -50,
            yPercent: -50,
          })
        }
      } else {
        // Reduced motion: move instantly
        ringPos.current = { ...mousePos.current }
        if (outerRingRef.current) {
          gsap.set(outerRingRef.current, {
            x: mousePos.current.x,
            y: mousePos.current.y,
            xPercent: -50,
            yPercent: -50,
          })
        }
      }

      requestAnimationFrame(animateCursor)
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
      if (outerRingRef.current) {
        gsap.to(outerRingRef.current, {
          scale: 1.2,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      if (outerRingRef.current) {
        gsap.to(outerRingRef.current, {
          scale: 1,
          opacity: 0.7,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseDown = () => {
      setIsClicking(true)
      if (outerRingRef.current) {
        gsap.to(outerRingRef.current, {
          scale: 0.85,
          duration: 0.15,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseUp = () => {
      setIsClicking(false)
      if (outerRingRef.current) {
        gsap.to(outerRingRef.current, {
          scale: isHovering ? 1.2 : 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    // Start animation loop
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    animateCursor()

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], label, select'
    )

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter as EventListener)
      el.addEventListener('mouseleave', handleMouseLeave as EventListener)
    })

    // Observer for dynamically added elements
    const observer = new MutationObserver(() => {
      const newInteractive = document.querySelectorAll(
        'a, button, [role="button"], label, select'
      )
      newInteractive.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter as EventListener)
        el.addEventListener('mouseleave', handleMouseLeave as EventListener)
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)

      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter as EventListener)
        el.removeEventListener('mouseleave', handleMouseLeave as EventListener)
      })

      observer.disconnect()

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
      }
    }
  }, [mounted, isMobile, isHovering, prefersReducedMotion, isVisible])

  // Don't render on mobile or before mount
  if (!mounted || isMobile) {
    return null
  }

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={outerRingRef}
        className="custom-cursor-ring pointer-events-none fixed z-[9999] transition-opacity duration-300"
        style={{
          width: '40px',
          height: '40px',
          border: `2px solid ${cursorColor}`,
          borderRadius: '50%',
          opacity: isVisible ? 0.7 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Inner Dot */}
      <div
        ref={innerDotRef}
        className="custom-cursor-dot pointer-events-none fixed z-[9999] transition-opacity duration-300"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: cursorColor,
          borderRadius: '50%',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </>
  )
}
