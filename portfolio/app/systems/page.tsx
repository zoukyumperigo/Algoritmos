'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const systems = [
  {
    id: 'oracle',
    name: 'ORACLE',
    client: 'Apex Distribution Networks',
    industry: 'B2B Logistics & Supply Chain',
    tagline: 'Real-time pricing intelligence for $40M logistics network',
    keyMetric: '91% pricing accuracy',
    color: 'cyan',
  },
  {
    id: 'phantom',
    name: 'PHANTOM',
    client: 'Vance Retail Group',
    industry: 'E-commerce & Retail Operations',
    tagline: 'Autonomous inventory prediction system',
    keyMetric: '97.3% forecast accuracy',
    color: 'mint',
  },
  {
    id: 'sentinel',
    name: 'SENTINEL',
    client: 'Meridian HealthTech',
    industry: 'Medical Devices & Remote Surgery',
    tagline: 'Zero-latency operational dashboard for remote surgical robotics',
    keyMetric: '47ms average latency',
    color: 'amber',
  },
  {
    id: 'hydra',
    name: 'HYDRA',
    client: 'Internal R&D Project',
    industry: 'Cybersecurity & Fraud Detection',
    tagline: 'Behavioral fraud detection architecture',
    keyMetric: '<11ms response time',
    color: 'coral',
  },
  {
    id: 'echo',
    name: 'ECHO',
    client: 'Titan Manufacturing',
    industry: 'Industrial Equipment & Predictive Maintenance',
    tagline: 'Predictive maintenance AI that listens to machines',
    keyMetric: '83% downtime reduction',
    color: 'mint',
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    client: 'Velocity Fintech',
    industry: 'Financial Services & Decision Automation',
    tagline: 'Autonomous credit decision engine',
    keyMetric: '8 second decisions',
    color: 'cyan',
  },
  {
    id: 'pulse',
    name: 'PULSE',
    client: 'Internal Product Studio',
    industry: 'Product Analytics & Growth Intelligence',
    tagline: 'Predictive product intelligence platform',
    keyMetric: '94% churn prediction accuracy',
    color: 'amber',
  },
]

export default function SystemsPage() {
  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-display mb-6">
            <span className="text-gradient">SYSTEMS</span>
          </h1>
          <p className="text-xl text-text-secondary mb-20 max-w-2xl">
            Not projects. Not portfolios. Strategic systems that generate fundamental advantages.
            Each one designed to adapt, learn, and outlast the problems they solve.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {systems.map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link href={`/systems/${system.id}`}>
                <div className="group h-full p-10 border border-border rounded-lg bg-surface/30 hover:border-cyan hover:bg-surface/60 hover:glow-cyan transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-cyan group-hover:text-gradient transition-colors">
                      {system.name}
                    </h2>
                    <span className="text-2xl text-text-secondary group-hover:text-cyan transition-colors">
                      →
                    </span>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-mono text-text-secondary mb-2">
                      {system.client} · {system.industry}
                    </p>
                    <p className="text-text-primary text-lg leading-relaxed">
                      {system.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-border">
                    <div className="h-1 w-12 bg-mint rounded-full" />
                    <p className="text-sm font-mono text-mint">
                      {system.keyMetric}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
