'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useO1DAnimations } from '@/hooks/useO1DAnimations';
import '@/app/theme.css';
import './home.css';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const heroProfiles = [
  {
    initials: 'JR',
    name: 'Jane Rivera',
    role: 'ML Engineer · O-1A Candidate',
    score: 70,
    dashOffset: '101.788',
    criteria: [
      { icon: '\u{1F3C6}', name: 'Awards', ok: true },
      { icon: '\u{1F4DA}', name: 'Scholarly', ok: true },
      { icon: '\u2696\uFE0F', name: 'Judging', ok: true },
      { icon: '\u{1F4A1}', name: 'Contributions', ok: false },
    ],
    matchCount: '14 new',
    jobs: [
      { co: 'Anthropic', role: 'Senior ML Researcher', loc: 'San Francisco' },
      { co: 'OpenAI', role: 'Research Scientist', loc: 'New York' },
    ],
  },
  {
    initials: 'MC',
    name: 'Marcus Chen',
    role: 'Digital Creator & Brand Strategist · O-1B Candidate',
    score: 78,
    dashOffset: '74.644',
    criteria: [
      { icon: '\u{1F4F0}', name: 'Published Material', ok: true },
      { icon: '\u{1F3AF}', name: 'Critical Role', ok: true },
      { icon: '\u{1F4B0}', name: 'High Salary', ok: true },
      { icon: '\u{1F3C6}', name: 'Awards', ok: false },
    ],
    matchCount: '9 new',
    jobs: [
      { co: 'Creative Agency', role: 'Head of Content', loc: 'Los Angeles' },
      { co: 'Media Corp', role: 'Brand Director', loc: 'Miami' },
    ],
  },
];

const o1Criteria = [
  {
    name: 'Awards',
    icon: '🏆',
    desc: 'National or international recognition',
    details: ['Nationally recognized prizes', 'Industry-specific awards', 'Competition wins', 'Fellowships & grants'],
  },
  {
    name: 'Memberships',
    icon: '👥',
    desc: 'Elite professional associations',
    details: ['Invite-only organizations', 'Peer-reviewed societies', 'Leadership positions', 'Board memberships'],
  },
  {
    name: 'Published Material',
    icon: '📰',
    desc: 'Media coverage about you',
    details: ['News articles featuring you', 'Magazine profiles', 'Podcast interviews', 'Documentary appearances'],
  },
  {
    name: 'Judging',
    icon: '⚖️',
    desc: 'Evaluating others in your field',
    details: ['Award panel judge', 'Grant reviewer', 'Thesis committee member', 'Competition evaluator'],
  },
  {
    name: 'Original Contributions',
    icon: '💡',
    desc: 'Significant innovations',
    details: ['Patents & inventions', 'New methodologies', 'Industry-changing work', 'Breakthrough research'],
  },
  {
    name: 'Scholarly Articles',
    icon: '📚',
    desc: 'Published research work',
    details: ['Peer-reviewed papers', 'Journal publications', 'Conference proceedings', 'Book chapters'],
  },
  {
    name: 'Critical Role',
    icon: '🎯',
    desc: 'Key positions at notable orgs',
    details: ['C-suite positions', 'Department head roles', 'Founding team member', 'Lead on major projects'],
  },
  {
    name: 'High Salary',
    icon: '💰',
    desc: 'Above-market compensation',
    details: ['Top percentile earnings', 'Significant equity stakes', 'Premium consulting rates', 'Performance bonuses'],
  },
];

export default function Home() {
  const signupHref = isDemoMode ? '/demo' : '/signup';
  const talentSignupHref = isDemoMode ? '/demo' : '/signup?role=talent';
  const employerSignupHref = isDemoMode ? '/demo' : '/signup?role=employer';

  const [profileIdx, setProfileIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setProfileIdx((i) => (i + 1) % heroProfiles.length), 5000);
    return () => clearInterval(timer);
  }, []);
  const hp = heroProfiles[profileIdx];

  useO1DAnimations();

  return (
    <div className="home-landing">
      <Navbar />

      {/* ─── DEMO BANNER ─── */}
      {isDemoMode && (
        <div className="hl-demo-banner">
          <Info size={14} />
          <span>Demo Mode — Explore with sample data. No real accounts or transactions.</span>
        </div>
      )}

      {/* ─── HERO — split layout ─── */}
      <section className="hl-hero">
        <div className="hl-hero-grid" />
        <div className="hl-glow-1" />
        <div className="hl-glow-2" />

        <div className="hl-hero-split">

          {/* LEFT — copy */}
          <div className="hl-hero-text">
            <div className="hl-hero-badge">
              <div className="hl-pulse-dot" />
              <span>The O-1 Visa Talent Marketplace</span>
            </div>

            <h1 className="hl-hero-h1">
              Connect <em>Extraordinary Talent</em>
              <br />with U.S. Employers
            </h1>

            <p className="hl-hero-sub">
              O1DMatch bridges the gap between O-1 visa candidates and employers
              ready to hire. Build your profile, showcase your extraordinary
              abilities, and get matched with opportunities.
            </p>

            <div className="hl-hero-ctas">
              <Link href={talentSignupHref} className="hl-btn-primary">
                I&apos;m O-1 Talent →
              </Link>
              <Link href={employerSignupHref} className="hl-btn-secondary">
                I&apos;m Hiring O-1 Talent
              </Link>
            </div>

            <div className="hl-hero-stats">
              <div>
                <div className="hl-stat-num">500+</div>
                <div className="hl-stat-label">O-1 Candidates</div>
              </div>
              <div>
                <div className="hl-stat-num">120+</div>
                <div className="hl-stat-label">Hiring Companies</div>
              </div>
              <div>
                <div className="hl-stat-num">40+</div>
                <div className="hl-stat-label">Industries</div>
              </div>
              <div>
                <div className="hl-stat-num">98%</div>
                <div className="hl-stat-label">Match Accuracy</div>
              </div>
            </div>
          </div>

          {/* RIGHT — animated dashboard preview */}
          <div className="hl-hero-preview">

            {/* Main card */}
            <div className="hl-preview-card">
              {/* Card header */}
              <div className="hl-preview-header">
                <div className="hl-preview-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="hl-preview-title">O1DMatch Platform</span>
                <span className="hl-preview-live">
                  <span className="hl-live-dot" />
                  Live
                </span>
              </div>

              {/* Profile row */}
              <div className="hl-preview-profile">
                <div className="hl-preview-avatar">{hp.initials}</div>
                <div>
                  <div className="hl-preview-name">{hp.name}</div>
                  <div className="hl-preview-role">{hp.role}</div>
                </div>
                <span className="hl-preview-badge-active">Active</span>
              </div>

              {/* Score ring + criteria */}
              <div className="hl-preview-score-row">
                {/* Ring */}
                <div className="hl-score-ring-wrap">
                  <svg viewBox="0 0 120 120" className="hl-score-ring-svg" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="rgba(255,255,255,0.08)" />
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="#D4A84B"
                      strokeDasharray="339.292"
                      strokeDashoffset={hp.dashOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="hl-score-ring-inner">
                    <span className="hl-score-num">{hp.score}%</span>
                    <span className="hl-score-label">O-1 Score</span>
                  </div>
                </div>

                {/* Criteria pills */}
                <div className="hl-criteria-pills">
                  {hp.criteria.map((c) => (
                    <div key={c.name} className={`hl-pill ${c.ok ? 'hl-pill-yes' : 'hl-pill-no'}`}>
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                      <span className="hl-pill-check">{c.ok ? '✓' : '○'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs matched bar */}
              <div className="hl-preview-matches">
                <span className="hl-matches-label">Matched Positions</span>
                <span className="hl-matches-count">{hp.matchCount}</span>
              </div>
              <div className="hl-preview-job-list">
                {hp.jobs.map((j) => (
                  <div key={j.co} className="hl-job-row">
                    <div className="hl-job-logo">{j.co[0]}</div>
                    <div className="hl-job-info">
                      <div className="hl-job-title">{j.role}</div>
                      <div className="hl-job-co">{j.co} · {j.loc}</div>
                    </div>
                    <span className="hl-job-match">95%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating card — interest letter */}
            <div className="hl-float-card hl-float-card-letter hl-float-1">
              <div className="hl-float-icon">✉️</div>
              <div>
                <div className="hl-float-title">Interest Letter Received</div>
                <div className="hl-float-sub">TechCorp Inc. · just now</div>
              </div>
            </div>

            {/* Floating card — new match */}
            <div className="hl-float-card hl-float-card-match hl-float-2">
              <div className="hl-float-icon">🎯</div>
              <div>
                <div className="hl-float-title">New Employer Match</div>
                <div className="hl-float-sub">3 companies viewed your profile</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── WHAT IS THE O-1 VISA? ─── */}
      <section className="hl-section hl-section-cream">
        <div className="hl-section-header hl-fade-up">
          <span className="hl-section-tag">The O-1 Visa</span>
          <h2 className="hl-section-title">What is the O-1 Visa?</h2>
        </div>
        <div className="hl-fade-up" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.8', marginBottom: '1rem' }}>
            The O-1 visa is a U.S. work authorization for individuals with extraordinary ability or achievement — in any field. Unlike the H-1B, there is no lottery, no annual cap, and no employer sponsorship required.
          </p>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.8', marginBottom: '2rem' }}>
            If you are among the best in what you do — whether in science, business, finance, the arts, athletics, media, or the digital economy — there is a path to working in the United States.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {[
              'Science & Research',
              'Business & Finance',
              'Arts & Entertainment',
              'Athletics',
              'Digital Creators & Influencers',
              'Freelancers & Independents',
              'Healthcare & Medicine',
              'Education & Academia',
              'Film, TV & Media',
            ].map((field) => (
              <span
                key={field}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  background: '#0B1D35',
                  color: '#E8C97A',
                  fontWeight: 500,
                }}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="hl-section hl-section-white">
        <div className="hl-section-header hl-fade-up">
          <span className="hl-section-tag">Simple Process</span>
          <h2 className="hl-section-title">How O1DMatch Works</h2>
          <p className="hl-section-desc">
            A streamlined 4-step process to connect O-1 talent with the right employers
          </p>
        </div>

        <div className="hl-steps-grid">
          <div className="hl-steps-line" />

          <div className="hl-step-card hl-fade-up">
            <div className="hl-step-num">1</div>
            <div className="hl-step-icon">📤</div>
            <h3>Create Your Profile</h3>
            <p>Upload your evidence of extraordinary abilities — awards, publications, memberships, and more.</p>
            <div className="hl-step-note">✓ Takes only 10 minutes</div>
          </div>

          <div className="hl-step-card hl-fade-up">
            <div className="hl-step-num">2</div>
            <div className="hl-step-icon">📊</div>
            <h3>Get Your O-1 Score</h3>
            <p>Our AI analyzes your evidence across all 8 O-1 criteria and generates a comprehensive readiness score.</p>
            <div className="hl-step-note">✓ AI-powered analysis</div>
          </div>

          <div className="hl-step-card hl-fade-up">
            <div className="hl-step-num">3</div>
            <div className="hl-step-icon">✉️</div>
            <h3>Receive Interest Letters</h3>
            <p>Employers browse your anonymized profile and send USCIS-ready interest letters to support your petition.</p>
            <div className="hl-step-note">✓ Privacy protected</div>
          </div>

          <div className="hl-step-card hl-fade-up">
            <div className="hl-step-num">4</div>
            <div className="hl-step-icon">🤝</div>
            <h3>Connect &amp; Get Hired</h3>
            <p>Accept connections, reveal your identity, and work with employers and attorneys to complete your petition.</p>
            <div className="hl-step-note">✓ Full support provided</div>
          </div>
        </div>
      </section>

      {/* ─── VIDEO ─── */}
      <section className="hl-section hl-section-navy">
        <div className="hl-section-header hl-fade-up">
          <span className="hl-section-tag">See It In Action</span>
          <h2 className="hl-section-title" style={{ color: '#FFFFFF' }}>Watch How O1DMatch Works</h2>
          <p className="hl-section-desc" style={{ color: 'rgba(255,255,255,0.7)' }}>
            See how our platform connects extraordinary talent with U.S. employers
            ready to support your O-1 visa journey.
          </p>
        </div>

        <div
          className="hl-fade-up"
          style={{
            maxWidth: '1025px',
            margin: '0 auto',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(11,29,53,0.15)',
            border: '1.5px solid #E2D9CC',
            position: 'relative',
            paddingBottom: '36%',
            height: 0,
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/cXjAexer_To?si=LQmBuQNWEeLrZxfd&controls=0&rel=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </section>

      {/* ─── O-1 CRITERIA ─── */}
      <section className="hl-section hl-section-cream">
        <div className="hl-section-header hl-fade-up">
          <span className="hl-section-tag">8 Criteria</span>
          <h2 className="hl-section-title">O-1 Visa Criteria We Track</h2>
          <p className="hl-section-desc">
            We help you document and score your evidence across all 8 USCIS criteria.
            You need to demonstrate extraordinary ability in at least 3 categories.
          </p>
        </div>

        <div className="hl-criteria-grid">
          {o1Criteria.map((criterion, index) => (
            <div key={criterion.name} className="hl-criterion-card hl-fade-up">
              <div className="hl-criterion-num">{index + 1}</div>
              <div className="hl-criterion-icon">{criterion.icon}</div>
              <h3>{criterion.name}</h3>
              <p>{criterion.desc}</p>
              <ul className="hl-criterion-list">
                {criterion.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hl-criteria-note hl-fade-up">
          <div className="hl-note-icon">ℹ️</div>
          <div>
            <h4>How Many Criteria Do I Need?</h4>
            <p>
              To qualify for an O-1A visa, you must provide evidence that meets at least{' '}
              <strong>3 of the 8 criteria</strong>, or show a major internationally recognized
              award (like a Nobel Prize). Our AI helps you identify which criteria you qualify
              for and strengthens your overall case.
            </p>
          </div>
        </div>

        <div className="hl-criteria-note hl-fade-up" style={{ marginTop: '1.25rem' }}>
          <div className="hl-note-icon">💡</div>
          <div>
            <h4>O-1A vs O-1B</h4>
            <p>
              O-1A covers extraordinary ability in science, education, business, or athletics.
              O-1B covers extraordinary achievement in the arts, motion picture, or television.
              Digital creators, influencers, streamers, and independent professionals may qualify
              under either category depending on their body of work.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOR BOTH ─── */}
      <section className="hl-section hl-section-white">
        <div className="hl-section-header hl-fade-up">
          <span className="hl-section-tag">Built for Both Sides</span>
          <h2 className="hl-section-title">Choose Your Path</h2>
        </div>

        <div className="hl-dual-grid">
          <div className="hl-cta-card hl-cta-talent hl-fade-up">
            <div className="hl-card-icon hl-card-icon-gold">🌟</div>
            <h3>For O-1 Talent</h3>
            <p>
              Track your O-1 eligibility, upload evidence, and connect with
              companies ready to sponsor your visa.
            </p>
            <ul>
              <li><span className="hl-check-gold">✓</span> Real-time O-1 eligibility scoring</li>
              <li><span className="hl-check-gold">✓</span> AI-powered job matching</li>
              <li><span className="hl-check-gold">✓</span> Dedicated account manager support</li>
              <li><span className="hl-check-gold">✓</span> Secure document management</li>
              <li><span className="hl-check-gold">✓</span> Built for creators, freelancers &amp; independent professionals</li>
            </ul>
            <Link href={talentSignupHref} className="hl-btn-gold">
              Start Your Profile →
            </Link>
          </div>

          <div className="hl-cta-card hl-cta-employer hl-fade-up">
            <div className="hl-card-icon hl-card-icon-blue">🏢</div>
            <h3>For Employers</h3>
            <p>
              Access a curated pool of exceptional international professionals
              pre-screened for O-1 eligibility.
            </p>
            <ul>
              <li><span className="hl-check-blue">✓</span> Browse pre-vetted O-1 candidates</li>
              <li><span className="hl-check-blue">✓</span> Send interest letters directly</li>
              <li><span className="hl-check-blue">✓</span> Post jobs to targeted talent pool</li>
              <li><span className="hl-check-blue">✓</span> Immigration compliance support</li>
            </ul>
            <Link href={employerSignupHref} className="hl-btn-navy">
              Hire O-1 Talent →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAND ─── */}
      <section className="hl-section hl-section-navy" style={{ padding: '4rem 2rem' }}>
        <div className="hl-trust-band">
          <div className="hl-trust-stat hl-fade-up">
            <div className="hl-trust-num">500+</div>
            <div className="hl-trust-label">Active O-1 Candidates</div>
          </div>
          <div className="hl-trust-stat hl-fade-up">
            <div className="hl-trust-num">120+</div>
            <div className="hl-trust-label">Partner Companies</div>
          </div>
          <div className="hl-trust-stat hl-fade-up">
            <div className="hl-trust-num">40+</div>
            <div className="hl-trust-label">Industries Covered</div>
          </div>
          <div className="hl-trust-stat hl-fade-up">
            <div className="hl-trust-num">15+</div>
            <div className="hl-trust-label">Years Immigration Exp.</div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="hl-section hl-section-cream">
        <div className="hl-final-cta hl-fade-up">
          <span className="hl-section-tag">Get Started Today</span>
          <h2>Ready to Begin Your O-1 Journey?</h2>
          <p>
            Join O1DMatch and take the next step toward connecting extraordinary
            talent with extraordinary opportunities.
          </p>
          <div className="hl-final-ctas">
            <Link href={signupHref} className="hl-btn-gold">
              Create Free Account →
            </Link>
            <Link href="/pricing" className="hl-btn-secondary" style={{ border: '1.5px solid #CBD5E1', color: '#0B1D35' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="hl-footer">
        <div className="hl-footer-inner">
          <div className="hl-footer-grid">
            <div className="hl-footer-brand">
              <span className="hl-footer-logo">O1DMatch</span>
              <p>Connecting exceptional talent with opportunities for O-1 visa sponsorship.</p>
            </div>
            <div className="hl-footer-col">
              <h4>Platform</h4>
              <Link href="/how-it-works/talent">For Candidates</Link>
              <Link href="/how-it-works/employers">For Employers</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div className="hl-footer-col">
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>
            <div className="hl-footer-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="hl-footer-bottom">
            <span>© {new Date().getFullYear()} O1DMatch. All rights reserved.</span>
            <span>Built by a licensed immigration attorney.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}