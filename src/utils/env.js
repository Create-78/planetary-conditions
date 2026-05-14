// Typed accessor for build-time env vars.
// Never hardcode API keys — always read through this module.
// See Discussion.md §3 Environment Variables.

export const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
