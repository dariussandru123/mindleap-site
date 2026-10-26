/**
 * Cookie Consent Management System
 * GDPR compliant, Google Tag Manager v2 ready
 */

export type CookieCategory = 'necessary' | 'performance' | 'marketing' | 'functional';

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  performance: boolean;
  marketing: boolean;
  functional: boolean;
}

export const COOKIE_CATEGORIES: Record<CookieCategory, { 
  id: CookieCategory; 
  name: string; 
  description: string;
  required: boolean;
}> = {
  necessary: {
    id: 'necessary',
    name: 'Necesare / Securitate',
    description: 'Cookie-urile necesare sunt esențiale pentru funcționarea site-ului și nu pot fi dezactivate. Acestea includ cookie-uri de securitate, sesiune și autentificare.',
    required: true,
  },
  performance: {
    id: 'performance',
    name: 'Performanță / Analitică',
    description: 'Cookie-urile de performanță ne ajută să înțelegem cum vizitatorii interacționează cu site-ul, colectând informații despre paginile vizitate, timpul petrecut și eventualele erori întâlnite.',
    required: false,
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing / Publicitate',
    description: 'Cookie-urile de marketing sunt folosite pentru a urmări vizitatorii pe site-uri diferite pentru a afișa reclame relevante și personalizate.',
    required: false,
  },
  functional: {
    id: 'functional',
    name: 'Funcționale',
    description: 'Cookie-urile funcționale permit site-ului să-și amintească alegerile făcute de utilizator (precum numele de utilizator, limba sau regiunea) pentru a oferi funcționalități îmbunătățite și personalizate.',
    required: false,
  },
};

const STORAGE_KEY = 'mindleap_cookie_consent';
const CONSENT_VERSION = '2.0';

export interface StoredConsent {
  preferences: CookiePreferences;
  timestamp: number;
  version: string;
}

/**
 * Get default cookie preferences (only necessary enabled)
 */
export function getDefaultPreferences(): CookiePreferences {
  return {
    necessary: true,
    performance: false,
    marketing: false,
    functional: false,
  };
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  
  try {
    const consent: StoredConsent = JSON.parse(stored);
    return consent.preferences !== undefined && consent.timestamp !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get current cookie preferences
 */
export function getPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return getDefaultPreferences();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultPreferences();
  
  try {
    const consent: StoredConsent = JSON.parse(stored);
    return consent.preferences || getDefaultPreferences();
  } catch {
    return getDefaultPreferences();
  }
}

/**
 * Save cookie preferences
 */
export function savePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  const consent: StoredConsent = {
    preferences: {
      ...preferences,
      necessary: true, // Always enforce necessary cookies
    },
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  
  // Push consent update to GTM dataLayer
  updateGTMConsent(consent.preferences);
}

/**
 * Update GTM dataLayer with consent preferences
 */
export function updateGTMConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  // Ensure dataLayer exists
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  // Push consent update event to GTM
  window.dataLayer.push({
    event: 'cookie_consent_update',
    cookie_consent: {
      necessary: preferences.necessary,
      performance: preferences.performance,
      marketing: preferences.marketing,
      functional: preferences.functional,
    },
  });
  
  // Also push individual category events for GTM triggers
  if (preferences.performance) {
    window.dataLayer.push({ event: 'cookie_consent_performance' });
  }
  if (preferences.marketing) {
    window.dataLayer.push({ event: 'cookie_consent_marketing' });
  }
  if (preferences.functional) {
    window.dataLayer.push({ event: 'cookie_consent_functional' });
  }
}

/**
 * Accept all cookies
 */
export function acceptAll(): void {
  savePreferences({
    necessary: true,
    performance: true,
    marketing: true,
    functional: true,
  });
}

/**
 * Reject all optional cookies (keep only necessary)
 */
export function rejectAll(): void {
  savePreferences({
    necessary: true,
    performance: false,
    marketing: false,
    functional: false,
  });
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer?: any[];
    addEventListener(type: 'openCookieSettings', listener: (event: CustomEvent) => void): void;
    removeEventListener(type: 'openCookieSettings', listener: (event: CustomEvent) => void): void;
    dispatchEvent(event: CustomEvent): boolean;
  }
}
