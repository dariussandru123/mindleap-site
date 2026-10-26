import React, { useEffect } from 'react';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface TestimonialModalProps {
  testimonial: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({
  testimonial,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !testimonial) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/20 bg-black/90 backdrop-blur-md p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Închide"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="pr-8">
          <blockquote className="mb-6">
            <p className="text-white/90 italic text-base md:text-lg leading-relaxed">
              "{testimonial.content}"
            </p>
          </blockquote>
          <div className="flex items-start justify-between gap-4 pt-4 border-t border-white/20">
            <div className="flex-1">
              <cite className="not-italic font-semibold block text-white text-lg md:text-xl">
                {testimonial.author}
              </cite>
              <p className="text-white/70 text-base md:text-lg mt-1">
                {testimonial.role}{testimonial.role && testimonial.company ? ', ' : ''}{testimonial.company}
              </p>
            </div>
            <div 
              className="flex text-yellow-400 text-lg md:text-xl flex-shrink-0" 
              aria-label={`${testimonial.rating} din 5 stele`}
            >
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i} aria-hidden="true">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialModal;
