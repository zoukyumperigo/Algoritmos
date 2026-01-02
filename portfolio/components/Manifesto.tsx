'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Manifesto() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-32 bg-gradient-to-b from-deepspace to-surface">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-h2 mb-12 text-center">
            Why I Build <span className="text-gradient">Differently</span>
          </h2>

          <div className="space-y-8 text-lg leading-relaxed">
            <p className="text-text-primary text-2xl font-light">
              Most software is built to solve yesterday's problems.
            </p>

            <p className="text-text-primary text-2xl">
              I design systems that adapt to problems you don't know you have yet.
            </p>

            <div className="border-l-2 border-cyan pl-8 space-y-6 text-text-secondary">
              <p className="flex items-start gap-3">
                <span className="text-cyan mt-1">→</span>
                <span><strong className="text-text-primary">Architecture that evolves</strong>, not expires</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-cyan mt-1">→</span>
                <span><strong className="text-text-primary">Data that generates decisions</strong>, not reports</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-cyan mt-1">→</span>
                <span><strong className="text-text-primary">Automation that learns context</strong>, not just runs scripts</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-cyan mt-1">→</span>
                <span><strong className="text-text-primary">Infrastructure invisible</strong> until you need it</span>
              </p>
            </div>

            <p className="text-text-primary pt-4">
              If you're building a business that will outlast its current form,
              you need systems designed for <strong>transformation</strong>, not transactions.
            </p>

            <p className="text-xl text-cyan font-mono">
              That's what I do.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
