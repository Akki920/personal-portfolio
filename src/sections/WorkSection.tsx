import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '../components/SectionHeader';
import { Link } from 'react-router';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: 'Facial Recognition System',
    description:
      'Real-time face detection and recognition pipeline powered by ONNX Runtime with CUDA GPU acceleration. Features MongoDB vector store for face embeddings, quality validation, and a production Flask API.',
    image: '/images/project-facial-recognition.png',
    tags: ['ONNX', 'CUDA', 'FLASK', 'MONGODB'],
    link: '/facial-recognition',
  },
  {
    title: 'GeoVigilance Labs',
    description:
      'AI-enabled system for automated land use monitoring — detecting unauthorized changes through satellite data acquisition and real-time analysis. Published research by Springer.',
    image: '/images/project-geovigilance.jpg',
    tags: ['COMPUTER VISION', 'YOLO', 'U2-NET', 'PYTHON'],
    link: '#publications',
  },
  {
    title: 'Multimodal Document AI Pipeline',
    description:
      'End-to-end document intelligence system using PaddleOCR, YOLO for layout detection, and ViT/DINOv2 for visual feature extraction. Orchestrated inference pipelines with model quantization.',
    image: '/images/project-document-ai.jpg',
    tags: ['OCR', 'VLM', 'LLM', 'JETSON'],
    link: null,
  },
  {
    title: 'Speech & Language Systems',
    description:
      'Text-to-speech synthesis pipeline and speech analysis microservices. Integrated multiple LLM APIs and Ollama for local VLM inferencing.',
    image: '/images/project-speech.jpg',
    tags: ['TTS', 'LLM', 'OLLAMA', 'MICROSERVICES'],
    link: null,
  },
];

export function WorkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const stickyRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(card, 
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.1,
        }
      );
    });

    if (stickyRef.current) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          if (stickyRef.current) {
            const opacity = 1 - self.progress * 0.7;
            stickyRef.current.style.opacity = String(opacity);
          }
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      id="work"
      ref={sectionRef}
      className="section-padding relative"
      style={{ zIndex: 2, background: 'linear-gradient(180deg, #0a0a0f 0%, #030305 100%)' }}
    >
      {/* Subtle aurora */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left: Sticky title */}
          <div ref={stickyRef} className="lg:w-2/5 lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              eyebrow="SELECTED WORK"
              title="PROJECTS & SYSTEMS"
              description="Production AI systems spanning computer vision, multimodal inference, and edge deployment."
            />
            <a
              href="https://github.com/Akki920"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-classic-outline text-cta mt-4 inline-flex"
            >
              GITHUB PROFILE
            </a>
          </div>

          {/* Right: Project cards */}
          <div className="lg:w-3/5 flex flex-col gap-8">
            {projects.map((project, i) => {
              const isHash = project.link?.startsWith('#');
              const CardWrapper = project.link ? (isHash ? 'a' : Link) : 'div';
              const cardProps = project.link
                ? (isHash
                    ? { href: project.link, className: 'liquid-glass group cursor-pointer block', onClick: (e: React.MouseEvent) => {
                        e.preventDefault();
                        const el = document.querySelector(project.link!);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    : { to: project.link, className: 'liquid-glass group cursor-pointer block' })
                : { className: 'liquid-glass group cursor-pointer' };
              return (
                <CardWrapper
                  key={project.title}
                  ref={(el: HTMLElement | null) => {
                    if (el) cardsRef.current[i] = el as HTMLDivElement;
                  }}
                  {...(cardProps as any)}
                >
                  <div className="aspect-video overflow-hidden rounded-[20px]">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="text-section-h3" style={{ fontSize: '22px' }}>
                      {project.title}
                    </h3>
                    <p className="mt-3" style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.55)' }}>
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-pill text-label"
                          style={{
                            fontSize: '10px',
                            background: 'rgba(139, 92, 246, 0.12)',
                            color: '#a78bfa',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {project.link && (
                      <div className="mt-4 flex items-center gap-1 text-neon-violet text-sm font-medium group-hover:text-white transition-colors">
                        {isHash ? 'VIEW PUBLICATION' : 'VIEW DEMO'} →
                      </div>
                    )}
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
