'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const projects = [
  {
    name: 'ORACLE',
    description: 'Real-time pricing intelligence for $40M logistics network',
    metric: '91% pricing accuracy',
  },
  {
    name: 'PHANTOM',
    description: 'Autonomous inventory prediction system',
    metric: '97.3% forecast accuracy',
  },
  {
    name: 'SENTINEL',
    description: 'Zero-latency operational dashboard for remote surgical robotics',
    metric: '47ms average latency',
  },
  {
    name: 'HYDRA',
    description: 'Behavioral fraud detection architecture',
    metric: '11ms response time',
  },
  {
    name: 'ECHO',
    description: 'Predictive maintenance AI',
    metric: '83% downtime reduction',
  },
]

export default function RecentWork() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-32">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h2 mb-4">Recent Work Includes:</h2>
          <p className="text-text-secondary mb-16 max-w-2xl">
            These aren't features. These are fundamental advantages.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group"
              >
                <Link href={`/systems/${project.name.toLowerCase()}`}>
                  <div className="p-8 border border-border rounded-lg bg-surface/50 hover:border-cyan hover:glow-cyan transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-cyan group-hover:text-gradient transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-xs font-mono text-text-secondary">
                        →
                      </span>
                    </div>
                    <p className="text-text-secondary mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <p className="text-sm font-mono text-mint">
                        {project.metric}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <Link
              href="/systems"
              className="inline-block px-8 py-4 border border-cyan text-cyan rounded-lg hover:bg-cyan/10 hover:glow-cyan transition-all"
            >
              View All Systems →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
