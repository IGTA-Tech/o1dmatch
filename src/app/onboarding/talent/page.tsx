'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useO1DAnimations } from '@/hooks/useO1DAnimations';
import '@/app/theme.css';
import Footer from "@/components/Footer";

const VIDEOS = [
  {
    num: '1',
    label: 'Getting Started',
    title: 'Dashboard Overview',
    desc: 'Get a full walkthrough of your O-1 talent dashboard — track your eligibility score, monitor interest inquiry progress, and manage everything from one place.',
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
  useO1DAnimations();

  return (
    <div className="o1d-page" style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="o1d-hero o1d-hero-sm">
        <div className="o1d-hero-grid" />
        <div className="o1d-hero-glow-1" />
        <div className="o1d-hero-glow-2" />

        <div className="o1d-hero-inner o1d-hero-inner-center">
          <div className="o1d-hero-badge">
            <div className="o1d-pulse-dot" />
            <span>Talent Onboarding Series · 4 Videos</span>
          </div>

          <h1 className="o1d-hero-h1">
            Master Your <em>O-1 Journey</em><br />in Four Steps
          </h1>

          <p className="o1d-hero-sub o1d-hero-sub-center">
            These short walkthrough videos will help you get the most out of O1DMatch —
            from setting up your profile to receiving sponsorship letters from top US employers.
          </p>
        </div>
      </section>

      {/* ─── VIDEOS ─── */}
      <section className="o1d-section o1d-section-cream">
        {/* Section header */}
        <div className="o1d-section-header o1d-fade-up">
          <span className="o1d-section-tag">Platform Walkthroughs</span>
          <h2 className="o1d-section-title">Talent Onboarding Videos</h2>
          <p className="o1d-section-desc">
            Watch each video in order for the smoothest onboarding experience.
            Each guide covers a key section of the platform.
          </p>
        </div>

        {/* Video grid */}
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '2rem',
        }}>
          {VIDEOS.map((v) => (
            <div
              key={v.embedId}
              className="o1d-fade-up"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E8E0D4',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,168,75,0.5)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(11,29,53,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E0D4';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Card header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #F1EBE0',
              }}>
                {/* Step number */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#0B1D35',
                  border: '2px solid #D4A84B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#D4A84B',
                }}>
                  {v.num}
                </div>

                <div>
                  <p style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#D4A84B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.2rem',
                  }}>
                    {v.label}
                  </p>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#0B1D35',
                  }}>
                    {v.title}
                  </p>
                </div>
              </div>

              {/* Video embed */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0B1D35' }}>
                <iframe
                  src={`https://drive.google.com/file/d/${v.embedId}/preview`}
                  allow="autoplay"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </div>

              {/* Description */}
              <p style={{
                padding: '1.1rem 1.5rem 1.4rem',
                fontSize: '0.88rem',
                color: '#64748B',
                lineHeight: 1.65,
              }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA STRIP ─── */}
      <section className="o1d-section o1d-section-navy">
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }} className="o1d-fade-up">
          <span className="o1d-section-tag">Ready to Begin?</span>
          <h2 className="o1d-section-title-white" style={{ marginTop: '0.5rem' }}>
            Build Your O-1 Profile Today
          </h2>
          <p className="o1d-section-desc-white" style={{ marginBottom: '2rem' }}>
            Join 500+ extraordinary professionals already using O1DMatch to connect with
            US employers seeking exceptional international talent.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup?role=talent" className="o1d-btn-primary">
              Create My Profile →
            </Link>
            <Link href="/how-it-works/employers" className="o1d-btn-secondary">
              For Employers
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}