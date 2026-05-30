import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Publications', href: '#publications' },
  { label: 'Education', href: '#education' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
];

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }

    const sectionIds = ['work', 'experience', 'publications', 'education', 'about', 'skills'];
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHome, location.pathname]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleHomeClick = () => {
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 ${
          scrolled
            ? 'bg-void-deep/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="content-container h-full flex items-center justify-between">
          {/* Left: Name mark */}
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <span className="text-label text-white/80 tracking-widest group-hover:text-neon-violet transition-colors duration-300">
              AKSHIT JOSHI
            </span>
            <span className="w-px h-4 bg-white/20" />
            <span className="text-label text-white/40 tracking-widest">
              AI/ML ENGINEER
            </span>
          </button>

          {/* Right: Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {/* Liquid glass pill nav container */}
            <div className="liquid-glass-strong rounded-pill px-2 py-1.5 flex items-center gap-1">
              {navLinks.map((link) => {
                const linkId = link.href.substring(1);
                const isActive = activeSection === linkId;
                const hasActive = activeSection !== '';
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className={`px-4 py-2 text-sm transition-all duration-300 rounded-pill hover:bg-white/10 hover:text-white relative group ${
                      isActive
                        ? 'text-neon-violet bg-purple/15'
                        : hasActive
                        ? 'text-white/30'
                        : 'text-white/60'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}

            </div>
            <a
              href="https://www.linkedin.com/in/akshitjoshi920"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-button-filled text-cta ml-4"
            >
              CONNECT
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-void-deep/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link, i) => {
              const linkId = link.href.substring(1);
              const isActive = activeSection === linkId;
              const hasActive = activeSection !== '';
              return (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-display transition-colors duration-300 ${
                    isActive
                      ? 'text-neon-violet'
                      : hasActive
                      ? 'text-white/30'
                      : 'text-white/80'
                  }`}
                  style={{ fontSize: 'clamp(32px, 8vw, 56px)' }}
                >
                  {link.label}
                </motion.button>
              );
            })}
            <motion.a
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              href="https://www.linkedin.com/in/akshitjoshi920"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-button-filled text-cta mt-6"
            >
              CONNECT
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
