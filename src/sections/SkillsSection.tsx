import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Brain, Cpu, Layers, BarChart3, Award } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const skillCategories = [
  {
    title: 'Computer Vision',
    icon: Eye,
    skills: 'YOLO, PaddleOCR, Google ViT, Facebook DINOv2, OpenCV, image segmentation, object detection, classification',
  },
  {
    title: 'Large Language Models',
    icon: Brain,
    skills: 'LLM fine-tuning, VLM inferencing, Ollama, Hugging Face Transformers, prompt engineering, model quantization',
  },
  {
    title: 'Edge & Deployment',
    icon: Cpu,
    skills: 'NVIDIA Jetson Orin Nano/NX, TensorRT, ONNX, AWS deployment, microservices architecture, Docker',
  },
  {
    title: 'Deep Learning',
    icon: Layers,
    skills: 'TensorFlow, PyTorch, model training pipelines, hyperparameter optimization, distributed training',
  },
  {
    title: 'Data & Visualization',
    icon: BarChart3,
    skills: 'Python, Pandas, NumPy, Apache Superset, Tableau, data preprocessing, ETL pipelines',
  },
  {
    title: 'Certifications',
    icon: Award,
    skills: 'Deep Learning — E-Cell IIT Bombay (2021), Interview Skills — TCS (2022), Machine Learning — Andrew Ng (Coursera), Python for Data Science — IBM',
  },
];

export function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.skill-card');

    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="section-padding relative"
      style={{ zIndex: 2, background: 'linear-gradient(180deg, #0a0a0f 0%, #030305 100%)' }}
    >
      {/* Aurora */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10">
        <SectionHeader eyebrow="CAPABILITIES" title="SKILLS & CREDENTIALS" centered />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.title}
                className="skill-card liquid-glass p-8 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <IconComponent className="w-5 h-5 text-neon-violet" />
                  </div>
                  <h3
                    className="font-display"
                    style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.02em', color: '#ffffff' }}
                  >
                    {category.title}
                  </h3>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.5)' }}>
                  {category.skills}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
