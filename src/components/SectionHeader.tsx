import { ScrollReveal } from './ScrollReveal';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeaderProps) {
  return (
    <ScrollReveal
      className={`mb-12 md:mb-16 ${centered ? 'text-center' : ''}`}
    >
      <span className="text-label tracking-widest" style={{ color: '#a78bfa' }}>
        {eyebrow}
      </span>
      <h2
        className="text-section-h2 mt-3"
        style={{ color: '#ffffff' }}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-lg ${centered ? 'mx-auto' : ''}`}
          style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px', lineHeight: 1.6 }}
        >
          {description}
        </p>
      )}
    </ScrollReveal>
  );
}
