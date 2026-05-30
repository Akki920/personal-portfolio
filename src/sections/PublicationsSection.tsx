import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';

const publications = [
  {
    title: 'GeoVigilance Labs: An AI-Enabled System for Automated Land Use Monitoring',
    venue: 'SPRINGER, JUN 2025',
    description:
      'An AI system for detecting unauthorized land use changes through data acquisition, real-time monitoring, and notification support for authorities.',
    link: 'https://link.springer.com/article/10.1007/s42979-025-04089-9',
  },
  {
    title: 'Object Extraction and Detection Using U2-Net and YOLOv7',
    venue: 'IJRITCC, JAN 2024',
    description:
      'Academic project exploring combined architecture of U2-Net for salient object detection and YOLOv7 for real-time object detection.',
    link: 'https://ijritcc.org/index.php/ijritcc/article/view/8015',
  },
];

export function PublicationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.publication-card');

    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      id="publications"
      ref={sectionRef}
      className="section-padding relative"
      style={{ zIndex: 2, background: 'linear-gradient(180deg, #030305 0%, #0a0a0f 100%)' }}
    >
      {/* Subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 30% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10">
        <div className="max-w-3xl mx-auto">
          <SectionHeader eyebrow="RESEARCH OUTPUT" title="PUBLICATIONS" centered />

          <div className="mt-12 flex flex-col">
            {publications.map((pub) => (
              <div
                key={pub.title}
                className="publication-card group py-8 flex gap-6 border-b"
                style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                {/* Accent line */}
                <div
                  className="flex-shrink-0 w-1 rounded-full self-start mt-1 transition-all duration-500 group-hover:h-16 h-12"
                  style={{
                    background: 'linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%)',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                  }}
                />

                {/* Content */}
                <div className="flex-1">
                  <span className="text-label text-neon-violet tracking-widest">{pub.venue}</span>
                  <h3 className="mt-2 text-section-h3" style={{ fontSize: '20px', lineHeight: 1.3 }}>
                    {pub.title}
                  </h3>
                  <p className="mt-3" style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.55)' }}>
                    {pub.description}
                  </p>
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-4 text-neon-violet hover:text-white transition-colors text-sm font-medium group/link"
                  >
                    READ PAPER
                    <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
