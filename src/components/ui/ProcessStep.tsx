import React, { useState, useEffect, useRef } from 'react';

interface ProcessStepData {
  number: number;
  title: string;
  description: string;
}

interface ProcessStepProps {
  steps: ProcessStepData[];
}

const ProcessStep: React.FC<ProcessStepProps> = ({ steps }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === activeStep) return;
    setActiveStep(stepNumber);
  };

  // Mobile: cerc mai mare (~360px) ca textul să fie vizibil; desktop 500px
  const dimensions = {
    size: isMobile ? 360 : 500,
    radius: isMobile ? 155 : 220,
    center: isMobile ? 180 : 250,
  };

  const totalSteps = steps.length;
  
  // Progress calculation: activeIndex / (steps - 1) to end exactly at active step
  // Step 1 (index 0) = 0%, Step 9 (index 8) = 100%
  const activeIndex = activeStep - 1;
  const progress = totalSteps > 1 ? (activeIndex / (totalSteps - 1)) * 100 : 0;
  
  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Calculate position for each step number on the circle
  const getStepPosition = (index: number) => {
    // Convert to 0-based index
    const stepIndex = index - 1;
    // Start from top (-90 degrees), distribute evenly
    const angle = (stepIndex * 360) / totalSteps - 90;
    const radian = (angle * Math.PI) / 180;
    const x = dimensions.center + dimensions.radius * Math.cos(radian);
    const y = dimensions.center + dimensions.radius * Math.sin(radian);
    return { x, y, angle };
  };

  const activeStepData = steps.find(s => s.number === activeStep) || steps[0];

  // Animation duration: 220-320ms, snappy easing
  const animationDuration = isMobile ? '220ms' : '280ms';
  const animationEasing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  return (
    <div ref={sectionRef} className="relative w-full flex items-center justify-center py-8 md:py-12">
      {/* Circle container + text overlay (text în mijlocul cercului pe toate ecranele) */}
      <div 
        ref={containerRef}
        className="relative w-full flex items-center justify-center"
        style={{
          maxWidth: `${dimensions.size}px`,
          height: `${dimensions.size}px`,
        }}
      >
        {/* SVG Circle Ring - Mobile & Desktop */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#40ffaa" />
              <stop offset="50%" stopColor="#4079ff" />
              <stop offset="100%" stopColor="#40ffaa" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation={isMobile ? "2" : "4"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background track circle - stroke cap "butt" */}
          <circle
            cx={dimensions.center}
            cy={dimensions.center}
            r={dimensions.radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={isMobile ? "1.5" : "2"}
            strokeLinecap="butt"
          />
          
          {/* Progress arc (animated) - stroke cap "round", reduced glow on mobile */}
          <circle
            cx={dimensions.center}
            cy={dimensions.center}
            r={dimensions.radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={isMobile ? "6" : "4"}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${dimensions.center} ${dimensions.center})`}
            style={{
              transition: `stroke-dashoffset ${animationDuration} ${animationEasing}`,
              filter: isMobile 
                ? 'drop-shadow(0 0 4px rgba(64, 255, 170, 0.3))' 
                : 'drop-shadow(0 0 8px rgba(64, 255, 170, 0.4))',
            }}
          />

          {/* Active step indicator dot on ring */}
          {steps.map((step) => {
            if (step.number !== activeStep) return null;
            const pos = getStepPosition(step.number);
            return (
              <g key={`indicator-${step.number}`}>
                {/* Glow ring - reduced on mobile */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isMobile ? "12" : "16"}
                  fill="rgba(64, 255, 170, 0.2)"
                  style={{
                    animation: 'pulse-ring 2s ease-in-out infinite',
                  }}
                />
                {/* Active dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isMobile ? "6" : "8"}
                  fill="#40ffaa"
                  filter="url(#glow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Clickable step number buttons - 44x44px hit area with smaller visual dot */}
        {steps.map((step) => {
          const pos = getStepPosition(step.number);
          const isActive = activeStep === step.number;
          const isCompleted = activeStep > step.number;
          
          // Tap target: 44x44px hit area (mobile accessibility)
          const hitAreaSize = 44;
          // Visual dot size: 20-28px (smaller visual, larger hit area)
          const visualDotSize = isMobile ? 20 : 28;
          
          return (
            <button
              key={step.number}
              type="button"
              onClick={() => handleStepClick(step.number)}
              className={`
                absolute rounded-full font-bold text-xs md:text-sm
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-black
                flex items-center justify-center
                ${isActive 
                  ? 'bg-gradient-to-br from-[#40ffaa] to-[#4079ff] text-black scale-105 shadow-lg shadow-[#40ffaa]/50' 
                  : isCompleted
                  ? 'bg-[#40ffaa]/20 text-[#40ffaa] border-2 border-[#40ffaa]/50'
                  : 'bg-white/10 text-white/80 border-2 border-white/20 hover:bg-white/20 hover:border-white/40'
                }
              `}
              style={{
                width: `${hitAreaSize}px`,
                height: `${hitAreaSize}px`,
                left: `calc(${(pos.x / dimensions.size) * 100}% - ${hitAreaSize / 2}px)`,
                top: `calc(${(pos.y / dimensions.size) * 100}% - ${hitAreaSize / 2}px)`,
                zIndex: isActive ? 10 : 1,
              }}
              aria-label={`Pas ${step.number}: ${step.title}`}
              aria-pressed={isActive}
            >
              {/* Visual dot inside hit area */}
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: `${visualDotSize}px`,
                  height: `${visualDotSize}px`,
                }}
              >
                {isCompleted && !isActive ? (
                  <span className="text-sm md:text-base">✓</span>
                ) : (
                  <span>{step.number}</span>
                )}
              </span>
            </button>
          );
        })}

        {/* Text content - în mijlocul cercului (mobile + desktop) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
            transition: `opacity ${animationDuration} ${animationEasing}, transform ${animationDuration} ${animationEasing}`,
          }}
        >
          <div 
            className="text-center w-full max-w-[85%] md:max-w-md px-4 md:px-8"
            style={{
              minHeight: isMobile ? '100px' : '120px',
            }}
          >
            <div 
              className="mb-3 text-xs md:text-sm font-semibold text-[#40ffaa] uppercase tracking-wider"
              style={{
                transition: `opacity ${animationDuration} ${animationEasing}`,
              }}
            >
              Pas {activeStep}
            </div>
            <h3
              className="text-lg md:text-2xl font-bold mb-3 text-white"
              style={{
                color: '#40ffaa',
                textShadow: '0 0 20px rgba(64, 255, 170, 0.3)',
                transition: `opacity ${animationDuration} ${animationEasing}`,
              }}
            >
              {activeStepData.title}
            </h3>
            <p 
              className="text-white/70 text-sm md:text-base leading-relaxed line-clamp-3"
              style={{
                transition: `opacity ${animationDuration} ${animationEasing}`,
              }}
            >
              {activeStepData.description}
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse-ring {
            0%, 100% {
              opacity: 0.2;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.4);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation: none !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default ProcessStep;
