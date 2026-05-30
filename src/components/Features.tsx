import { useRef } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import './Features.css'

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const FEATURES = [
  {
    num: '01', highlight: true,
    title: 'Sub-50ms Latency',
    desc: 'Edge-deployed inference nodes in 30+ regions. Your AI responses arrive before users notice the wait.',
  },
  {
    num: '02', highlight: false,
    title: 'Zero Lock-In',
    desc: 'OpenAI-compatible API surface. Swap providers, fine-tuned models, or hosting layers — your code stays the same.',
  },
  {
    num: '03', highlight: false,
    title: 'Enterprise Security',
    desc: 'SOC-2 Type II ready. All data encrypted at rest and in transit. BYOK support. Private VPC deployment available.',
  },
  {
    num: '04', highlight: true,
    title: 'Observability Stack',
    desc: 'Full token-level tracing, latency percentiles, cost attribution, and drift alerts — out of the box.',
  },
  {
    num: '05', highlight: false,
    title: 'Visual Pipeline Builder',
    desc: 'Chain prompts, tools, and agents with a drag-and-drop canvas. No framework lock, pure JSON export.',
  },
  {
    num: '06', highlight: false,
    title: 'Auto-Scaling',
    desc: 'From zero to thousands of concurrent requests with no cold starts. GPU spot markets managed automatically.',
  },
]

const MARQUEE_ITEMS = [
  'AGENTIC AI','FINE-TUNING','FOUNDATION MODELS',
  'RAG PIPELINES','EDGE INFERENCE','VECTOR SEARCH',
  'OBSERVABILITY','AUTO-SCALING','ZERO LOCK-IN',
]

function AnimatedCounter({ to }: { to: number }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const raw    = useMotionValue(0)
  const spring = useSpring(raw, { stiffness: 60, damping: 20 })
  const display = useTransform(spring, v => Math.round(v))

  if (inView) spring.set(to)

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>%
    </span>
  )
}

function FeatureRow({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  return (
    <motion.li
      className={`feat__item ${feature.highlight ? 'feat__item--highlight' : ''}`}
      initial={{ opacity: 0, x: -32, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_OUT }}
      whileHover={{ paddingLeft: '0.75rem', backgroundColor: 'rgba(0,212,255,0.03)' }}
    >
      <span className="feat__num">{feature.num}</span>
      <div className="feat__body">
        <h3 className="feat__title">{feature.title}</h3>
        <p className="feat__desc">{feature.desc}</p>
      </div>
      <motion.span
        className="feat__arrow"
        whileHover={{ x: 5, y: -5 }}
        transition={{ duration: 0.22 }}
        style={{ display: 'inline-block' }}
      >↗</motion.span>
    </motion.li>
  )
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef    = useRef<HTMLDivElement>(null)
  const leftView   = useInView(leftRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const leftY  = useTransform(scrollYProgress, [0, 1], [60, -60])
  const rightY = useTransform(scrollYProgress, [0, 1], [80, -80])

  return (
    <section id="features" ref={sectionRef} className="features section">
      <div className="features__marquee" aria-hidden="true">
        <motion.div
          className="features__marquee-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="features__marquee-item">
              <span className="features__marquee-dot" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="container">
        <div className="features__layout">
          <motion.div
            ref={leftRef}
            className="features__left"
            style={{ y: leftY }}
            initial={{ opacity: 0, y: 60, filter: 'blur(12px)' }}
            animate={leftView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            <span className="s-label">Why Cynappze</span>
            <h2 className="s-title features__title">
              Built for<br />production.<br /><em>Not demos.</em>
            </h2>

            <motion.div
              className="features__stat"
              whileHover={{
                borderColor: 'rgba(0,212,255,0.3)',
                boxShadow: '0 0 40px rgba(0,212,255,0.08)',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="features__stat-num">
                <AnimatedCounter to={99} />
              </span>
              <span className="features__stat-label">
                uptime SLA across<br />all compute tiers
              </span>
            </motion.div>

            <motion.a
              href="#how-it-works"
              className="btn-ghost features__cta"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.22 }}
            >
              See the architecture <span>→</span>
            </motion.a>
          </motion.div>

          <motion.ul className="features__list" style={{ y: rightY }} role="list">
            {FEATURES.map((f, i) => (
              <FeatureRow key={f.num} feature={f} index={i} />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}