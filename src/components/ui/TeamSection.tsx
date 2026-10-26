import React, { useEffect, useRef, useState } from 'react';

interface TeamMember {
  name: string;
  role: string;
  icon: string;
  photo: string;
}

interface TeamSectionProps {
  members?: TeamMember[];
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { name: 'Vlăduț', role: 'Content creator', icon: 'ti-video', photo: '/echipa/vladut.webp' },
  { name: 'David', role: 'Ads', icon: 'ti-ad-2', photo: '/echipa/david.webp' },
  { name: 'Darius', role: 'Web development', icon: 'ti-code', photo: '/echipa/darius.webp' },
  { name: 'Bianca', role: 'Graphic design', icon: 'ti-palette', photo: '/echipa/bianca.webp' },
];

const GLASS = 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))';
const GLASS_ACTIVE = 'linear-gradient(135deg, rgba(64,255,170,0.16), rgba(255,255,255,0.04))';

const TeamCard: React.FC<{ member: TeamMember; index: number; isMobile: boolean }> = ({
  member,
  index,
  isMobile,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = isMobile ? (index % 2) * 90 : index * 90;
            setTimeout(() => setVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, isMobile]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current || !innerRef.current || !avatarRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    innerRef.current.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    innerRef.current.style.borderColor = 'rgba(64,255,170,0.5)';
    innerRef.current.style.boxShadow = '0 16px 32px rgba(0,0,0,0.3), 0 0 24px rgba(64,255,170,0.15)';

    const ax = (x - cx) * 0.18;
    const ay = (y - cy) * 0.18;
    avatarRef.current.style.transform = `translate(${ax}px, ${ay}px)`;
  };

  const handleMouseLeave = () => {
    if (isMobile || !innerRef.current || !avatarRef.current) return;
    innerRef.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    innerRef.current.style.borderColor = 'rgba(255,255,255,0.14)';
    innerRef.current.style.boxShadow = 'none';
    avatarRef.current.style.transform = 'translate(0px, 0px)';
  };

  const handleTouchStart = () => {
    if (!isMobile || !innerRef.current) return;
    innerRef.current.style.transform = 'scale(0.97)';
    innerRef.current.style.borderColor = 'rgba(64,255,170,0.5)';
    innerRef.current.style.boxShadow = '0 0 16px rgba(64,255,170,0.18)';
  };

  const handleTouchEnd = () => {
    if (!isMobile || !innerRef.current) return;
    innerRef.current.style.transform = 'scale(1)';
    setTimeout(() => {
      if (!innerRef.current) return;
      innerRef.current.style.borderColor = 'rgba(255,255,255,0.14)';
      innerRef.current.style.boxShadow = 'none';
    }, 200);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'pointer',
      }}
    >
      <div
        ref={innerRef}
        style={{
          background: GLASS,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '0.5px solid rgba(255,255,255,0.14)',
          borderRadius: isMobile ? 14 : 16,
          padding: isMobile ? '18px 14px' : '24px 18px',
          textAlign: 'center',
          transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          ref={avatarRef}
          style={{
            width: isMobile ? 52 : 56,
            height: isMobile ? 52 : 56,
            margin: isMobile ? '0 auto 10px' : '0 auto 14px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: GLASS_ACTIVE,
            border: '0.5px solid rgba(64,255,170,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {!imgError && (
            <img
              src={member.photo}
              alt={`${member.name}, ${member.role}`}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                inset: 0,
              }}
            />
          )}
          <i
            className={`ti ${member.icon}`}
            style={{ fontSize: isMobile ? 22 : 24, color: '#40ffaa', position: 'relative', zIndex: 0 }}
            aria-hidden="true"
          />
        </div>
        <h3
          style={{
            fontSize: isMobile ? 13.5 : 15,
            fontWeight: 600,
            color: '#F5F7FA',
            margin: '0 0 4px',
          }}
        >
          {member.name}
        </h3>
        <p style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.4 }}>
          {member.role}
        </p>
      </div>
    </div>
  );
};

const TeamSection: React.FC<TeamSectionProps> = ({ members }) => {
  const team = members && members.length > 0 ? members : DEFAULT_MEMBERS;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
        gap: isMobile ? 12 : 18,
      }}
    >
      {team.map((member, i) => (
        <TeamCard key={member.name} member={member} index={i} isMobile={isMobile} />
      ))}
    </div>
  );
};

export default TeamSection;
