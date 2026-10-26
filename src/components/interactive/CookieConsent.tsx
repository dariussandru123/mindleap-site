import React, { useState, useEffect } from 'react';
import {
  hasConsent,
  acceptAll,
  rejectAll,
  getPreferences,
  savePreferences,
  type CookiePreferences,
  COOKIE_CATEGORIES,
  type CookieCategory,
} from '@/lib/cookieConsent';

interface CookieConsentProps {
  onPreferencesChange?: (preferences: CookiePreferences) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onPreferencesChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(getPreferences());

  useEffect(() => {
    // Show banner if consent hasn't been given
    if (!hasConsent()) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom event to open cookie settings
  useEffect(() => {
    const handleOpenCookieSettings = () => {
      setIsVisible(true);
      setShowCustomize(true);
    };

    window.addEventListener('openCookieSettings', handleOpenCookieSettings);
    return () => {
      window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    const newPrefs = getPreferences();
    setPreferences(newPrefs);
    setIsVisible(false);
    setShowCustomize(false);
    onPreferencesChange?.(newPrefs);
  };

  const handleRejectAll = () => {
    rejectAll();
    const newPrefs = getPreferences();
    setPreferences(newPrefs);
    setIsVisible(false);
    setShowCustomize(false);
    onPreferencesChange?.(newPrefs);
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
    setIsVisible(false);
    setShowCustomize(false);
    onPreferencesChange?.(preferences);
  };

  const toggleCategory = (category: CookieCategory) => {
    if (category === 'necessary') return; // Cannot disable necessary
    
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop with glassmorphism */}
      <div
        className="fixed inset-0 z-[9998] transition-opacity duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        onClick={() => !showCustomize && setIsVisible(false)}
      />

      {/* Cookie Banner */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-modal="true"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative rounded-2xl border border-white/10 p-6 md:p-8"
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              boxShadow: 
                '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
              transform: 'translateZ(0)',
              willChange: 'transform, backdrop-filter',
            }}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none opacity-60" />

            <div className="relative z-10">
              {!showCustomize ? (
                // Main banner view
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <h2
                      id="cookie-consent-title"
                      className="text-xl md:text-2xl font-bold text-white mb-3"
                    >
                      Utilizăm cookie-uri
                    </h2>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                      Utilizăm cookie-uri pentru a îmbunătăți experiența ta, a analiza traficul site-ului și a personaliza conținutul. 
                      Poți alege ce tipuri de cookie-uri să acceptăm. 
                      <a
                        href="/legal/cookies"
                        className="text-[#40ffaa] hover:text-[#40ffaa]/80 underline ml-1 transition-colors"
                      >
                        Află mai multe
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                    <button
                      onClick={handleRejectAll}
                      className="cookie-button-secondary relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
                      aria-label="Refuză toate cookie-urile opționale"
                    >
                      <span className="relative z-10">Refuză toate</span>
                    </button>
                    <button
                      onClick={handleCustomize}
                      className="cookie-button-secondary relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
                      aria-label="Personalizează preferințele cookie-uri"
                    >
                      <span className="relative z-10">Personalizează</span>
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="cookie-button-primary relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
                      aria-label="Acceptă toate cookie-urile"
                    >
                      <span className="relative z-10">Acceptă toate</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Customize view
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Personalizează preferințele cookie-uri
                    </h2>
                    <p className="text-white/70 text-sm md:text-base">
                      Selectează ce tipuri de cookie-uri vrei să acceptăm. Cookie-urile necesare nu pot fi dezactivate.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.values(COOKIE_CATEGORIES).map((category) => {
                      const isEnabled = preferences[category.id];
                      const isRequired = category.required;

                      return (
                        <div
                          key={category.id}
                          className="relative overflow-hidden rounded-xl border border-white/10 p-4"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 16px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {/* Decorative gradient for card */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none opacity-50" />
                          <div className="relative z-10 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {category.name}
                                </h3>
                                {isRequired && (
                                  <span 
                                    className="px-2 py-1 text-xs font-medium rounded-md text-white/80"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      backdropFilter: 'blur(10px)',
                                      WebkitBackdropFilter: 'blur(10px)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                  >
                                    Necesar
                                  </span>
                                )}
                              </div>
                              <p className="text-white/60 text-sm leading-relaxed">
                                {category.description}
                              </p>
                            </div>

                            {/* Toggle Switch */}
                            <div className="flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => !isRequired && toggleCategory(category.id)}
                                disabled={isRequired}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black ${
                                  isEnabled
                                    ? 'bg-[#40ffaa]'
                                    : 'bg-white/20'
                                } ${isRequired ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                aria-label={`${isEnabled ? 'Dezactivează' : 'Activează'} ${category.name}`}
                                aria-pressed={isEnabled}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setShowCustomize(false)}
                      className="cookie-button-secondary relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
                    >
                      <span className="relative z-10">Înapoi</span>
                    </button>
                    <button
                      onClick={handleSaveCustom}
                      className="cookie-button-primary relative flex-1 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
                    >
                      <span className="relative z-10">Salvează preferințele</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Liquid Glass Button - Secondary (white/transparent) */
          .cookie-button-secondary {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
            box-shadow: 
              0 4px 16px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            transform: translateZ(0);
            will-change: transform, backdrop-filter;
          }

          .cookie-button-secondary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 50%;
            border-radius: 9999px 9999px 0 0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
            pointer-events: none;
            z-index: 0;
            opacity: 0.4;
            transition: opacity 0.3s ease;
          }

          .cookie-button-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
            box-shadow: 
              0 8px 24px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.15);
          }

          .cookie-button-secondary:hover::before {
            opacity: 0.6;
          }

          .cookie-button-secondary:active {
            transform: translateY(0);
            box-shadow: 
              0 2px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          }

          /* Liquid Glass Button - Primary (green) */
          .cookie-button-primary {
            background: rgba(64, 255, 170, 0.35);
            backdrop-filter: blur(20px) saturate(200%);
            -webkit-backdrop-filter: blur(20px) saturate(200%);
            border: 1px solid rgba(64, 255, 170, 0.5);
            border-radius: 9999px;
            box-shadow: 
              0 4px 16px rgba(64, 255, 170, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            transform: translateZ(0);
            will-change: transform, backdrop-filter;
          }

          .cookie-button-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 50%;
            border-radius: 9999px 9999px 0 0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(64, 255, 170, 0.3));
            pointer-events: none;
            z-index: 0;
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }

          .cookie-button-primary:hover {
            background: rgba(64, 255, 170, 0.45);
            border-color: rgba(64, 255, 170, 0.6);
            transform: translateY(-1px);
            box-shadow: 
              0 8px 24px rgba(64, 255, 170, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 0 rgba(0, 0, 0, 0.15);
          }

          .cookie-button-primary:hover::before {
            opacity: 0.9;
          }

          .cookie-button-primary:active {
            transform: translateY(0);
            box-shadow: 
              0 2px 8px rgba(64, 255, 170, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          }

          @media (prefers-reduced-motion: reduce) {
            .cookie-button-secondary,
            .cookie-button-primary {
              transition: none;
            }
            
            .cookie-button-secondary:hover,
            .cookie-button-primary:hover {
              transform: none;
            }
          }
        `
      }} />
    </>
  );
};

export default CookieConsent;
