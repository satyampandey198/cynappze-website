import { useRef, useEffect, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type Variants,
} from 'framer-motion'
import './Hero.css'

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_IN:  [number, number, number, number] = [0.55, 0, 1, 0.45]

const ROTATING_WORDS = ['Agents', 'Pipelines', 'Fine-Tuning', 'RAG', 'Inference']

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [wordIdx, setWordIdx] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const headY   = useTransform(scrollYProgress, [0, 1], [0, -180])
  const subY    = useTransform(scrollYProgress, [0, 1], [0, -120])
  const ctaY    = useTransform(scrollYProgress, [0, 1], [0,  -80])
  const badgeY  = useTransform(scrollYProgress, [0, 1], [0,  -60])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1,   0])
  const scale   = useTransform(scrollYProgress, [0, 1],   [1, 0.92])
  const gridY   = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const gridO   = useTransform(scrollYProgress, [0, 0.8], [1,   0])

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const spotX  = useSpring(useTransform(mouseX, [0, 1], ['20%', '80%']), { stiffness: 60, damping: 18 })
  const spotY  = useSpring(useTransform(mouseY, [0, 1], ['20%', '80%']), { stiffness: 60, damping: 18 })

  useEffect(() => {
    const t = setInterval(() =>
      setWordIdx(p => (p + 1) % ROTATING_WORDS.length), 2600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseX, mouseY])

  const containerVariants: Variants = {
    hidden:  {},
    visible: {
      transition: { staggerChildren: 0.14, delayChildren: 0.3 },
    },
  }

  const itemUp: Variants = {
    hidden:  { opacity: 0, y: 48, filter: 'blur(10px)' },
    visible: {
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 1.0, ease: EASE_OUT },
    },
  }

  const wordVariants: Variants = {
    enter: {
      y: 40, opacity: 0, filter: 'blur(8px)',
      transition: { duration: 0.45, ease: EASE_OUT },
    },
    center: {
      y: 0, opacity: 1, filter: 'blur(0px)',
      transition: { duration: 0.55, ease: EASE_OUT },
    },
    exit: {
      y: -36, opacity: 0, filter: 'blur(6px)',
      transition: { duration: 0.35, ease: EASE_IN },
    },
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="hero"
      aria-label="Hero"
    >
      {/* Mouse spotlight */}
      <motion.div
        className="hero__spotlight"
        style={{ left: spotX, top: spotY }}
        aria-hidden="true"
      />

      {/* Perspective grid */}
      <motion.div
        className="hero__grid"
        style={{ y: gridY, opacity: gridO }}
        aria-hidden="true"
      />

      {/* Scan line */}
      <motion.div
        className="hero__scan"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
        aria-hidden="true"
      />

      <div className="container">
        <motion.div
          className="hero__inner"
          style={{ opacity, scale }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div
            className="hero__badge"
            style={{ y: badgeY }}
            variants={itemUp}
            whileHover={{ scale: 1.05, borderColor: 'rgba(0,212,255,0.4)' }}
          >
            <span className="hero__badge-dot" aria-hidden="true" />
            <span>Production-Ready AI Platform</span>
            <span className="hero__badge-arrow">→</span>
          </motion.div>

          {/* Headline */}
          <motion.div className="hero__headline" style={{ y: headY }}>
            <motion.h1 className="hero__title" variants={itemUp}>
              <span className="hero__title-line">The AI stack for</span>
              <span className="hero__title-line hero__title-line--flex">
                <span className="hero__title-static">shipping</span>
                <span className="hero__rotating-wrapper" aria-live="polite">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={ROTATING_WORDS[wordIdx]}
                      className="hero__rotating-word"
                      variants={wordVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      {ROTATING_WORDS[wordIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
              <span className="hero__title-line hero__title-line--dim">
                at scale.
              </span>
            </motion.h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            className="hero__sub"
            style={{ y: subY }}
            variants={itemUp}
          >
            Cogniaris gives engineering teams a single platform to deploy AI agents,
            fine-tune models, and run RAG pipelines — with sub-50ms latency and
            99% uptime, globally.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="hero__ctas"
            style={{ y: ctaY }}
            variants={itemUp}
          >
            <motion.a
              href="#pricing"
              className="btn-primary hero__cta-primary"
              whileHover={{
                scale: 1.04,
                boxShadow: '0 0 40px rgba(0,212,255,0.35), 0 8px 32px rgba(0,212,255,0.2)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span>Start Building Free</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >→</motion.span>
            </motion.a>

            <motion.a
              href="#how-it-works"
              className="btn-ghost hero__cta-ghost"
              whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="hero__cta-play" aria-hidden="true">▶</span>
              <span>See How It Works</span>
            </motion.a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="hero__proof"
            variants={itemUp}
            style={{ y: ctaY }}
          >
            <div className="hero__proof-avatars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="hero__proof-avatar"
                  initial={{ opacity: 0, scale: 0, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{
                    delay: 1.0 + i * 0.08,
                    type: 'spring', stiffness: 500, damping: 22,
                  }}
                  style={{ zIndex: 5 - i }}
                />
              ))}
            </div>
            <span className="hero__proof-text">
              Trusted by <strong>1,200+</strong> engineering teams
            </span>
          </motion.div>
        </motion.div>

        {/* Floating stat pills */}
        {[
          { label: 'Latency', value: '<50ms', x: '72%', y: '28%', delay: 1.2, color: 'cyan'   },
          { label: 'Uptime',  value: '99.9%', x: '78%', y: '58%', delay: 1.4, color: 'violet' },
          { label: 'Regions', value: '30+',   x: '68%', y: '76%', delay: 1.6, color: 'green'  },
        ].map(pill => (
          <motion.div
            key={pill.label}
            className={`hero__pill hero__pill--${pill.color}`}
            style={{ left: pill.x, top: pill.y }}
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
            transition={{ delay: pill.delay, duration: 0.7, ease: EASE_OUT }}
            whileHover={{ scale: 1.1, y: -4 }}
          >
            <span className="hero__pill-value">{pill.value}</span>
            <span className="hero__pill-label">{pill.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        aria-hidden="true"
      >
        <motion.div
          className="hero__scroll-dot"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}