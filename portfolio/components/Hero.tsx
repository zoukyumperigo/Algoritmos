'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-deepspace via-surface to-deepspace opacity-50" />

      {/* Animated particles/grid - subtle */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#00F5FF 1px, transparent 1px), linear-gradient(90deg, #00F5FF 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <motion.h1
            className="text-display font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            I BUILD SYSTEMS
            <br />
            <span className="text-gradient">THAT THINK AHEAD.</span>
          </motion.h1>

          <motion.p
            className="text-xl text-text-secondary mb-6 max-w-2xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Not platforms. Not dashboards. Not "solutions."
            <br />
            <span className="text-text-primary">Intelligent infrastructure for organizations that operate in the future tense.</span>
          </motion.p>

          <motion.p
            className="text-sm text-text-secondary mb-12 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Strategic systems architecture · Operational intelligence · Decision automation
            <br />
            Working with 7–8 figure businesses that can't afford to build wrong.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex gap-4"
          >
            <Link
              href="/systems"
              className="px-8 py-4 bg-cyan text-deepspace font-bold rounded-lg hover:glow-cyan-strong hover:scale-105 transition-all"
            >
              View Systems
            </Link>
            <Link
              href="/initiate"
              className="px-8 py-4 border border-border text-text-primary rounded-lg hover:border-cyan hover:text-cyan transition-all"
            >
              Initiate Contact
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-cyan/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-cyan rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}
