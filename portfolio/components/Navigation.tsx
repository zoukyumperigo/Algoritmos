'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-deepspace/90 backdrop-blur-lg border-b border-border' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom py-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-cyan transition-colors">
          TRANSMISSION
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link href="/systems" className="text-text-secondary hover:text-text-primary transition-colors">
            Systems
          </Link>
          <Link href="/capabilities" className="text-text-secondary hover:text-text-primary transition-colors">
            Capabilities
          </Link>
          <Link href="/intelligence" className="text-text-secondary hover:text-text-primary transition-colors">
            Intelligence
          </Link>
          <Link
            href="/initiate"
            className="px-6 py-2 bg-cyan/10 border border-cyan text-cyan rounded-lg hover:bg-cyan/20 hover:glow-cyan transition-all"
          >
            Initiate
          </Link>
        </div>

        {/* Mobile menu - simplified for now */}
        <div className="md:hidden">
          <Link href="/initiate" className="text-cyan">
            Contact
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
