import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberCardProps {
  title: string;
  initialValue?: number;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  delay?: number;
  className?: string;
}

const AnimatedNumberCard: React.FC<AnimatedNumberCardProps> = ({
  title,
  initialValue,
  value,
  suffix = '',
  prefix = '',
  color = 'rgba(64, 255, 170, 1)',
  delay = 0,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayInitialValue, setDisplayInitialValue] = useState(initialValue ?? 0);
  const [displayValue, setDisplayValue] = useState(initialValue ?? 0);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now() + delay;
    const duration = 2000; // 2 seconds
    const startValue = initialValue ?? 0;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(1, elapsed / duration);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, value, initialValue, delay]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Glassmorphism shine effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.8s ease-out`,
          transitionDelay: `${delay + 200}ms`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <h4
          className="text-white/70 text-sm font-semibold mb-4 uppercase tracking-wider"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            transitionDelay: `${delay + 100}ms`,
          }}
        >
          {title}
        </h4>
        
        <div className="flex items-baseline gap-3 mb-2">
          {/* Initial value */}
          {initialValue !== undefined && initialValue !== null && (
            <div
              className="text-2xl md:text-3xl font-semibold text-white/50"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: `${delay + 200}ms`,
              }}
            >
              {prefix}
              {initialValue.toLocaleString()}
            </div>
          )}
          
          {/* Arrow */}
          {initialValue !== undefined && initialValue !== null && (
            <div
              className="text-2xl md:text-3xl font-bold"
              style={{
                color: color,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: `${delay + 400}ms`,
              }}
            >
              →
            </div>
          )}
          
          {/* Final value */}
          <div
            className="text-4xl md:text-5xl font-bold text-white"
            style={{
              color: color,
              textShadow: `0 0 20px ${color}40, 0 0 40px ${color}20`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              transitionDelay: `${delay + 300}ms`,
            }}
          >
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </div>
        </div>

        {/* Decorative accent line */}
        <div
          className="h-1 rounded-full mt-4"
          style={{
            background: `linear-gradient(90deg, ${color}, transparent)`,
            width: isVisible ? '60px' : '0px',
            opacity: isVisible ? 1 : 0,
            transition: 'width 0.8s ease-out, opacity 0.8s ease-out',
            transitionDelay: `${delay + 400}ms`,
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedNumberCard;
