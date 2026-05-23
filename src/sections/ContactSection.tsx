import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';

export function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const words = sectionRef.current.querySelectorAll('.contact-word');
    const cta = sectionRef.current.querySelector('.contact-cta');
    const sub = sectionRef.current.querySelector('.contact-sub');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });

    tl.from(words, {
      y: 40,
      opacity: 0,
      duration: 1.0,
      stagger: 0.06,
      ease: 'power4.out',
    });

    if (sub) {
      tl.from(sub, { y: 25, opacity: 0, duration: 0.8, ease: 'power4.out' }, '-=0.5');
    }

    if (cta) {
      tl.from(cta, { y: 25, opacity: 0, duration: 0.7, ease: 'power4.out' }, '-=0.4');
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-40 text-center flex flex-col items-center justify-center"
      style={{
        zIndex: 1,
        background: 'linear-gradient(180deg, #030305 0%, #0a0a0f 50%, #030305 100%)',
      }}
    >
      {/* Glowing orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '500px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <span className="text-label text-neon-violet tracking-[0.2em]">
          LET&apos;S BUILD SOMETHING
        </span>

        <h2
          className="text-display mt-4 neon-glow whitespace-nowrap"
          style={{ color: '#ffffff' }}
        >
          {'COLLABORATE'.split('').map((char, i) => (
            <span key={i} className="contact-word inline-block">
              {char}
            </span>
          ))}
        </h2>

        <p
          className="contact-sub mt-6 max-w-lg mx-auto"
          style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.45)' }}
        >
          Open to research collaborations, AI consulting, and engineering roles.
          Let&apos;s discuss how intelligence can transform your product.
        </p>

        <div className="contact-cta mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://www.linkedin.com/in/akshitjoshi920"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-button-filled text-cta"
          >
            CONNECT ON LINKEDIN
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
          >
            GITHUB
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
