export function Footer() {
  return (
    <footer className="relative py-12" style={{ zIndex: 2, background: '#030305' }}>
      <div className="content-container">
        {/* Divider */}
        <div className="w-full h-px mb-8" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left */}
          <div>
            <span className="text-label tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              AKSHIT JOSHI
            </span>
            <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.35)' }}>
              AI/ML Engineer
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            {[
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/akshitjoshi920' },
              { label: 'GitHub', href: 'https://github.com' },
              { label: 'Email', href: 'mailto:akshitjoshi@example.com' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="transition-colors duration-300"
                style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.2)' }}>
            &copy; 2025 Akshit Joshi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
