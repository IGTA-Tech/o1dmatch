'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import '../onboarding.css';
import Navbar from '@/components/Navbar';

const VIDEOS = [
  {
    num: '1',
    label: 'Getting Started',
    title: 'Dashboard Overview',
    desc: 'A complete walkthrough of your employer dashboard — monitor candidate matches, track interest letters, and manage your hiring pipeline all in one place.',
    embedId: '1vh7zqV_styuSviZRWl_VayDyKI2H5yq2',
  },
  {
    num: '2',
    label: 'Attracting Talent',
    title: 'Jobs — How to Post',
    desc: 'Learn how to create job listings that reach our curated pool of pre-vetted O-1 candidates. Set role requirements, visa sponsorship details, and visibility options.',
    embedId: '1iZ9GrpJZwJQxDnQa3ITxsb1TWGRNQFEe',
  },
  {
    num: '3',
    label: 'Finding the Right Fit',
    title: 'Candidates (Browse Talent)',
    desc: 'Discover how to search and filter our database of extraordinary professionals by field, O-1 score, and criteria met — then shortlist the talent you want to pursue.',
    embedId: '1djTkDIq23q7-Y6hqKtggLWV7i1Sr3Ue9',
  },
  {
    num: '4',
    label: 'Making It Official',
    title: 'Letters of Interest',
    desc: 'Understand how to send formal interest letters to candidates, what happens after they accept, and how our team facilitates the next steps toward visa sponsorship.',
    embedId: '1m--wNe4mn7HHQDDaL_ZVrp-AieuIAPUv',
  },
];

export default function EmployerOnboardingPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('fade-visible');
        });
      },
      { threshold: 0.12 }
    );

    requestAnimationFrame(() => {
      const wrapper = document.querySelector('.onboarding-landing');
      document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
      wrapper?.classList.add('animations-ready');
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="onboarding-landing">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="ob-hero">
        <div className="ob-hero-grid-bg" />
        <div className="ob-hero-glow" />
        <div className="ob-hero-glow-2" />

        <div className="ob-hero-inner">
          <div className="ob-hero-badge">
            <div className="ob-pulse-dot" />
            <span>Employer Onboarding Series · 4 Videos</span>
          </div>

          <h1 className="ob-hero-h1">
            Hire <em>Extraordinary Talent</em> with Confidence
          </h1>

          <p className="ob-hero-sub">
            These walkthroughs show you exactly how to use O1DMatch to find, evaluate,
            and sponsor exceptional O-1 professionals — from posting your first job to
            sending a formal letter of interest.
          </p>
        </div>
      </section>

      {/* ─── VIDEOS ─── */}
      <section className="ob-videos-section">
        <div className="ob-videos-header fade-up">
          <div className="ob-section-tag">Platform Walkthroughs</div>
          <h2 className="ob-section-title">Employer Onboarding Videos</h2>
          <p className="ob-section-desc">
            Four concise guides covering every part of the employer experience —
            watch in order or jump to the section you need.
          </p>
        </div>

        <div className="ob-videos-grid">
          {VIDEOS.map((v) => (
            <div className="ob-video-card fade-up" key={v.embedId}>
              <div className="ob-video-header">
                <div className="ob-video-num">{v.num}</div>
                <div className="ob-video-title-wrap">
                  <div className="ob-video-label">{v.label}</div>
                  <div className="ob-video-title">{v.title}</div>
                </div>
              </div>

              <div className="ob-video-embed">
                <iframe
                  src={`https://drive.google.com/file/d/${v.embedId}/preview`}
                  allow="autoplay"
                  allowFullScreen
                />
              </div>

              <p className="ob-video-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="ob-cta-strip">
        <div className="ob-cta-strip-glow" />
        <div className="ob-cta-strip-inner fade-up">
          <div className="ob-cta-tag">Start Hiring</div>
          <h2 className="ob-cta-title">Access a Curated Pool of O-1 Talent</h2>
          <p className="ob-cta-desc">
            Join 120+ companies already using O1DMatch to find and sponsor extraordinary
            international professionals across 40+ industries.
          </p>
          <div className="ob-cta-btns">
            <Link href="/signup?role=employer" className="ob-btn-primary">
              Create Employer Account →
            </Link>
            <Link href="/how-it-works/employers" className="ob-btn-secondary">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ob-footer">
        <div className="ob-footer-inner">
          <div className="ob-footer-grid">
            <div className="ob-footer-brand">
              <span className="ob-footer-logo">O1DMatch</span>
              <p>
                Connecting exceptional talent with opportunities for O-1 visa sponsorship.
              </p>
            </div>
            <div className="ob-footer-col">
              <h4>Platform</h4>
              <Link href="/how-it-works/talent">For Candidates</Link>
              <Link href="/how-it-works/employers">For Employers</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div className="ob-footer-col">
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>
            <div className="ob-footer-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="ob-footer-bottom">
            <span>© 2026 O1DMatch. All rights reserved.</span>
            <span>Built by a licensed immigration attorney.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}