import React from 'react';

const CookieSettingsButton: React.FC = () => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Dispatch custom event to open cookie settings modal
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[100]">
        <button
          onClick={handleClick}
          className="cookie-settings-button relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#40ffaa]/50 focus:ring-offset-2 min-w-[48px] min-h-[48px] group"
          aria-label="Gestionează preferințele cookie-uri"
          title="Gestionează preferințele cookie-uri"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Cookie Icon */}
          <svg
            className="relative z-10 w-6 h-6 text-[#40ffaa] transition-transform duration-300 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          
          {/* Tooltip */}
          <span className="cookie-settings-tooltip absolute left-full ml-3 px-3 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Setări cookie-uri
          </span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Apple Liquid Glass style for cookie settings button */
          .cookie-settings-button {
            background: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(28px) saturate(200%);
            -webkit-backdrop-filter: blur(28px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
              0 12px 40px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2);
            transform: translateZ(0);
            will-change: transform, backdrop-filter;
          }

          .cookie-settings-button:hover {
            background: rgba(0, 0, 0, 0.45);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 
              0 16px 48px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.25);
          }

          .cookie-settings-button:active {
            transform: scale(0.95) translateZ(0);
            box-shadow: 
              0 8px 24px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          }

          /* Tooltip glassmorphism */
          .cookie-settings-tooltip {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          @media (prefers-reduced-motion: reduce) {
            .cookie-settings-button,
            .cookie-settings-button:hover,
            .cookie-settings-button:active {
              transform: none;
              transition: none;
            }
            
            .group:hover {
              transform: none;
            }
          }
        `
      }} />
    </>
  );
};

export default CookieSettingsButton;
