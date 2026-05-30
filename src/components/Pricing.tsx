import { useRef, useState } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
  type Variants,
} from 'framer-motion'
import './Pricing.css'

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PLANS = [
  {
    id: 'solo', label: 'SOLO', highlight: false,
    price: { monthly: 0, annual: 0 },
    desc: 'For individuals exploring AI-powered workflows.',
    cta: 'Start Free',
    features: [
      '1 active agent',
      '100K tokens / month',
      'Foundation model API access',
      'Community support',
      '1 deployment region',
    ],
  },
  {
    id: 'pro', label: 'PRO', highlight: true,
    price: { monthly: 49, annual: 39 },
    desc: 'For developers and small teams shipping fast.',
    cta: 'Get Pro',
    features: [
      '10 active agents',
      '5M tokens / month',
      'Fine-tuning (LoRA)',
      'RAG pipelines',
      'Priority support',
      'All deployment regions',
      'Basic observability',
    ],
  },
  {
    id: 'enterprise', label: 'ENTERPRISE', highlight: false,
    price: { monthly: null, annual: null },
    desc: 'For organizations with custom scale and compliance needs.',
    cta: 'Contact Us',
    features: [
      'Unlimited agents',
      'Custom token volume',
      'Full fine-tuning suite',
      'Private VPC deployment',
      'SOC-2 compliance',
      'Dedicated support SLA',
      'BYOK encryption',
    ],
  },
]

function PricingCard({
  plan, index, annual,
}: {
  plan: typeof PLANS[0]
  index: number
  annual: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rawX    = useMotionValue(0)
  const rawY    = useMotionValue(0)

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]),  { stiffness: 280, damping: 26 })
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]),  { stiffness: 280, damping: 26 })
  const glowX   = useTransform(rawX, [-0.5, 0.5], ['15%', '85%'])
  const glowY   = useTransform(rawY, [-0.5, 0.5], ['15%', '85%'])

  const highlightGlow = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(0,212,255,0.14), transparent 65%)`
  const defaultGlow   = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.05), transparent 65%)`
  const glowBg        = plan.highlight ? highlightGlow : defaultGlow

  const price = annual ? plan.price.annual : plan.price.monthly

  const hoverShadow = plan.highlight
    ? '0 30px 80px rgba(0,212,255,0.2), 0 0 0 1px rgba(0,212,255,0.35)'
    : '0 24px 60px rgba(107,92,231,0.15), 0 0 0 1px rgba(255,255,255,0.1)'

  const featVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.3 + index * 0.12 } },
  }

  const featItem: Variants = {
    hidden:  { opacity: 0, x: -12 },
    visible: {
      opacity: 1, x: 0,
      transition: { duration: 0.4, ease: EASE_OUT },
    },
  }

  return (
    <motion.div
      ref={cardRef}
      className={`price__card ${plan.highlight ? 'price__card--highlight' : ''}`}
      onMouseMove={e => {
        const r = cardRef.current!.getBoundingClientRect()
        rawX.set((e.clientX - r.left) / r.width  - 0.5)
        rawY.set((e.clientY - r.top)  / r.height - 0.5)
      }}
      onMouseLeave={() => { rawX.set(0); rawY.set(0) }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, delay: index * 0.13, ease: EASE_OUT }}
      whileHover={{ scale: 1.02, y: -10, boxShadow: hoverShadow, zIndex: 10 }}
    >
      <motion.div
        className="price__card-cursor-glow"
        style={{ background: glowBg }}
        aria-hidden="true"
      />

      {plan.highlight && (
        <motion.div
          className="price__card-badge"
          initial={{ opacity: 0, y: -10, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 400, damping: 20 }}
        >
          MOST POPULAR
        </motion.div>
      )}

      <div style={{ transform: 'translateZ(10px)' }}>
        <div className="price__card-top">
          <span className="price__card-label">{plan.label}</span>

          <div className="price__card-price">
            <AnimatePresence mode="wait">
              {price === null ? (
                <motion.span
                  key="custom"
                  className="price__card-custom"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >Custom</motion.span>
              ) : (
                <motion.div
                  key={`price-${annual ? 'a' : 'm'}`}
                  className="price__card-price-inner"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                >
                  <span className="price__card-currency">$</span>
                  <span className="price__card-num">{price}</span>
                  <span className="price__card-period">/mo</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="price__card-desc">{plan.desc}</p>
        </div>

        <div className="price__card-rule" />

        <motion.ul
          className="price__card-features"
          role="list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={featVariants}
        >
          {plan.features.map((f, i) => (
            <motion.li key={f} className="price__feat" variants={featItem}>
              <motion.span
                className="price__feat-check"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.4 + index * 0.12 + i * 0.05,
                  type: 'spring', stiffness: 500, damping: 20,
                }}
                aria-hidden="true"
              >✓</motion.span>
              <span>{f}</span>
            </motion.li>
          ))}
        </motion.ul>

        <motion.a
          href="#"
          className={plan.highlight ? 'btn-primary price__cta' : 'btn-ghost price__cta'}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span>{plan.cta}</span>
          <span>→</span>
        </motion.a>
      </div>

      {plan.highlight && <div className="price__card-glow" aria-hidden="true" />}
    </motion.div>
  )
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef    = useRef<HTMLDivElement>(null)
  const inView     = useInView(headRef, { once: true, margin: '-80px' })
  const [annual, setAnnual] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const gridY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section id="pricing" ref={sectionRef} className="pricing section">
      <div className="pricing__top-rule" aria-hidden="true" />
      <div className="container">
        <motion.div
          ref={headRef}
          className="pricing__head"
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, ease: EASE_OUT }}
        >
          <span className="s-label">Pricing</span>
          <h2 className="s-title">Simple pricing.<br /><em>Serious</em> power.</h2>
          <p className="s-sub">Start free. Scale when ready. No surprise bills.</p>

          <div className="pricing__toggle" role="group" aria-label="Billing period">
            <motion.div
              className="pricing__toggle-slider"
              animate={{ x: annual ? '100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              aria-hidden="true"
            />
            <button
              className={`pricing__toggle-btn ${!annual ? 'pricing__toggle-btn--active' : ''}`}
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
            >Monthly</button>
            <button
              className={`pricing__toggle-btn ${annual ? 'pricing__toggle-btn--active' : ''}`}
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
            >
              Annual
              <span className="pricing__toggle-badge">−20%</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          className="pricing__grid"
          style={{ y: gridY, perspective: 1000 }}
        >
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} annual={annual} />
          ))}
        </motion.div>

        <motion.p
          className="pricing__note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          All plans include a 14-day trial of Pro features. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}