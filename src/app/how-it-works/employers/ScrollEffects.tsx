'use client';

import { useEffect, useRef } from 'react';

export function ScrollEffects() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Nav scroll effect
    const nav = document.querySelector('.el-nav');
    const handleScroll = () => {
      nav?.classList.toggle('nav-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial check

    // Fade-up on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('fade-visible');
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}