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
    desc: 'Get a full walkthrough of your O-1 talent dashboard — track your eligibility score, monitor application progress, and manage everything from one place.',
    embedId: '1ptcmD00vC40xiKekAJOdG9GS44RKrj1W',
  },
  {
    num: '2',
    label: 'Finding Opportunities',
    title: 'Jobs Section',
    desc: 'Learn how to browse and apply to positions specifically posted for O-1 talent. Discover how our matching algorithm surfaces the right roles for your expertise.',
    embedId: '1-rw_MPGDh5SJLsqZJCwfqPSp5Ifv9FIo',
  },
  {
    num: '3',
    label: 'Building Your Case',
    title: 'Evidence & Documents',
    desc: 'See how to upload your awards, publications, media coverage, and other evidence to strengthen your O-1 eligibility score in real time.',
    embedId: '1zpuT5PFChvbvZm51g7aYjxwdm7xzREhZ',
  },
  {
    num: '4',
    label: 'Securing Sponsorship',
    title: 'Letters of Interest',
    desc: 'Understand the sponsorship letter process — how employers express interest, how you review and accept letters, and what happens next in the visa journey.',
    embedId: '1ngy80LG4EpVvJOyK5e2DIE_fmcMmDifB',
  },
];

export default function TalentOnboardingPage() {
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
            <span>Talent Onboarding Series · 4 Videos</span>
          </div>

          <h1 className="ob-hero-h1">
            Master Your <em>O-1 Journey</em> in Four Steps
          </h1>

          <p className="ob-hero-sub">
            These short walkthrough videos will help you get the most out of O1DMatch —
            from setting up your profile to receiving sponsorship letters from top US employers.
          </p>
        </div>
      </section>

      {/* ─── VIDEOS ─── */}
      <section className="ob-videos-section">
        <div className="ob-videos-header fade-up">
          <div className="ob-section-tag">Platform Walkthroughs</div>
          <h2 className="ob-section-title">Talent Onboarding Videos</h2>
          <p className="ob-section-desc">
            Watch each video in order for the smoothest onboarding experience.
            Each guide covers a key section of the platform.
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
          <div className="ob-cta-tag">Ready to Begin?</div>
          <h2 className="ob-cta-title">Build Your O-1 Profile Today</h2>
          <p className="ob-cta-desc">
            Join 500+ extraordinary professionals already using O1DMatch to connect with
            US employers seeking exceptional international talent.
          </p>
          <div className="ob-cta-btns">
            <Link href="/signup?role=talent" className="ob-btn-primary">
              Create My Profile →
            </Link>
            <Link href="/how-it-works/employers" className="ob-btn-secondary">
              For Employers
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