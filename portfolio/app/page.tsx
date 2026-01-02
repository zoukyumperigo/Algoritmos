import Hero from '@/components/Hero'
import Manifesto from '@/components/Manifesto'
import RecentWork from '@/components/RecentWork'
import CTASection from '@/components/CTASection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Manifesto />
      <RecentWork />
      <CTASection />
    </main>
  )
}
