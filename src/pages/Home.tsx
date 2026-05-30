import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VortexCanvas } from '../components/Vortex';
import { HeroSection } from '../sections/HeroSection';
import { WorkSection } from '../sections/WorkSection';
import { TimelineSection } from '../sections/TimelineSection';
import { PublicationsSection } from '../sections/PublicationsSection';
import { EducationSection } from '../sections/EducationSection';
import { AboutSection } from '../sections/AboutSection';
import { SkillsSection } from '../sections/SkillsSection';
import { ContactSection } from '../sections/ContactSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const scrollProgress = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  // ScrollTrigger for vortex
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });
  });

  return (
    <>
      {/* WebGL Vortex Background — fixed, behind everything */}
      <VortexCanvas scrollProgress={scrollProgress} />

      {/* Content */}
      <main className="relative">
        {/* Hero — transparent, vortex visible */}
        <HeroSection />

        {/* Work — solid sand bg, covers vortex */}
        <WorkSection />

        {/* Timeline — solid sand-dark bg */}
        <TimelineSection />

        {/* Publications — solid sand bg */}
        <PublicationsSection />

        {/* Education */}
        <EducationSection />

        {/* About — solid sand-dark bg */}
        <AboutSection />

        {/* Skills — solid sand bg */}
        <SkillsSection />

        {/* Contact CTA — charcoal bg, vortex faintly visible */}
        <ContactSection />
      </main>
    </>
  );
}
