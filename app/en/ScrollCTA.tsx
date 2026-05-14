'use client';

interface ScrollCTAProps {
  targetId: string;
  className: string;
  children: React.ReactNode;
}

export default function ScrollCTA({ targetId, className, children }: ScrollCTAProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
