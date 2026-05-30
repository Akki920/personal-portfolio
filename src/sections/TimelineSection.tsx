import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '../components/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const timelineEntries = [
  {
    title: 'Junior AI/ML Engineer',
    org: 'WebOccult',
    date: 'JUN 2024 – PRESENT',
    location: 'GREATER AHMEDABAD, ONSITE',
    description:
      'Training and fine-tuning PaddleOCR, YOLO (detection/segmentation/classification), Google ViT, Facebook DINOv2. Orchestrating inference pipelines, VLM inferencing with Ollama, model quantization, system optimization for Jetson Orin Nano/NX, edge and AWS cloud deployment.',
    tags: ['PYTHON', 'TENSORFLOW', 'PYTORCH'],
    side: 'right' as const,
  },
  {
    title: 'Machine Learning Trainee',
    org: 'Kiraat Technology',
    date: 'AUG 2023 – MAY 2024',
    location: 'AHMEDABAD, HYBRID',
    description:
      'Document information extraction tool using Tesseract OCR. Researched latest LLMs. Data visualization with Apache Superset and Tableau.',
    tags: ['OCR', 'TABLEAU', 'SUPERSET'],
    side: 'left' as const,
  },
  {
    title: 'Software Engineer Trainee',
    org: 'Kiraat Technology',
    date: 'OCT 2021 – MAR 2022',
    location: 'AHMEDABAD, ONSITE',
    description:
      'Software engineering foundation. Android development with Java, building production mobile applications.',
    tags: ['JAVA', 'ANDROID', 'MOBILE'],
    side: 'right' as const,
  },
];

export function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const entries = sectionRef.current.querySelectorAll('.timeline-entry');
    const nodes = sectionRef.current.querySelectorAll('.timeline-node');

    entries.forEach((entry, i) => {
      const card = entry.querySelector('.timeline-card');
      const node = nodes[i];
      const side = timelineEntries[i].side;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: entry,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(node, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, 0);
      tl.to(node, { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', scale: 1.3, duration: 0.3, ease: 'power2.out' }, 0.1);

      if (card) {
        tl.fromTo(card, 
          { x: side === 'left' ? -50 : 50, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.7, ease: 'power4.out' }, 
          0.1
        );
      }
    });
  }, { scope: sectionRef });

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="section-padding relative"
      style={{ zIndex: 2, background: '#030305' }}
    >
      {/* Aurora */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 80% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10">
        <SectionHeader eyebrow="CAREER PATH" title="EXPERIENCE" centered />

        <div className="max-w-4xl mx-auto relative mt-16">
          {/* Central spine — liquid glass */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.3) 20%, rgba(139, 92, 246, 0.3) 80%, transparent 100%)' }}
          />

          <div className="flex flex-col gap-12 md:gap-16">
            {timelineEntries.map((entry, i) => (
              <div
                key={`${entry.title}-${i}`}
                className={`timeline-entry relative flex items-start ${entry.side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Node */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                  <div
                    className="timeline-node w-3.5 h-3.5 rounded-full"
                    style={{
                      background: '#0a0a0f',
                      border: '2px solid rgba(139, 92, 246, 0.5)',
                      boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
                    }}
                  />
                </div>

                {/* Card */}
                <div className={`ml-10 md:ml-0 md:w-5/12 ${entry.side === 'left' ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="timeline-card liquid-glass p-6">
                    <span className="text-label text-neon-violet tracking-widest">{entry.date}</span>
                    <h3 className="mt-2 font-semibold" style={{ fontSize: '16px', color: '#ffffff' }}>
                      {entry.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {entry.org}{entry.location && ` · ${entry.location}`}
                    </p>
                    <p className="mt-2" style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.55)' }}>
                      {entry.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-label rounded-pill px-2 py-0.5"
                          style={{
                            fontSize: '9px',
                            background: 'rgba(139, 92, 246, 0.12)',
                            color: '#a78bfa',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block md:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
