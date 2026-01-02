'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function OraclePage() {
  return (
    <main className="min-h-screen pt-32 pb-20">
      {/* Hero */}
      <section className="container-custom mb-20">
        <Link href="/systems" className="inline-flex items-center gap-2 text-text-secondary hover:text-cyan transition-colors mb-8">
          ← Back to Systems
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-display mb-6 text-gradient">
            ORACLE
          </h1>
          <p className="text-2xl text-text-primary mb-4">
            Real-time pricing intelligence for a $40M logistics network
          </p>
          <p className="text-text-secondary font-mono">
            Apex Distribution Networks · B2B Logistics & Supply Chain · Q2–Q4 2023
          </p>
        </motion.div>
      </section>

      {/* Key Metrics Bar */}
      <section className="bg-surface/50 border-y border-border py-12 mb-20">
        <div className="container-custom grid md:grid-cols-4 gap-8">
          {[
            { label: 'Quote Time', value: '11 sec', change: 'from 4 hours' },
            { label: 'Win Rate', value: '+34%', change: 'improvement' },
            { label: 'Pricing Accuracy', value: '91%', change: 'vs 63% baseline' },
            { label: 'Annual Margin', value: '+$2.7M', change: 'improvement' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-mint mb-2">{metric.value}</p>
              <p className="text-sm text-text-primary mb-1">{metric.label}</p>
              <p className="text-xs text-text-secondary font-mono">{metric.change}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content */}
      <div className="container-custom max-w-4xl">
        <section className="mb-20">
          <h2 className="text-h2 mb-6 text-cyan">THE PROBLEM</h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-text-primary leading-relaxed mb-4">
              A $40M logistics company was pricing contracts manually — using historical data, competitor guesses, and gut instinct.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              Route complexity, fuel volatility, and seasonal demand made every quote a gamble. Lost contracts to underpricing. Lost margin to overpricing. No visibility into what competitors were doing.
            </p>
            <p className="text-text-primary leading-relaxed font-medium">
              They needed to price faster, smarter, and dynamically — in real time.
            </p>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-h2 mb-6 text-cyan">THE SYSTEM</h2>
          <p className="text-2xl text-text-primary mb-8">
            <strong>Oracle</strong> — an autonomous pricing intelligence engine.
          </p>

          <div className="space-y-6 mb-10">
            <h3 className="text-h3 text-text-primary">What it does:</h3>
            <ul className="space-y-4 text-text-secondary">
              <li className="flex gap-3">
                <span className="text-cyan mt-1">→</span>
                <span>Ingests 50+ real-time data streams: fuel prices, weather patterns, traffic APIs, competitor bids, historical win/loss data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan mt-1">→</span>
                <span>Uses ensemble ML models (XGBoost + LSTM networks) to predict optimal pricing per route</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan mt-1">→</span>
                <span>Generates instant quotes with confidence intervals</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan mt-1">→</span>
                <span>Learns from every accepted/rejected proposal</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan mt-1">→</span>
                <span>Runs scenario simulations: "What if fuel rises 12%?"</span>
              </li>
            </ul>
          </div>

          <div className="p-8 bg-surface/50 border border-border rounded-lg">
            <h3 className="text-h3 text-text-primary mb-6">Architecture:</h3>
            <ul className="grid md:grid-cols-2 gap-4 text-sm font-mono text-text-secondary">
              <li>• Event-driven microservices (AWS Lambda)</li>
              <li>• Streaming data pipeline (Kafka + Kinesis)</li>
              <li>• Graph database (Neo4j)</li>
              <li>• Real-time inference (SageMaker)</li>
              <li>• Web + mobile (React + Flutter)</li>
            </ul>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-h2 mb-6 text-cyan">THE RESULTS</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { metric: 'Quote generation time', result: '4 hours → 11 seconds' },
              { metric: 'Contract win rate', result: '+34%' },
              { metric: 'Pricing accuracy', result: '91% (vs 63% baseline)' },
              { metric: 'Annual margin improvement', result: '$2.7M' },
              { metric: 'Competitive blind spots', result: '100% eliminated' },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-border rounded-lg bg-surface/30">
                <p className="text-sm text-text-secondary mb-2">{item.metric}</p>
                <p className="text-xl font-bold text-mint">{item.result}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="p-10 bg-gradient-to-br from-cyan/10 to-mint/10 border border-cyan/30 rounded-lg">
            <h2 className="text-h2 mb-4 text-cyan">WHY THIS MATTERS</h2>
            <p className="text-lg text-text-primary leading-relaxed">
              Pricing is never "just math." It's risk management, competitive intelligence, and strategic positioning compressed into a number.
              <strong className="block mt-4">Oracle doesn't just calculate — it learns what winning looks like.</strong>
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-12 border-t border-border">
          <Link href="/systems" className="text-text-secondary hover:text-cyan transition-colors">
            ← All Systems
          </Link>
          <Link href="/systems/phantom" className="text-text-secondary hover:text-cyan transition-colors">
            Next: PHANTOM →
          </Link>
        </div>
      </div>
    </main>
  )
}
