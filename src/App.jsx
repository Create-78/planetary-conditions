import { useState } from 'react'
import TabBar from './components/TabBar.jsx'
import StarField from './components/StarField.jsx'
import AtmosphericBackdrop from './components/AtmosphericBackdrop.jsx'
import BodyHero from './components/BodyHero.jsx'
import MarsTab from './tabs/MarsTab.jsx'
import MoonTab from './tabs/MoonTab.jsx'
import { DEFAULT_TAB, TABS } from './constants/tabs.js'

function App() {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)

  return (
    <div className="relative min-h-screen w-full font-sans text-slate-100 antialiased">
      <AtmosphericBackdrop activeTab={activeTab} />
      <StarField />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Planetary Conditions
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Real-time surface and space environment data from Mars and the Moon.
          </p>
        </header>

        <div className="mb-8 md:mb-10">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <BodyHero activeTab={activeTab} />

        <div className="rounded-lg border border-slate-800/60 bg-slate-950/30 backdrop-blur-md p-6 md:p-8">
          {activeTab === TABS.MARS.id && <MarsTab />}
          {activeTab === TABS.MOON.id && <MoonTab />}
        </div>
      </main>
    </div>
  )
}

export default App
