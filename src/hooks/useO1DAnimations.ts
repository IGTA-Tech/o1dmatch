'use client';

import { useEffect, useRef } from 'react';

/**
 * useO1DAnimations
 *
 * Drop this into any page component to get the shared
 * fade-up scroll animation from the o1d design system.
 *
 * Usage:
 *   import { useO1DAnimations } from '@/hooks/useO1DAnimations';
 *   export default function MyPage() {
 *     useO1DAnimations();
 *     return <div className="o1d-page"> ... </div>;
 *   }
 *
 * Elements with className="o1d-fade-up" will animate in
 * as they scroll into view.
 */
export function useO1DAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('o1d-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    requestAnimationFrame(() => {
      // Add the gate class — this hides .o1d-fade-up elements.
      // Because we observe first (synchronously inside rAF), elements
      // already in the viewport receive o1d-visible in the same frame,
      // so they never appear blank.
      const wrapper = document.querySelector('.o1d-page');
      document.querySelectorAll('.o1d-fade-up').forEach((el) => observer.observe(el));
      wrapper?.classList.add('o1d-ready');
    });

    return () => observer.disconnect();
  }, []);
}