import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './Footer.css'

const LINKS = {
  Product:  ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company:  ['About', 'Blog', 'Careers', 'Press'],
  Legal:    ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export default function Footer({ logo }: { logo: React.ReactNode }) {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <footer ref={ref} className="footer">
      <div className="footer__glow" aria-hidden="true" />

      <div className="container">
        {/* Top grid */}
        <div className="footer__top">

          {/* Brand column */}
          <motion.div
            className="footer__brand"
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <a href="#home" className="footer__logo">
              {logo}
              <span className="footer__wordmark">CYNAPPZE</span>
            </a>
            <p className="footer__tagline">
              Production-grade AI infrastructure for teams that move fast and build things that last.
            </p>
            <div className="footer__socials">
              {['X', 'GH', 'LI', 'DC'].map((s, i) => (
                <motion.a
                  key={s}
                  href="#"
                  className="footer__social"
                  aria-label={s}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    delay: 0.3 + i * 0.07,
                    type: 'spring',
                    stiffness: 400,
                    damping: 18,
                  }}
                  whileHover={{ scale: 1.15, borderColor: 'rgba(0,212,255,0.4)' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links], colIdx) => (
            <motion.div
              key={title}
              className="footer__col"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.1 + colIdx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="footer__col-title">{title}</span>
              {links.map((link, i) => (
                <motion.a
                  key={link}
                  href="#"
                  className="footer__link"
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: 0.2 + colIdx * 0.08 + i * 0.05,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ x: 4, color: 'var(--c-white)' }}
                >
                  {link}
                </motion.a>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          className="footer__bottom"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p className="footer__copy">
            © 2026 <span>CYNAPPZE</span>. All rights reserved.
          </p>
          <div className="footer__legal">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}