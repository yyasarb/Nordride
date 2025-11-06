'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    // Custom cursor with smooth following
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const animateCursor = () => {
      // Smooth interpolation (lerp)
      const ease = 0.15
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * ease
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * ease

      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: cursorPos.current.x,
          y: cursorPos.current.y,
          xPercent: -50,
          yPercent: -50,
        })
      }

      if (cursorDotRef.current) {
        gsap.set(cursorDotRef.current, {
          x: mousePos.current.x,
          y: mousePos.current.y,
          xPercent: -50,
          yPercent: -50,
        })
      }

      requestAnimationFrame(animateCursor)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animateCursor()

    // Cursor interactions
    const handleMouseEnter = () => {
      gsap.to(cursorRef.current, {
        scale: 1.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(cursorRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, [role="button"]'
    )

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="custom-cursor pointer-events-none fixed z-[9999] hidden lg:block"
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(0, 0, 0, 0.3)',
          borderRadius: '50%',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={cursorDotRef}
        className="custom-cursor-dot pointer-events-none fixed z-[9999] hidden lg:block"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '50%',
        }}
      />
      {children}
    </>
  )
}
