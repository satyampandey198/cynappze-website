import { memo, useEffect, useRef, useCallback } from 'react'
import './Cursor.css'

const Cursor = memo(function Cursor() {
  const isTouch = typeof window !== 'undefined'
    && (window.matchMedia('(hover: none)').matches
    || window.matchMedia('(pointer: coarse)').matches)

  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef({
    x: -100,
    y: -100,
    dotX: -100,
    dotY: -100,
    ringX: -100,
    ringY: -100,
  })

  const onMove = useCallback((e: MouseEvent) => {
    stateRef.current.x = e.clientX
    stateRef.current.y = e.clientY
  }, [])

  useEffect(() => {
    if (isTouch) return

    /* Hide default cursor */
    document.documentElement.style.cursor = 'none'

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

    const tick = () => {
      const state = stateRef.current
      state.dotX += (state.x - state.dotX) * 0.35
      state.dotY += (state.y - state.dotY) * 0.35
      state.ringX += (state.x - state.ringX) * 0.18
      state.ringY += (state.y - state.ringY) * 0.18

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${state.dotX}px, ${state.dotY}px, 0) translate3d(-50%, -50%, 0)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${state.ringX}px, ${state.ringY}px, 0) translate3d(-50%, -50%, 0)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    attachListeners()
    rafRef.current = requestAnimationFrame(tick)

    /* Re-attach on DOM mutations */
    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [isTouch, onMove])

  /* Hide on mobile */
  if (isTouch) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
})

export default Cursor