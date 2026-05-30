import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { Loader } from './components/Loader';
import { useAnalytics } from './hooks/useAnalytics';
import Home from './pages/Home';
import FacialRecognition from './pages/FacialRecognition';
import Admin from './pages/Admin';

function AppContent() {
  const location = useLocation();
  useAnalytics();

  return (
    <>
      <CustomCursor />
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/facial-recognition" element={<FacialRecognition />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      <AppContent />
    </>
  );
}
