import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import './Cursor.css'

export default function Cursor() {
  /* Raw mouse position */
  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)

  /* Smooth dot (fast) */
  const dotX = useSpring(rawX, { stiffness: 800, damping: 40, mass: 0.3 })
  const dotY = useSpring(rawY, { stiffness: 800, damping: 40, mass: 0.3 })

  /* Smooth ring (slow/laggy for depth effect) */
  const ringX = useSpring(rawX, { stiffness: 150, damping: 24, mass: 0.6 })
  const ringY = useSpring(rawY, { stiffness: 150, damping: 24, mass: 0.6 })

  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* Hide default cursor */
    document.documentElement.style.cursor = 'none'

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
    }

    /* Hover states */
    const onEnterLink = () => {
      dotRef.current?.classList.add('cursor-dot--hover')
      ringRef.current?.classList.add('cursor-ring--hover')
    }
    const onLeaveLink = () => {
      dotRef.current?.classList.remove('cursor-dot--hover')
      ringRef.current?.classList.remove('cursor-ring--hover')
    }
    const onEnterBtn = () => {
      dotRef.current?.classList.add('cursor-dot--btn')
      ringRef.current?.classList.add('cursor-ring--btn')
    }
    const onLeaveBtn = () => {
      dotRef.current?.classList.remove('cursor-dot--btn')
      ringRef.current?.classList.remove('cursor-ring--btn')
    }

    const attachListeners = () => {
      document.querySelectorAll('a, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
      document.querySelectorAll('button, .btn-primary, .svc__card, .price__card, .feat__item').forEach(el => {
        el.addEventListener('mouseenter', onEnterBtn)
        el.addEventListener('mouseleave', onLeaveBtn)
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    attachListeners()

    /* Re-attach on DOM mutations */
    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [rawX, rawY])

  /* Hide on mobile */
  if (typeof window !== 'undefined' &&
      window.matchMedia('(hover: none)').matches) return null

  return (
    <>
      {/* Dot — snappy */}
      <motion.div
        ref={dotRef}
        className="cursor-dot"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        aria-hidden="true"
      />

      {/* Ring — laggy */}
      <motion.div
        ref={ringRef}
        className="cursor-ring"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        aria-hidden="true"
      />
    </>
  )
}