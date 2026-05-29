import { TAB_LIST } from '../constants/tabs.js'

/**
 * TabBar — glass pill tab switcher (Mars / Moon).
 *
 * Drop-in replacement for the original bordered TabBar: same props
 * (activeTab, onTabChange) and same TAB_LIST source, restyled as a frosted
 * pill group with a body-tinted active state and a status dot.
 */

const DOT = { mars: '#f59e0b', moon: '#cbd5e1' }

function TabBar({ activeTab, onTabChange }) {
  return (
    <nav role="tablist" aria-label="Planetary body" className="tabset">
      {TAB_LIST.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`tab-pill ${isActive ? `active-${tab.id}` : ''}`}
          >
            <span className="dot" style={{ background: isActive ? DOT[tab.id] : 'rgba(255,255,255,0.25)' }} />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export default TabBar
