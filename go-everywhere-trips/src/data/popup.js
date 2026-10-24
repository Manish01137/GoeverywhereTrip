// Default welcome-popup settings. Admins override any of these in Admin → Popup
// (saved as settings.popup in the site content).
export const DEFAULT_POPUP = {
  enabled: true,
  delaySeconds: 12,
  frequency: 'every-visit', // 'every-visit' | 'every-days'
  everyDays: 3,
  stopAfterSubmit: false, // true = never show again to someone who already submitted
  hideOn: ['/custom-trip', '/contact'], // admin & payment pages are always excluded

  eyebrow: 'Customise your trip',
  title: 'Where do you want to go next?',
  subtitle: 'Share a few details — we’ll WhatsApp you a personalised plan. Free, no obligation.',
  buttonText: 'Get my free trip plan',
  footnote: 'We’ll only use your number to send your trip plan.',
  successTitle: 'Thanks! 🎉',
  successText: 'Our trip expert will WhatsApp you shortly with a plan made for you.',

  image: 'customTrips',
  sideTitle: 'Customise your',
  sideHighlight: 'dream trip',
  bullets: ['Free itinerary on WhatsApp in 24 hours', 'Planned by local Himalayan experts', 'No booking fees · no obligation'],

  askDestination: true,
  destinationMode: 'list', // 'list' = the destinations below | 'departures' = upcoming trip departures (automatic)
  destinations: ['Uttarakhand', 'Kedarnath / Char Dham', 'Himachal & Manali', 'Spiti Valley', 'Rishikesh weekend', 'Rajasthan', 'Andaman', 'Kashmir / Ladakh'],
  askMonth: true,
  askGroup: true,
  groups: ['Solo', '2 people', '3–5 people', '6–10 people', '10+ people'],
}

export const withPopupDefaults = (p = {}) => ({ ...DEFAULT_POPUP, ...p })
