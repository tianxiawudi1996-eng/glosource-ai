'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Decorative product-category imagery behind a category tile.
 *
 * Two muted still-life photos (AI-generated, palette-toned) cross-fade on a slow
 * ambient loop, treated as a low-opacity duotone so they read as atmosphere under
 * the hanji paper rather than as photography competing with the Haerye glyph.
 *
 * The loop only runs while the tile is on screen (IntersectionObserver → data-inview)
 * and is disabled entirely under prefers-reduced-motion, so nothing animates off-screen
 * or against the user's motion preference. aria-hidden throughout — purely decorative.
 */
export default function CategoryTileMedia({
  name,
  tint,
  opacity = 0.13,
}: {
  name: string;
  tint: string;
  opacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-inview={inView}
      className="gs-cat-media pointer-events-none absolute inset-0 z-0"
      style={{ '--cat-op': opacity } as CSSProperties}
    >
      <Image src={`/categories/${name}-1.jpg`} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="gs-cat-img gs-cat-a" />
      <Image src={`/categories/${name}-2.jpg`} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="gs-cat-img gs-cat-b" />
      <span className="gs-cat-tint" style={{ backgroundColor: tint }} />
    </div>
  );
}
