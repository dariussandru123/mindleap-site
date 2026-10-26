import React, { useEffect, useRef, useState, useMemo } from 'react';

interface AnimatedChartProps {
  data: { label: string; value: number; color?: string }[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  showLabels?: boolean;
  animationDuration?: number;
  className?: string;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  type = 'bar',
  height = 300,
  showLabels = true,
  animationDuration = 1500,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);

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
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  const defaultColors = [
    'rgba(64, 255, 170, 1)',
    'rgba(64, 121, 255, 1)',
    'rgba(255, 170, 64, 1)',
    'rgba(147, 51, 234, 1)',
  ];

  if (type === 'bar') {
    return (
      <div 
        ref={chartRef} 
        className={`w-full relative ${className}`} 
        style={{ 
          height: `${height}px`,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '32px 24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-start justify-between h-full gap-10 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-white/40 text-xs font-medium pr-3" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
            {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>
          
          <div className="flex items-start justify-between h-full gap-10 flex-1 ml-14">
            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100;
              const color = item.color || defaultColors[index % defaultColors.length];
              const delay = index * 150;

              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
                  {/* Value label on top */}
                  {showLabels && isVisible && (
                    <div 
                      className="mb-4 text-white text-2xl font-bold"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: `opacity ${animationDuration}ms ease-out`,
                        transitionDelay: `${delay + 200}ms`,
                      }}
                    >
                      {item.value}
                    </div>
                  )}
                  
                  {/* Bar with glassmorphism */}
                  <div
                    className="w-full rounded-t-2xl relative overflow-hidden"
                    style={{
                      height: isVisible ? `${percentage}%` : '0%',
                      background: `linear-gradient(180deg, ${color} 0%, ${color.replace('1)', '0.85)')} 50%, ${color.replace('1)', '0.7)')} 100%)`,
                      transition: `height ${animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                      transitionDelay: `${delay}ms`,
                      boxShadow: isVisible
                        ? `0 6px 20px ${color.replace('1)', '0.35)')}, inset 0 2px 0 rgba(255, 255, 255, 0.25)`
                        : 'none',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    {/* Glassmorphism shine effect */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/15 to-transparent"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: `opacity ${animationDuration}ms ease-out`,
                        transitionDelay: `${delay + 400}ms`,
                      }}
                    />
                  </div>
                  
                  {/* Label at bottom */}
                  {showLabels && (
                    <div className="mt-4 text-white/50 text-sm text-center font-medium">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'line') {
    // Calculate points from data - optimized, no excessive interpolation
    const points = React.useMemo(() => {
      return data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 100;
        return { x, y, ...item };
      });
    }, [data, maxValue]);

    // Create smooth path using cubic bezier curves - performance optimized
    const smoothPathD = React.useMemo(() => {
      if (points.length < 2) return '';
      if (points.length === 2) {
        return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
      }
      
      let path = `M ${points[0].x} ${points[0].y}`;
      
      // Use Catmull-Rom spline for smooth curves with minimal computation
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        
        // Calculate control points for cubic bezier
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      
      return path;
    }, [points]);

    const areaD = React.useMemo(() => `${smoothPathD} L 100 100 L 0 100 Z`, [smoothPathD]);
    const lineColor = React.useMemo(() => data[0]?.color || defaultColors[0], [data]);

    return (
      <div 
        ref={chartRef} 
        className={`w-full relative ${className}`} 
        style={{ 
          height: `${height}px`,
          background: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-white/50 text-sm font-semibold pr-4" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((val, idx) => (
            <span key={idx} className="text-right">{val.toLocaleString()}</span>
          ))}
        </div>
        
        <svg 
          className="w-full h-full ml-16" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          style={{ paddingTop: '40px', paddingBottom: '40px' }}
        >
          {/* Subtle grid lines */}
          {[0, 25, 50, 75, 100].map((yVal, idx) => (
            <line
              key={idx}
              x1="0"
              y1={yVal}
              x2="100"
              y2={yVal}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="0.3"
            />
          ))}
          
          {/* Area fill - single optimized layer */}
          <path
            d={areaD}
            fill="url(#lineGradient)"
            opacity={isVisible ? 0.5 : 0}
            style={{
              transition: `opacity ${animationDuration}ms ease-out`,
              willChange: 'opacity',
            }}
          />
          
          {/* Single glow layer - performance optimized */}
          <path
            d={smoothPathD}
            fill="none"
            stroke={lineColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isVisible ? 0.3 : 0}
            style={{
              transition: `opacity ${animationDuration}ms ease-out`,
              filter: 'blur(4px)',
              willChange: 'opacity',
            }}
          />
          
          {/* Main line - optimized rendering */}
          <path
            d={smoothPathD}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={isVisible ? '20000' : '0'}
            strokeDashoffset={isVisible ? '0' : '20000'}
            style={{
              transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
              filter: 'drop-shadow(0 0 8px rgba(64, 255, 170, 0.7))',
              willChange: 'stroke-dashoffset',
            }}
          />
          
          {/* Value labels - only show original data points, not interpolated */}
          {showLabels && isVisible && data.map((item, index) => {
            const point = points[index];
            const delay = index * 100 + 1000;
            return (
              <text
                key={index}
                x={point.x}
                y={point.y}
                dy="-20"
                textAnchor="middle"
                fill="white"
                fontSize="5"
                fontWeight="800"
                opacity={isVisible ? 1 : 0}
                style={{
                  transition: `opacity ${animationDuration}ms ease-out`,
                  transitionDelay: `${delay}ms`,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(64, 255, 170, 0.6)',
                  willChange: 'opacity',
                }}
              >
                {item.value.toLocaleString()}
              </text>
            );
          })}
          
          <defs>
            {/* Optimized gradient for area */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={lineColor.replace('1)', '0.7)')} />
              <stop offset="50%" stopColor={lineColor.replace('1)', '0.4)')} />
              <stop offset="100%" stopColor={lineColor.replace('1)', '0)')} />
            </linearGradient>
          </defs>
        </svg>
        {/* X-axis labels */}
        {showLabels && (
          <div className="absolute bottom-0 left-16 right-0 flex justify-between px-8" style={{ paddingBottom: '40px' }}>
            {data.map((item, index) => (
              <div key={index} className="text-white/50 text-sm text-center font-semibold">
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pie chart
  let currentAngle = -90;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div 
      ref={chartRef} 
      className={`w-full flex items-center justify-center ${className}`} 
      style={{ 
        height: `${height}px`,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      <svg width={height - 64} height={height - 64} viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 360;
          const color = item.color || defaultColors[index % defaultColors.length];
          const startAngle = currentAngle;
          const endAngle = currentAngle + percentage;
          currentAngle = endAngle;

          const startX = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
          const startY = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
          const endX = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
          const endY = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
          const largeArcFlag = percentage > 180 ? 1 : 0;

          const pathD = `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

          return (
            <path
              key={index}
              d={pathD}
              fill={color}
              opacity={isVisible ? 1 : 0}
              style={{
                transition: `opacity ${animationDuration}ms ease-out`,
                transitionDelay: `${index * 150}ms`,
              }}
            />
          );
        })}
      </svg>
      {showLabels && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white text-2xl font-bold">{total}</div>
          <div className="text-white/70 text-sm">Total</div>
        </div>
      )}
    </div>
  );
};

export default AnimatedChart;
