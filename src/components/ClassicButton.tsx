import { type ReactNode } from 'react';

interface ClassicButtonProps {
  children: ReactNode;
  variant?: 'filled' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}

export function ClassicButton({
  children,
  variant = 'filled',
  href,
  onClick,
  className = '',
  external = false,
}: ClassicButtonProps) {
  const baseClasses = 'btn-classic text-cta transition-all duration-200 hover:-translate-y-0.5';
  const variantClasses =
    variant === 'filled'
      ? 'btn-classic-filled'
      : 'btn-classic-outline';

  const classes = `${baseClasses} ${variantClasses} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
