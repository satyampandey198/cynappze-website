import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cursor          from './components/Cursor'
import WebGLBackground from './components/WebGLBackground'
import Navbar          from './components/Navbar'
import Hero            from './components/Hero'
import './App.css'

const Services   = lazy(() => import('./components/Services'))
const Features   = lazy(() => import('./components/Features'))
const HowItWorks = lazy(() => import('./components/HowItWorks'))
const Pricing    = lazy(() => import('./components/Pricing'))
const Footer     = lazy(() => import('./components/Footer'))

/* ── SVG Logo ── */
const Logo = memo(function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Cogniaris logo"
    >
      <rect width="32" height="32" rx="8" fill="url(#lg)" />
      <path d="M8 16 L16 8 L24 16 L16 24 Z"
        stroke="#fff" strokeWidth="1.5"
        fill="none" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3" fill="#fff" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" />
          <stop offset="1" stopColor="#6b5ce7" />
        </linearGradient>
      </defs>
    </svg>
  )
})

/* ── Loader ── */
const Loader = memo(function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let frame = 0
    const total = 55
    const tick = () => {
      frame++
      setPct(Math.min(Math.round((frame / total) * 100), 100))
      if (frame < total) requestAnimationFrame(tick)
      else setTimeout(onDone, 200)
    }
    requestAnimationFrame(tick)
  }, [onDone])

  return (
    <div className="loader">
      <div className="loader__logo">
        <Logo size={36} />
        <span className="loader__wordmark">COGNIARIS</span>
      </div>
      <div className="loader__bar-track">
        <motion.div
          className="loader__bar-fill"
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>
      <span className="loader__pct">{pct}%</span>
    </div>
  )
})

const App = memo(function App() {
  const [loading, setLoading] = useState(true)
  const handleDone = useCallback(() => setLoading(false), [])

  return (
    <div id="root">
      {/* Custom cursor — always on top */}
      <Cursor />

      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          >
            <Loader onDone={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* WebGL stays pinned to background */}
      <WebGLBackground />

      {/* All page content sits above WebGL */}
      <div className="page">
        <Navbar logo={<Logo />} />
        <main>
          <Hero />
          <Suspense fallback={null}>
            <Services />
            <Features />
            <HowItWorks />
            <Pricing />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer logo={<Logo />} />
        </Suspense>
      </div>
    </div>
  )
})

export default App