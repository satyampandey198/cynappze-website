import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
} from 'framer-motion'
import './HowItWorks.css'

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]


const STEPS = [
  {
    num: '01', label: 'CONNECT',
    title: 'Integrate in minutes',
    desc: 'Drop our SDK into your codebase. One API key unlocks the entire Cogniaris platform — no separate credentials per service.',
    code: `import { Cogniaris } from '@cogniaris/sdk'

const ai = new Cogniaris({
  apiKey: process.env.COGNIARIS_KEY,
  region: 'auto',
})`,
  },
  {
    num: '02', label: 'CONFIGURE',
    title: 'Pick your stack',
    desc: 'Choose your foundation model, configure your agent logic, connect your data sources, and set your latency budget.',
    code: `const agent = await ai.agents.create({
  model: 'gpt-4o',
  tools: ['search', 'code', 'browse'],
  memory: { type: 'vector', topK: 8 },
  maxSteps: 20,
})`,
  },
  {
    num: '03', label: 'DEPLOY',
    title: 'Ship to production',
    desc: 'One command deploys to our global edge network. Auto-scales from zero. Costs you nothing until users arrive.',
    code: `const deployment = await ai.deploy({
  agent: agent.id,
  regions: ['auto'],
  scaling: { min: 0, max: 'unlimited' },
})

console.log(deployment.url)
// → https://your-agent.cogniaris.run`,
  },
  {
    num: '04', label: 'OBSERVE',
    title: 'Monitor everything',
    desc: 'Token-level traces, cost per request, latency percentiles, and model drift alerts — all visible in real time.',
    code: `ai.traces.stream(deployment.id, (trace) => {
  console.log({
    tokens:   trace.usage.total,
    latency:  trace.latency_ms,
    cost_usd: trace.cost,
    status:   trace.status,
  })
})`,
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef    = useRef<HTMLDivElement>(null)
  const inView     = useInView(headRef, { once: true, margin: '-80px' })

  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const leftY       = useTransform(scrollYProgress, [0, 1], [50, -50])
  const rightY      = useTransform(scrollYProgress, [0, 1], [80, -80])
  const panelRotate = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -2])

  useEffect(() => {
    const t = setInterval(() =>
      setActive(p => (p + 1) % STEPS.length), 4500)
    return () => clearInterval(t)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(STEPS[active].code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const stepVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const stepItem: Variants = {
    hidden:  { opacity: 0, x: -28, filter: 'blur(6px)' },
    visible: {
      opacity: 1, x: 0, filter: 'blur(0px)',
      transition: { duration: 0.65, ease: EASE_OUT },
    },
  }

  return (
    <section id="how-it-works" ref={sectionRef} className="hiw section">
      <div className="hiw__glow" aria-hidden="true" />
      <div className="container">
        <motion.div
          ref={headRef}
          className="hiw__header"
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, ease: EASE_OUT }}
        >
          <span className="s-label">The Process</span>
          <h2 className="s-title hiw__title">
            From API key to<br /><em>production</em> in four steps
          </h2>
        </motion.div>

        <div className="hiw__layout">
          <motion.div style={{ y: leftY }}>
            <motion.ul
              className="hiw__steps"
              role="list"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stepVariants}
            >
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.num}
                  className={`hiw__step ${active === i ? 'hiw__step--active' : ''}`}
                  onClick={() => setActive(i)}
                  variants={stepItem}
                  whileHover={{ x: active === i ? 0 : 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="hiw__step-head">
                    <motion.span
                      className="hiw__step-num"
                      animate={{ color: active === i ? 'var(--c-cyan)' : 'var(--c-text-faint)' }}
                      transition={{ duration: 0.3 }}
                    >{s.num}</motion.span>
                    <motion.span
                      className="hiw__step-label"
                      animate={{ color: active === i ? 'var(--c-white)' : 'var(--c-text-dim)' }}
                      transition={{ duration: 0.3 }}
                    >{s.label}</motion.span>
                    <motion.span
                      className="hiw__step-chevron"
                      animate={{
                        rotate: active === i ? 45 : 0,
                        color:  active === i ? 'var(--c-cyan)' : 'var(--c-text-faint)',
                      }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                      aria-hidden="true"
                    >+</motion.span>
                  </div>

                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE_OUT }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="hiw__step-body-inner">
                          <h3 className="hiw__step-title">{s.title}</h3>
                          <p className="hiw__step-desc">{s.desc}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {active === i && (
                    <motion.div
                      className="hiw__step-bar"
                      layoutId="activeBar"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            className="hiw__panel"
            style={{ y: rightY, rotateX: panelRotate }}
            initial={{ opacity: 0, y: 60, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT }}
            whileHover={{
              boxShadow: '0 30px 80px rgba(0,212,255,0.1), 0 0 0 1px rgba(0,212,255,0.15)',
            }}
          >
            <div className="hiw__panel-bar">
              <div className="hiw__panel-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <motion.span
                className="hiw__panel-title"
                key={active}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                cogniaris-sdk — step {STEPS[active].num}
              </motion.span>
              <motion.button
                className="hiw__copy"
                onClick={handleCopy}
                whileTap={{ scale: 0.92 }}
                whileHover={{ borderColor: 'rgba(255,255,255,0.25)', color: 'var(--c-white)' }}
                aria-label="Copy code"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="done"
                      className="hiw__copy-done"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >✓ Copied</motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >Copy</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="hiw__code">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={active}
                  initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <code>{STEPS[active].code}</code>
                </motion.pre>
              </AnimatePresence>
            </div>

            <div className="hiw__panel-steps" aria-hidden="true">
              {STEPS.map((_, i) => (
                <motion.button
                  key={i}
                  className="hiw__pip"
                  onClick={() => setActive(i)}
                  animate={{
                    width:      i === active ? 40 : 20,
                    background: i === active ? 'var(--c-cyan)' : 'var(--c-text-faint)',
                    opacity:    i === active ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>

            <div className="hiw__panel-glow" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}