import { useState } from 'react'
import PlanetStage from './components/PlanetStage.jsx'
import TabBar from './components/TabBar.jsx'
import MarsTab from './tabs/MarsTab.jsx'
import MoonTab from './tabs/MoonTab.jsx'
import { useNow } from './hooks/useNow.js'
import { DEFAULT_TAB, TABS } from './constants/tabs.js'

/** Planet glyph in the wordmark — matches the original App's PlanetaryIcon. */
function PlanetMark({ activeTab, size = 44 }) {
  const color = activeTab === 'mars' ? '#b91c1c' : '#94a3b8'
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true" className="flex-shrink-0">
      <circle cx="18" cy="18" r="18" fill="#04050a" />
      <circle cx="18" cy="18" r="14" fill={color} />
      <path d="M 18 4 A 14 14 0 0 0 18 32 A 5 14 0 0 1 18 4 Z" fill="#04050a" />
    </svg>
  )
}

function nowUtc(now) {
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm} UTC`
}

function App() {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)
  const now = useNow()

  return (
    <PlanetStage activeTab={activeTab}>
      <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-6 pb-11 pt-9 md:px-11 text-slate-100 antialiased">
        {/* header: wordmark · live chip + tab pills */}
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <PlanetMark activeTab={activeTab} />
            <div>
              <h1 className="wordmark text-[19px] leading-none text-white">Planetary Conditions</h1>
              <p className="mt-1.5 text-[12.5px] text-slate-400">
                Real-time surface &amp; space-environment telemetry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="chip telem">
              <span className="live-dot" /> Live · {nowUtc(now)}
            </span>
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </header>

        {/* tab content fills the rest; each tab floats its bento grid low over the planet */}
        <div className="flex flex-1 flex-col">
          {activeTab === TABS.MARS.id && <MarsTab />}
          {activeTab === TABS.MOON.id && <MoonTab />}
        </div>
      </main>
    </PlanetStage>
  )
}

export default App
