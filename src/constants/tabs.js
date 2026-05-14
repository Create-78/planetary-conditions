// Tab identifiers and palette keys.
// App.jsx and TabBar.jsx both import from here so the wiring stays consistent.

export const TABS = {
  MARS: {
    id: 'mars',
    label: 'Mars',
    paletteKey: 'mars',
  },
  MOON: {
    id: 'moon',
    label: 'Moon',
    paletteKey: 'moon',
  },
}

export const TAB_LIST = [TABS.MARS, TABS.MOON]

export const DEFAULT_TAB = TABS.MARS.id
