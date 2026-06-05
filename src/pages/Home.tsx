import { useRef, useEffect, lazy, Suspense } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { VortexCanvas } from '../components/Vortex';
import { HeroSection } from '../sections/HeroSection';

// Lazy-load below-fold sections — they don't need to be in the initial bundle
const WorkSection = lazy(() => import('../sections/WorkSection').then(m => ({ default: m.WorkSection })));
const TimelineSection = lazy(() => import('../sections/TimelineSection').then(m => ({ default: m.TimelineSection })));
const PublicationsSection = lazy(() => import('../sections/PublicationsSection').then(m => ({ default: m.PublicationsSection })));
const EducationSection = lazy(() => import('../sections/EducationSection').then(m => ({ default: m.EducationSection })));
const AboutSection = lazy(() => import('../sections/AboutSection').then(m => ({ default: m.AboutSection })));
const SkillsSection = lazy(() => import('../sections/SkillsSection').then(m => ({ default: m.SkillsSection })));
const ContactSection = lazy(() => import('../sections/ContactSection').then(m => ({ default: m.ContactSection })));

gsap.registerPlugin(ScrollTrigger);

// Minimal fallback while lazy sections load
function SectionSkeleton() {
  return (
    <div className="section-padding content-container">
      <div className="flex flex-col gap-6">
        <div className="shimmer" style={{ width: '200px', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
        <div className="shimmer" style={{ width: '60%', height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} />
        <div className="shimmer" style={{ width: '80%', height: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
        <div className="shimmer" style={{ width: '70%', height: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

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
        {/* Hero — above the fold, loaded eagerly */}
        <HeroSection />

        {/* Below-fold sections — lazy loaded */}
        <Suspense fallback={<SectionSkeleton />}>
          <WorkSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <TimelineSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PublicationsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <EducationSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SkillsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ContactSection />
        </Suspense>
      </main>
    </>
  );
}
