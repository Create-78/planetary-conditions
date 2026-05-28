import { useState } from 'react'
import TabBar from './components/TabBar.jsx'
import StarField from './components/StarField.jsx'
import AtmosphericBackdrop from './components/AtmosphericBackdrop.jsx'
import BodyHero from './components/BodyHero.jsx'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js'
import MarsTab from './tabs/MarsTab.jsx'
import MoonTab from './tabs/MoonTab.jsx'
import { DEFAULT_TAB, TABS } from './constants/tabs.js'

function PlanetaryIcon({ activeTab }) {
  const color = activeTab === 'mars' ? '#b91c1c' : '#94a3b8'
  const bg = '#020617'
  return (
    <svg width="44" height="44" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
      <circle cx="18" cy="18" r="18" fill={bg} />
      <circle cx="18" cy="18" r="14" fill={color} />
      <path d="M 18 4 A 14 14 0 0 0 18 32 A 5 14 0 0 1 18 4 Z" fill={bg} />
    </svg>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className="relative min-h-screen w-full font-sans text-slate-100 antialiased">
      <AtmosphericBackdrop activeTab={activeTab} reducedMotion={reducedMotion} />
      <StarField />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <header className="mb-8 md:mb-12 flex items-center gap-4">
          <PlanetaryIcon activeTab={activeTab} />
          <div>
            <h1 className="font-logo text-xl md:text-2xl tracking-widest uppercase text-white leading-none mb-1">
              Planetary Conditions
            </h1>
            <p className="text-slate-500 text-xs tracking-wide">
              Real-time surface and space environment data from Mars and the Moon.
            </p>
          </div>
        </header>

        <div className="mb-8 md:mb-10">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <BodyHero activeTab={activeTab} reducedMotion={reducedMotion} />

        <div className="rounded-lg border border-slate-800/60 bg-slate-950/30 backdrop-blur-md p-6 md:p-8">
          {activeTab === TABS.MARS.id && <MarsTab />}
          {activeTab === TABS.MOON.id && <MoonTab />}
        </div>
      </main>
    </div>
  )
}

export default App
