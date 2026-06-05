import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { Loader } from './components/Loader';
import { useAnalytics } from './hooks/useAnalytics';
import Home from './pages/Home';

// Lazy-load rarely-visited pages to reduce initial bundle
const FacialRecognition = lazy(() => import('./pages/FacialRecognition'));
const Admin = lazy(() => import('./pages/Admin'));

function AppContent() {
  const location = useLocation();
  useAnalytics();

  return (
    <>
      <CustomCursor />
      <Navigation />
      <AnimatePresence mode="wait">
        <Suspense fallback={
          <div className="min-h-screen" style={{ background: '#0a0a0f' }} />
        }>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/facial-recognition" element={<FacialRecognition />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
    </>
  );
}

// Preload critical images used in the hero section
const CRITICAL_IMAGES = [
  '/images/portrait-akshit.jpg',
];

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);

  // Track web font loading
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Preload critical hero images
  useEffect(() => {
    if (CRITICAL_IMAGES.length === 0) {
      setImagesReady(true);
      return;
    }

    let loadedCount = 0;
    const total = CRITICAL_IMAGES.length;

    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= total) setImagesReady(true);
      };
      img.src = src;
    });
  }, []);

  return (
    <>
      {!loaded && (
        <Loader
          readySignals={{ fonts: fontsReady, images: imagesReady }}
          onComplete={() => setLoaded(true)}
        />
      )}
      <AppContent />
    </>
  );
}
