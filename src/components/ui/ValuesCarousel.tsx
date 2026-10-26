import React, { useState, useEffect, useRef } from 'react';
import SpotlightCard from './SpotlightCard';

interface Value {
  title: string;
  description: string;
  spotlightColor: string;
  icon?: string;
}

interface ValuesCarouselProps {
  values: Value[];
  autoPlay?: boolean;
  interval?: number;
}

const ValuesCarousel: React.FC<ValuesCarouselProps> = ({
  values,
  autoPlay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [cardsPerView, setCardsPerView] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width >= 1280) setCardsPerView(4);
      else if (width >= 768) setCardsPerView(3);
      else setCardsPerView(1);
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const isMobile = cardsPerView === 1;
  const slideWidth = 100 / cardsPerView;
  const maxIndex = Math.max(0, values.length - cardsPerView);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (isPlaying && values.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (isMobile) {
            return (prev + 1) % values.length;
          } else {
            return (prev + 1) % (maxIndex + 1);
          }
        });
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, interval, values.length, cardsPerView, maxIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (isMobile) {
        return (prev - 1 + values.length) % values.length;
      } else {
        return (prev - 1 + (maxIndex + 1)) % (maxIndex + 1);
      }
    });
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (isMobile) {
        return (prev + 1) % values.length;
      } else {
        return (prev + 1) % (maxIndex + 1);
      }
    });
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl md:py-1">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * slideWidth}%)`
          }}
        >
          {values.map((value, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2 md:px-2"
              style={{ width: `${slideWidth}%` }}
            >
              <SpotlightCard
                spotlightColor={value.spotlightColor}
                className="h-full !p-4 md:!p-5 rounded-xl"
              >
                {value.icon && (
                  <div
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(64,255,170,0.18), rgba(255,255,255,0.04))',
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      border: '0.5px solid rgba(64,255,170,0.4)',
                      boxShadow: '0 0 20px rgba(64,255,170,0.15), inset 0 1px 1px rgba(255,255,255,0.12)',
                    }}
                  >
                    <i className={`ti ${value.icon}`} style={{ fontSize: '18px', color: '#40ffaa' }} aria-hidden="true" />
                  </div>
                )}
                <h3 className="text-base sm:text-lg font-bold mb-2 leading-snug" style={{
                  background: 'linear-gradient(to right, #ffffff, #40ffaa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-4 md:line-clamp-5">
                  {value.description}
                </p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {values.length > cardsPerView && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {values.map((_, index) => {
            if (!isMobile && index > maxIndex) return null;
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/40 hover:bg-white/60 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Navigation Arrows */}
      {values.length > cardsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full backdrop-blur-sm border transition-all duration-300 flex items-center justify-center z-10 shadow-lg ${
              isMobile ? '-left-1' : '-left-10'
            } bg-black/60 border-white/30 hover:bg-black/80 hover:border-white/50`}
            aria-label="Previous slide"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full backdrop-blur-sm border transition-all duration-300 flex items-center justify-center z-10 shadow-lg ${
              isMobile ? '-right-1' : '-right-10'
            } bg-black/60 border-white/30 hover:bg-black/80 hover:border-white/50`}
            aria-label="Next slide"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default ValuesCarousel;
