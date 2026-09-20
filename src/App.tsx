import { useCallback, useState } from 'react'
import Navbar from './components/Navbar'
import SplashScreen from './components/SplashScreen'
import { BookingProvider } from './context/BookingContext'
import { useScrollLock } from './hooks/useScrollLock'
import Hero from './sections/Hero'
import SmileGallery from './sections/SmileGallery'
import ImplantDentistry from './sections/ImplantDentistry'
import About from './sections/About'
import Services from './sections/Services'
import Doctors from './sections/Doctors'
import PatientJourney from './sections/PatientJourney'
import Testimonials from './sections/Testimonials'
import FAQ from './sections/FAQ'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const onSplashComplete = useCallback(() => setShowSplash(false), [])

  // No scrolling behind the splash counter.
  useScrollLock(showSplash)

  return (
    <BookingProvider>
      <div className="bg-white">
        {showSplash && <SplashScreen onComplete={onSplashComplete} />}

        <a
          href="#main"
          className="sr-only z-[70] rounded-full bg-black px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>

        <Navbar />

        <main id="main">
          <Hero ready={!showSplash} />
          <SmileGallery />
          <ImplantDentistry />
          <About />
          <Services />
          <Doctors />
          <PatientJourney />
          <Testimonials />
          <FAQ />
          <Contact />
        </main>

        <Footer />
      </div>
    </BookingProvider>
  )
}
