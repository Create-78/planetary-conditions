import { TAB_LIST } from '../constants/tabs.js'

// Palette-aware styles per tab id.
// Active tab gets a strong body-color background + accent border.
// Inactive tab gets a muted slate look so the active one reads as clearly distinct.
const TAB_STYLES = {
  mars: {
    active: 'bg-mars-700 text-mars-50 border-mars-900 shadow-[0_0_24px_-6px_#7f1d1d]',
    inactive: 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-mars-50 hover:border-mars-700',
  },
  moon: {
    active: 'bg-moon-800 text-moon-50 border-moon-accent shadow-[0_0_24px_-6px_#cbd5e1]',
    inactive: 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-moon-50 hover:border-moon-700',
  },
}

function TabBar({ activeTab, onTabChange }) {
  return (
    <nav
      role="tablist"
      aria-label="Planetary body"
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
    >
      {TAB_LIST.map((tab) => {
        const isActive = activeTab === tab.id
        const styles = TAB_STYLES[tab.id]
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex-1 px-6 py-4 text-lg font-semibold tracking-wide',
              'border-2 rounded-lg transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950 focus-visible:ring-white',
              isActive ? styles.active : styles.inactive,
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export default TabBar
