export const appleBusinessPresence = {
  id: 'apple-business',
  name: 'Apple Business',
  category: 'Digital Presence',
  status: 'guided-setup',
  setupUrl: 'https://business.apple.com/',
  summary:
    'Manage how CPR appears across Apple Maps, Mail, Wallet, Siri, Spotlight, and other Apple services.',
  value: [
    'A verified CPR brand and location presence across Apple services',
    'Direct actions for calling, visiting, registering, and learning more',
    'Consistent CPR contact details, imagery, hours, and destination links',
    'Visibility into how Apple customers discover and engage with CPR',
  ],
  setupChecklist: [
    'Sign in with a CPR-owned Apple Account',
    'Enter and verify CPR’s legal business information',
    'Add CPR’s physical location or service-area details',
    'Add the CPR logo, cover image, description, categories, and hours',
    'Confirm CPR’s phone number, email address, and website',
    'Connect registration, intake, and Learn More actions',
    'Review how CPR appears across Apple services',
    'Record the verification result in the CPR admin portal',
  ],
  supportedActions: ['Register', 'Learn More', 'Get Started', 'Call', 'Visit Website'],
  readinessChecks: [
    'Missing or inconsistent business information',
    'Outdated hours, images, offers, or destination links',
    'Verification and setup follow-up',
    'Apple partner and API readiness',
  ],
  automationNote:
    'Guided setup is available now. Automated synchronization remains disabled until Efficiency Architects receives Apple third-party partner and API approval.',
} as const;
