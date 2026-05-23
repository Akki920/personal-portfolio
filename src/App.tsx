import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import Home from './pages/Home';

export default function App() {
  const location = useLocation();

  return (
    <>
      <CustomCursor />
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
