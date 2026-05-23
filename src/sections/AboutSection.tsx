import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '2+', label: 'Years Experience' },
  { value: '2', label: 'Research Publications' },
  { value: '500+', label: 'LinkedIn Network' },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const image = sectionRef.current.querySelector('.about-image');
    const textElements = sectionRef.current.querySelectorAll('.about-text');

    if (image) {
      gsap.from(image, {
        scale: 0.95,
        opacity: 0,
        duration: 1.0,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: image,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    textElements.forEach((el, i) => {
      gsap.from(el, {
        y: 25,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding relative"
      style={{ zIndex: 2, background: '#0a0a0f' }}
    >
      {/* Aurora */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 70% 40%, rgba(192, 132, 252, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          {/* Left: Portrait */}
          <div className="md:w-1/2">
            <div
              className="about-image rounded-2xl overflow-hidden aspect-[3/4] max-w-md"
              style={{
                boxShadow: '0 8px 40px rgba(139, 92, 246, 0.15), 0 8px 40px rgba(0, 0, 0, 0.6)',
              }}
            >
              <img
                src="/images/portrait-akshit.jpg"
                alt="Akshit Joshi - AI/ML Engineer"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Bio */}
          <div className="md:w-1/2 flex flex-col gap-5">
            <div className="about-text">
              <span className="text-label text-neon-violet tracking-widest">ABOUT</span>
            </div>

            <h2 className="about-text text-section-h2">AKSHIT JOSHI</h2>

            <p className="about-text font-medium" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>
              AI/ML Engineer | Python | Computer Vision | LLMs | VLMs
            </p>

            <div className="about-text flex flex-col gap-4 mt-2">
              <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.55)' }}>
                I engineer AI systems that bridge research and production. From fine-tuning vision
                transformers to deploying quantized models on edge devices, I specialize in building
                end-to-end pipelines that actually ship.
              </p>
              <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.55)' }}>
                Currently at WebOccult, I work on multimodal document AI — OCR, visual feature
                extraction, LLM integration, and edge deployment on NVIDIA Jetson platforms.
              </p>
              <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.55)' }}>
                I&apos;m passionate about the full stack of ML engineering: model architecture, training
                optimization, inference acceleration, and cloud deployment.
              </p>
            </div>

            {/* Stats */}
            <div className="about-text flex gap-8 md:gap-12 mt-6 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-neon-violet font-display"
                    style={{ fontSize: '36px', fontWeight: 400, lineHeight: 1, textShadow: '0 0 20px rgba(167, 139, 250, 0.4)' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-label tracking-widest mt-2" style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '10px' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
