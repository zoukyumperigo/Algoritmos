import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Systems Architect | Decision Intelligence & Predictive Systems',
  description: 'I build systems that think ahead. Strategic systems architecture, operational intelligence, and decision automation for 7-8 figure businesses.',
  keywords: 'systems architecture, decision intelligence, predictive systems, AI automation, strategic CTO',
  openGraph: {
    title: 'Systems Architect | Decision Intelligence & Predictive Systems',
    description: 'I build systems that think ahead. Not platforms. Not dashboards. Intelligent infrastructure for organizations that operate in the future tense.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
