import { useState, useEffect } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { Loader } from './components/Loader';
import Home from './pages/Home';

function AppContent() {
  const location = useLocation();

  return (
    <>
      <CustomCursor />
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

// Preload critical images used in the hero section
const CRITICAL_IMAGES = [
  `${import.meta.env.BASE_URL}images/portrait-akshit.jpg`,
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
