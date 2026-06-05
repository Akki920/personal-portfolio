import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });

    // Eyebrow
    tl.from(eyebrowRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
    });

    // Headline words — sharp, dramatic entrance
    const words = headlineRef.current?.querySelectorAll('.word');
    if (words) {
      tl.from(
        words,
        {
          y: 60,
          opacity: 0,
          rotateX: 45,
          duration: 1.2,
          stagger: 0.12,
          ease: 'power4.out',
        },
        '-=0.5'
      );
    }

    // Subheadline
    tl.from(
      subRef.current,
      {
        y: 30,
        opacity: 0,
        duration: 1.0,
        ease: 'power4.out',
      },
      '-=0.7'
    );

    // CTAs
    tl.from(
      ctaRef.current,
      {
        y: 25,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power4.out',
      },
      '-=0.6'
    );
  }, { scope: sectionRef });

  const handleWorkClick = () => {
    const el = document.querySelector('#work');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Dark vignette overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10, 10, 15, 0.7) 0%, rgba(10, 10, 15, 0.3) 50%, transparent 100%)',
          zIndex: 2,
        }}
      />

      {/* Glowing orb behind text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 3,
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <span
          ref={eyebrowRef}
          className="text-label text-neon-violet tracking-[0.2em] mb-8 block normal-case text-sm md:text-base"
        >
          Akshit Joshi | AI/ML Engineer
        </span>

        <h1
          ref={headlineRef}
          className="text-display"
          style={{
            textShadow: `
              0 0 40px rgba(139, 92, 246, 0.4),
              0 0 80px rgba(139, 92, 246, 0.2),
              0 0 120px rgba(139, 92, 246, 0.1),
              0 4px 20px rgba(0, 0, 0, 0.8)
            `,
            perspective: '1000px',
          }}
        >
          <span className="word inline-block text-gradient-purple">ENGINEERING</span>{' '}
          <span className="word inline-block" style={{ color: '#ffffff' }}>INTELLIGENCE</span>
        </h1>

        <p
          ref={subRef}
          className="mt-8 text-lg md:text-xl max-w-2xl mx-auto"
          style={{
            color: 'rgba(255, 255, 255, 0.55)',
            lineHeight: 1.7,
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          Building production AI systems that see, understand, and reason.
          Computer vision, LLMs, VLMs — from research to deployment.
        </p>

        <div ref={ctaRef} className="mt-12 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleWorkClick}
            className="btn-classic-filled text-cta"
          >
            VIEW MY WORK
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span
          className="text-label tracking-[0.2em]"
          style={{ color: 'rgba(167, 139, 250, 0.6)', fontSize: '10px' }}
        >
          SCROLL TO DIVE
        </span>
        <ChevronDown
          className="w-5 h-5 animate-bounce"
          style={{ color: 'rgba(167, 139, 250, 0.6)' }}
        />
      </div>

      {/* System labels */}
      <div className="absolute top-24 left-6 md:left-12 z-10">
        <span
          className="text-label tracking-widest"
          style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '10px' }}
        >
          // SYSTEM.ACTIVE
        </span>
      </div>
      <div className="absolute top-24 right-6 md:right-12 z-10">
        <span
          className="text-label tracking-widest"
          style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '10px' }}
        >
          DATA_PIPELINE_VORTEX
        </span>
      </div>

      {/* Crosshair center dot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
        style={{
          zIndex: 5,
          background: '#8b5cf6',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.4)',
        }}
      />

      {/* Corner crosshair markers */}
      <div className="absolute top-20 left-8 w-6 h-6 border-l border-t border-white/10 z-10" />
      <div className="absolute top-20 right-8 w-6 h-6 border-r border-t border-white/10 z-10" />
      <div className="absolute bottom-20 left-8 w-6 h-6 border-l border-b border-white/10 z-10" />
      <div className="absolute bottom-20 right-8 w-6 h-6 border-r border-b border-white/10 z-10" />
    </section>
  );
}
