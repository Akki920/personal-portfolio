import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, BookOpen, Award } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const educationEntries = [
  {
    degree: 'B.Tech in Computer Science & Engineering',
    specialization: 'Artificial Intelligence',
    institution: 'Parul University',
    period: '2020 – 2024',
    description:
      'Specialized in AI/ML with focus on deep learning, computer vision, and natural language processing. Published research in international journals.',
    highlights: [
      'Specialization in Artificial Intelligence',
      'Published 2 research papers',
      'Deep Learning & Computer Vision focus',
    ],
    icon: GraduationCap,
  },
];

const certifications = [
  { title: 'Deep Learning', org: 'E-Cell IIT Bombay', year: '2021', icon: Award },
  { title: 'Machine Learning', org: 'Andrew Ng (Coursera)', year: '2022', icon: BookOpen },
  { title: 'Python for Data Science', org: 'IBM', year: '2022', icon: BookOpen },
  { title: 'Interview Skills', org: 'TCS iON', year: '2022', icon: Award },
];

export function EducationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.edu-card');
    const certs = sectionRef.current.querySelectorAll('.cert-item');

    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });

    certs.forEach((cert, i) => {
      gsap.from(cert, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: cert,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      id="education"
      ref={sectionRef}
      className="section-padding relative"
      style={{ zIndex: 2, background: '#0a0a0f' }}
    >
      {/* Aurora */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 60% 50%, rgba(139, 92, 246, 0.07) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10">
        <SectionHeader eyebrow="ACADEMIC BACKGROUND" title="EDUCATION" centered />

        <div className="max-w-3xl mx-auto">
          {/* Degree Card */}
          {educationEntries.map((entry) => {
            const IconComponent = entry.icon;
            return (
              <div
                key={entry.degree}
                className="edu-card liquid-glass p-8 md:p-10 relative overflow-hidden"
              >
                {/* Decorative gradient */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(167, 139, 250, 0.1) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)',
                      }}
                    >
                      <IconComponent className="w-7 h-7 text-neon-violet" />
                    </div>
                    <div className="flex-1">
                      <span className="text-label text-neon-violet tracking-widest">{entry.period}</span>
                      <h3 className="mt-2 text-section-h3" style={{ fontSize: '22px', lineHeight: 1.3 }}>
                        {entry.degree}
                      </h3>
                      <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                        {entry.institution} · <span className="text-neon-violet">{entry.specialization}</span>
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.5)' }}>
                    {entry.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {entry.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-3 py-1.5 rounded-pill text-label flex items-center gap-1.5"
                        style={{
                          fontSize: '10px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.18)',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#8b5cf6', boxShadow: '0 0 6px rgba(139, 92, 246, 0.6)' }}
                        />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Certifications */}
          <div className="mt-10">
            <span
              className="text-label tracking-widest block text-center mb-6"
              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
            >
              CERTIFICATIONS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((cert) => {
                const CertIcon = cert.icon;
                return (
                  <div
                    key={cert.title}
                    className="cert-item group flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                      }}
                    >
                      <CertIcon className="w-4 h-4 text-neon-violet" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>{cert.title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)' }}>
                        {cert.org} · {cert.year}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
