'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-32 bg-gradient-to-b from-surface to-deepspace">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-h1 mb-8">
            Ready to Build <span className="text-gradient">Systems That Last?</span>
          </h2>

          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            I don't take every project. I take the right ones.
            <br />
            If you're building something that will exist in 5 years, not 5 months — let's talk.
          </p>

          <Link
            href="/initiate"
            className="inline-block px-12 py-5 bg-cyan text-deepspace font-bold text-lg rounded-lg hover:glow-cyan-strong hover:scale-105 transition-all"
          >
            Initiate Contact
          </Link>

          <p className="mt-8 text-sm text-text-secondary font-mono">
            Response time: 48 hours for aligned projects
          </p>
        </motion.div>
      </div>
    </section>
  )
}
