import React, { useEffect, useRef, useState } from 'react';

export type BlogCarouselPost = {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  icon: string;
  published: boolean;
};

type BlogCarouselProps = {
  posts: BlogCarouselPost[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  interval?: number;
};

const BlogCarousel: React.FC<BlogCarouselProps> = ({
  posts,
  eyebrow = 'Blog',
  title = 'Alte articole',
  subtitle,
  autoPlay = true,
  interval = 6000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [cardsPerView, setCardsPerView] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width >= 1024) setCardsPerView(3);
      else if (width >= 640) setCardsPerView(2);
      else setCardsPerView(1);
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const isMobile = cardsPerView === 1;
  const slideWidth = 100 / cardsPerView;
  const maxIndex = Math.max(0, posts.length - cardsPerView);
  const canScroll = posts.length > cardsPerView;

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (isPlaying && canScroll) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (isMobile) return (prev + 1) % posts.length;
          return (prev + 1) % (maxIndex + 1);
        });
      }, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, interval, posts.length, isMobile, maxIndex, canScroll]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (isMobile) return (prev - 1 + posts.length) % posts.length;
      return (prev - 1 + (maxIndex + 1)) % (maxIndex + 1);
    });
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (isMobile) return (prev + 1) % posts.length;
      return (prev + 1) % (maxIndex + 1);
    });
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  if (posts.length === 0) return null;

  const renderCard = (post: BlogCarouselPost) => {
    const inner = (
      <>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="resurse-badge">Blog</span>
          <span className="text-xs text-white/45">{post.readTime}</span>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(64,255,170,0.18), rgba(255,255,255,0.04))',
            border: '0.5px solid rgba(64,255,170,0.35)',
          }}
        >
          <i className={`ti ${post.icon} text-primary-mint text-lg`} aria-hidden="true" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug group-hover:text-primary-mint transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-white/65 leading-relaxed mb-5 flex-grow">{post.excerpt}</p>
        {post.published ? (
          <span className="resurse-link">
            Citește ghidul
            <i className="ti ti-arrow-right text-base" aria-hidden="true" />
          </span>
        ) : (
          <span className="resurse-link resurse-link-soon">În curând</span>
        )}
      </>
    );

    if (post.published) {
      return (
        <a
          href={`/resurse/blog/${post.slug}`}
          className="resurse-card group h-full flex flex-col no-underline text-inherit"
        >
          {inner}
        </a>
      );
    }

    return <article className="resurse-card group h-full flex flex-col">{inner}</article>;
  };

  return (
    <div className="blog-carousel">
      <div className="blog-carousel-header">
        <div>
          <span className="blog-carousel-eyebrow">{eyebrow}</span>
          <h2 className="blog-carousel-title">{title}</h2>
          {subtitle && <p className="blog-carousel-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="relative w-full px-1 sm:px-8">
        <div className="relative overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * slideWidth}%)` }}
          >
            {posts.map((post) => (
              <div
                key={post.slug}
                className="flex-shrink-0 px-2"
                style={{ width: `${slideWidth}%` }}
              >
                {renderCard(post)}
              </div>
            ))}
          </div>
        </div>

        {canScroll && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className={`blog-carousel-nav ${isMobile ? 'blog-carousel-nav--inset' : 'blog-carousel-nav--left'}`}
              aria-label="Articol anterior"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              className={`blog-carousel-nav ${isMobile ? 'blog-carousel-nav--inset-right' : 'blog-carousel-nav--right'}`}
              aria-label="Articol următor"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {canScroll && (
        <div className="flex justify-center items-center gap-2 mt-5">
          {posts.map((post, index) => {
            if (!isMobile && index > maxIndex) return null;
            return (
              <button
                key={post.slug}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60 w-2'
                }`}
                aria-label={`Mergi la articolul ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlogCarousel;
