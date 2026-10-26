import React, { useState, useEffect, useRef } from 'react';
import SpotlightCard from './SpotlightCard';
import TestimonialModal from './TestimonialModal';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  autoPlay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const slideWidth = isMobile ? 100 : 100 / 3;
  const maxIndex = isMobile ? testimonials.length - 1 : Math.max(0, testimonials.length - 3);

  useEffect(() => {
    if (isPlaying && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (isMobile) {
            return (prev + 1) % testimonials.length;
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
  }, [isPlaying, interval, testimonials.length, isMobile, maxIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (isMobile) {
        return (prev - 1 + testimonials.length) % testimonials.length;
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
        return (prev + 1) % testimonials.length;
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
      <div className="relative overflow-hidden rounded-2xl md:py-2">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * slideWidth}%)`
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className={`flex-shrink-0 px-10 md:px-4 ${isMobile ? 'w-full' : 'w-1/3'}`}>
              <SpotlightCard 
                spotlightColor="rgba(64, 255, 170, 0.2)"
                className="h-full flex flex-col"
              >
                <blockquote className="mb-4 flex-1 overflow-hidden">
                  <p className="text-white/90 italic text-sm md:text-base leading-relaxed line-clamp-6 md:line-clamp-8">
                    "{testimonial.content}"
                  </p>
                </blockquote>
                <div className="flex items-start justify-between gap-4 mt-4 flex-shrink-0">
                  <div className="flex-1">
                    <cite className="not-italic font-semibold block text-white text-base md:text-lg">
                      {testimonial.author}
                    </cite>
                    <p className="text-white/70 text-sm md:text-base">
                      {testimonial.role}{testimonial.role && testimonial.company ? ', ' : ''}{testimonial.company}
                    </p>
                  </div>
                  <div 
                    className="flex text-yellow-400 text-base md:text-lg flex-shrink-0" 
                    aria-label={`${testimonial.rating} din 5 stele`}
                  >
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} aria-hidden="true">★</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0 min-h-[24px]">
                  {testimonial.content.length > 200 && (
                    <button
                      onClick={() => {
                        setSelectedTestimonial(testimonial);
                        setIsModalOpen(true);
                      }}
                      className="text-sm text-[#40ffaa] hover:text-[#40ffaa]/80 transition-colors font-medium"
                    >
                      Vezi mai mult →
                    </button>
                  )}
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {testimonials.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {testimonials.map((_, index) => {
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
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full backdrop-blur-sm border transition-all duration-300 flex items-center justify-center z-10 shadow-lg ${
              isMobile ? '-left-2' : '-left-14'
            } bg-black/60 border-white/30 hover:bg-black/80 hover:border-white/50`}
            aria-label="Previous slide"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6 text-white"
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
            className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full backdrop-blur-sm border transition-all duration-300 flex items-center justify-center z-10 shadow-lg ${
              isMobile ? '-right-2' : '-right-14'
            } bg-black/60 border-white/30 hover:bg-black/80 hover:border-white/50`}
            aria-label="Next slide"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6 text-white"
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

      {/* Modal */}
      <TestimonialModal
        testimonial={selectedTestimonial}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default TestimonialsCarousel;
