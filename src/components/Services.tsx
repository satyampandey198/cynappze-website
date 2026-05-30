import { useRef } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  type Variants,
} from 'framer-motion'
import './Services.css'

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const SERVICES = [
  {
    id: '01', tag: 'AGENTIC AI', accent: 'cyan',
    title: 'Autonomous AI Agents',
    desc: 'Deploy intelligent agents that plan, reason, and execute multi-step tasks across your entire tech stack — without manual intervention.',
    meta: 'Powered by LLM orchestration',
  },
  {
    id: '02', tag: 'FINE-TUNING', accent: 'violet',
    title: 'Model Fine-Tuning',
    desc: 'Adapt foundation models to your domain with surgical precision. Fewer parameters, higher accuracy, dramatically lower inference cost.',
    meta: 'LoRA / QLoRA supported',
  },
  {
    id: '03', tag: 'FOUNDATION MODELS', accent: 'green',
    title: 'Model Access API',
    desc: 'One unified API for the best open and closed-source foundation models. GPT-4o, Claude, Mistral, Gemini — switch without code rewrites.',
    meta: 'OpenAI-compatible schema',
  },
  {
    id: '04', tag: 'ENTERPRISE DATA', accent: 'cyan',
    title: 'Data Pipeline & RAG',
    desc: 'Ingest, chunk, embed, and retrieve your enterprise data at production scale. Real-time vector search with sub-50ms latency.',
    meta: 'Pinecone / pgvector / Weaviate',
  },
  {
    id: '05', tag: 'DEPLOYMENT', accent: 'violet',
    title: 'One-Click Deploy',
    desc: 'Ship your AI workloads from prototype to global edge in minutes. Auto-scaling, zero cold starts, and built-in observability.',
    meta: 'Edge runtime + GPU cloud',
  },
]

function ServiceCard({
  service,
  index,
}: {
  service: typeof SERVICES[0]
  index: number
}) {
  const cardRef = useRef<HTMLLIElement>(null)
  const rawX    = useMotionValue(0)
  const rawY    = useMotionValue(0)

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]),   { stiffness: 300, damping: 28 })
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 28 })
  const glowX   = useTransform(rawX, [-0.5, 0.5], ['10%', '90%'])
  const glowY   = useTransform(rawY, [-0.5, 0.5], ['10%', '90%'])

  const cyanGlow   = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(0,212,255,0.18), transparent 65%)`
  const violetGlow = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(107,92,231,0.18), transparent 65%)`
  const greenGlow  = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(0,255,157,0.14), transparent 65%)`

  const glowBg =
    service.accent === 'cyan'   ? cyanGlow   :
    service.accent === 'violet' ? violetGlow : greenGlow

  const glowShadow =
    service.accent === 'cyan'   ? '0 20px 60px rgba(0,212,255,0.15), 0 0 0 1px rgba(0,212,255,0.2)'  :
    service.accent === 'violet' ? '0 20px 60px rgba(107,92,231,0.15), 0 0 0 1px rgba(107,92,231,0.2)' :
                                  '0 20px 60px rgba(0,255,157,0.12), 0 0 0 1px rgba(0,255,157,0.2)'

  return (
    <motion.li
      ref={cardRef}
      className={`svc__card svc__card--${service.accent}`}
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
        transformPerspective: 900,
      }}
      initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: EASE_OUT }}
      whileHover={{ scale: 1.02, y: -10, boxShadow: glowShadow, zIndex: 10 }}
    >
      <motion.div
        className="svc__card-glow"
        style={{ background: glowBg }}
        aria-hidden="true"
      />

      <div className="svc__card-head">
        <span className="svc__card-id">{service.id}</span>
        <motion.span
          className={`svc__card-tag svc__card-tag--${service.accent}`}
          whileHover={{ scale: 1.05 }}
        >
          {service.tag}
        </motion.span>
      </div>

      <h3 className="svc__card-title" style={{ transform: 'translateZ(18px)' }}>
        {service.title}
      </h3>

      <p className="svc__card-desc">{service.desc}</p>

      <div className="svc__card-foot">
        <span className="svc__card-meta">{service.meta}</span>
        <motion.span
          className="svc__card-arrow"
          whileHover={{ x: 5, y: -5 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-block' }}
        >↗</motion.span>
      </div>
    </motion.li>
  )
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef    = useRef<HTMLDivElement>(null)
  const inView     = useInView(headRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const gridY = useTransform(scrollYProgress, [0, 1], [40, -40])

  const wrapperVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const slideUp: Variants = {
    hidden:  { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.9, ease: EASE_OUT },
    },
  }

  return (
    <section id="services" ref={sectionRef} className="services section">
      <div className="services__glow" aria-hidden="true" />
      <div className="container">
        <motion.div
          ref={headRef}
          className="services__head"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={wrapperVariants}
        >
          <motion.div className="services__head-left" variants={slideUp}>
            <span className="s-label">What We Build</span>
            <h2 className="s-title">
              Five <em>core</em><br />AI capabilities
            </h2>
          </motion.div>
          <motion.div className="services__head-right" variants={slideUp}>
            <p className="s-sub">
              Each service is a precision-engineered layer of the AI stack.
              Use one. Use all. They're designed to work together at enterprise scale.
            </p>
            <motion.a
              href="#pricing"
              className="btn-ghost services__head-cta"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.22 }}
            >
              View Pricing <span>→</span>
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.ul className="svc__grid" style={{ y: gridY }} role="list">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </motion.ul>
      </div>
    </section>
  )
}