import { type ReactNode } from 'react';

interface PillButtonProps {
  children: ReactNode;
  variant?: 'filled' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}

export function PillButton({
  children,
  variant = 'filled',
  href,
  onClick,
  className = '',
  external = false,
}: PillButtonProps) {
  const baseClasses = 'pill-button text-cta transition-all duration-200 hover:-translate-y-0.5';
  const variantClasses =
    variant === 'filled'
      ? 'pill-button-filled'
      : 'pill-button-outline';

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
