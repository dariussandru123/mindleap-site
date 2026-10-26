import React, { useState, useEffect } from 'react';
import {
  getPreferences,
  savePreferences,
  type CookiePreferences,
  COOKIE_CATEGORIES,
  type CookieCategory,
} from '@/lib/cookieConsent';

const CookiePreferencesManager: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(getPreferences());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPreferences(getPreferences());
  }, []);

  const toggleCategory = (category: CookieCategory) => {
    if (category === 'necessary') return; // Cannot disable necessary
    
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    savePreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      performance: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      performance: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyNecessary);
    savePreferences(onlyNecessary);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAcceptAll}
          className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-black bg-[#40ffaa] hover:bg-[#40ffaa]/90 focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black"
        >
          Acceptă toate
        </button>
        <button
          onClick={handleRejectAll}
          className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border border-white/20 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black"
        >
          Refuză toate opționale
        </button>
      </div>

      {/* Cookie Categories */}
      <div className="space-y-4">
        {Object.values(COOKIE_CATEGORIES).map((category) => {
          const isEnabled = preferences[category.id];
          const isRequired = category.required;

          return (
            <div
              key={category.id}
              className="relative overflow-hidden rounded-xl border border-white/10 p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-white">
                      {category.name}
                    </h3>
                    {isRequired && (
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-white/10 text-white/80">
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
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black ${
                      isEnabled
                        ? 'bg-[#40ffaa]'
                        : 'bg-white/20'
                    } ${isRequired ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    aria-label={`${isEnabled ? 'Dezactivează' : 'Activează'} ${category.name}`}
                    aria-pressed={isEnabled}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
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

      {/* Save Button */}
      <div className="pt-6 border-t border-white/10">
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 text-black bg-[#40ffaa] hover:bg-[#40ffaa]/90 focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved ? '✓ Preferințe salvate!' : 'Salvează preferințele'}
        </button>
      </div>
    </div>
  );
};

export default CookiePreferencesManager;
