'use client';

interface ScrollCTAProps {
  targetId: string;
  className: string;
  children: React.ReactNode;
}

export default function ScrollCTA({ targetId, className, children }: ScrollCTAProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(targetId)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
