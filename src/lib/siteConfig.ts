/**
 * Centralized site configuration for Nexus
 * Contains public metadata, external links, and contact channels.
 */

export const siteConfig = {
  name: 'Nexus',
  tagline: 'Real-Time Communities, Voice & Chat',
  description:
    'A modern real-time community platform for teams, creators, and builders featuring low-latency chat, WebRTC voice and video spaces, and granular role permissions.',
  url: 'https://nexus-app-ashy-theta.vercel.app',
  
  // External links and resources
  links: {
    // Official GitHub repository
    github: 'https://github.com/krushnabankar31/nexus-app',
    
    // TODO: Replace with real Twitter/X profile URL once created
    twitter: '',
    
    // TODO: Replace with real Discord community URL if applicable
    discord: '',
    
    // Status page URL
    status: '/status',
  },

  // Contact emails
  contact: {
    // TODO: Replace with real support email address
    supportEmail: 'support@nexus.app',
    
    // TODO: Replace with real sales/partnerships email address
    salesEmail: 'contact@nexus.app',
  },

  // Roadmap & status flags
  features: {
    billingLive: false,
    customDomainsLive: false,
    mobileAppsLive: false,
    aiCopilotLive: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
